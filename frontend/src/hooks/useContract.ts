"use client";

import { useCallback } from "react";
import { useAccount } from "wagmi";
import { writeContract, waitForReceipt } from "@/lib/genlayer";

export function useContract() {
  const { address } = useAccount();

  const createBounty = useCallback(
    async (criteria: string, rewardPool: bigint, deadline: string, minStake: bigint) => {
      if (!address) throw new Error("Wallet not connected");
      const provider = (window as any).ethereum;
      if (!provider) throw new Error("No wallet provider found");

      const hash = await writeContract(
        address as `0x${string}`,
        provider,
        "create_bounty",
        [criteria, rewardPool, deadline, minStake]
      );
      await waitForReceipt(hash);
      return hash;
    },
    [address]
  );

  const submitWork = useCallback(
    async (bountyId: string, githubUrls: string[], demoUrl: string, description: string) => {
      if (!address) throw new Error("Wallet not connected");
      const provider = (window as any).ethereum;
      if (!provider) throw new Error("No wallet provider found");

      const hash = await writeContract(
        address as `0x${string}`,
        provider,
        "submit_work",
        [bountyId, githubUrls, demoUrl, description]
      );
      await waitForReceipt(hash);
      return hash;
    },
    [address]
  );

  const evaluateSubmission = useCallback(
    async (bountyId: string, submissionId: string) => {
      if (!address) throw new Error("Wallet not connected");
      const provider = (window as any).ethereum;
      if (!provider) throw new Error("No wallet provider found");

      const hash = await writeContract(
        address as `0x${string}`,
        provider,
        "evaluate",
        [bountyId, submissionId]
      );
      await waitForReceipt(hash);
      return hash;
    },
    [address]
  );

  const resolveBounty = useCallback(async (bountyId: string) => {
    if (!address) throw new Error("Wallet not connected");
    const provider = (window as any).ethereum;
    if (!provider) throw new Error("No wallet provider found");

    const hash = await writeContract(
      address as `0x${string}`,
      provider,
      "resolve",
      [bountyId]
    );
    await waitForReceipt(hash);
    return hash;
  }, [address]);

  const deleteBounty = useCallback(async (bountyId: string) => {
    if (!address) throw new Error("Wallet not connected");
    const provider = (window as any).ethereum;
    if (!provider) throw new Error("No wallet provider found");

    const hash = await writeContract(
      address as `0x${string}`,
      provider,
      "delete_bounty",
      [bountyId]
    );
    await waitForReceipt(hash);
    return hash;
  }, [address]);

  const pauseBounty = useCallback(async (bountyId: string) => {
    if (!address) throw new Error("Wallet not connected");
    const provider = (window as any).ethereum;
    if (!provider) throw new Error("No wallet provider found");

    const hash = await writeContract(
      address as `0x${string}`,
      provider,
      "pause_bounty",
      [bountyId]
    );
    await waitForReceipt(hash);
    return hash;
  }, [address]);

  const resumeBounty = useCallback(async (bountyId: string) => {
    if (!address) throw new Error("Wallet not connected");
    const provider = (window as any).ethereum;
    if (!provider) throw new Error("No wallet provider found");

    const hash = await writeContract(
      address as `0x${string}`,
      provider,
      "resume_bounty",
      [bountyId]
    );
    await waitForReceipt(hash);
    return hash;
  }, [address]);

  const extendDeadline = useCallback(async (bountyId: string, deadline: string) => {
    if (!address) throw new Error("Wallet not connected");
    const provider = (window as any).ethereum;
    if (!provider) throw new Error("No wallet provider found");

    const hash = await writeContract(
      address as `0x${string}`,
      provider,
      "extend_deadline",
      [bountyId, deadline]
    );
    await waitForReceipt(hash);
    return hash;
  }, [address]);

  const editBounty = useCallback(
    async (bountyId: string, criteria: string, rewardPool: bigint, minStake: bigint) => {
      if (!address) throw new Error("Wallet not connected");
      const provider = (window as any).ethereum;
      if (!provider) throw new Error("No wallet provider found");

      const hash = await writeContract(
        address as `0x${string}`,
        provider,
        "edit_bounty",
        [bountyId, criteria, rewardPool, minStake]
      );
      await waitForReceipt(hash);
      return hash;
    },
    [address]
  );

  const appealEvaluation = useCallback(
    async (bountyId: string, submissionId: string, reason: string) => {
      if (!address) throw new Error("Wallet not connected");
      const provider = (window as any).ethereum;
      if (!provider) throw new Error("No wallet provider found");

      const hash = await writeContract(
        address as `0x${string}`,
        provider,
        "appeal",
        [bountyId, submissionId, reason]
      );
      await waitForReceipt(hash);
      return hash;
    },
    [address]
  );

  return {
    createBounty,
    submitWork,
    evaluateSubmission,
    resolveBounty,
    deleteBounty,
    pauseBounty,
    resumeBounty,
    extendDeadline,
    editBounty,
    appealEvaluation,
  };
}
