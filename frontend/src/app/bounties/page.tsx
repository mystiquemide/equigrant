"use client";

import { motion } from "framer-motion";
import { AlertCircle, ArrowUpDown, Filter, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { BountyCard } from "@/components/BountyCard";
import { useLanguage } from "@/components/LanguageProvider";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useBounties } from "@/hooks/useBounties";
import type { BountyData } from "@/types";

type StatusFilter = "all" | BountyData["status"];
type RewardFilter = "all" | "under-5k" | "5k-10k" | "10k-plus";
type SortOption = "newest" | "reward-desc" | "deadline-asc" | "submissions-desc";

function numericAmount(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function matchesRewardFilter(bounty: BountyData, filter: RewardFilter) {
  const reward = numericAmount(bounty.reward_pool);
  if (filter === "under-5k") return reward < 5000;
  if (filter === "5k-10k") return reward >= 5000 && reward <= 10000;
  if (filter === "10k-plus") return reward > 10000;
  return true;
}

export default function BountiesPage() {
  const { bounties, isLoading, error } = useBounties();
  const { t } = useLanguage();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [rewardFilter, setRewardFilter] = useState<RewardFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const sourceBounties = bounties;
  const hasNoLiveBounties = !isLoading && !error && bounties.length === 0;

  const filteredBounties = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sourceBounties
      .filter((bounty) => {
        const searchableText = `${bounty.id} ${bounty.criteria} ${bounty.creator}`.toLowerCase();
        const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
        const matchesStatus = statusFilter === "all" || bounty.status === statusFilter;
        return matchesQuery && matchesStatus && matchesRewardFilter(bounty, rewardFilter);
      })
      .sort((a, b) => {
        if (sortBy === "reward-desc") return numericAmount(b.reward_pool) - numericAmount(a.reward_pool);
        if (sortBy === "deadline-asc") {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (sortBy === "submissions-desc") {
          return Number(b.submission_count || 0) - Number(a.submission_count || 0);
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [query, rewardFilter, sortBy, sourceBounties, statusFilter]);

  const activeCount = sourceBounties.filter((bounty) => bounty.status === "active").length;
  const totalRewards = sourceBounties.reduce((sum, bounty) => sum + numericAmount(bounty.reward_pool), 0);
  const submissionCount = sourceBounties.reduce((sum, bounty) => sum + Number(bounty.submission_count || 0), 0);

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <section className="border-b border-black/10 bg-[#f7f7f8] px-4 py-12 dark:border-white/10 dark:bg-[#060608] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="mb-3 text-sm font-bold uppercase text-[#282B5D] dark:text-[#BCA2FF]">
                {t.browseHeroEyebrow}
              </p>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal text-black dark:text-white sm:text-5xl">
                {t.browseHeroHeadline}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-black/60 dark:text-white/60">
                {t.browseHeroBody}
              </p>
            </div>
            <button
              onClick={() => router.push("/create")}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#282B5D] px-5 text-sm font-bold text-white shadow-xl shadow-[#282B5D]/15 transition hover:-translate-y-0.5 hover:bg-[#110FFF] dark:bg-white dark:text-black dark:hover:bg-[#BCA2FF]"
            >
              <Plus className="h-4 w-4" />
              {t.createBounty}
            </button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-sm font-semibold text-black/45 dark:text-white/45">{t.activeBounties}</p>
              <p className="mt-2 text-3xl font-bold">{activeCount}</p>
            </div>
            <div className="rounded-md border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-sm font-semibold text-black/45 dark:text-white/45">{t.rewardPool}</p>
              <p className="mt-2 text-3xl font-bold">{totalRewards.toLocaleString()} GEN</p>
            </div>
            <div className="rounded-md border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-sm font-semibold text-black/45 dark:text-white/45">{t.builderSubmissions}</p>
              <p className="mt-2 text-3xl font-bold">{submissionCount}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {(error || hasNoLiveBounties) && (
            <div className="mb-5 flex items-start gap-3 rounded-md border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error || t.noLiveBounties}</p>
            </div>
          )}

          <div className="sticky top-20 z-30 mb-6 rounded-md border border-black/10 bg-white/90 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-black/80">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
              <label className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40 dark:text-white/40" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t.searchByCriteria}
                  className="h-11 w-full rounded-md border border-black/10 bg-white pl-10 pr-4 text-sm font-medium text-black outline-none transition placeholder:text-black/35 focus:border-[#282B5D] focus:ring-4 focus:ring-[#282B5D]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35 dark:focus:border-[#BCA2FF] dark:focus:ring-[#BCA2FF]/10"
                />
              </label>

              <label className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40 dark:text-white/40" />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                  className="h-11 w-full appearance-none rounded-md border border-black/10 bg-white pl-10 pr-9 text-sm font-bold text-black outline-none transition focus:border-[#282B5D] dark:border-white/10 dark:bg-black dark:text-white dark:focus:border-[#BCA2FF] lg:w-44"
                >
                  <option value="all">{t.allStatuses}</option>
                  <option value="active">{t.active}</option>
                  <option value="evaluating">{t.evaluating}</option>
                  <option value="resolved">{t.resolved}</option>
                </select>
              </label>

              <label className="relative">
                <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40 dark:text-white/40" />
                <select
                  value={rewardFilter}
                  onChange={(event) => setRewardFilter(event.target.value as RewardFilter)}
                  className="h-11 w-full appearance-none rounded-md border border-black/10 bg-white pl-10 pr-9 text-sm font-bold text-black outline-none transition focus:border-[#282B5D] dark:border-white/10 dark:bg-black dark:text-white dark:focus:border-[#BCA2FF] lg:w-44"
                >
                  <option value="all">{t.allRewards}</option>
                  <option value="under-5k">{t.under5k}</option>
                  <option value="5k-10k">{t.between5k10k}</option>
                  <option value="10k-plus">{t.over10k}</option>
                </select>
              </label>

              <label className="relative">
                <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40 dark:text-white/40" />
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOption)}
                  className="h-11 w-full appearance-none rounded-md border border-black/10 bg-white pl-10 pr-9 text-sm font-bold text-black outline-none transition focus:border-[#282B5D] dark:border-white/10 dark:bg-black dark:text-white dark:focus:border-[#BCA2FF] lg:w-48"
                >
                  <option value="newest">{t.newestFirst}</option>
                  <option value="reward-desc">{t.highestReward}</option>
                  <option value="deadline-asc">{t.deadlineSoonest}</option>
                  <option value="submissions-desc">{t.mostSubmissions}</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-black/55 dark:text-white/55">
              {t.showingBounties} {filteredBounties.length} {t.of} {sourceBounties.length} {t.bounties}
            </p>
            {(query || statusFilter !== "all" || rewardFilter !== "all") && (
              <button
                onClick={() => {
                  setQuery("");
                  setStatusFilter("all");
                  setRewardFilter("all");
                }}
                className="text-sm font-bold text-[#282B5D] transition hover:text-[#110FFF] dark:text-[#BCA2FF]"
              >
                {t.clearFilters}
              </button>
            )}
          </div>

          {isLoading ? (
            <LoadingSkeleton variant="card" count={6} />
          ) : filteredBounties.length === 0 ? (
            <div className="rounded-md border border-black/10 bg-[#f7f7f8] px-6 py-16 text-center dark:border-white/10 dark:bg-white/[0.04]">
              <h2 className="text-2xl font-bold text-black dark:text-white">{t.noBountiesMatch}</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/55 dark:text-white/55">
                {t.widenFilters}
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {filteredBounties.map((bounty) => (
                <BountyCard key={bounty.id} bounty={bounty} />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <button
        onClick={() => router.push("/create")}
        className="fixed bottom-5 right-5 z-40 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#282B5D] px-5 text-sm font-bold text-white shadow-2xl shadow-[#282B5D]/25 transition hover:-translate-y-0.5 hover:bg-[#110FFF] dark:bg-white dark:text-black dark:hover:bg-[#BCA2FF]"
      >
        <Plus className="h-4 w-4" />
        {t.createBounty}
      </button>
    </div>
  );
}
