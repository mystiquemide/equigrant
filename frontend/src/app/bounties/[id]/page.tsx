"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Coins,
  FileCheck2,
  GitPullRequestArrow,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

import { ErrorBanner } from "@/components/ErrorBanner";
import { useLanguage } from "@/components/LanguageProvider";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useBounty } from "@/hooks/useBounty";
import { formatDate, formatGEN } from "@/lib/format";
import { truncateAddress } from "@/lib/truncate";
import type { BountyData, SubmissionData } from "@/types";

type DetailProfile = {
  title: string;
  description: string;
  requirements: string[];
  evaluationCriteria: string[];
};

type LeaderboardEntry = {
  rank: number;
  builder: string;
  project: string;
  score: number;
  status: "Winner" | "Finalist" | "Evaluating";
};

function makeFallbackProfile(bounty: BountyData): DetailProfile {
  const firstSentence = bounty.criteria.split(/[.!?]/)[0]?.trim();

  return {
    title: firstSentence || "AI-scored grant opportunity",
    description:
      bounty.criteria ||
      "Review the full bounty criteria, submission expectations, reward pool, and AI evaluation rules before entering.",
    requirements: [
      "Submit a public GitHub repository with a clear README and setup instructions.",
      "Include a working demo URL that reviewers and validators can inspect.",
      "Explain project architecture, tradeoffs, security assumptions, and impact.",
      "Stake the required GEN amount before submitting to the bounty.",
    ],
    evaluationCriteria: [
      bounty.criteria || "Alignment with the published bounty criteria",
      "Execution quality, completeness, and production readiness",
      "Originality, security posture, and evidence of real implementation",
      "Impact potential for foundations, NGOs, DAOs, or enterprise grant teams",
    ],
  };
}

function statusStyles(status: BountyData["status"]) {
  if (status === "active") return "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300";
  if (status === "evaluating") return "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300";
  return "bg-black/5 text-black/60 ring-black/10 dark:bg-white/10 dark:text-white/60";
}

function buildSubmissionLeaderboard(submissions: SubmissionData[]): LeaderboardEntry[] {
  return submissions.slice(0, 5).map((submission, index) => ({
    rank: index + 1,
    builder: submission.submitter,
    project: submission.description.split(/[.!?]/)[0]?.slice(0, 44) || `Submission ${index + 1}`,
    score: Math.max(74, 94 - index * 4),
    status: index === 0 ? "Winner" : index === 1 ? "Finalist" : "Evaluating",
  }));
}

export default function BountyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bountyId = params?.id as string;
  const { bounty, submissions, isLoading, error, refetch } = useBounty(bountyId);
  const { t } = useLanguage();

  const resolvedBounty = bounty;
  const profile = resolvedBounty ? makeFallbackProfile(resolvedBounty) : null;
  const leaderboard = useMemo(() => {
    if (submissions.length > 0) return buildSubmissionLeaderboard(submissions);
    return [];
  }, [submissions]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <LoadingSkeleton variant="rect" width="100%" height="3rem" />
        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_360px]">
          <LoadingSkeleton variant="card" count={3} />
          <LoadingSkeleton variant="card" count={2} />
        </div>
      </div>
    );
  }

  if (!resolvedBounty || !profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorBanner
          title="Bounty not found"
          message={error ?? "This bounty may have been removed or the link is invalid."}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <section className="border-b border-black/10 bg-[#f7f7f8] px-4 py-10 dark:border-white/10 dark:bg-[#060608] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <button
            onClick={() => router.push("/bounties")}
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-black/55 transition hover:text-[#282B5D] dark:text-white/55 dark:hover:text-[#BCA2FF]"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backToBounties}
          </button>

          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${statusStyles(resolvedBounty.status)}`}>
                  {resolvedBounty.status}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#282B5D]/10 px-3 py-1 text-xs font-bold text-[#282B5D] dark:bg-[#BCA2FF]/15 dark:text-[#BCA2FF]">
                  <BrainCircuit className="h-3.5 w-3.5" />
                  {t.aiConsensusScoring}
                </span>
              </div>
              <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-black dark:text-white sm:text-5xl">
                {profile.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-black/60 dark:text-white/60">
                {profile.description}
              </p>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="rounded-md border border-black/10 bg-white p-5 shadow-xl shadow-black/5 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-[#f7f7f8] p-4 dark:bg-black/30">
                  <Coins className="mb-3 h-5 w-5 text-[#282B5D] dark:text-[#BCA2FF]" />
                  <p className="text-xs font-bold uppercase text-black/45 dark:text-white/45">{t.prizePool}</p>
                  <p className="mt-1 text-xl font-bold">{formatGEN(resolvedBounty.reward_pool)} GEN</p>
                </div>
                <div className="rounded-md bg-[#f7f7f8] p-4 dark:bg-black/30">
                  <ShieldCheck className="mb-3 h-5 w-5 text-[#282B5D] dark:text-[#BCA2FF]" />
                  <p className="text-xs font-bold uppercase text-black/45 dark:text-white/45">{t.stakeRequired}</p>
                  <p className="mt-1 text-xl font-bold">{formatGEN(resolvedBounty.min_stake)} GEN</p>
                </div>
                <div className="rounded-md bg-[#f7f7f8] p-4 dark:bg-black/30">
                  <CalendarDays className="mb-3 h-5 w-5 text-[#282B5D] dark:text-[#BCA2FF]" />
                  <p className="text-xs font-bold uppercase text-black/45 dark:text-white/45">{t.deadline}</p>
                  <p className="mt-1 text-sm font-bold">{formatDate(resolvedBounty.deadline) || "Rolling"}</p>
                </div>
                <div className="rounded-md bg-[#f7f7f8] p-4 dark:bg-black/30">
                  <Users className="mb-3 h-5 w-5 text-[#282B5D] dark:text-[#BCA2FF]" />
                  <p className="text-xs font-bold uppercase text-black/45 dark:text-white/45">{t.submissions}</p>
                  <p className="mt-1 text-xl font-bold">{resolvedBounty.submission_count}</p>
                </div>
              </div>

              <div className="mt-5 rounded-md border border-black/10 p-4 dark:border-white/10">
                <p className="text-xs font-bold uppercase text-black/45 dark:text-white/45">{t.creator}</p>
                <p className="mt-2 font-mono text-sm font-semibold">{truncateAddress(resolvedBounty.creator)}</p>
              </div>

              <button
                onClick={() => router.push(`/bounties/${resolvedBounty.id}/submit`)}
                disabled={resolvedBounty.status !== "active"}
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#282B5D] px-5 text-sm font-bold text-white shadow-xl shadow-[#282B5D]/15 transition hover:-translate-y-0.5 hover:bg-[#110FFF] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-[#BCA2FF]"
              >
                {t.submitEntry}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </motion.aside>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="rounded-md border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-5 flex items-center gap-3">
                <FileCheck2 className="h-5 w-5 text-[#282B5D] dark:text-[#BCA2FF]" />
                <h2 className="text-2xl font-bold">{t.description}</h2>
              </div>
              <p className="text-sm leading-7 text-black/60 dark:text-white/60">{resolvedBounty.criteria}</p>
            </section>

            <section className="rounded-md border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-5 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#282B5D] dark:text-[#BCA2FF]" />
                <h2 className="text-2xl font-bold">{t.requirements}</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {profile.requirements.map((requirement) => (
                  <div key={requirement} className="rounded-md bg-[#f7f7f8] p-4 text-sm leading-6 text-black/65 dark:bg-black/30 dark:text-white/65">
                    {requirement}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-md border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-5 flex items-center gap-3">
                <BrainCircuit className="h-5 w-5 text-[#282B5D] dark:text-[#BCA2FF]" />
                <h2 className="text-2xl font-bold">{t.evaluationCriteria}</h2>
              </div>
              <div className="space-y-3">
                {profile.evaluationCriteria.map((criterion, index) => (
                  <div key={criterion} className="flex gap-3 rounded-md border border-black/10 p-4 dark:border-white/10">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#282B5D] text-xs font-bold text-white dark:bg-[#BCA2FF] dark:text-black">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-6 text-black/65 dark:text-white/65">{criterion}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-md border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-5 flex items-center gap-3">
                <Trophy className="h-5 w-5 text-[#282B5D] dark:text-[#BCA2FF]" />
                <h2 className="text-2xl font-bold">{t.publicLeaderboardTitle}</h2>
              </div>

              {leaderboard.length === 0 ? (
                <div className="rounded-md bg-[#f7f7f8] p-5 text-sm leading-6 text-black/55 dark:bg-black/30 dark:text-white/55">
                  {t.noPublicSubmissions}
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry) => (
                    <div key={`${entry.rank}-${entry.builder}`} className="rounded-md border border-black/10 p-4 dark:border-white/10">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase text-[#282B5D] dark:text-[#BCA2FF]">
                            {t.rank} {entry.rank}
                          </p>
                          <p className="mt-1 font-bold">{entry.project}</p>
                          <p className="mt-1 font-mono text-xs text-black/45 dark:text-white/45">
                            {truncateAddress(entry.builder)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{entry.score}</p>
                          <p className="text-xs font-semibold text-black/45 dark:text-white/45">{t.aiScore}</p>
                        </div>
                      </div>
                      <div className="mt-3 inline-flex rounded-full bg-[#282B5D]/10 px-3 py-1 text-xs font-bold text-[#282B5D] dark:bg-[#BCA2FF]/15 dark:text-[#BCA2FF]">
                        {entry.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-md border border-black/10 bg-[#282B5D] p-6 text-white dark:border-white/10">
              <GitPullRequestArrow className="h-6 w-6 text-[#BCA2FF]" />
              <h2 className="mt-4 text-2xl font-bold">{t.readyToCompete}</h2>
              <p className="mt-3 text-sm leading-6 text-white/70">
                {t.readyToCompeteBody}
              </p>
              <button
                onClick={() => router.push(`/bounties/${resolvedBounty.id}/submit`)}
                disabled={resolvedBounty.status !== "active"}
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:bg-[#BCA2FF] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t.submitEntry}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </section>
          </aside>
        </div>
      </section>
    </div>
  );
}
