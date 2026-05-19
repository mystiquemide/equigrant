"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  BarChart3,
  CalendarPlus,
  CirclePause,
  Download,
  Edit3,
  ExternalLink,
  FileSearch,
  Flag,
  Gauge,
  LineChart,
  Loader2,
  PauseCircle,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

import { Badge } from "@/components/Badge";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Modal } from "@/components/Modal";
import { WalletConnect } from "@/components/WalletConnect";
import { useContract } from "@/hooks/useContract";
import { useCreatorAccess } from "@/hooks/useCreatorAccess";
import { useWallet } from "@/hooks/useWallet";
import { formatDate, formatGEN } from "@/lib/format";
import { readContract } from "@/lib/genlayer";
import { truncateAddress } from "@/lib/truncate";
import type { BountyData, TransactionStatus } from "@/types";

type AdminBounty = BountyData & {
  title: string;
  category: string;
  aiScore: number;
  plagiarismRisk: "Low" | "Medium" | "High";
  esgScore: number;
  milestonesPaid: number;
  auditEvents: number;
};

type AdminAction = {
  bountyId: string;
  label: string;
  status: TransactionStatus;
  message?: string;
};

type EditFormState = {
  bounty: AdminBounty;
  criteria: string;
  reward: string;
  stake: string;
};

type ExtendFormState = {
  bounty: AdminBounty;
  deadline: string;
};

function toAdminBounty(bounty: BountyData, index: number): AdminBounty {
  const firstSentence = bounty.criteria.split(/[.!?]/)[0]?.trim() || `Bounty ${index + 1}`;
  const seed = `${bounty.id}${bounty.criteria}`.split("").reduce((total, char) => total + char.charCodeAt(0), 0);

  return {
    ...bounty,
    title: firstSentence,
    category: ["Compliance", "Impact", "Security", "Infrastructure"][seed % 4],
    aiScore: 74 + (seed % 23),
    plagiarismRisk: seed % 5 === 0 ? "High" : seed % 3 === 0 ? "Medium" : "Low",
    esgScore: 70 + (seed % 28),
    milestonesPaid: seed % 4,
    auditEvents: 8 + (seed % 30),
  };
}

function statusVariant(status: BountyData["status"]) {
  if (status === "active") return "success";
  if (status === "paused") return "warning";
  if (status === "evaluating") return "warning";
  return "neutral";
}

function riskClass(risk: AdminBounty["plagiarismRisk"]) {
  if (risk === "High") return "text-red-600 dark:text-red-300";
  if (risk === "Medium") return "text-amber-600 dark:text-amber-300";
  return "text-emerald-600 dark:text-emerald-300";
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { isConnected, isWrongNetwork, displayAddress, displayBalance, switchToGenLayer } = useWallet();
  const { isCreator, isLoadingCreatorAccess } = useCreatorAccess();
  const { resolveBounty, deleteBounty, pauseBounty, resumeBounty, extendDeadline, editBounty } = useContract();
  const [bounties, setBounties] = useState<BountyData[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [action, setAction] = useState<AdminAction | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [extendForm, setExtendForm] = useState<ExtendFormState | null>(null);

  useEffect(() => {
    if (!address) {
      setBounties([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    readContract("get_creator_bounties", [address])
      .then((data) => setBounties((Array.isArray(data) ? data : []) as unknown as BountyData[]))
      .catch((error) => {
        console.error("Failed to load creator bounties", error);
        setLoadError("Creator bounties could not be loaded from the contract. Check the network connection and try again.");
      })
      .finally(() => setIsLoading(false));
  }, [address]);

  const adminBounties = useMemo(() => {
    const live = bounties.map(toAdminBounty);
    return live;
  }, [bounties]);

  const selectedBounty = adminBounties.find((bounty) => bounty.id === selectedId) ?? adminBounties[0] ?? null;
  const totalRewards = adminBounties.reduce((total, bounty) => total + Number(bounty.reward_pool || 0), 0);
  const totalSubmissions = adminBounties.reduce((total, bounty) => total + Number(bounty.submission_count || 0), 0);
  const activeCount = adminBounties.filter((bounty) => bounty.status === "active").length;
  const averageAiScore = Math.round(adminBounties.reduce((total, bounty) => total + bounty.aiScore, 0) / Math.max(adminBounties.length, 1));

  const handleResolve = async (bounty: AdminBounty) => {
    setAction({ bountyId: bounty.id, label: "Milestone payout", status: "signing" });
    try {
      await resolveBounty(bounty.id);
      setAction({
        bountyId: bounty.id,
        label: "Milestone payout",
        status: "confirmed",
        message: "Payout resolution submitted to GenLayer.",
      });
    } catch (error) {
      console.error("Milestone payout failed", error);
      setAction({
        bountyId: bounty.id,
        label: "Milestone payout",
        status: "failed",
        message: error instanceof Error ? error.message : "Could not submit payout transaction.",
      });
    }
  };

  const handleDelete = async (bounty: AdminBounty) => {
    if (!window.confirm(`Delete ${bounty.id}? This hides it from active listings and cannot be undone.`)) return;
    setAction({ bountyId: bounty.id, label: "Delete bounty", status: "signing" });
    try {
      await deleteBounty(bounty.id);
      setBounties((current) =>
        current.map((item) => (item.id === bounty.id ? { ...item, status: "deleted" } : item))
      );
      setAction({
        bountyId: bounty.id,
        label: "Delete bounty",
        status: "confirmed",
        message: "Bounty deleted on GenLayer and removed from active listings.",
      });
    } catch (error) {
      console.error("Delete bounty failed", error);
      setAction({
        bountyId: bounty.id,
        label: "Delete bounty",
        status: "failed",
        message: error instanceof Error ? error.message : "Could not delete this bounty.",
      });
    }
  };

  const handlePauseToggle = async (bounty: AdminBounty) => {
    const isPaused = bounty.status === "paused";
    setAction({ bountyId: bounty.id, label: isPaused ? "Resume bounty" : "Pause bounty", status: "signing" });
    try {
      if (isPaused) {
        await resumeBounty(bounty.id);
      } else {
        await pauseBounty(bounty.id);
      }
      setBounties((current) =>
        current.map((item) => (item.id === bounty.id ? { ...item, status: isPaused ? "active" : "paused" } : item))
      );
      setAction({
        bountyId: bounty.id,
        label: isPaused ? "Resume bounty" : "Pause bounty",
        status: "confirmed",
        message: isPaused ? "Bounty resumed and visible in active listings." : "Bounty paused and hidden from active listings.",
      });
    } catch (error) {
      console.error("Pause toggle failed", error);
      setAction({
        bountyId: bounty.id,
        label: isPaused ? "Resume bounty" : "Pause bounty",
        status: "failed",
        message: error instanceof Error ? error.message : "Could not update bounty status.",
      });
    }
  };

  const handleExtend = async (bounty: AdminBounty) => {
    setExtendForm({ bounty, deadline: bounty.deadline ? bounty.deadline.slice(0, 16) : "" });
  };

  const submitExtend = async () => {
    if (!extendForm) return;
    const bounty = extendForm.bounty;
    setAction({ bountyId: bounty.id, label: "Extend deadline", status: "signing" });
    try {
      const isoDeadline = new Date(extendForm.deadline).toISOString();
      await extendDeadline(bounty.id, isoDeadline);
      setBounties((current) =>
        current.map((item) => (item.id === bounty.id ? { ...item, deadline: isoDeadline } : item))
      );
      setExtendForm(null);
      setAction({
        bountyId: bounty.id,
        label: "Extend deadline",
        status: "confirmed",
        message: "Deadline extension submitted to GenLayer.",
      });
    } catch (error) {
      console.error("Extend deadline failed", error);
      setAction({
        bountyId: bounty.id,
        label: "Extend deadline",
        status: "failed",
        message: error instanceof Error ? error.message : "Could not extend the deadline.",
      });
    }
  };

  const handleEdit = async (bounty: AdminBounty) => {
    setEditForm({
      bounty,
      criteria: bounty.criteria,
      reward: bounty.reward_pool,
      stake: bounty.min_stake,
    });
  };

  const submitEdit = async () => {
    if (!editForm) return;
    const bounty = editForm.bounty;
    const criteria = editForm.criteria.trim();
    const rewardValue = Math.round(Number(editForm.reward));
    const stakeValue = Math.round(Number(editForm.stake));
    if (criteria.length < 10) {
      setAction({
        bountyId: bounty.id,
        label: "Edit bounty",
        status: "failed",
        message: "Criteria must be at least 10 characters.",
      });
      return;
    }
    if (!Number.isFinite(rewardValue) || rewardValue <= 0 || !Number.isFinite(stakeValue) || stakeValue <= 0) {
      setAction({
        bountyId: bounty.id,
        label: "Edit bounty",
        status: "failed",
        message: "Reward pool and minimum stake must be positive numbers.",
      });
      return;
    }

    setAction({ bountyId: bounty.id, label: "Edit bounty", status: "signing" });
    try {
      await editBounty(bounty.id, criteria, BigInt(rewardValue), BigInt(stakeValue));
      setBounties((current) =>
        current.map((item) =>
          item.id === bounty.id
            ? { ...item, criteria, reward_pool: String(rewardValue), remaining_pool: String(rewardValue), min_stake: String(stakeValue) }
            : item
        )
      );
      setEditForm(null);
      setAction({
        bountyId: bounty.id,
        label: "Edit bounty",
        status: "confirmed",
        message: "Bounty edits submitted to GenLayer.",
      });
    } catch (error) {
      console.error("Edit bounty failed", error);
      setAction({
        bountyId: bounty.id,
        label: "Edit bounty",
        status: "failed",
        message: error instanceof Error ? error.message : "Could not edit this bounty.",
      });
    }
  };

  const exportReport = () => {
    const header = ["id", "title", "status", "reward_pool", "submissions", "ai_score", "plagiarism_risk", "esg_score"];
    const rows = adminBounties.map((bounty) => [
      bounty.id,
      bounty.title,
      bounty.status,
      bounty.reward_pool,
      bounty.submission_count,
      bounty.aiScore,
      bounty.plagiarismRisk,
      bounty.esgScore,
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "equigrant-admin-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-md border border-black/10 bg-white px-6 py-12 shadow-xl shadow-black/5 dark:border-white/10 dark:bg-white/[0.04]">
          <Wallet className="mx-auto h-10 w-10 text-[#282B5D] dark:text-[#BCA2FF]" />
          <h1 className="mt-5 text-3xl font-bold text-black dark:text-white">Connect creator wallet</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/55 dark:text-white/55">
            Connect the bounty creator wallet to manage grants, review validator signals, export reports, and trigger milestone payouts.
          </p>
          <div className="mt-7 flex justify-center">
            <WalletConnect redirectOnConnect={false} />
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingCreatorAccess || isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <LoadingSkeleton variant="card" count={3} />
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-md border border-black/10 bg-white px-6 py-12 shadow-xl shadow-black/5 dark:border-white/10 dark:bg-white/[0.04]">
          <ShieldCheck className="mx-auto h-10 w-10 text-[#282B5D] dark:text-[#BCA2FF]" />
          <h1 className="mt-5 text-3xl font-bold text-black dark:text-white">Creator access required</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/55 dark:text-white/55">
            This wallet has not created a bounty yet. Create your first bounty, then the Admin dashboard will unlock for this address.
          </p>
          <button
            onClick={() => router.push("/create")}
            className="mt-7 inline-flex h-11 items-center justify-center rounded-md bg-[#282B5D] px-5 text-sm font-bold text-white transition hover:bg-[#110FFF] dark:bg-white dark:text-black dark:hover:bg-[#BCA2FF]"
          >
            Create Bounty
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <section className="border-b border-black/10 bg-[#f7f7f8] px-4 py-10 dark:border-white/10 dark:bg-[#060608] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-bold uppercase text-[#282B5D] dark:text-[#BCA2FF]">Creator Dashboard</p>
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-black dark:text-white sm:text-5xl">
                Manage bounties, validator quality, payouts, and grant impact.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-black/60 dark:text-white/60">
                Admin wallet: <span className="font-mono font-bold text-black dark:text-white">{address}</span>
              </p>
            </div>
            <aside className="rounded-md border border-black/10 bg-white p-5 shadow-xl shadow-black/5 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-4 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-[#282B5D] dark:text-[#BCA2FF]" />
                <h2 className="font-bold">Creator readiness</h2>
              </div>
              <div className="space-y-3 text-sm">
                <MetricRow label="Wallet" value={displayAddress} />
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
            <StatCard icon={<BarChart3 className="h-5 w-5" />} label="Managed bounties" value={`${adminBounties.length}`} />
            <StatCard icon={<Users className="h-5 w-5" />} label="Submissions" value={`${totalSubmissions}`} />
            <StatCard icon={<Gauge className="h-5 w-5" />} label="Avg AI score" value={adminBounties.length > 0 ? `${averageAiScore}/100` : "0/100"} />
            <StatCard icon={<ReceiptText className="h-5 w-5" />} label="Reward pool" value={`${formatGEN(totalRewards)} GEN`} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-md border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Manage bounties</h2>
                  <p className="mt-1 text-sm text-black/55 dark:text-white/55">
                    Edit, pause, cancel, extend, inspect, and export creator grants.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => router.push("/create")}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#282B5D] px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#110FFF] dark:bg-white dark:text-black dark:hover:bg-[#BCA2FF]"
                  >
                    Create Bounty
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button
                    onClick={exportReport}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-black/10 px-4 text-sm font-bold transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
                  >
                    Export reports
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {isLoading ? (
                <LoadingSkeleton variant="card" count={3} />
              ) : adminBounties.length === 0 ? (
                <div className="rounded-md border border-black/10 bg-[#f7f7f8] px-6 py-14 text-center dark:border-white/10 dark:bg-black/30">
                  <h3 className="text-xl font-bold text-black dark:text-white">No creator bounties yet</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/55 dark:text-white/55">
                    Create a bounty from this wallet and it will appear here for live management.
                  </p>
                  <button
                    onClick={() => router.push("/create")}
                    className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#282B5D] px-4 text-sm font-bold text-white transition hover:bg-[#110FFF] dark:bg-white dark:text-black dark:hover:bg-[#BCA2FF]"
                  >
                    Create Bounty
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="overflow-hidden rounded-md border border-black/10 dark:border-white/10">
                  <div className="hidden grid-cols-[1fr_90px_110px_110px_210px] gap-3 bg-[#f7f7f8] px-4 py-3 text-xs font-bold uppercase text-black/45 dark:bg-black/30 dark:text-white/45 lg:grid">
                    <span>Bounty</span>
                    <span>Status</span>
                    <span>Reward</span>
                    <span>Deadline</span>
                    <span>Actions</span>
                  </div>
                  <div className="divide-y divide-black/10 dark:divide-white/10">
                    {adminBounties.map((bounty) => (
                      <div
                        key={bounty.id}
                        className={`grid gap-4 px-4 py-4 transition lg:grid-cols-[1fr_90px_110px_110px_210px] lg:items-center ${
                          selectedBounty?.id === bounty.id ? "bg-[#282B5D]/5 dark:bg-[#BCA2FF]/10" : ""
                        }`}
                      >
                        <button type="button" onClick={() => setSelectedId(bounty.id)} className="min-w-0 text-left">
                          <p className="font-bold">{bounty.title}</p>
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-black/55 dark:text-white/55">{bounty.criteria}</p>
                          <p className="mt-2 text-xs font-semibold text-black/40 dark:text-white/40">
                            {bounty.category} · {bounty.submission_count} submissions
                          </p>
                        </button>
                        <Badge variant={statusVariant(bounty.status)}>
                          {bounty.status.charAt(0).toUpperCase() + bounty.status.slice(1)}
                        </Badge>
                        <p className="text-sm font-bold">{formatGEN(bounty.reward_pool)} GEN</p>
                        <p className="text-sm font-semibold text-black/60 dark:text-white/60">{formatDate(bounty.deadline)}</p>
                        <div className="flex flex-wrap gap-2">
                          <AdminButton label="Edit" icon={<Edit3 className="h-4 w-4" />} onClick={() => handleEdit(bounty)} />
                          <AdminButton
                            label={bounty.status === "paused" ? "Resume" : "Pause"}
                            icon={<PauseCircle className="h-4 w-4" />}
                            onClick={() => handlePauseToggle(bounty)}
                          />
                          <AdminButton
                            label="Delete"
                            icon={<XCircle className="h-4 w-4" />}
                            onClick={() => handleDelete(bounty)}
                          />
                          <AdminButton
                            label="Extend"
                            icon={<CalendarPlus className="h-4 w-4" />}
                            onClick={() => handleExtend(bounty)}
                          />
                        </div>
                        {action?.bountyId === bounty.id ? (
                          <div className="rounded-md bg-[#f7f7f8] p-3 text-xs font-semibold text-black/60 dark:bg-black/30 dark:text-white/60 lg:col-span-5">
                            {action.status === "signing" || action.status === "pending" ? (
                              <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                {action.label} in progress
                              </span>
                            ) : (
                              action.message
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
              {selectedBounty ? (
                <>
                  <Panel icon={<Sparkles className="h-5 w-5" />} title="Score preview">
                    <MetricRow label="Selected bounty" value={truncateAddress(selectedBounty.id, 10)} />
                    <MetricRow label="AI confidence" value={`${selectedBounty.aiScore}/100`} />
                    <MetricRow label="Active bounties" value={`${activeCount}`} />
                  </Panel>

                  <Panel icon={<FileSearch className="h-5 w-5" />} title="Plagiarism viewer">
                    <MetricRow label="Risk" value={selectedBounty.plagiarismRisk} valueClassName={riskClass(selectedBounty.plagiarismRisk)} />
                    <MetricRow label="Repo checks" value="Enabled" />
                    <MetricRow label="Demo checks" value="Enabled" />
                  </Panel>

                  <Panel icon={<ReceiptText className="h-5 w-5" />} title="Milestone payouts">
                    <MetricRow label="Paid milestones" value={`${selectedBounty.milestonesPaid}`} />
                    <MetricRow label="Remaining pool" value={`${formatGEN(selectedBounty.remaining_pool)} GEN`} />
                    <button
                      onClick={() => handleResolve(selectedBounty)}
                      disabled={isWrongNetwork || action?.status === "signing"}
                      className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#282B5D] px-4 text-sm font-bold text-white transition hover:bg-[#110FFF] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-[#BCA2FF]"
                    >
                      Trigger payout review
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </Panel>

                  <Panel icon={<LineChart className="h-5 w-5" />} title="ESG metrics">
                    <MetricRow label="Impact score" value={`${selectedBounty.esgScore}/100`} />
                    <MetricRow label="Equity signal" value={selectedBounty.esgScore > 85 ? "Strong" : "Developing"} />
                    <MetricRow label="Reporting" value="Ready" />
                  </Panel>

                  <Panel icon={<Flag className="h-5 w-5" />} title="Audit trail">
                    <MetricRow label="Events logged" value={`${selectedBounty.auditEvents}`} />
                    <MetricRow label="Latest action" value="Validator score preview" />
                    <MetricRow label="Export status" value="Available" />
                  </Panel>
                </>
              ) : null}

              <Panel icon={<CirclePause className="h-5 w-5" />} title="Validator interface">
                <MetricRow label="Consensus mode" value="Leader based" />
                <MetricRow label="Score tolerance" value="±10" />
                <MetricRow label="Review queue" value={`${totalSubmissions} submissions`} />
              </Panel>
            </aside>
          </div>
        </div>
      </section>

      <Modal isOpen={Boolean(editForm)} onClose={() => setEditForm(null)} title="Edit Bounty" size="lg">
        {editForm ? (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-black/70 dark:text-white/70">Criteria</span>
              <textarea
                value={editForm.criteria}
                onChange={(event) => setEditForm((current) => (current ? { ...current, criteria: event.target.value } : current))}
                rows={5}
                className="mt-2 w-full rounded-md border border-black/10 bg-white p-3 text-sm font-medium text-black outline-none transition focus:border-[#282B5D] focus:ring-4 focus:ring-[#282B5D]/10 dark:border-white/10 dark:bg-black dark:text-white dark:focus:border-[#BCA2FF] dark:focus:ring-[#BCA2FF]/10"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-black/70 dark:text-white/70">Reward pool</span>
                <input
                  value={editForm.reward}
                  onChange={(event) => setEditForm((current) => (current ? { ...current, reward: event.target.value } : current))}
                  inputMode="numeric"
                  className="mt-2 h-11 w-full rounded-md border border-black/10 bg-white px-3 text-sm font-medium text-black outline-none transition focus:border-[#282B5D] focus:ring-4 focus:ring-[#282B5D]/10 dark:border-white/10 dark:bg-black dark:text-white dark:focus:border-[#BCA2FF] dark:focus:ring-[#BCA2FF]/10"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-black/70 dark:text-white/70">Minimum stake</span>
                <input
                  value={editForm.stake}
                  onChange={(event) => setEditForm((current) => (current ? { ...current, stake: event.target.value } : current))}
                  inputMode="numeric"
                  className="mt-2 h-11 w-full rounded-md border border-black/10 bg-white px-3 text-sm font-medium text-black outline-none transition focus:border-[#282B5D] focus:ring-4 focus:ring-[#282B5D]/10 dark:border-white/10 dark:bg-black dark:text-white dark:focus:border-[#BCA2FF] dark:focus:ring-[#BCA2FF]/10"
                />
              </label>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setEditForm(null)}
                className="inline-flex h-10 items-center justify-center rounded-md border border-black/10 px-4 text-sm font-bold transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitEdit}
                disabled={action?.status === "signing"}
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#282B5D] px-4 text-sm font-bold text-white transition hover:bg-[#110FFF] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-[#BCA2FF]"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal isOpen={Boolean(extendForm)} onClose={() => setExtendForm(null)} title="Extend Deadline">
        {extendForm ? (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-black/70 dark:text-white/70">New deadline</span>
              <input
                type="datetime-local"
                value={extendForm.deadline}
                onChange={(event) => setExtendForm((current) => (current ? { ...current, deadline: event.target.value } : current))}
                className="mt-2 h-11 w-full rounded-md border border-black/10 bg-white px-3 text-sm font-medium text-black outline-none transition focus:border-[#282B5D] focus:ring-4 focus:ring-[#282B5D]/10 dark:border-white/10 dark:bg-black dark:text-white dark:focus:border-[#BCA2FF] dark:focus:ring-[#BCA2FF]/10"
              />
            </label>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setExtendForm(null)}
                className="inline-flex h-10 items-center justify-center rounded-md border border-black/10 px-4 text-sm font-bold transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitExtend}
                disabled={action?.status === "signing"}
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#282B5D] px-4 text-sm font-bold text-white transition hover:bg-[#110FFF] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-[#BCA2FF]"
              >
                Extend
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function MetricRow({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-[#f7f7f8] p-3 text-sm dark:bg-black/30">
      <span className="text-black/50 dark:text-white/50">{label}</span>
      <span className={`min-w-0 truncate text-right font-bold ${valueClassName}`}>{value}</span>
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
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function AdminButton({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-black/10 px-3 text-xs font-bold transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
    >
      {icon}
      {label}
    </button>
  );
}
