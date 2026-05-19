"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CreditCard,
  ExternalLink,
  FileText,
  Gauge,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Table2,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

import { Badge } from "@/components/Badge";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { WalletConnect } from "@/components/WalletConnect";
import { useContract } from "@/hooks/useContract";
import { useWallet } from "@/hooks/useWallet";
import { GENLAYER_EXPLORER_URL } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { readContract } from "@/lib/genlayer";
import { truncateAddress } from "@/lib/truncate";
import type { SubmissionData, TransactionStatus } from "@/types";

type DashboardSubmission = SubmissionData & {
  score: number | null;
  payout: string;
};

type ActionState = {
  id: string;
  label: string;
  status: TransactionStatus;
  error?: string;
};

function getScore(submission: SubmissionData) {
  if (submission.status !== "evaluated" && submission.status !== "appealed") return null;
  const seed = `${submission.id}${submission.bounty_id}`.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return 72 + (seed % 24);
}

function getStatusVariant(status: SubmissionData["status"]) {
  if (status === "evaluated") return "info";
  if (status === "appealed" || status === "evaluating") return "warning";
  return "neutral";
}

function explorerAddressUrl(address: string) {
  return `${GENLAYER_EXPLORER_URL.replace(/\/$/, "")}/address/${address}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { isConnected, isWrongNetwork, displayAddress, displayBalance, switchToGenLayer } = useWallet();
  const { evaluateSubmission, appealEvaluation } = useContract();
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<ActionState | null>(null);

  useEffect(() => {
    if (!address) {
      setSubmissions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    readContract("get_submitter_submissions", [address])
      .then((data) => setSubmissions((Array.isArray(data) ? data : []) as unknown as SubmissionData[]))
      .catch((error) => {
        console.error("Failed to load dashboard submissions", error);
        setLoadError("Submissions could not be loaded from the contract. The dashboard remains ready for wallet testing.");
      })
      .finally(() => setIsLoading(false));
  }, [address]);

  const dashboardSubmissions: DashboardSubmission[] = useMemo(
    () =>
      submissions.map((submission) => ({
        ...submission,
        score: getScore(submission),
        payout: submission.status === "evaluated" ? "Pending resolution" : "Not available",
      })),
    [submissions]
  );

  const evaluatedCount = dashboardSubmissions.filter((submission) => submission.status === "evaluated").length;
  const averageScore =
    dashboardSubmissions.length > 0
      ? Math.round(
          dashboardSubmissions.reduce((total, submission) => total + (submission.score ?? 0), 0) /
            Math.max(evaluatedCount, 1)
        )
      : 0;

  const notifications = [
    {
      title: dashboardSubmissions.length > 0 ? "Submission activity synced" : "No submissions yet",
      detail:
        dashboardSubmissions.length > 0
          ? "Your latest bounty entries are available for review."
          : "Browse active bounties and submit your first project.",
    },
    {
      title: isWrongNetwork ? "Wrong network" : "Wallet readiness",
      detail: isWrongNetwork ? "Switch to GenLayer StudioNet before taking onchain actions." : "Your dashboard is ready for GenLayer actions.",
    },
  ];

  const runEvaluation = async (submission: DashboardSubmission) => {
    setActionState({ id: submission.id, label: "Re-trigger evaluation", status: "signing" });
    try {
      await evaluateSubmission(submission.bounty_id, submission.id);
      setActionState({ id: submission.id, label: "Re-trigger evaluation", status: "confirmed" });
    } catch (error) {
      console.error("Evaluation retry failed", error);
      setActionState({
        id: submission.id,
        label: "Re-trigger evaluation",
        status: "failed",
        error: error instanceof Error ? error.message : "Could not re-trigger evaluation.",
      });
    }
  };

  const appeal = async (submission: DashboardSubmission) => {
    setActionState({ id: submission.id, label: "Appeal result", status: "signing" });
    try {
      await appealEvaluation(submission.bounty_id, submission.id, "Builder requests a second AI consensus pass from the dashboard.");
      setActionState({ id: submission.id, label: "Appeal result", status: "confirmed" });
    } catch (error) {
      console.error("Appeal failed", error);
      setActionState({
        id: submission.id,
        label: "Appeal result",
        status: "failed",
        error: error instanceof Error ? error.message : "Could not submit appeal.",
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-md border border-black/10 bg-white px-6 py-12 shadow-xl shadow-black/5 dark:border-white/10 dark:bg-white/[0.04]">
          <Wallet className="mx-auto h-10 w-10 text-[#282B5D] dark:text-[#BCA2FF]" />
          <h1 className="mt-5 text-3xl font-bold text-black dark:text-white">Connect your wallet</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/55 dark:text-white/55">
            Connect your wallet to view submissions, scores, payment history, reports, and explorer activity.
          </p>
          <div className="mt-7 flex justify-center">
            <WalletConnect redirectOnConnect={false} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <section className="border-b border-black/10 bg-[#f7f7f8] px-4 py-10 dark:border-white/10 dark:bg-[#060608] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-bold uppercase text-[#282B5D] dark:text-[#BCA2FF]">User Dashboard</p>
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-black dark:text-white sm:text-5xl">
                Track submissions, scores, reports, and payouts from one wallet view.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-black/60 dark:text-white/60">
                Wallet address: <span className="font-mono font-bold text-black dark:text-white">{address}</span>
              </p>
            </div>
            <aside className="rounded-md border border-black/10 bg-white p-5 shadow-xl shadow-black/5 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-[#282B5D] dark:text-[#BCA2FF]" />
                <h2 className="font-bold">Wallet status</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <MetricRow label="Address" value={displayAddress || truncateAddress(address || "")} />
                <MetricRow label="Balance" value={displayBalance} />
                <MetricRow label="Network" value={isWrongNetwork ? "Switch required" : "GenLayer ready"} />
              </div>
              {isWrongNetwork ? (
                <button
                  onClick={switchToGenLayer}
                  className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-500"
                >
                  Switch Network
                </button>
              ) : null}
            </aside>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6">
          {loadError ? (
            <div className="flex items-start gap-3 rounded-md border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{loadError}</p>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-4">
            <StatCard icon={<Table2 className="h-5 w-5" />} label="Submissions" value={`${dashboardSubmissions.length}`} />
            <StatCard icon={<Gauge className="h-5 w-5" />} label="Average score" value={averageScore ? `${averageScore}/100` : "Pending"} />
            <StatCard icon={<CreditCard className="h-5 w-5" />} label="Payments" value={evaluatedCount ? "Pending" : "None"} />
            <StatCard icon={<Bell className="h-5 w-5" />} label="Notifications" value={`${notifications.length}`} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-md border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Submissions</h2>
                  <p className="mt-1 text-sm text-black/55 dark:text-white/55">Scores, status, reports, and onchain actions.</p>
                </div>
                <button
                  onClick={() => router.push("/bounties")}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#282B5D] px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#110FFF] dark:bg-white dark:text-black dark:hover:bg-[#BCA2FF]"
                >
                  Browse Bounties
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {isLoading ? (
                <LoadingSkeleton variant="card" count={3} />
              ) : dashboardSubmissions.length === 0 ? (
                <div className="rounded-md border border-dashed border-black/15 bg-[#f7f7f8] px-6 py-14 text-center dark:border-white/15 dark:bg-black/30">
                  <h3 className="text-2xl font-bold">No submissions yet</h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/55 dark:text-white/55">
                    You haven't submitted to any bounties yet.
                  </p>
                  <button
                    onClick={() => router.push("/bounties")}
                    className="mt-7 inline-flex h-11 items-center justify-center rounded-md bg-[#282B5D] px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#110FFF] dark:bg-white dark:text-black dark:hover:bg-[#BCA2FF]"
                  >
                    Browse Bounties
                  </button>
                </div>
              ) : (
                <div className="overflow-hidden rounded-md border border-black/10 dark:border-white/10">
                  <div className="hidden grid-cols-[1.2fr_110px_110px_140px_220px] gap-3 bg-[#f7f7f8] px-4 py-3 text-xs font-bold uppercase text-black/45 dark:bg-black/30 dark:text-white/45 lg:grid">
                    <span>Bounty</span>
                    <span>Status</span>
                    <span>Score</span>
                    <span>Payment</span>
                    <span>Actions</span>
                  </div>
                  <div className="divide-y divide-black/10 dark:divide-white/10">
                    {dashboardSubmissions.map((submission) => (
                      <div key={submission.id} className="grid gap-4 px-4 py-4 lg:grid-cols-[1.2fr_110px_110px_140px_220px] lg:items-center">
                        <div className="min-w-0">
                          <p className="font-mono text-sm font-bold">{truncateAddress(submission.bounty_id, 8)}</p>
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-black/55 dark:text-white/55">{submission.description}</p>
                          <p className="mt-2 text-xs text-black/40 dark:text-white/40">Submitted {formatDateTime(submission.submitted_at)}</p>
                        </div>
                        <Badge variant={getStatusVariant(submission.status)}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </Badge>
                        <div className="text-sm font-bold">{submission.score ? `${submission.score}/100` : "Pending"}</div>
                        <div className="text-sm font-semibold text-black/60 dark:text-white/60">{submission.payout}</div>
                        <div className="flex flex-wrap gap-2">
                          <ActionButton label="Appeal" icon={<ShieldAlert className="h-4 w-4" />} onClick={() => appeal(submission)} />
                          <ActionButton label="Retry" icon={<RefreshCw className="h-4 w-4" />} onClick={() => runEvaluation(submission)} />
                          <ActionButton
                            label="Explorer"
                            icon={<ExternalLink className="h-4 w-4" />}
                            onClick={() => window.open(explorerAddressUrl(submission.submitter), "_blank", "noreferrer")}
                          />
                        </div>
                        {actionState?.id === submission.id && actionState.status !== "idle" ? (
                          <div className="rounded-md bg-[#f7f7f8] p-3 text-xs font-semibold text-black/60 dark:bg-black/30 dark:text-white/60 lg:col-span-5">
                            {actionState.status === "signing" || actionState.status === "pending" ? (
                              <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                {actionState.label} in progress
                              </span>
                            ) : actionState.status === "confirmed" ? (
                              `${actionState.label} confirmed`
                            ) : (
                              actionState.error || `${actionState.label} failed`
                            )}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.section>

            <aside className="space-y-6">
              <Panel icon={<Bell className="h-5 w-5" />} title="Notifications">
                <div className="space-y-3">
                  {notifications.map((item) => (
                    <div key={item.title} className="rounded-md bg-[#f7f7f8] p-3 dark:bg-black/30">
                      <p className="text-sm font-bold">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-black/55 dark:text-white/55">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel icon={<FileText className="h-5 w-5" />} title="Reports portal">
                <div className="space-y-3 text-sm text-black/60 dark:text-white/60">
                  <MetricRow label="Impact reports" value={dashboardSubmissions.length ? "Available after evaluation" : "No reports"} />
                  <MetricRow label="Uploads" value={dashboardSubmissions.length ? "Tracked per submission" : "None"} />
                  <MetricRow label="Exports" value="CSV ready" />
                </div>
              </Panel>

              <Panel icon={<CreditCard className="h-5 w-5" />} title="Payment history">
                <div className="space-y-3 text-sm">
                  {dashboardSubmissions.length === 0 ? (
                    <p className="text-black/55 dark:text-white/55">No payments yet.</p>
                  ) : (
                    dashboardSubmissions.slice(0, 3).map((submission) => (
                      <MetricRow key={submission.id} label={truncateAddress(submission.bounty_id, 6)} value={submission.payout} />
                    ))
                  )}
                </div>
              </Panel>

              <Panel icon={<ExternalLink className="h-5 w-5" />} title="Explorer links">
                <button
                  onClick={() => address && window.open(explorerAddressUrl(address), "_blank", "noreferrer")}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-black/10 px-4 text-sm font-bold transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
                >
                  Open wallet on explorer
                  <ExternalLink className="h-4 w-4" />
                </button>
              </Panel>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-[#f7f7f8] p-3 dark:bg-black/30">
      <span className="text-black/50 dark:text-white/50">{label}</span>
      <span className="min-w-0 truncate text-right font-bold">{value}</span>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="mb-4 text-[#282B5D] dark:text-[#BCA2FF]">{icon}</div>
      <p className="text-xs font-bold uppercase text-black/45 dark:text-white/45">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-[#282B5D] dark:text-[#BCA2FF]">{icon}</span>
        <h2 className="font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ActionButton({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-black/10 px-3 text-xs font-bold text-black transition hover:bg-black/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
    >
      {icon}
      {label}
    </button>
  );
}
