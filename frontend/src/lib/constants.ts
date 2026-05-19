export const GENLAYER_CHAIN_ID = parseInt(
  process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID || "61999"
);

export const GENLAYER_RPC_URL =
  process.env.NEXT_PUBLIC_GENLAYER_RPC_URL ||
  "https://studio.genlayer.com/api";

export const GENLAYER_EXPLORER_URL =
  process.env.NEXT_PUBLIC_GENLAYER_EXPLORER_URL ||
  "https://genlayer-explorer.vercel.app";

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x0dB3Ecd9D59f4db642b0CDe1b3442294A0D8Ff00";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

export const WALLETCONNECT_PROJECT_ID =
  walletConnectProjectId && walletConnectProjectId !== "your_project_id" ? walletConnectProjectId : "";

export const GENLAYER_CHAIN_CONFIG = {
  id: GENLAYER_CHAIN_ID,
  name: "GenLayer StudioNet",
  nativeCurrency: {
    name: "GEN",
    symbol: "GEN",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [GENLAYER_RPC_URL] },
    public: { http: [GENLAYER_RPC_URL] },
  },
  blockExplorers: {
    default: {
      name: "GenLayer Explorer",
      url: GENLAYER_EXPLORER_URL,
    },
  },
  testnet: true,
} as const;
