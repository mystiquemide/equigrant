"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useAccount } from "wagmi";
import { readContract } from "@/lib/genlayer";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { CountdownTimer } from "@/components/CountdownTimer";
import { formatGEN } from "@/lib/format";
import type { BountyData } from "@/types";

export default function MyGrantsPage() {
  const router = useRouter();
  const { isConnected } = useWallet();
  const { address } = useAccount();
  const [bounties, setBounties] = useState<BountyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    setIsLoading(true);
    readContract("get_creator_bounties", [address])
      .then((data) => setBounties((Array.isArray(data) ? data : []) as unknown as BountyData[]))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [address]);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-h2 text-text-primary mb-4">Connect Your Wallet</h1>
        <p className="text-text-secondary">Connect your wallet to view your grants.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-h2 text-text-primary">My Bounties</h1>
        <Button variant="primary" onClick={() => router.push("/create")}>
          Create Bounty
        </Button>
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="card" count={3} />
      ) : bounties.length === 0 ? (
        <EmptyState
          title="No bounties created yet"
          description="Create your first bounty for grants or hackathons with AI validator judging."
          action={{ label: "Create Bounty", onClick: () => router.push("/create") }}
        />
      ) : (
        <div className="space-y-3">
          {bounties.map((bounty) => {
            const statusVariant =
              bounty.status === "active"
                ? "success"
                : bounty.status === "evaluating"
                ? "warning"
                : "neutral";

            return (
              <div
                key={bounty.id}
                className="card cursor-pointer hover:border-border-focus"
                onClick={() => router.push(`/bounties/${bounty.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    router.push(`/bounties/${bounty.id}`);
                  }
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-text-primary line-clamp-2">
                      {bounty.criteria}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-text-primary font-semibold">
                        {formatGEN(bounty.reward_pool)} GEN
                      </p>
                      <p className="text-xs text-text-muted">
                        {bounty.submission_count} subs
                      </p>
                    </div>
                    <Badge variant={statusVariant}>
                      {bounty.status.charAt(0).toUpperCase() + bounty.status.slice(1)}
                    </Badge>
                    <CountdownTimer deadline={bounty.deadline} size="sm" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
