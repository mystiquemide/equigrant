"use client";

import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { CONTRACT_ADDRESS } from "./constants";

// Read-only client — doesn't need wallet, talks directly to RPC
let readClient: ReturnType<typeof createClient> | null = null;

function getReadClient() {
  if (!readClient) {
    readClient = createClient({
      chain: studionet,
    });
  }
  return readClient;
}

export async function readContract(functionName: string, args: any[] = []) {
  const client = getReadClient();
  const result = await client.readContract({
    address: CONTRACT_ADDRESS as any,
    functionName,
    args,
  });
  return result;
}

export async function writeContract(
  account: `0x${string}`,
  provider: any,
  functionName: string,
  args: any[] = [],
  value: bigint = BigInt(0)
): Promise<string> {
  const client = createClient({
    chain: studionet,
    account,
    provider,
  });
  const request: Record<string, unknown> = {
    address: CONTRACT_ADDRESS as any,
    functionName,
    args,
  };

  if (value > BigInt(0)) {
    request.value = value;
  }

  const hash = await client.writeContract(request as any);
  return String(hash);
}

export async function waitForReceipt(hash: string) {
  const client = getReadClient();
  const { TransactionStatus } = await import("genlayer-js/types");
  // genlayer-js expects a narrow hash type (0x + 64 hex chars)
  // The runtime hash is correct; we bypass the overly narrow type constraint
  return client.waitForTransactionReceipt({
    hash: hash as any,
    status: TransactionStatus.ACCEPTED,
  });
}
