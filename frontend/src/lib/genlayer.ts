     1|"use client";
     2|
     3|import { createClient } from "genlayer-js";
     4|import { studionet } from "genlayer-js/chains";
     5|import { CONTRACT_ADDRESS } from "./constants";
     6|
     7|// Read-only client , doesn't need wallet, talks directly to RPC
     8|let readClient: ReturnType<typeof createClient> | null = null;
     9|
    10|function getReadClient() {
    11|  if (!readClient) {
    12|    readClient = createClient({
    13|      chain: studionet,
    14|    });
    15|  }
    16|  return readClient;
    17|}
    18|
    19|export async function readContract(functionName: string, args: any[] = []) {
    20|  const client = getReadClient();
    21|  const result = await client.readContract({
    22|    address: CONTRACT_ADDRESS as any,
    23|    functionName,
    24|    args,
    25|  });
    26|  return result;
    27|}
    28|
    29|export async function writeContract(
    30|  account: `0x${string}`,
    31|  provider: any,
    32|  functionName: string,
    33|  args: any[] = [],
    34|  value: bigint = BigInt(0)
    35|): Promise<string> {
    36|  const client = createClient({
    37|    chain: studionet,
    38|    account,
    39|    provider,
    40|  });
    41|  const request: Record<string, unknown> = {
    42|    address: CONTRACT_ADDRESS as any,
    43|    functionName,
    44|    args,
    45|  };
    46|
    47|  if (value > BigInt(0)) {
    48|    request.value = value;
    49|  }
    50|
    51|  const hash = await client.writeContract(request as any);
    52|  return String(hash);
    53|}
    54|
    55|export async function waitForReceipt(hash: string) {
    56|  const client = getReadClient();
    57|  const { TransactionStatus } = await import("genlayer-js/types");
    58|  // genlayer-js expects a narrow hash type (0x + 64 hex chars)
    59|  // The runtime hash is correct; we bypass the overly narrow type constraint
    60|  return client.waitForTransactionReceipt({
    61|    hash: hash as any,
    62|    status: TransactionStatus.ACCEPTED,
    63|  });
    64|}
    65|
