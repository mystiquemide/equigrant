"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useAccount } from "wagmi";
import { readContract } from "@/lib/genlayer";
import { Badge } from "@/components/Badge";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { truncateAddress } from "@/lib/truncate";
import { formatDateTime } from "@/lib/format";
import type { SubmissionData } from "@/types";

export default function MySubmissionsPage() {
  const router = useRouter();
  const { isConnected } = useWallet();
  const { address } = useAccount();
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!address) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    readContract("get_submitter_submissions", [address])
      .then((data) => setSubmissions((Array.isArray(data) ? data : []) as unknown as SubmissionData[]))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [address]);

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold text-black dark:text-white">Connect Your Wallet</h1>
        <p className="text-black/60 dark:text-white/60">Connect your wallet to view your submissions.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 rounded-md border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
        <p className="mb-2 text-sm font-bold uppercase text-[#282B5D] dark:text-[#BCA2FF]">Dashboard</p>
        <h1 className="text-3xl font-bold text-black dark:text-white">My Submissions</h1>
        <p className="mt-3 text-sm text-black/55 dark:text-white/55">
          Track your bounty entries, evaluation status, scores, and payout history.
        </p>
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="card" count={3} />
      ) : submissions.length === 0 ? (
        <div className="rounded-md border border-black/10 bg-white px-6 py-14 text-center dark:border-white/10 dark:bg-white/[0.04]">
          <h2 className="text-2xl font-bold text-black dark:text-white">No submissions yet</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/55 dark:text-white/55">
            You haven't submitted to any bounties yet. Browse active bounties to find opportunities.
          </p>
          <button
            onClick={() => router.push("/bounties")}
            className="mt-7 inline-flex h-11 items-center justify-center rounded-md bg-[#282B5D] px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#110FFF] dark:bg-white dark:text-black dark:hover:bg-[#BCA2FF]"
          >
            Browse Bounties
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="cursor-pointer rounded-md border border-black/10 bg-white p-4 transition hover:border-[#282B5D]/50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-[#BCA2FF]/50"
              onClick={() => router.push(`/results/${sub.bounty_id}/${sub.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  router.push(`/results/${sub.bounty_id}/${sub.id}`);
                }
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex-1">
                  <p className="font-mono text-sm text-black dark:text-white">
                    {truncateAddress(sub.bounty_id, 6)}
                  </p>
                  <p className="mt-1 text-xs text-black/50 dark:text-white/50">
                    {sub.description.slice(0, 80)}
                    {sub.description.length > 80 ? "..." : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      sub.status === "evaluated"
                        ? "info"
                        : sub.status === "appealed"
                        ? "warning"
                        : sub.status === "evaluating"
                        ? "warning"
                        : "neutral"
                    }
                  >
                    {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                  </Badge>
                  <span className="text-xs text-black/50 dark:text-white/50">
                    {formatDateTime(sub.submitted_at)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
