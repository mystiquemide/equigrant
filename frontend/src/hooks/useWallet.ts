"use client";

import { useAccount, useBalance, useChainId, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { GENLAYER_CHAIN_ID } from "@/lib/constants";
import { truncateAddress } from "@/lib/truncate";
import { useCallback, useMemo } from "react";
import type { WalletState } from "@/types";

export function useWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({ address });

  const isWrongNetwork = isConnected && chainId !== GENLAYER_CHAIN_ID;

  const walletState: WalletState = isConnected
    ? "connected"
    : "disconnected";

  const displayAddress = address ? truncateAddress(address) : "";
  const displayBalance = balance
    ? `${parseFloat(balance.formatted).toFixed(2)} ${balance.symbol}`
    : "0 GEN";

  const connectWallet = useCallback(async () => {
    const injectedConnector = connectors.find((c) => c.id === "injected" || c.id === "io.metamask");
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    } else if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  }, [connect, connectors]);

  const switchToGenLayer = useCallback(() => {
    switchChain({ chainId: GENLAYER_CHAIN_ID });
  }, [switchChain]);

  return useMemo(
    () => ({
      address,
      isConnected,
      walletState,
      isWrongNetwork,
      displayAddress,
      displayBalance,
      connectWallet,
      disconnect,
      switchToGenLayer,
    }),
    [
      address,
      isConnected,
      walletState,
      isWrongNetwork,
      displayAddress,
      displayBalance,
      connectWallet,
      disconnect,
      switchToGenLayer,
    ]
  );
}
