"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BrainCircuit, CalendarDays, Coins, ShieldCheck, Users } from "lucide-react";
import { useRouter } from "next/navigation";

import { useLanguage } from "@/components/LanguageProvider";
import type { BountyData } from "@/types";
import { formatDate, formatGEN } from "@/lib/format";

interface BountyCardProps {
  bounty: BountyData;
}

const statusStyles = {
  active:
    "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-300/20",
  evaluating:
    "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300 dark:ring-amber-300/20",
  paused:
    "bg-[#282B5D]/10 text-[#282B5D] ring-[#282B5D]/20 dark:text-[#BCA2FF] dark:ring-[#BCA2FF]/20",
  resolved:
    "bg-black/5 text-black/60 ring-black/10 dark:bg-white/10 dark:text-white/60 dark:ring-white/10",
  deleted:
    "bg-red-500/10 text-red-700 ring-red-500/20 dark:text-red-300 dark:ring-red-300/20",
} satisfies Record<BountyData["status"], string>;

function getTitle(criteria: string, fallback: string) {
  const firstSentence = criteria.split(/[.!?]/)[0]?.trim();
  if (!firstSentence) return fallback;
  return firstSentence.length > 86 ? `${firstSentence.slice(0, 83)}...` : firstSentence;
}

export function BountyCard({ bounty }: BountyCardProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const submissionCount = Number(bounty.submission_count || 0);
  const title = getTitle(bounty.criteria, t.defaultBountyTitle);

  const openBounty = () => router.push(`/bounties/${bounty.id}`);
  const statusLabel = {
    active: t.active,
    evaluating: t.evaluating,
    paused: t.paused,
    resolved: t.resolved,
    deleted: t.deleted,
  }[bounty.status];

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      onClick={openBounty}
      className="group flex min-h-[320px] cursor-pointer flex-col rounded-md border border-black/10 bg-white p-5 shadow-sm transition hover:border-[#282B5D]/50 hover:shadow-2xl hover:shadow-[#282B5D]/10 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-[#BCA2FF]/60 dark:hover:shadow-[#110FFF]/10"
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          openBounty();
        }
      }}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${
            statusStyles[bounty.status]
          }`}
        >
          {statusLabel}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#282B5D]/10 px-3 py-1 text-xs font-bold text-[#282B5D] dark:bg-[#BCA2FF]/15 dark:text-[#BCA2FF]">
          <BrainCircuit className="h-3.5 w-3.5" />
          {t.aiScored}
        </span>
      </div>

      <h2 className="text-xl font-bold leading-7 text-black transition group-hover:text-[#282B5D] dark:text-white dark:group-hover:text-[#BCA2FF]">
        {title}
      </h2>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-black/55 dark:text-white/55">
        {bounty.criteria}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-md border border-black/10 bg-[#f7f7f8] p-3 dark:border-white/10 dark:bg-black/30">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-black/45 dark:text-white/45">
            <Coins className="h-3.5 w-3.5" />
            {t.reward}
          </div>
          <p className="font-bold text-black dark:text-white">{formatGEN(bounty.reward_pool)} GEN</p>
        </div>
        <div className="rounded-md border border-black/10 bg-[#f7f7f8] p-3 dark:border-white/10 dark:bg-black/30">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-black/45 dark:text-white/45">
            <CalendarDays className="h-3.5 w-3.5" />
            {t.deadline}
          </div>
          <p className="font-bold text-black dark:text-white">{formatDate(bounty.deadline) || t.rolling}</p>
        </div>
      </div>

      <div className="mt-auto border-t border-black/10 pt-5 dark:border-white/10">
        <div className="flex items-center justify-between gap-4 text-sm text-black/55 dark:text-white/55">
          <span className="inline-flex items-center gap-2">
            <Users className="h-4 w-4 text-[#282B5D] dark:text-[#BCA2FF]" />
            {submissionCount > 0 ? `${submissionCount} ${t.submissions}` : t.noSubmissions}
          </span>
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#282B5D] dark:text-[#BCA2FF]" />
            {formatGEN(bounty.min_stake)} GEN {t.stake}
          </span>
        </div>
        <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#282B5D] dark:text-[#BCA2FF]">
          {t.viewBounty}
          <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </motion.article>
  );
}
