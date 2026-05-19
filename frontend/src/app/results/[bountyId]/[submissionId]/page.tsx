"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  CircleAlert,
  FileText,
  Gauge,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Modal } from "@/components/Modal";
import { ScoreGauge } from "@/components/ScoreGauge";
import { Textarea } from "@/components/Textarea";
import { TransactionModal } from "@/components/TransactionModal";
import { useContract } from "@/hooks/useContract";
import { useEvaluation } from "@/hooks/useEvaluation";
import { formatDateTime } from "@/lib/format";
import type { TransactionStatus } from "@/types";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const bountyId = params?.bountyId as string;
  const submissionId = params?.submissionId as string;

  const { evaluation, isLoading, error, refetch } = useEvaluation(bountyId, submissionId);
  const { appealEvaluation } = useContract();

  const [showAppeal, setShowAppeal] = useState(false);
  const [appealReason, setAppealReason] = useState("");
  const [txStatus, setTxStatus] = useState<TransactionStatus>("idle");
  const [txError, setTxError] = useState<string>();

  const verdict = evaluation?.plagiarism_flag
    ? "Plagiarism Detected"
    : evaluation?.passed
    ? "Passed"
    : "Needs Review";
  const verdictTone = evaluation?.plagiarism_flag
    ? "bg-red-500/10 text-red-700 ring-red-500/20 dark:text-red-300"
    : evaluation?.passed
    ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300"
    : "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300";

  const handleAppeal = async () => {
    setTxStatus("signing");
    try {
      await appealEvaluation(bountyId, submissionId, appealReason);
      setTxStatus("pending");
      setTimeout(() => {
        setTxStatus("confirmed");
        setShowAppeal(false);
        refetch();
      }, 3000);
    } catch (err: any) {
      setTxStatus("failed");
      setTxError(err?.message || "Appeal failed");
    }
  };

  if (error && !evaluation) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-md border border-black/10 bg-white p-8 shadow-xl shadow-black/5 dark:border-white/10 dark:bg-white/[0.04]">
          <BrainCircuit className="mx-auto h-10 w-10 text-[#282B5D] dark:text-[#BCA2FF]" />
          <h1 className="mb-4 mt-5 text-3xl font-bold text-black dark:text-white">Results Not Available</h1>
          <p className="mx-auto mb-6 max-w-md text-sm leading-6 text-black/55 dark:text-white/55">{error}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={refetch} variant="secondary">
              Check Again
            </Button>
            <Button onClick={() => router.push(`/bounties/${bountyId}`)} variant="primary">
              Back to Bounty
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <LoadingSkeleton variant="rect" width="100%" height="12rem" />
        <div className="mt-6 grid gap-4 lg:grid-cols-[360px_1fr]">
          <LoadingSkeleton variant="card" count={1} />
          <LoadingSkeleton variant="card" count={2} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <section className="border-b border-black/10 bg-[#f7f7f8] px-4 py-10 dark:border-white/10 dark:bg-[#060608] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <button
            onClick={() => router.push(`/bounties/${bountyId}`)}
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-black/55 transition hover:text-[#282B5D] dark:text-white/55 dark:hover:text-[#BCA2FF]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Bounty
          </button>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-md border border-black/10 bg-white p-6 shadow-2xl shadow-black/5 dark:border-white/10 dark:bg-white/[0.04]"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-[#282B5D] dark:bg-[#BCA2FF]" />
            <div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#282B5D]/10 px-3 py-1 text-xs font-bold uppercase text-[#282B5D] ring-1 ring-[#282B5D]/15 dark:bg-[#BCA2FF]/15 dark:text-[#BCA2FF] dark:ring-[#BCA2FF]/20">
                  <BrainCircuit className="h-3.5 w-3.5" />
                  AI consensus report
                </div>
                <h1 className="max-w-3xl text-4xl font-bold tracking-normal text-black dark:text-white sm:text-5xl">
                  Evaluation Results
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-black/55 dark:text-white/55">
                  Validator scoring, consensus state, and reasoning for this submission.
                </p>
              </div>
              {evaluation ? (
                <div className="rounded-md border border-black/10 bg-[#f7f7f8] p-4 dark:border-white/10 dark:bg-black/30">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold uppercase text-black/45 dark:text-white/45">Verdict</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${verdictTone}`}>
                      {verdict}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <MetricTile label="Score" value={`${evaluation.score}/100`} />
                    <MetricTile label="Round" value={`${evaluation.round}`} />
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {evaluation ? (
            <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
              <motion.aside
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-md border border-black/10 bg-white p-6 shadow-xl shadow-black/5 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className="flex items-center gap-3">
                  <Gauge className="h-5 w-5 text-[#282B5D] dark:text-[#BCA2FF]" />
                  <h2 className="text-xl font-bold">Scorecard</h2>
                </div>
                <div className="mt-6 flex justify-center rounded-md bg-[#f7f7f8] p-6 dark:bg-black/30">
                  <ScoreGauge score={evaluation.score} size="lg" />
                </div>
                <div className="mt-5 grid gap-3">
                  <StatusRow
                    icon={<ShieldCheck className="h-4 w-4" />}
                    label="Consensus"
                    value={evaluation.consensus_reached ? "Reached" : "Not Reached"}
                    good={evaluation.consensus_reached}
                  />
                  <StatusRow
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    label="Plagiarism"
                    value={evaluation.plagiarism_flag ? "Flagged" : "Clear"}
                    good={!evaluation.plagiarism_flag}
                  />
                  <StatusRow icon={<RotateCcw className="h-4 w-4" />} label="Round" value={`${evaluation.round}`} good />
                </div>
              </motion.aside>

              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                {evaluation.plagiarism_flag && (
                  <div className="rounded-md border border-red-500/20 bg-red-500/10 p-4 text-sm leading-6 text-red-700 dark:text-red-200">
                    <div className="mb-2 flex items-center gap-2 font-bold">
                      <CircleAlert className="h-4 w-4" />
                      Plagiarism review required
                    </div>
                    This submission has been flagged for substantially copied content without enough original contribution.
                  </div>
                )}

                <section className="rounded-md border border-black/10 bg-white p-6 shadow-xl shadow-black/5 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-[#282B5D] dark:text-[#BCA2FF]" />
                      <h2 className="text-2xl font-bold">Reasoning</h2>
                    </div>
                    <Badge variant={evaluation.passed ? "success" : evaluation.plagiarism_flag ? "danger" : "warning"} size="md">
                      {verdict}
                    </Badge>
                  </div>
                  <div className="relative overflow-hidden rounded-md border border-black/10 bg-[#f7f7f8] p-5 dark:border-white/10 dark:bg-black/30">
                    <div className="absolute left-0 top-0 h-full w-1 bg-[#282B5D] dark:bg-[#BCA2FF]" />
                    <p className="pl-4 text-base leading-8 text-black/65 dark:text-white/65">
                      {evaluation.reasoning || "No reasoning provided."}
                    </p>
                  </div>
                </section>

                <section className="grid gap-3 sm:grid-cols-3">
                  <ReportCard icon={<Sparkles className="h-4 w-4" />} label="Evaluated" value={formatDateTime(evaluation.evaluated_at) || "Pending"} />
                  <ReportCard icon={<BrainCircuit className="h-4 w-4" />} label="Consensus" value={evaluation.consensus_reached ? "Multi-validator agree" : "Still pending"} />
                  <ReportCard icon={<ShieldCheck className="h-4 w-4" />} label="Outcome" value={verdict} />
                </section>

                {!evaluation.passed && !evaluation.plagiarism_flag && (
                  <section className="rounded-md border border-amber-500/20 bg-amber-500/10 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="font-bold text-amber-900 dark:text-amber-100">Want a second pass?</h2>
                        <p className="mt-1 text-sm leading-6 text-amber-800/80 dark:text-amber-100/75">
                          Request another AI consensus round if this result missed important context.
                        </p>
                      </div>
                      <Button variant="outline" onClick={() => setShowAppeal(true)}>
                        Appeal Result
                      </Button>
                    </div>
                  </section>
                )}
              </motion.div>
            </div>
          ) : (
            <div className="rounded-md border border-black/10 bg-white px-6 py-14 text-center shadow-xl shadow-black/5 dark:border-white/10 dark:bg-white/[0.04]">
              <BrainCircuit className="mx-auto h-10 w-10 text-[#282B5D] dark:text-[#BCA2FF]" />
              <p className="mt-4 text-lg font-bold text-black dark:text-white">Evaluation in progress</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/55 dark:text-white/55">
                The validator result has not landed yet. You can check again without leaving this page.
              </p>
              <div className="mt-6">
                <Button onClick={refetch} variant="secondary">
                  Check Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Modal isOpen={showAppeal} onClose={() => setShowAppeal(false)} title="Appeal Evaluation">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Explain why you believe this evaluation was incorrect. A new round of AI validators will re-evaluate your submission. You will need to stake an additional bond.
          </p>
          <Textarea
            label="Reason for Appeal"
            placeholder="Provide specific reasons why the evaluation should be reconsidered..."
            value={appealReason}
            onChange={(event) => setAppealReason(event.target.value)}
            rows={4}
            showCharCount
            maxLength={1000}
          />
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleAppeal} disabled={appealReason.length < 20} fullWidth>
              Submit Appeal
            </Button>
            <Button variant="secondary" onClick={() => setShowAppeal(false)} fullWidth>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <TransactionModal
        isOpen={txStatus !== "idle"}
        status={txStatus}
        errorMessage={txError}
        onClose={() => setTxStatus("idle")}
        onRetry={txStatus === "failed" ? handleAppeal : undefined}
      />
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white p-3 dark:bg-white/[0.05]">
      <p className="text-xs font-bold uppercase text-black/45 dark:text-white/45">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-black dark:text-white">{value}</p>
    </div>
  );
}

function StatusRow({
  icon,
  label,
  value,
  good,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  good: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-black/10 p-3 text-sm dark:border-white/10">
      <span className="flex items-center gap-2 text-black/55 dark:text-white/55">
        <span className={good ? "text-emerald-600 dark:text-emerald-300" : "text-amber-600 dark:text-amber-300"}>{icon}</span>
        {label}
      </span>
      <span className="font-bold text-black dark:text-white">{value}</span>
    </div>
  );
}

function ReportCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-black/10 bg-white p-4 shadow-lg shadow-black/5 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="mb-3 text-[#282B5D] dark:text-[#BCA2FF]">{icon}</div>
      <p className="text-xs font-bold uppercase text-black/45 dark:text-white/45">{label}</p>
      <p className="mt-2 text-sm font-bold leading-5 text-black dark:text-white">{value}</p>
    </div>
  );
}
