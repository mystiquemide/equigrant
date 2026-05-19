"use client";

import { motion } from "framer-motion";
import { Star, TrendingUp, Trophy } from "lucide-react";
import Link from "next/link";

import { useLanguage } from "@/components/LanguageProvider";

const builders = [
  { name: "impact-labs.eth", score: 98, grants: 7, earnings: "24,800 GEN" },
  { name: "ada_foundry", score: 95, grants: 5, earnings: "18,100 GEN" },
  { name: "publicgoods.dev", score: 92, grants: 4, earnings: "13,450 GEN" },
];

export function LeaderboardTeaser() {
  const { t } = useLanguage();

  return (
    <section className="border-b border-black/10 bg-white px-4 py-20 dark:border-white/10 dark:bg-black sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#282B5D]/10 px-3 py-1 text-sm font-bold text-[#282B5D] dark:bg-[#BCA2FF]/15 dark:text-[#BCA2FF]">
            <Trophy className="h-4 w-4" />
            {t.publicLeaderboard}
          </div>
          <h2 className="text-3xl font-bold tracking-normal text-black dark:text-white sm:text-4xl">{t.leaderboardHeadline}</h2>
          <p className="mt-4 text-base leading-7 text-black/60 dark:text-white/60">
            {t.leaderboardBody}
          </p>
          <Link href="/leaderboard" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#282B5D] transition hover:text-[#110FFF] dark:text-[#BCA2FF]">
            {t.viewFullLeaderboard}
            <TrendingUp className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-md border border-black/10 bg-[#f7f7f8] p-3 dark:border-white/10 dark:bg-white/5">
          <div className="space-y-3">
            {builders.map((builder, index) => (
              <motion.div
                key={builder.name}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black/40"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[#282B5D] text-sm font-bold text-white dark:bg-[#BCA2FF] dark:text-black">
                  {index + 1}
                </span>
                <div>
                  <p className="font-bold text-black dark:text-white">{builder.name}</p>
                  <p className="text-sm text-black/50 dark:text-white/50">{builder.grants} {t.grantsCompleted}</p>
                </div>
                <div className="text-right">
                  <p className="inline-flex items-center justify-end gap-1 font-bold text-[#282B5D] dark:text-[#BCA2FF]">
                    <Star className="h-4 w-4 fill-current" />
                    {builder.score}
                  </p>
                  <p className="text-sm font-semibold text-black/45 dark:text-white/45">{builder.earnings}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
