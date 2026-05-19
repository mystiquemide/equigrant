"use client";

import { useState, useEffect, useCallback } from "react";
import { readContract } from "@/lib/genlayer";
import type { BountyData, SubmissionData } from "@/types";

export function useBounty(bountyId: string | undefined) {
  const [bounty, setBounty] = useState<BountyData | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBounty = useCallback(async () => {
    if (!bountyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [bountyData, submissionsData] = await Promise.all([
        readContract("get_bounty", [bountyId]),
        readContract("get_submissions", [bountyId]),
      ]);
      setBounty(bountyData as unknown as BountyData);
      setSubmissions((Array.isArray(submissionsData) ? submissionsData : []) as unknown as SubmissionData[]);
    } catch (err: any) {
      const msg = err?.message || err?.toString() || "";
      if (msg.includes("invalid_contract") || msg.includes("VMError") || msg.includes("absent")) {
        setError("No contract deployed yet. Deploy the EquiGrant contract to Bradbury testnet first.");
      } else if (msg.includes("not found") || msg.includes("not found".toLowerCase())) {
        setError("Bounty not found.");
      } else {
        setError("Failed to load bounty details.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [bountyId]);

  useEffect(() => {
    fetchBounty();
  }, [fetchBounty]);

  return { bounty, submissions, isLoading, error, refetch: fetchBounty };
}
