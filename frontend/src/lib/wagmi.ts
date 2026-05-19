"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { GENLAYER_CHAIN_CONFIG, WALLETCONNECT_PROJECT_ID } from "./constants";

const wallets = WALLETCONNECT_PROJECT_ID
  ? undefined
  : [
      {
        groupName: "Browser Wallet",
        wallets: [injectedWallet],
      },
    ];

export const wagmiConfig = getDefaultConfig({
  appName: "EquiGrant",
  projectId: WALLETCONNECT_PROJECT_ID || "00000000000000000000000000000000",
  wallets,
  chains: [GENLAYER_CHAIN_CONFIG],
  ssr: false,
});
