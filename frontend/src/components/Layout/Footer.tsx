"use client";

import { ExternalLink } from "lucide-react";
import Image from "next/image";

import { useLanguage } from "@/components/LanguageProvider";

const footerLinks = [
  { label: "Docs", href: "#" },
  { label: "Faucet", href: "https://testnet-faucet.genlayer.foundation" },
  { label: "Explorer", href: "https://bradbury.explorer.genlayer.foundation" },
];

export function Footer() {
  const { t } = useLanguage();
  const labels = {
    Docs: t.docs,
    Faucet: t.faucet,
    Explorer: t.explorer,
  };

  return (
    <footer className="border-t border-black/10 bg-[#f7f7f8] dark:border-white/10 dark:bg-[#060608]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md">
              <Image
                src="/equigrant-mark.svg"
                alt="EquiGrant"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            </span>
            <div>
              <p className="text-base font-bold text-black dark:text-white">EquiGrant</p>
              <p className="text-sm text-black/55 dark:text-white/55">{t.footerTagline}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm font-semibold text-black/60 dark:text-white/60">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href === "#" ? undefined : "_blank"}
                rel={link.href === "#" ? undefined : "noopener noreferrer"}
                className="inline-flex items-center gap-1 transition hover:text-[#282B5D] dark:hover:text-[#BCA2FF]"
              >
                {labels[link.label as keyof typeof labels]}
                {link.href === "#" ? null : <ExternalLink className="h-3.5 w-3.5" />}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-black/10 pt-6 text-xs text-black/45 dark:border-white/10 dark:text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} EquiGrant. {t.allRightsReserved}</p>
          <p>{t.footerPowered}</p>
        </div>
      </div>
    </footer>
  );
}
