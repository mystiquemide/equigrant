"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bot, CheckCircle2, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useLanguage } from "@/components/LanguageProvider";

export function Hero() {
  const { t } = useLanguage();
  const stats = [
    { label: t.consensusScoring, value: "AI" },
    { label: t.grantPayouts, value: "GEN" },
    { label: t.auditTrail, value: t.onchain },
  ];
  const validatorScores = [t.repoQuality, t.impactEvidence, t.originality];

  return (
    <section className="relative min-h-[calc(100vh-80px)] overflow-hidden border-b border-black/10 bg-white dark:border-white/10 dark:bg-black">
      <div className="absolute inset-0 opacity-[0.25] dark:opacity-[0.28]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(40,43,93,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(40,43,93,0.12)_1px,transparent_1px)] bg-[size:56px_56px] dark:bg-[linear-gradient(to_right,rgba(188,162,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(188,162,255,0.1)_1px,transparent_1px)]" />
      </div>
      <motion.div
        aria-hidden
        animate={{ y: [0, -16, 0], rotate: [0, 1, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[max(2rem,calc((100vw-80rem)/2+1rem))] top-24 hidden w-80 rounded-md border border-black/10 bg-white/90 p-5 shadow-2xl shadow-[#282B5D]/10 backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[#110FFF]/20 lg:block"
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-black dark:text-white">{t.validatorConsensus}</p>
          <span className="rounded-full bg-[#282B5D]/10 px-2 py-1 text-xs font-bold text-[#282B5D] dark:bg-[#BCA2FF]/30 dark:text-[#BCA2FF]">
            {t.live}
          </span>
        </div>
        <div className="space-y-3">
          {validatorScores.map((item, index) => (
            <div key={item}>
              <div className="mb-1 flex justify-between text-xs text-black/55 dark:text-white/55">
                <span>{item}</span>
                <span>{92 - index * 7}%</span>
              </div>
              <div className="h-2 rounded-full bg-black/10 dark:bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${92 - index * 7}%` }}
                  transition={{ delay: 0.7 + index * 0.15, duration: 0.9 }}
                  className="h-2 rounded-full bg-[#282B5D] dark:bg-[#BCA2FF]"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        aria-hidden
        animate={{ y: [0, 14, 0], rotate: [0, -1.5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-16 left-[max(2rem,calc((100vw-80rem)/2+1rem))] hidden w-72 rounded-md border border-black/10 bg-white/90 p-5 shadow-2xl shadow-[#282B5D]/10 backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[#110FFF]/20 xl:block"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#282B5D] text-white dark:bg-[#BCA2FF] dark:text-black">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-black dark:text-white">{t.autoDistributionReady}</p>
            <p className="text-xs text-black/55 dark:text-white/55">{t.payoutPrepared}</p>
          </div>
        </div>
      </motion.div>

      <div className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="mb-8 inline-flex items-center gap-3 rounded-full border border-black/10 bg-white px-4 py-2 shadow-lg shadow-black/5 dark:border-white/10 dark:bg-white/[0.06]"
          >
            <Image
              src="/equigrant-mark.svg"
              alt="EquiGrant"
              width={22}
              height={22}
              className="h-[22px] w-[22px] object-contain"
              priority
            />
            <span className="text-sm font-semibold text-black/70 dark:text-white/70">
              {t.builtFor}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.65, ease: "easeOut" }}
            className="text-balance text-5xl font-bold leading-[1.02] tracking-normal text-black dark:text-white sm:text-6xl lg:text-7xl"
          >
            {t.heroHeadline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.6, ease: "easeOut" }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-black/65 dark:text-white/65"
          >
            {t.heroBody}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34, duration: 0.6, ease: "easeOut" }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              href="/bounties"
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#282B5D] px-6 text-sm font-bold text-white shadow-xl shadow-[#282B5D]/15 transition hover:-translate-y-0.5 hover:bg-[#110FFF] dark:bg-white dark:text-black dark:shadow-[#BCA2FF]/10 dark:hover:bg-[#BCA2FF] sm:w-auto"
            >
              {t.browse}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link
              href="/create"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-6 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:border-[#282B5D] dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:hover:border-[#BCA2FF] sm:w-auto"
            >
              <Sparkles className="h-4 w-4" />
              {t.createBounty}
            </Link>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + index * 0.08, duration: 0.45 }}
                className="rounded-md border border-black/10 bg-white/80 p-4 text-left backdrop-blur dark:border-white/10 dark:bg-white/[0.06]"
              >
                <div className="mb-3 flex items-center gap-2 text-[#282B5D] dark:text-[#BCA2FF]">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-black dark:text-white">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
