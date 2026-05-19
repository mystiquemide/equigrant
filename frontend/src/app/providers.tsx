"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useTheme } from "next-themes";
import { useState } from "react";
import { WagmiProvider } from "wagmi";

import { LanguageProvider } from "@/components/LanguageProvider";
import { wagmiConfig } from "@/lib/wagmi";

function WalletThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <RainbowKitProvider
      modalSize="compact"
      theme={
        isDark
          ? darkTheme({
              accentColor: "#BCA2FF",
              accentColorForeground: "#000000",
              borderRadius: "small",
            })
          : lightTheme({
              accentColor: "#282B5D",
              accentColorForeground: "#FFFFFF",
              borderRadius: "small",
            })
      }
    >
      {children}
    </RainbowKitProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <LanguageProvider>
            <WalletThemeProvider>{children}</WalletThemeProvider>
          </LanguageProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
