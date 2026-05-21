"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Coins, Globe2, LayoutDashboard, Menu, ShieldCheck, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";

import { ThemeToggle } from "@/components/ThemeToggle";
import { WALLET_REDIRECT_KEY, WalletConnect } from "@/components/WalletConnect";
import { useLanguage } from "@/components/LanguageProvider";
import { useCreatorAccess } from "@/hooks/useCreatorAccess";
import { languages, type LanguageCode } from "@/lib/i18n";

const currencies = ["GEN", "USD", "EUR", "GBP", "NGN", "USDC"];

function CurrencySelect() {
  const [selected, setSelected] = useState("GEN");
  const [open, setOpen] = useState(false);

  return (
    <div className="relative hidden xl:block">
      <button
        aria-label="Select currency"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 items-center gap-2 rounded-md border border-black/10 bg-white px-3 text-sm font-semibold text-black transition hover:border-[#282B5D] hover:text-[#282B5D] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:border-[#BCA2FF]/60 dark:hover:bg-white/[0.08]"
      >
        <Coins className="h-4 w-4" />
        {selected}
        <ChevronDown className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 top-12 z-50 w-36 overflow-hidden rounded-md border border-black/10 bg-white p-1 shadow-2xl dark:border-white/10 dark:bg-[#09090d]"
          >
            {currencies.map((currency) => (
              <button
                key={currency}
                onClick={() => {
                  setSelected(currency);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm font-semibold text-black/70 transition hover:bg-black/5 hover:text-black dark:text-white/75 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {currency}
                {selected === currency ? <Check className="h-4 w-4 text-[#BCA2FF]" /> : null}
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function LanguageSelect() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const selected = languages.find((item) => item.code === language) ?? languages[0];

  return (
    <div className="relative hidden xl:block">
      <button
        aria-label="Select language"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 items-center gap-2 rounded-md border border-black/10 bg-white px-3 text-sm font-semibold text-black transition hover:border-[#282B5D] hover:text-[#282B5D] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:border-[#BCA2FF]/60 dark:hover:bg-white/[0.08]"
      >
        <Globe2 className="h-4 w-4" />
        {selected.code.toUpperCase()}
        <ChevronDown className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-md border border-black/10 bg-white p-1 shadow-2xl dark:border-white/10 dark:bg-[#09090d]"
          >
            {languages.map((item) => (
              <button
                key={item.code}
                onClick={() => {
                  setLanguage(item.code as LanguageCode);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm font-semibold text-black/70 transition hover:bg-black/5 hover:text-black dark:text-white/75 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <span>
                  {item.nativeName}
                  <span className="ml-2 text-xs text-black/35 dark:text-white/35">{item.label}</span>
                </span>
                {language === item.code ? <Check className="h-4 w-4 text-[#BCA2FF]" /> : null}
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isConnected } = useAccount();
  const { t } = useLanguage();
  const { isCreator } = useCreatorAccess();
  const [isOpen, setIsOpen] = useState(false);
  const wasConnected = useRef(isConnected);

  const navLinks = [
    { href: "/", label: t.home },
    { href: "/bounties", label: t.browseBounties },
    { href: "/create", label: t.createBounty },
    { href: "/leaderboard", label: t.leaderboard },
  ];

  const connectedLinks = [
    { href: "/dashboard", label: t.dashboard, icon: LayoutDashboard, visible: true },
    { href: "/admin", label: t.admin, icon: ShieldCheck, visible: isCreator },
  ].filter((link) => link.visible);

  useEffect(() => {
    const shouldRedirect = window.sessionStorage.getItem(WALLET_REDIRECT_KEY) === "true";

    if ((shouldRedirect && pathname === "/") || (isConnected && pathname === "/")) {
      window.sessionStorage.removeItem(WALLET_REDIRECT_KEY);
      router.replace("/dashboard/submissions");
    }
    if (wasConnected.current && !isConnected && pathname !== "/") {
      router.replace("/");
    }
    wasConnected.current = isConnected;
  }, [isConnected, pathname, router]);

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-black/90"
    >
      <div className="mx-auto grid h-20 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-5 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <motion.span
            whileHover={{ scale: 1.04, filter: "drop-shadow(0 0 14px rgba(188,162,255,0.45))" }}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#ede9e3] p-1"
          >
            <span className="absolute inset-0 rounded-md opacity-0 ring-2 ring-[#BCA2FF]/70 transition group-hover:opacity-100" />
            <Image
              src="/equigrant-mark.svg"
              alt="EquiGrant"
              width={40}
              height={40}
              className="h-8 w-8 object-contain"
              priority
            />
          </motion.span>
          <span className="text-lg font-bold tracking-tight text-black dark:text-white">EquiGrant</span>
        </Link>

        <div className="hidden min-w-0 items-center justify-center gap-5 lg:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative max-w-[120px] text-center text-sm font-semibold leading-5 transition xl:max-w-none ${
                  active
                    ? "text-[#282B5D] dark:text-[#BCA2FF]"
                    : "text-black/55 hover:text-black dark:text-white/55 dark:hover:text-white"
                }`}
              >
                {link.label}
                {active ? (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-[#282B5D] dark:bg-[#BCA2FF]"
                  />
                ) : null}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center justify-end gap-2 lg:flex">
          <ThemeToggle />
          <LanguageSelect />
          <CurrencySelect />
          {isConnected
            ? connectedLinks.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
                      active
                        ? "border-[#282B5D]/40 bg-[#282B5D]/10 text-[#282B5D] dark:border-[#BCA2FF]/50 dark:bg-[#BCA2FF]/15 dark:text-[#BCA2FF]"
                        : "border-black/10 bg-white text-black hover:border-[#282B5D] hover:text-[#282B5D] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:border-[#BCA2FF]/60 dark:hover:bg-white/[0.08]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden xl:inline">{link.label}</span>
                  </Link>
                );
              })
            : null}
          <WalletConnect redirectOnConnect={pathname === "/"} />
        </div>

        <button
          aria-label="Open menu"
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center justify-self-end rounded-md border border-black/10 bg-white text-black dark:border-white/10 dark:bg-white/[0.04] dark:text-white lg:hidden"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-black/10 bg-white dark:border-white/10 dark:bg-black lg:hidden"
          >
            <div className="space-y-3 px-4 py-5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-md px-3 py-3 text-sm font-semibold text-black/75 hover:bg-black/5 dark:text-white/75 dark:hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
              {isConnected ? (
                <div className="grid gap-2 border-t border-black/10 pt-3 dark:border-white/10">
                  {connectedLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 rounded-md px-3 py-3 text-sm font-semibold text-black/75 hover:bg-black/5 dark:text-white/75 dark:hover:bg-white/10"
                      >
                        <Icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <ThemeToggle />
                <WalletConnect redirectOnConnect={pathname === "/"} />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.nav>
  );
}
