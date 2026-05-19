"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { getMessages, type LanguageCode } from "@/lib/i18n";

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: ReturnType<typeof getMessages>;
};

type TranslationResponse = {
  translations?: Record<string, string>;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const apiLanguageCodes: Record<LanguageCode, string> = {
  en: "en",
  es: "es",
  fr: "fr",
  pt: "pt",
  ar: "ar",
  hi: "hi",
  zh: "zh-CN",
  ja: "ja",
};

const translatedTextNodes = new WeakMap<Text, string>();
const translatedAttributes = new WeakMap<Element, Map<string, string>>();
const translationCache = new Map<string, string>();
const ignoredTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "SVG", "CANVAS", "IFRAME"]);
const translatableAttributes = ["placeholder", "aria-label", "title", "alt"];

function cacheKey(language: LanguageCode, text: string) {
  return `equigrant-translation-v2:${language}:${text}`;
}

function shouldTranslateText(text: string) {
  const normalized = text.trim();
  if (normalized.length < 2) return false;
  if (/^(0x[a-fA-F0-9]{6,}|https?:\/\/|\/|#|\d+|[.,:;!?()[\]{}|+\-=]+)$/.test(normalized)) return false;
  if (!/[A-Za-z]/.test(normalized)) return false;
  return true;
}

function getOriginalAttribute(element: Element, attribute: string) {
  const stored = translatedAttributes.get(element)?.get(attribute);
  return stored ?? element.getAttribute(attribute) ?? "";
}

function setOriginalAttribute(element: Element, attribute: string, value: string) {
  const existing = translatedAttributes.get(element) ?? new Map<string, string>();
  if (!existing.has(attribute)) existing.set(attribute, value);
  translatedAttributes.set(element, existing);
}

function collectTextNodes(root: ParentNode) {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ignoredTags.has(parent.tagName) || parent.closest("[data-no-translate]")) {
        return NodeFilter.FILTER_REJECT;
      }
      if (translatedTextNodes.has(node as Text)) return NodeFilter.FILTER_ACCEPT;
      return shouldTranslateText(node.nodeValue ?? "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });

  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  return nodes;
}

function collectAllTextNodes(root: ParentNode) {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ignoredTags.has(parent.tagName) || parent.closest("[data-no-translate]")) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  return nodes;
}

function collectAttributeElements(root: ParentNode) {
  const elements = Array.from(root.querySelectorAll<HTMLElement>("input, textarea, button, img, [aria-label], [title], option"));
  if (root instanceof Element) elements.unshift(root as HTMLElement);
  return elements.filter((element) => !element.closest("[data-no-translate]") && !ignoredTags.has(element.tagName));
}

async function fetchTranslations(language: LanguageCode, texts: string[]) {
  const missing = texts.filter((text) => !translationCache.has(cacheKey(language, text)));
  if (missing.length === 0) return;

  const response = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language: apiLanguageCodes[language], texts: missing }),
  });

  if (!response.ok) throw new Error("Translation request failed");

  const data = (await response.json()) as TranslationResponse;
  Object.entries(data.translations ?? {}).forEach(([source, translated]) => {
    translationCache.set(cacheKey(language, source), translated);
    try {
      window.localStorage.setItem(cacheKey(language, source), translated);
    } catch {
      // Local storage can be full or blocked. The in-memory cache is enough for this session.
    }
  });
}

function hydrateCache(language: LanguageCode, texts: string[]) {
  texts.forEach((text) => {
    const key = cacheKey(language, text);
    if (translationCache.has(key)) return;
    try {
      const stored = window.localStorage.getItem(key);
      if (stored) translationCache.set(key, stored);
    } catch {
      // Ignore storage restrictions.
    }
  });
}

function restoreEnglish(root: ParentNode) {
  collectAllTextNodes(root).forEach((node) => {
    const original = translatedTextNodes.get(node);
    if (original) node.nodeValue = original;
  });

  collectAttributeElements(root).forEach((element) => {
    const originals = translatedAttributes.get(element);
    originals?.forEach((value, attribute) => {
      element.setAttribute(attribute, value);
    });
  });
}

async function translateDom(root: ParentNode, language: LanguageCode) {
  if (language === "en") {
    restoreEnglish(root);
    return;
  }

  const textNodes = collectTextNodes(root);
  const textSources = textNodes
    .map((node) => translatedTextNodes.get(node) ?? node.nodeValue ?? "")
    .map((text) => text.trim())
    .filter(shouldTranslateText);

  const attributeEntries = collectAttributeElements(root).flatMap((element) =>
    translatableAttributes
      .map((attribute) => ({ element, attribute, value: getOriginalAttribute(element, attribute).trim() }))
      .filter((entry) => shouldTranslateText(entry.value))
  );

  const optionEntries = Array.from(root.querySelectorAll<HTMLOptionElement>("option"))
    .map((element) => ({ element, attribute: "textContent", value: (translatedTextNodes.get(element.firstChild as Text) ?? element.textContent ?? "").trim() }))
    .filter((entry) => shouldTranslateText(entry.value));

  const sources = Array.from(new Set([...textSources, ...attributeEntries.map((entry) => entry.value), ...optionEntries.map((entry) => entry.value)]));
  if (sources.length === 0) return;

  hydrateCache(language, sources);
  await fetchTranslations(language, sources);

  textNodes.forEach((node) => {
    const original = translatedTextNodes.get(node) ?? node.nodeValue?.trim() ?? "";
    if (!shouldTranslateText(original)) return;
    const translated = translationCache.get(cacheKey(language, original));
    if (!translated) return;
    if (!translatedTextNodes.has(node)) translatedTextNodes.set(node, original);
    node.nodeValue = (node.nodeValue ?? "").replace(original, translated);
  });

  attributeEntries.forEach(({ element, attribute, value }) => {
    const translated = translationCache.get(cacheKey(language, value));
    if (!translated) return;
    setOriginalAttribute(element, attribute, value);
    element.setAttribute(attribute, translated);
  });

  optionEntries.forEach(({ element, value }) => {
    const translated = translationCache.get(cacheKey(language, value));
    if (!translated) return;
    if (element.firstChild instanceof Text && !translatedTextNodes.has(element.firstChild)) {
      translatedTextNodes.set(element.firstChild, value);
    }
    element.textContent = translated;
  });
}

function scheduleDomTranslation(language: LanguageCode) {
  const root = document.querySelector("main") ?? document.body;
  const delays = [0, 120, 300, 700, 1200, 2200];
  delays.forEach((delay) => {
    window.setTimeout(() => {
      translateDom(root, language).catch((error) => {
        console.error("App translation failed", error);
      });
    }, delay);
  });
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const observerRef = useRef<MutationObserver | null>(null);
  const mutationTimerRef = useRef<number | null>(null);
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("equigrant-language") as LanguageCode | null;
    if (stored) {
      setLanguageState(stored);
      document.documentElement.lang = stored;
      document.documentElement.dir = stored === "ar" ? "rtl" : "ltr";
      scheduleDomTranslation(stored);
    }
  }, []);

  useEffect(() => {
    observerRef.current?.disconnect();
    observerRef.current = new MutationObserver(() => {
      if (mutationTimerRef.current) window.clearTimeout(mutationTimerRef.current);
      mutationTimerRef.current = window.setTimeout(() => scheduleDomTranslation(language), 160);
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: translatableAttributes,
    });

    scheduleDomTranslation(language);

    return () => {
      observerRef.current?.disconnect();
      if (mutationTimerRef.current) window.clearTimeout(mutationTimerRef.current);
    };
  }, [language, pathname]);

  const setLanguage = (nextLanguage: LanguageCode) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem("equigrant-language", nextLanguage);
    document.documentElement.lang = nextLanguage;
    document.documentElement.dir = nextLanguage === "ar" ? "rtl" : "ltr";
    scheduleDomTranslation(nextLanguage);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: getMessages(language),
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
