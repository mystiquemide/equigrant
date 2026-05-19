import { NextResponse } from "next/server";

const supportedLanguages = new Set(["es", "fr", "pt", "ar", "hi", "zh-CN", "ja"]);

async function translateText(text: string, language: string) {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", `en|${language}`);

  const response = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 30 } });
  if (!response.ok) return text;

  const data = (await response.json()) as {
    responseData?: { translatedText?: string };
    responseStatus?: number;
  };

  if (data.responseStatus && data.responseStatus >= 400) return text;
  return data.responseData?.translatedText?.trim() || text;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { language?: string; texts?: unknown } | null;
  const language = body?.language;
  const texts = Array.isArray(body?.texts) ? body.texts : [];

  if (!language || !supportedLanguages.has(language)) {
    return NextResponse.json({ translations: {} }, { status: 400 });
  }

  const cleanTexts = Array.from(
    new Set(
      texts
        .filter((text): text is string => typeof text === "string")
        .map((text) => text.trim())
        .filter((text) => text.length > 1 && text.length < 500)
    )
  ).slice(0, 80);

  const entries = await Promise.all(
    cleanTexts.map(async (text) => [text, await translateText(text, language)] as const)
  );

  return NextResponse.json({ translations: Object.fromEntries(entries) });
}
