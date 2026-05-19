"use client";

import { Navbar } from "@/components/Layout/Navbar";
import { Footer } from "@/components/Layout/Footer";
import { Providers } from "@/app/providers";
import "@/styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>EquiGrant | AI-Governed Grant Platform</title>
        <meta
          name="description"
          content="Decentralized grant platform on GenLayer where AI validators evaluate submissions and auto-distribute payouts."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Providers>
          <div className="flex min-h-screen flex-col bg-white text-black transition-colors duration-300 dark:bg-black dark:text-white">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
