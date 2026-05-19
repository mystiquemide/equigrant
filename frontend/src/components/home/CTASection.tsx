"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAccount } from "wagmi";

import { useLanguage } from "@/components/LanguageProvider";

export function CTASection() {
  const { isConnected } = useAccount();
  const { t } = useLanguage();

  return (
    <section className="bg-[#f7f7f8] px-4 py-20 dark:bg-[#060608] sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55 }}
        className="mx-auto max-w-7xl overflow-hidden rounded-md border border-black/10 bg-black p-8 text-white shadow-2xl shadow-[#282B5D]/20 dark:border-white/10 dark:bg-white dark:text-black md:p-12"
      >
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="mb-3 text-sm font-bold uppercase text-[#BCA2FF] dark:text-[#282B5D]">{t.ready}</p>
            <h2 className="text-3xl font-bold tracking-normal sm:text-4xl">{t.ctaHeadline}</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/65 dark:text-black/60">
              {t.ctaBody}
            </p>
          </div>

          <Link
            href={isConnected ? "/dashboard" : "/bounties"}
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-md bg-white px-6 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:bg-[#BCA2FF] dark:bg-black dark:text-white dark:hover:bg-[#282B5D]"
          >
            {isConnected ? t.enterEquigrant : t.viewActiveBounties}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
