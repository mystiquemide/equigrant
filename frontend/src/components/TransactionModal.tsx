"use client";

import type { TransactionStatus } from "@/types";

interface TransactionModalProps {
  isOpen: boolean;
  status: TransactionStatus;
  txHash?: string;
  errorMessage?: string;
  onClose: () => void;
  onRetry?: () => void;
}

export function TransactionModal({
  isOpen,
  status,
  txHash,
  errorMessage,
  onClose,
  onRetry,
}: TransactionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-lg bg-bg-secondary p-6 shadow-lg animate-slide-up">
        {status === "signing" && (
          <>
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Confirm in Wallet
            </h2>
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-brand-primary/10 flex items-center justify-center">
                <svg className="h-8 w-8 text-brand-primary animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <p className="text-sm text-text-secondary text-center">
                Please confirm this transaction in your wallet
              </p>
            </div>
          </>
        )}

        {status === "pending" && (
          <>
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Transaction Pending
            </h2>
            <div className="flex flex-col items-center gap-4">
              <svg className="h-12 w-12 animate-spin text-brand-primary" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {txHash && (
                <p className="font-mono text-xs text-text-muted break-all">
                  {txHash}
                </p>
              )}
              <p className="text-sm text-text-secondary">
                Waiting for confirmation...
              </p>
            </div>
          </>
        )}

        {status === "confirmed" && (
          <>
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <span className="text-accent-green">&#x2714;</span>
              Transaction Confirmed
            </h2>
            <div className="flex flex-col items-center gap-4">
              {txHash && (
                <p className="font-mono text-xs text-text-muted break-all">
                  {txHash}
                </p>
              )}
              <button onClick={onClose} className="btn-primary w-full">
                Close
              </button>
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <span className="text-accent-red">&#x2718;</span>
              Transaction Failed
            </h2>
            <div className="flex flex-col gap-4">
              {errorMessage && (
                <p className="text-sm text-accent-red bg-accent-red/10 rounded-md p-3">
                  {errorMessage}
                </p>
              )}
              <div className="flex gap-2">
                {onRetry && (
                  <button onClick={onRetry} className="btn-primary flex-1">
                    Try Again
                  </button>
                )}
                <button onClick={onClose} className="btn-secondary flex-1">
                  Close
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
