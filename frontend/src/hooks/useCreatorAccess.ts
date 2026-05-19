"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { readContract } from "@/lib/genlayer";
import type { BountyData } from "@/types";

export function useCreatorAccess() {
  const { address, isConnected } = useAccount();
  const [creatorBounties, setCreatorBounties] = useState<BountyData[]>([]);
  const [isLoadingCreatorAccess, setIsLoadingCreatorAccess] = useState(false);
  const [creatorAccessError, setCreatorAccessError] = useState<string | null>(null);

  const refetchCreatorAccess = useCallback(async () => {
    if (!address || !isConnected) {
      setCreatorBounties([]);
      setIsLoadingCreatorAccess(false);
      setCreatorAccessError(null);
      return;
    }

    setIsLoadingCreatorAccess(true);
    setCreatorAccessError(null);

    try {
      const data = await readContract("get_creator_bounties", [address]);
      setCreatorBounties((Array.isArray(data) ? data : []) as unknown as BountyData[]);
    } catch (error) {
      console.error("Failed to check creator access", error);
      setCreatorBounties([]);
      setCreatorAccessError("Creator access could not be checked right now.");
    } finally {
      setIsLoadingCreatorAccess(false);
    }
  }, [address, isConnected]);

  useEffect(() => {
    refetchCreatorAccess();
  }, [refetchCreatorAccess]);

  useEffect(() => {
    window.addEventListener("equigrant:creator-bounties-updated", refetchCreatorAccess);
    return () => window.removeEventListener("equigrant:creator-bounties-updated", refetchCreatorAccess);
  }, [refetchCreatorAccess]);

  return {
    creatorBounties,
    creatorAccessError,
    isCreator: creatorBounties.length > 0,
    isLoadingCreatorAccess,
    refetchCreatorAccess,
  };
}
