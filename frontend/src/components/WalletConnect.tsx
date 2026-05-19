"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Loader2, Wallet } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";

export const WALLET_REDIRECT_KEY = "equigrant-wallet-connect-redirect";

interface WalletConnectProps {
  redirectOnConnect?: boolean;
}

export function WalletConnect({ redirectOnConnect = false }: WalletConnectProps) {
  const { isConnected } = useAccount();
  const pathname = usePathname();
  const router = useRouter();
  const wasConnected = useRef(isConnected);

  useEffect(() => {
    if (wasConnected.current && !isConnected && pathname !== "/") {
      window.sessionStorage.removeItem(WALLET_REDIRECT_KEY);
      router.replace("/");
      wasConnected.current = isConnected;
      return;
    }

    if (!isConnected) {
      wasConnected.current = isConnected;
      return;
    }

    const shouldRedirect = window.sessionStorage.getItem(WALLET_REDIRECT_KEY) === "true";
    if (!shouldRedirect) {
      wasConnected.current = isConnected;
      return;
    }

    window.sessionStorage.removeItem(WALLET_REDIRECT_KEY);
    if (redirectOnConnect && pathname === "/") {
      router.replace("/dashboard/submissions");
    }
    wasConnected.current = isConnected;
  }, [isConnected, pathname, redirectOnConnect, router]);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!ready) {
          return (
            <button className="inline-flex h-10 items-center gap-2 rounded-md border border-black/10 bg-black px-4 text-sm font-semibold text-white dark:border-white/15 dark:bg-white dark:text-black">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading
            </button>
          );
        }

        if (!connected) {
          return (
            <button
              onClick={() => {
                if (redirectOnConnect) {
                  window.sessionStorage.setItem(WALLET_REDIRECT_KEY, "true");
                } else {
                  window.sessionStorage.removeItem(WALLET_REDIRECT_KEY);
                }
                openConnectModal();
              }}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-[#282B5D] px-4 text-sm font-semibold text-white shadow-lg shadow-[#282B5D]/20 transition hover:-translate-y-0.5 hover:bg-[#110FFF] focus-visible:ring-[#BCA2FF] dark:bg-white dark:text-black dark:hover:bg-[#BCA2FF]"
            >
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              className="inline-flex h-10 items-center rounded-md bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-500"
            >
              Wrong Network
            </button>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={openAccountModal}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-black px-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#282B5D] dark:bg-white dark:text-black dark:hover:bg-[#BCA2FF]"
            >
              {account.displayName}
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
