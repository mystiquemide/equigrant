"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileUp,
  GitBranch,
  Globe2,
  Loader2,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";

import { WalletConnect } from "@/components/WalletConnect";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { TransactionModal } from "@/components/TransactionModal";
import { useBounty } from "@/hooks/useBounty";
import { useContract } from "@/hooks/useContract";
import { useWallet } from "@/hooks/useWallet";
import { CONTRACT_ADDRESS } from "@/lib/constants";
import { formatDate, formatGEN } from "@/lib/format";
import type { TransactionStatus } from "@/types";

type FormErrors = Partial<{
  githubUrl: string;
  demoUrl: string;
  description: string;
  stake: string;
  wallet: string;
  liveSubmission: string;
}>;

function isGithubUrl(value: string) {
  return /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/.test(value.trim());
}

function isWebUrl(value: string) {
  if (!value.trim()) return true;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function getBountyTitle(criteria: string) {
  const firstSentence = criteria.split(/[.!?]/)[0]?.trim();
  return firstSentence || "Grant submission";
}

export default function SubmitToBountyPage() {
  const params = useParams();
  const router = useRouter();
  const bountyId = params?.id as string;
  const { bounty, isLoading, error } = useBounty(bountyId);
  const { isConnected, isWrongNetwork, displayAddress, displayBalance, switchToGenLayer } = useWallet();
  const { submitWork } = useContract();

  const resolvedBounty = bounty;
  const canSubmitToLiveContract = Boolean(bounty) && Boolean(CONTRACT_ADDRESS);

  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [stakeConfirmed, setStakeConfirmed] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [txStatus, setTxStatus] = useState<TransactionStatus>("idle");
  const [txHash, setTxHash] = useState<string>();
  const [txError, setTxError] = useState<string>();
  const [submittedBountyId, setSubmittedBountyId] = useState<string>();

  const title = useMemo(() => (resolvedBounty ? getBountyTitle(resolvedBounty.criteria) : ""), [resolvedBounty]);
  const descriptionLimit = 2000;
  const minimumDescriptionLength = 80;

  const selectedFileSize = files.reduce((total, file) => total + file.size, 0);
  const selectedFileSizeLabel = selectedFileSize > 0 ? `${(selectedFileSize / 1024 / 1024).toFixed(2)} MB` : "0 MB";

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!isConnected) nextErrors.wallet = "Connect your wallet before submitting.";
    if (isWrongNetwork) nextErrors.wallet = "Switch to the GenLayer network before submitting.";
    if (!canSubmitToLiveContract) {
      nextErrors.liveSubmission =
        "Live submission is unavailable until contract data for this bounty is loaded.";
    }
    if (!isGithubUrl(githubUrl)) nextErrors.githubUrl = "Enter a valid GitHub repository URL, for example https://github.com/team/repo.";
    if (!isWebUrl(demoUrl)) nextErrors.demoUrl = "Enter a valid demo URL starting with http or https.";
    if (description.trim().length < minimumDescriptionLength) {
      nextErrors.description = `Describe the project in at least ${minimumDescriptionLength} characters.`;
    }
    if (description.trim().length > descriptionLimit) {
      nextErrors.description = `Keep the project description under ${descriptionLimit} characters.`;
    }
    if (!stakeConfirmed) nextErrors.stake = "Confirm the required GEN stake before submitting.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    setFiles(selectedFiles.slice(0, 5));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTxError(undefined);

    if (!resolvedBounty || !validate() || !canSubmitToLiveContract) return;

    setTxStatus("signing");
    try {
      const hash = await submitWork(resolvedBounty.id, [githubUrl.trim()], demoUrl.trim(), description.trim());
      setTxHash(String(hash || ""));
      setSubmittedBountyId(resolvedBounty.id);
      setTxStatus("confirmed");
    } catch (err) {
      console.error("Submission transaction failed", err);
      setTxStatus("failed");
      setTxError(err instanceof Error ? err.message : "Transaction failed. Please try again.");
    }
  };

  if (isLoading && !resolvedBounty) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <LoadingSkeleton variant="card" count={3} />
      </div>
    );
  }

  if (!resolvedBounty) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-black dark:text-white">Bounty not found</h1>
        <p className="mt-3 text-sm leading-6 text-black/55 dark:text-white/55">
          This bounty may have been removed or the link is invalid.
        </p>
        <button
          onClick={() => router.push("/bounties")}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-[#282B5D] px-5 text-sm font-bold text-white transition hover:bg-[#110FFF] dark:bg-white dark:text-black dark:hover:bg-[#BCA2FF]"
        >
          Browse Bounties
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <section className="border-b border-black/10 bg-[#f7f7f8] px-4 py-10 dark:border-white/10 dark:bg-[#060608] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <button
            onClick={() => router.push(`/bounties/${resolvedBounty.id}`)}
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-black/55 transition hover:text-[#282B5D] dark:text-white/55 dark:hover:text-[#BCA2FF]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to bounty
          </button>

          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="mb-3 text-sm font-bold uppercase text-[#282B5D] dark:text-[#BCA2FF]">
                Submit to Bounty
              </p>
              <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-black dark:text-white sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-black/60 dark:text-white/60">
                Submit your GitHub repository, live demo, project narrative, supporting files, and stake confirmation for AI validator review.
              </p>
            </div>

            <aside className="rounded-md border border-black/10 bg-white p-5 shadow-xl shadow-black/5 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-[#f7f7f8] p-4 dark:bg-black/30">
                  <p className="text-xs font-bold uppercase text-black/45 dark:text-white/45">Reward</p>
                  <p className="mt-2 text-xl font-bold">{formatGEN(resolvedBounty.reward_pool)} GEN</p>
                </div>
                <div className="rounded-md bg-[#f7f7f8] p-4 dark:bg-black/30">
                  <p className="text-xs font-bold uppercase text-black/45 dark:text-white/45">Stake</p>
                  <p className="mt-2 text-xl font-bold">{formatGEN(resolvedBounty.min_stake)} GEN</p>
                </div>
              </div>
              <div className="mt-3 rounded-md bg-[#f7f7f8] p-4 dark:bg-black/30">
                <p className="text-xs font-bold uppercase text-black/45 dark:text-white/45">Deadline</p>
                <p className="mt-2 text-sm font-bold">{formatDate(resolvedBounty.deadline) || "Rolling"}</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_360px]">
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {error && (
              <div className="flex items-start gap-3 rounded-md border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Live contract data was unavailable. Open a live bounty from Browse Bounties and try again.</p>
              </div>
            )}

            {(!canSubmitToLiveContract || errors.liveSubmission) && (
              <div className="flex items-start gap-3 rounded-md border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-900 dark:text-blue-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  {errors.liveSubmission ??
                    "Submission is available only for live bounties from the deployed EquiGrant contract."}
                </p>
              </div>
            )}

            <div className="rounded-md border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-5 flex items-center gap-3">
                <GitBranch className="h-5 w-5 text-[#282B5D] dark:text-[#BCA2FF]" />
                <h2 className="text-xl font-bold">Repository</h2>
              </div>
              <label className="block text-sm font-bold text-black/70 dark:text-white/70" htmlFor="github-url">
                GitHub URL
              </label>
              <input
                id="github-url"
                value={githubUrl}
                onChange={(event) => setGithubUrl(event.target.value)}
                placeholder="https://github.com/team/project"
                className="mt-2 h-12 w-full rounded-md border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none transition placeholder:text-black/35 focus:border-[#282B5D] focus:ring-4 focus:ring-[#282B5D]/10 dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-white/35 dark:focus:border-[#BCA2FF] dark:focus:ring-[#BCA2FF]/10"
              />
              {errors.githubUrl && <p className="mt-2 text-xs font-semibold text-red-500">{errors.githubUrl}</p>}
            </div>

            <div className="rounded-md border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-5 flex items-center gap-3">
                <Globe2 className="h-5 w-5 text-[#282B5D] dark:text-[#BCA2FF]" />
                <h2 className="text-xl font-bold">Live demo</h2>
              </div>
              <label className="block text-sm font-bold text-black/70 dark:text-white/70" htmlFor="demo-url">
                Demo URL
              </label>
              <input
                id="demo-url"
                value={demoUrl}
                onChange={(event) => setDemoUrl(event.target.value)}
                placeholder="https://project-demo.vercel.app"
                className="mt-2 h-12 w-full rounded-md border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none transition placeholder:text-black/35 focus:border-[#282B5D] focus:ring-4 focus:ring-[#282B5D]/10 dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-white/35 dark:focus:border-[#BCA2FF] dark:focus:ring-[#BCA2FF]/10"
              />
              {errors.demoUrl && <p className="mt-2 text-xs font-semibold text-red-500">{errors.demoUrl}</p>}
            </div>

            <div className="rounded-md border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-5 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-[#282B5D] dark:text-[#BCA2FF]" />
                <h2 className="text-xl font-bold">Project description</h2>
              </div>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={descriptionLimit}
                placeholder="Explain what you built, how it meets the bounty criteria, major technical decisions, and what validators should inspect."
                className="min-h-[180px] w-full resize-y rounded-md border border-black/10 bg-white p-4 text-sm font-medium leading-6 text-black outline-none transition placeholder:text-black/35 focus:border-[#282B5D] focus:ring-4 focus:ring-[#282B5D]/10 dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-white/35 dark:focus:border-[#BCA2FF] dark:focus:ring-[#BCA2FF]/10"
              />
              <div className="mt-2 flex items-center justify-between gap-4 text-xs font-semibold">
                <span className={errors.description ? "text-red-500" : "text-black/45 dark:text-white/45"}>
                  {errors.description ?? `Minimum ${minimumDescriptionLength} characters`}
                </span>
                <span className="text-black/45 dark:text-white/45">
                  {description.length}/{descriptionLimit}
                </span>
              </div>
            </div>

            <div className="rounded-md border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-5 flex items-center gap-3">
                <FileUp className="h-5 w-5 text-[#282B5D] dark:text-[#BCA2FF]" />
                <h2 className="text-xl font-bold">Supporting files</h2>
              </div>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-black/20 bg-[#f7f7f8] px-4 py-8 text-center transition hover:border-[#282B5D] dark:border-white/15 dark:bg-black/30 dark:hover:border-[#BCA2FF]">
                <FileUp className="h-8 w-8 text-[#282B5D] dark:text-[#BCA2FF]" />
                <span className="mt-3 text-sm font-bold">Upload files</span>
                <span className="mt-1 text-xs text-black/45 dark:text-white/45">
                  PDF, images, reports, or architecture notes. Up to 5 files.
                </span>
                <input multiple type="file" className="sr-only" onChange={handleFiles} />
              </label>
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-black/45 dark:text-white/45">
                    <span>{files.length} selected</span>
                    <span>{selectedFileSizeLabel}</span>
                  </div>
                  {files.map((file) => (
                    <div key={`${file.name}-${file.size}`} className="flex items-center justify-between rounded-md bg-[#f7f7f8] px-3 py-2 text-sm dark:bg-black/30">
                      <span className="min-w-0 truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setFiles((current) => current.filter((item) => item !== file))}
                        className="ml-3 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-black/45 transition hover:bg-black/10 hover:text-black dark:text-white/45 dark:hover:bg-white/10 dark:hover:text-white"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-md border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={stakeConfirmed}
                  onChange={(event) => setStakeConfirmed(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-black/20 text-[#282B5D] focus:ring-[#282B5D] dark:border-white/20"
                />
                <span>
                  <span className="block text-sm font-bold">Confirm stake requirement</span>
                  <span className="mt-1 block text-sm leading-6 text-black/55 dark:text-white/55">
                    I understand this submission requires {formatGEN(resolvedBounty.min_stake)} GEN stake and that my wallet will be asked to sign the transaction.
                  </span>
                </span>
              </label>
              {errors.stake && <p className="mt-3 text-xs font-semibold text-red-500">{errors.stake}</p>}
            </div>

            {errors.wallet && (
              <div className="rounded-md border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-600 dark:text-red-300">
                {errors.wallet}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => router.push(`/bounties/${resolvedBounty.id}`)}
                className="inline-flex h-12 items-center justify-center rounded-md border border-black/10 px-5 text-sm font-bold text-black transition hover:bg-black/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={
                  txStatus === "signing" ||
                  txStatus === "pending" ||
                  resolvedBounty.status !== "active" ||
                  !canSubmitToLiveContract
                }
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#282B5D] px-6 text-sm font-bold text-white shadow-xl shadow-[#282B5D]/15 transition hover:-translate-y-0.5 hover:bg-[#110FFF] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-[#BCA2FF]"
              >
                {txStatus === "signing" || txStatus === "pending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                {canSubmitToLiveContract ? "Submit Entry" : "Live Submission Disabled"}
              </button>
            </div>
          </motion.form>

          <aside className="space-y-5">
            <section className="rounded-md border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-4 flex items-center gap-3">
                <Wallet className="h-5 w-5 text-[#282B5D] dark:text-[#BCA2FF]" />
                <h2 className="text-xl font-bold">Wallet status</h2>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3 rounded-md bg-[#f7f7f8] p-3 dark:bg-black/30">
                  <span className="text-black/50 dark:text-white/50">Connection</span>
                  <span className={`font-bold ${isConnected ? "text-emerald-600 dark:text-emerald-300" : "text-red-600 dark:text-red-300"}`}>
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-md bg-[#f7f7f8] p-3 dark:bg-black/30">
                  <span className="text-black/50 dark:text-white/50">Address</span>
                  <span className="font-mono font-bold">{displayAddress || "Not connected"}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-md bg-[#f7f7f8] p-3 dark:bg-black/30">
                  <span className="text-black/50 dark:text-white/50">Balance</span>
                  <span className="font-bold">{displayBalance}</span>
                </div>
              </div>
              <div className="mt-4">
                {!isConnected ? <WalletConnect redirectOnConnect={false} /> : null}
                {isConnected && isWrongNetwork ? (
                  <button
                    onClick={switchToGenLayer}
                    className="inline-flex h-10 w-full items-center justify-center rounded-md bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-500"
                  >
                    Switch Network
                  </button>
                ) : null}
              </div>
            </section>

            <section className="rounded-md border border-black/10 bg-[#282B5D] p-5 text-white dark:border-white/10">
              <CheckCircle2 className="h-6 w-6 text-[#BCA2FF]" />
              <h2 className="mt-4 text-xl font-bold">Submission checklist</h2>
              <div className="mt-4 space-y-3 text-sm text-white/75">
                <p className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#BCA2FF]" />
                  Public GitHub repository with setup instructions.
                </p>
                <p className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#BCA2FF]" />
                  Demo URL that validators can open.
                </p>
                <p className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#BCA2FF]" />
                  Clear description mapped to bounty criteria.
                </p>
                <p className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#BCA2FF]" />
                  Stake confirmation before wallet signature.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </section>

      <TransactionModal
        isOpen={txStatus !== "idle"}
        status={txStatus}
        txHash={txHash}
        errorMessage={txError}
        onClose={() => {
          if (txStatus === "confirmed") {
            router.push("/dashboard");
          }
          if (submittedBountyId) {
            setSubmittedBountyId(undefined);
          }
          setTxStatus("idle");
        }}
        onRetry={txStatus === "failed" ? () => undefined : undefined}
      />
    </div>
  );
}
