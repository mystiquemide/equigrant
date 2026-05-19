"use client";

import { motion } from "framer-motion";
import { BrainCircuit, FileSearch, Gavel, ShieldCheck } from "lucide-react";

const signals = [
  {
    icon: FileSearch,
    label: "Proof-of-work review",
    detail: "Validators inspect repositories, demos, descriptions, and supporting files before scores are accepted.",
  },
  {
    icon: BrainCircuit,
    label: "Consensus judging",
    detail: "Multiple AI validators compare each entry against the same natural-language criteria.",
  },
  {
    icon: Gavel,
    label: "Appeals path",
    detail: "Disputed results can move into appeal review instead of disappearing into a black box.",
  },
  {
    icon: ShieldCheck,
    label: "Onchain audit trail",
    detail: "Bounties, submissions, evaluation state, and outcomes are designed to remain transparent.",
  },
];

export function JudgingLayerPreview() {
  return (
    <section className="border-b border-black/10 bg-white px-4 py-16 dark:border-white/10 dark:bg-black sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="mb-3 text-sm font-bold uppercase text-[#282B5D] dark:text-[#BCA2FF]">
              Judging Layer
            </p>
            <h2 className="text-3xl font-bold tracking-normal text-black dark:text-white sm:text-4xl">
              Built for the messy middle between grants and hackathons.
            </h2>
            <p className="mt-4 text-base leading-7 text-black/60 dark:text-white/60">
              EquiGrant gives creators a structured way to publish challenges, collect staked submissions, and let validators judge proof of work with transparent criteria.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {signals.map((signal, index) => (
              <motion.div
                key={signal.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
                className="rounded-md border border-black/10 bg-[#f7f7f8] p-5 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-[#282B5D] text-white dark:bg-[#BCA2FF] dark:text-black">
                  <signal.icon className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-bold text-black dark:text-white">{signal.label}</h3>
                <p className="mt-3 text-sm leading-6 text-black/60 dark:text-white/60">{signal.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
