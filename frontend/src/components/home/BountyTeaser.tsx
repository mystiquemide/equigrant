"use client";

import { motion } from "framer-motion";
import { ArrowRight, Filter, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { useLanguage } from "@/components/LanguageProvider";

export function BountyTeaser() {
  const { t } = useLanguage();
  const bounties = [
    {
      id: "privacy-wallet",
      title: t.privacyWalletTitle,
      reward: "8,500 GEN",
      deadline: "12 days",
      category: t.privacyWalletCategory,
      criteria: t.privacyWalletCriteria,
    },
    {
      id: "ngo-impact",
      title: t.ngoDashboardTitle,
      reward: "6,000 GEN",
      deadline: "18 days",
      category: t.ngoDashboardCategory,
      criteria: t.ngoDashboardCriteria,
    },
    {
      id: "dao-reviews",
      title: t.daoPortalTitle,
      reward: "10,000 GEN",
      deadline: "24 days",
      category: t.daoPortalCategory,
      criteria: t.daoPortalCriteria,
    },
  ];

  return (
    <section id="features" className="border-b border-black/10 bg-[#f7f7f8] px-4 py-20 dark:border-white/10 dark:bg-[#060608] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-bold uppercase text-[#282B5D] dark:text-[#BCA2FF]">{t.publicBountyTeaser}</p>
            <h2 className="text-3xl font-bold tracking-normal text-black dark:text-white sm:text-4xl">{t.bountyHeadline}</h2>
            <p className="mt-4 text-base leading-7 text-black/60 dark:text-white/60">
              {t.bountyBody}
            </p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-[1fr_auto] lg:max-w-xl">
            <label className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40 dark:text-white/40" />
              <input
                type="search"
                placeholder={t.searchBounties}
                className="h-12 w-full rounded-md border border-black/10 bg-white pl-10 pr-4 text-sm font-medium text-black outline-none transition placeholder:text-black/35 focus:border-[#282B5D] focus:ring-4 focus:ring-[#282B5D]/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/35 dark:focus:border-[#BCA2FF] dark:focus:ring-[#BCA2FF]/10"
              />
            </label>
            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-4 text-sm font-bold text-black transition hover:border-[#282B5D] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-[#BCA2FF]">
              <Filter className="h-4 w-4" />
              {t.filters}
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {bounties.map((bounty, index) => (
            <motion.div
              key={bounty.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              whileHover={{ y: -6, rotateX: 1.2, rotateY: -1.2 }}
              transition={{ delay: index * 0.08, duration: 0.45 }}
              className="group rounded-md border border-black/10 bg-white p-5 shadow-sm transition hover:border-[#282B5D]/40 hover:shadow-2xl hover:shadow-[#282B5D]/10 dark:border-white/10 dark:bg-white/5 dark:hover:border-[#BCA2FF]/50"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="rounded-full bg-[#282B5D]/10 px-3 py-1 text-xs font-bold text-[#282B5D] dark:bg-[#BCA2FF]/15 dark:text-[#BCA2FF]">
                  {t.active}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-black/55 dark:text-white/55">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#282B5D] dark:text-[#BCA2FF]" />
                  {t.aiScoring}
                </span>
              </div>
              <p className="mb-2 text-sm font-bold text-black/45 dark:text-white/45">{bounty.category}</p>
              <h3 className="min-h-14 text-xl font-bold leading-7 text-black transition group-hover:text-[#282B5D] dark:text-white dark:group-hover:text-[#BCA2FF]">
                {bounty.title}
              </h3>
              <p className="mt-4 min-h-12 text-sm leading-6 text-black/60 dark:text-white/60">{bounty.criteria}</p>
              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-black/10 pt-5 dark:border-white/10">
                <div>
                  <p className="text-xs font-semibold text-black/40 dark:text-white/40">{t.reward}</p>
                  <p className="mt-1 font-bold text-black dark:text-white">{bounty.reward}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-black/40 dark:text-white/40">{t.deadline}</p>
                  <p className="mt-1 font-bold text-black dark:text-white">{bounty.deadline}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/bounties" className="group inline-flex items-center gap-2 text-sm font-bold text-[#282B5D] transition hover:text-[#110FFF] dark:text-[#BCA2FF]">
            {t.viewAllBounties}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
