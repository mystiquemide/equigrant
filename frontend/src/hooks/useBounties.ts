"use client";

import { useState, useEffect, useCallback } from "react";
import { readContract } from "@/lib/genlayer";
import type { BountyData } from "@/types";

export function useBounties() {
  const [bounties, setBounties] = useState<BountyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBounties = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await readContract("get_active_bounties", []);
      const arr = Array.isArray(data) ? data : [];
      setBounties(arr as unknown as BountyData[]);
    } catch (err: any) {
      const msg = err?.message || err?.toString() || "";
      if (msg.includes("invalid_contract") || msg.includes("VMError") || msg.includes("absent")) {
        setError("No contract deployed yet. Deploy the EquiGrant contract to Bradbury testnet first.");
      } else if (msg.includes("network") || msg.includes("fetch") || msg.includes("ENOTFOUND")) {
        setError("Cannot reach GenLayer network. Check your connection.");
      } else {
        setError("Failed to load bounties. The contract may not be deployed yet.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBounties();
  }, [fetchBounties]);

  return { bounties, isLoading, error, refetch: fetchBounties };
}
