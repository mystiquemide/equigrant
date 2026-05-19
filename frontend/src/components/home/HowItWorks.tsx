"use client";

import { motion } from "framer-motion";
import { Bot, FileText, Upload } from "lucide-react";

import { useLanguage } from "@/components/LanguageProvider";

const steps = [
  {
    icon: FileText,
    title: "Post Grant",
    description: "Grant creators define evaluation criteria in natural language and fund bounty with GEN.",
  },
  {
    icon: Upload,
    title: "Submit Your Work",
    description: "Builders stake GEN and submit GitHub repos, demo URLs, and project descriptions.",
  },
  {
    icon: Bot,
    title: "Get Funded by AI",
    description: "AI validators evaluate submissions through multi-model consensus and auto-distribute payouts.",
  },
];

export function HowItWorks() {
  const { t } = useLanguage();
  const translatedSteps = [
    { ...steps[0], title: t.postGrant, description: t.postGrantBody },
    { ...steps[1], title: t.submitWork, description: t.submitWorkBody },
    { ...steps[2], title: t.getFunded, description: t.getFundedBody },
  ];

  return (
    <section id="how-it-works" className="border-b border-black/10 bg-[#f7f7f8] px-4 py-20 dark:border-white/10 dark:bg-[#060608] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-bold uppercase text-[#282B5D] dark:text-[#BCA2FF]">{t.howItWorks}</p>
          <h2 className="text-3xl font-bold tracking-normal text-black dark:text-white sm:text-4xl">{t.howHeadline}</h2>
        </div>

        <div className="relative overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-3%", "0%"] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="grid gap-4 md:grid-cols-3"
          >
            {translatedSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                whileHover={{ y: -8 }}
                transition={{ delay: index * 0.1, duration: 0.45 }}
                className="rounded-md border border-black/10 bg-white p-6 shadow-sm transition hover:border-[#282B5D]/40 hover:shadow-2xl hover:shadow-[#282B5D]/10 dark:border-white/10 dark:bg-white/5 dark:hover:border-[#BCA2FF]/50"
              >
                <div className="mb-8 flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-md bg-[#282B5D] text-white dark:bg-[#BCA2FF] dark:text-black">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-sm font-bold text-black/30 dark:text-white/30">0{index + 1}</span>
                </div>
                <h3 className="text-2xl font-bold text-black dark:text-white">{step.title}</h3>
                <p className="mt-4 text-base leading-7 text-black/60 dark:text-white/60">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
