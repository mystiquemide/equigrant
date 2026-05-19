"use client";

import { motion } from "framer-motion";
import {
  Award,
  BadgeCheck,
  Banknote,
  Crown,
  Medal,
  ShieldCheck,
  Star,
  TrendingUp,
  Trophy,
} from "lucide-react";

const topBuilders = [
  {
    builder: "impact-labs.eth",
    bountiesWon: 7,
    genEarned: "24,800",
    consensusScore: 98,
    appeals: "3 won / 0 lost",
    badge: "Consensus Elite",
  },
  {
    builder: "ada_foundry",
    bountiesWon: 5,
    genEarned: "18,100",
    consensusScore: 95,
    appeals: "2 won / 1 lost",
    badge: "Impact Builder",
  },
  {
    builder: "publicgoods.dev",
    bountiesWon: 4,
    genEarned: "13,450",
    consensusScore: 92,
    appeals: "1 won / 0 lost",
    badge: "Reliable Shipper",
  },
  {
    builder: "openreview.dao",
    bountiesWon: 3,
    genEarned: "9,700",
    consensusScore: 89,
    appeals: "0 won / 0 lost",
    badge: "Rubric Pro",
  },
  {
    builder: "fieldops.studio",
    bountiesWon: 2,
    genEarned: "6,250",
    consensusScore: 86,
    appeals: "1 won / 1 lost",
    badge: "Rising Builder",
  },
];

const pastWinners = [
  {
    project: "Audit Trail Exporter",
    winner: "impact-labs.eth",
    sponsor: "Open Grants DAO",
    award: "7,200 GEN",
    score: 95,
  },
  {
    project: "Reviewer Portal Toolkit",
    winner: "ada_foundry",
    sponsor: "Foundation Ops Collective",
    award: "5,800 GEN",
    score: 93,
  },
  {
    project: "Public Goods KPI Board",
    winner: "publicgoods.dev",
    sponsor: "Civic Grants Lab",
    award: "4,450 GEN",
    score: 91,
  },
];

const highestScores = [
  { project: "Private Treasury Signer", builder: "impact-labs.eth", score: 98, signal: "Security depth" },
  { project: "AI Rubric Explainer", builder: "ada_foundry", score: 96, signal: "Criteria fit" },
  { project: "Milestone Report Parser", builder: "publicgoods.dev", score: 94, signal: "Execution quality" },
  { project: "DAO Reviewer Console", builder: "openreview.dao", score: 92, signal: "Workflow clarity" },
];

const fundedProjects = [
  { project: "Climate Resilience Grants OS", builder: "fieldops.studio", funded: "18,000 GEN", backers: 14 },
  { project: "NGO Outcomes Ledger", builder: "impact-labs.eth", funded: "15,500 GEN", backers: 11 },
  { project: "Quadratic Review Portal", builder: "openreview.dao", funded: "12,900 GEN", backers: 9 },
  { project: "Sanctions Screening Agent", builder: "ada_foundry", funded: "11,250 GEN", backers: 7 },
];

const highlights = [
  { label: "Top consensus score", value: "98", icon: Star },
  { label: "GEN earned", value: "72.3K", icon: Trophy },
  { label: "Bounties won", value: "21", icon: Award },
  { label: "Appeals resolved", value: "9", icon: ShieldCheck },
];

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <section className="border-b border-black/10 bg-[#f7f7f8] px-4 py-12 dark:border-white/10 dark:bg-[#060608] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-bold uppercase text-[#282B5D] dark:text-[#BCA2FF]">
            Leaderboard
          </p>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-black dark:text-white sm:text-5xl">
            Reputation for builders judged by AI validator consensus.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-black/60 dark:text-white/60">
            Rankings for past winners, top builders, highest scores, and the most funded projects on EquiGrant.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item) => (
              <StatCard key={item.label} icon={<item.icon className="h-5 w-5" />} label={item.label} value={item.value} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6">
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Panel
              eyebrow="Past winners"
              title="Recently funded work"
              icon={<Crown className="h-5 w-5" />}
            >
              <div className="grid gap-3">
                {pastWinners.map((winner, index) => (
                  <motion.div
                    key={winner.project}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="grid gap-4 rounded-md border border-black/10 bg-[#f7f7f8] p-4 dark:border-white/10 dark:bg-black/30 md:grid-cols-[44px_1fr_auto] md:items-center"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[#282B5D] text-sm font-bold text-white dark:bg-[#BCA2FF] dark:text-black">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-bold">{winner.project}</p>
                      <p className="mt-1 text-sm text-black/55 dark:text-white/55">
                        {winner.winner} · {winner.sponsor}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="font-bold">{winner.award}</p>
                      <p className="mt-1 text-xs font-semibold text-[#282B5D] dark:text-[#BCA2FF]">{winner.score}/100 score</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Panel>

            <Panel
              eyebrow="Highest scores"
              title="Best AI-reviewed submissions"
              icon={<BadgeCheck className="h-5 w-5" />}
            >
              <div className="space-y-3">
                {highestScores.map((item, index) => (
                  <div key={item.project} className="rounded-md border border-black/10 p-4 dark:border-white/10">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold">{item.project}</p>
                        <p className="mt-1 text-sm text-black/55 dark:text-white/55">{item.builder}</p>
                      </div>
                      <span className="rounded-full bg-[#282B5D]/10 px-3 py-1 text-sm font-bold text-[#282B5D] dark:bg-[#BCA2FF]/15 dark:text-[#BCA2FF]">
                        {item.score}
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.score}%` }}
                        transition={{ delay: index * 0.05, duration: 0.45 }}
                        className="h-full rounded-full bg-[#282B5D] dark:bg-[#BCA2FF]"
                      />
                    </div>
                    <p className="mt-2 text-xs font-semibold text-black/45 dark:text-white/45">{item.signal}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <Panel eyebrow="Top builders" title="Builder reputation table" icon={<Medal className="h-5 w-5" />}>
            <div className="overflow-hidden rounded-md border border-black/10 bg-white dark:border-white/10 dark:bg-white/[0.04]">
              <div className="hidden grid-cols-[80px_1.4fr_repeat(5,1fr)] gap-4 border-b border-black/10 px-5 py-4 text-xs font-bold uppercase text-black/45 dark:border-white/10 dark:text-white/45 lg:grid">
                <span>Rank</span>
                <span>Builder</span>
                <span>Bounties won</span>
                <span>GEN earned</span>
                <span>Consensus score</span>
                <span>Appeals</span>
                <span>Badge</span>
              </div>

              <div className="divide-y divide-black/10 dark:divide-white/10">
                {topBuilders.map((row, index) => (
                  <motion.div
                    key={row.builder}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="grid gap-4 px-5 py-5 lg:grid-cols-[80px_1.4fr_repeat(5,1fr)] lg:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#282B5D] text-sm font-bold text-white dark:bg-[#BCA2FF] dark:text-black">
                        {index + 1}
                      </span>
                      {index < 3 ? <Medal className="h-5 w-5 text-[#BCA2FF] lg:hidden" /> : null}
                    </div>
                    <div>
                      <p className="font-bold text-black dark:text-white">{row.builder}</p>
                      <p className="mt-1 text-sm text-black/45 dark:text-white/45 lg:hidden">
                        {row.bountiesWon} wins, {row.genEarned} GEN earned
                      </p>
                    </div>
                    <Metric label="Bounties won" value={String(row.bountiesWon)} />
                    <Metric label="GEN earned" value={`${row.genEarned} GEN`} />
                    <Metric label="Consensus score" value={String(row.consensusScore)} />
                    <Metric label="Appeals" value={row.appeals} />
                    <div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#282B5D]/10 px-3 py-1 text-xs font-bold text-[#282B5D] dark:bg-[#BCA2FF]/15 dark:text-[#BCA2FF]">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {row.badge}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel eyebrow="Most funded projects" title="Funding momentum" icon={<Banknote className="h-5 w-5" />}>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {fundedProjects.map((project, index) => (
                <motion.article
                  key={project.project}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-md border border-black/10 bg-[#f7f7f8] p-4 dark:border-white/10 dark:bg-black/30"
                >
                  <p className="text-xs font-bold uppercase text-black/45 dark:text-white/45">#{index + 1}</p>
                  <h3 className="mt-3 min-h-[48px] text-lg font-bold leading-6">{project.project}</h3>
                  <p className="mt-2 text-sm text-black/55 dark:text-white/55">{project.builder}</p>
                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase text-black/40 dark:text-white/40">Funded</p>
                      <p className="mt-1 text-xl font-bold">{project.funded}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#282B5D] dark:bg-white/10 dark:text-[#BCA2FF]">
                      {project.backers} backers
                    </span>
                  </div>
                </motion.article>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="mb-3 text-[#282B5D] dark:text-[#BCA2FF]">{icon}</div>
      <p className="text-sm font-semibold text-black/45 dark:text-white/45">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function Panel({
  eyebrow,
  title,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="mb-5 flex items-center gap-3">
        <span className="text-[#282B5D] dark:text-[#BCA2FF]">{icon}</span>
        <div>
          <p className="text-xs font-bold uppercase text-[#282B5D] dark:text-[#BCA2FF]">{eyebrow}</p>
          <h2 className="mt-1 text-2xl font-bold">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-black/40 dark:text-white/40 lg:hidden">{label}</p>
      <p className="mt-1 font-semibold text-black/70 dark:text-white/70 lg:mt-0">{value}</p>
    </div>
  );
}
