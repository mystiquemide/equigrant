"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bell,
  BrainCircuit,
  CalendarDays,
  Check,
  Coins,
  FileCheck2,
  Globe2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { WalletConnect } from "@/components/WalletConnect";
import { TransactionModal } from "@/components/TransactionModal";
import { useContract } from "@/hooks/useContract";
import { useWallet } from "@/hooks/useWallet";
import type { TransactionStatus } from "@/types";

type WizardStep = {
  label: string;
  title: string;
  description: string;
};

type RequirementGroup = {
  title: string;
  items: string[];
};

type FormErrors = Partial<Record<"title" | "criteria" | "rewardPool" | "deadline" | "minStake", string>>;

const steps: WizardStep[] = [
  {
    label: "Bounty",
    title: "Describe the challenge",
    description: "Tell builders what you want funded in plain language. GenLayer validators will use this to judge submissions.",
  },
  {
    label: "Funding",
    title: "Set reward and deadline",
    description: "Choose the bounty amount, submission deadline, and stake requirement builders must commit.",
  },
  {
    label: "Rubric",
    title: "Preview the AI judging rubric",
    description: "Review what validators will check before the bounty goes live.",
  },
  {
    label: "Confirm",
    title: "Review and create",
    description: "Confirm the bounty details before creating it on StudioNet.",
  },
];

const requirementGroups: RequirementGroup[] = [
  {
    title: "Application intake",
    items: [
      "Customizable online application forms",
      "LOI submissions",
      "File uploads",
      "Applicant tracking",
      "Self-service grantee portal",
      "Status tracking",
      "Mobile responsive access",
      "User-friendly UI",
    ],
  },
  {
    title: "Review and decisions",
    items: [
      "Reviewer portals",
      "Scoring rubrics",
      "Automated scoring",
      "Committee collaboration tools",
      "Approval workflows",
      "Full audit trails",
      "AI summaries",
      "Data verification",
    ],
  },
  {
    title: "Communications",
    items: [
      "Real-time notifications",
      "Report uploads",
      "Communications center",
      "Personalized notifications",
      "Automated reminders",
      "Communication history",
      "Email integrations",
      "Documentation center",
    ],
  },
  {
    title: "Finance and reporting",
    items: [
      "Financial tracking",
      "Outcome dashboards",
      "Expenditure reports",
      "Exportable reports",
      "Impact forecasting",
      "Multi-currency support",
      "Multi-language support",
      "ESG dashboards",
      "KPI dashboards",
      "ROI planning",
      "Cost planning",
    ],
  },
  {
    title: "Compliance and security",
    items: [
      "Sanctions screening",
      "Role-based access control",
      "Data encryption",
      "GDPR / CCPA compliance",
      "Multi-jurisdiction support",
      "Security standards",
      "Accessibility standards",
      "Security audits",
      "Governance policy management",
    ],
  },
  {
    title: "Organization and integrations",
    items: [
      "CRM database",
      "Relationship tracking",
      "Accounting integrations",
      "ERP integrations",
      "CRM integrations",
      "HR integrations",
      "Centralized system",
      "Cloud architecture",
      "Backups",
    ],
  },
  {
    title: "Automation and rollout",
    items: [
      "Real-time updates",
      "Full lifecycle workflow automation",
      "Needs assessment tools",
      "Build vs buy advisory flow",
      "Scalability planning",
      "Testing rollout flow",
      "Data migration",
      "Pilot testing",
      "User training",
      "Workflow automation engine",
      "Impact tracking",
      "Update/change management",
    ],
  },
];

const allRequirements = requirementGroups.flatMap((group) => group.items);

const reviewOptions = [
  "AI validator automated scoring",
  "Committee collaboration workspace",
  "Reviewer portal with rubric scoring",
  "Approval workflow before payouts",
  "Plagiarism and originality checks",
  "Audit trail for every decision",
];

const rubricPreview = [
  {
    label: "Criteria fit",
    detail: "Does the submission clearly solve the challenge described by the creator?",
    weight: "30%",
  },
  {
    label: "Proof of work",
    detail: "Are the GitHub repo, demo, and project notes complete enough to verify?",
    weight: "25%",
  },
  {
    label: "Impact potential",
    detail: "Would this be useful for a grant program, hackathon sponsor, DAO, or foundation?",
    weight: "20%",
  },
  {
    label: "Execution quality",
    detail: "Is the product polished, usable, documented, and realistic to maintain?",
    weight: "15%",
  },
  {
    label: "Originality and risk",
    detail: "Is the work original, secure enough for the bounty scope, and free of obvious plagiarism?",
    weight: "10%",
  },
];

const exampleGrant = {
  title: "Impact dashboard for DAO grants",
  audience: "Foundations, NGOs, DAOs, enterprise grant teams",
  reward: "5,000 GEN",
  stake: "100 GEN",
  criteria:
    "A strong submission includes a live dashboard, GitHub repository, demo URL, clear KPI tracking, and documentation for grant managers.",
};

function toWholeGEN(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return BigInt(0);
  return BigInt(Math.round(parsed));
}

function buildCriteria(input: {
  title: string;
  audience: string;
  criteria: string;
  loiPrompt: string;
  applicationPrompt: string;
  selectedReviews: string[];
  currency: string;
  language: string;
  jurisdiction: string;
}) {
  return [
    `Bounty title: ${input.title}`,
    `Target audience: ${input.audience}`,
    `Primary evaluation criteria: ${input.criteria}`,
    `LOI expectations: ${input.loiPrompt || "Applicants should provide a concise letter of intent before full review."}`,
    `Application form requirements: ${input.applicationPrompt || "Applicants must submit project overview, team background, budget plan, impact goals, repository links, demo links, and supporting files."}`,
    `Review workflow: ${input.selectedReviews.join(", ")}`,
    `Rubric preview: ${rubricPreview.map((item) => `${item.label} ${item.weight}: ${item.detail}`).join(" ")}`,
    `Operating context: currency ${input.currency}, language ${input.language}, jurisdiction ${input.jurisdiction}.`,
    `Internal grant-system capabilities to support behind the scenes: ${allRequirements.join("; ")}.`,
  ].join("\n\n");
}

export default function CreateGrantPage() {
  const router = useRouter();
  const { isConnected, isWrongNetwork, displayAddress, displayBalance, switchToGenLayer } = useWallet();
  const { createBounty } = useContract();

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("");
  const [criteria, setCriteria] = useState("");
  const [loiPrompt, setLoiPrompt] = useState("");
  const [applicationPrompt, setApplicationPrompt] = useState("");
  const [rewardPool, setRewardPool] = useState("");
  const [deadline, setDeadline] = useState("");
  const [minStake, setMinStake] = useState("");
  const [currency, setCurrency] = useState("GEN");
  const [language, setLanguage] = useState("English");
  const [jurisdiction, setJurisdiction] = useState("Global");
  const [selectedReviews, setSelectedReviews] = useState(reviewOptions);
  const [errors, setErrors] = useState<FormErrors>({});
  const [txStatus, setTxStatus] = useState<TransactionStatus>("idle");
  const [txHash, setTxHash] = useState<string>();
  const [txError, setTxError] = useState<string>();

  const generatedCriteria = useMemo(
    () =>
      buildCriteria({
        title,
        audience,
        criteria,
        loiPrompt,
        applicationPrompt,
        selectedReviews,
        currency,
        language,
        jurisdiction,
      }),
    [applicationPrompt, audience, criteria, currency, jurisdiction, language, loiPrompt, selectedReviews, title]
  );

  const validateStep = (targetStep = step) => {
    const nextErrors: FormErrors = {};

    if (targetStep === 0) {
      if (title.trim().length < 6) nextErrors.title = "Add a clear bounty title.";
      if (criteria.trim().length < 80) nextErrors.criteria = "Write at least 80 characters of evaluation criteria.";
    }

    if (targetStep === 1) {
      if (Number(rewardPool) <= 0) nextErrors.rewardPool = "Reward pool must be greater than 0.";
      if (Number(minStake) <= 0) nextErrors.minStake = "Minimum stake must be greater than 0.";
      if (!deadline || new Date(deadline) <= new Date()) nextErrors.deadline = "Choose a future deadline.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const toggleReviewOption = (option: string) => {
    setSelectedReviews((current) =>
      current.includes(option) ? current.filter((item) => item !== option) : [...current, option]
    );
  };

  const handleDeploy = async () => {
    if (!validateStep(0) || !validateStep(1)) return;
    if (!isConnected) {
      setTxStatus("failed");
      setTxError("Connect your wallet before creating this bounty.");
      return;
    }
    if (isWrongNetwork) {
      setTxStatus("failed");
      setTxError("Switch to the GenLayer network before creating this bounty.");
      return;
    }

    setTxStatus("signing");
    setTxError(undefined);

    try {
      const hash = await createBounty(
        generatedCriteria,
        toWholeGEN(rewardPool),
        new Date(deadline).toISOString(),
        toWholeGEN(minStake)
      );
      setTxHash(String(hash || ""));
      window.dispatchEvent(new Event("equigrant:creator-bounties-updated"));
      setTxStatus("pending");
      setTimeout(() => setTxStatus("confirmed"), 900);
    } catch (err) {
      console.error("Create bounty transaction failed", err);
      setTxStatus("failed");
      setTxError(err instanceof Error ? err.message : "Transaction failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <section className="border-b border-black/10 bg-[#f7f7f8] px-4 py-10 dark:border-white/10 dark:bg-[#060608] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <button
            onClick={() => router.push("/bounties")}
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-black/55 transition hover:text-[#282B5D] dark:text-white/55 dark:hover:text-[#BCA2FF]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to bounties
          </button>

          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="mb-3 text-sm font-bold uppercase text-[#282B5D] dark:text-[#BCA2FF]">
                Create Bounty
              </p>
              <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-black dark:text-white sm:text-5xl">
                Create a bounty builders can understand and validators can judge fairly.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-black/60 dark:text-white/60">
                Write the challenge in natural language, set the reward, preview the AI rubric, and create a StudioNet bounty when everything looks right.
              </p>
            </div>

            <aside className="rounded-md border border-black/10 bg-white p-5 shadow-xl shadow-black/5 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-4 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-[#282B5D] dark:text-[#BCA2FF]" />
                <h2 className="text-lg font-bold">Wallet readiness</h2>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-md bg-[#f7f7f8] p-3 dark:bg-black/30">
                  <span className="text-black/50 dark:text-white/50">Wallet</span>
                  <span className="font-bold">{isConnected ? displayAddress : "Disconnected"}</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-[#f7f7f8] p-3 dark:bg-black/30">
                  <span className="text-black/50 dark:text-white/50">Balance</span>
                  <span className="font-bold">{displayBalance}</span>
                </div>
              </div>
              <div className="mt-4">
                {!isConnected ? <WalletConnect redirectOnConnect={false} /> : null}
                {isConnected && isWrongNetwork ? (
                  <button
                    onClick={switchToGenLayer}
                    className="inline-flex h-10 w-full items-center justify-center rounded-md bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-500"
                  >
                    Switch Network
                  </button>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-md border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04] lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-2">
              {steps.map((item, index) => (
                <button
                  key={item.label}
                  onClick={() => {
                    if (index <= step || validateStep(step)) setStep(index);
                  }}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition ${
                    step === index
                      ? "bg-[#282B5D] text-white dark:bg-[#BCA2FF] dark:text-black"
                      : "text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      step === index ? "bg-white text-[#282B5D] dark:bg-black dark:text-[#BCA2FF]" : "bg-black/10 dark:bg-white/10"
                    }`}
                  >
                    {index < step ? <Check className="h-4 w-4" /> : index + 1}
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{item.label}</span>
                    <span className="block text-xs opacity-70">{item.title}</span>
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-md border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6"
          >
            <div className="mb-6">
              <p className="text-sm font-bold uppercase text-[#282B5D] dark:text-[#BCA2FF]">
                Step {step + 1} of {steps.length}
              </p>
              <h2 className="mt-2 text-3xl font-bold">{steps[step].title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-black/55 dark:text-white/55">
                {steps[step].description}
              </p>
            </div>

            {step === 0 && (
              <div className="space-y-5">
                <section className="rounded-md border border-[#282B5D]/20 bg-[#282B5D]/5 p-4 dark:border-[#BCA2FF]/20 dark:bg-[#BCA2FF]/10">
                  <div className="mb-3 flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-[#282B5D] dark:text-[#BCA2FF]" />
                    <h3 className="text-sm font-bold text-[#282B5D] dark:text-[#BCA2FF]">Example preview</h3>
                  </div>
                  <div className="grid gap-3 text-sm md:grid-cols-[1fr_auto_auto] md:items-center">
                    <div>
                      <p className="font-bold text-black dark:text-white">{exampleGrant.title}</p>
                      <p className="mt-1 leading-6 text-black/55 dark:text-white/55">{exampleGrant.criteria}</p>
                      <p className="mt-2 text-xs font-bold uppercase text-black/40 dark:text-white/40">{exampleGrant.audience}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#282B5D] dark:bg-black dark:text-[#BCA2FF]">
                      {exampleGrant.reward}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#282B5D] dark:bg-black dark:text-[#BCA2FF]">
                      Stake {exampleGrant.stake}
                    </span>
                  </div>
                </section>
                <Field label="Bounty title" error={errors.title}>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="create-input"
                    placeholder="Build an impact dashboard for DAO grants"
                  />
                </Field>
                <Field label="Target applicants">
                  <input
                    value={audience}
                    onChange={(event) => setAudience(event.target.value)}
                    className="create-input"
                    placeholder="Foundations, NGOs, DAOs, enterprise teams"
                  />
                </Field>
                <Field label="What should builders create?" error={errors.criteria}>
                  <textarea
                    value={criteria}
                    onChange={(event) => setCriteria(event.target.value)}
                    className="create-textarea min-h-[180px]"
                    placeholder="Describe the challenge, who it helps, what a strong submission includes, and what would make an entry stand out."
                  />
                  <p className="mt-2 text-xs font-semibold text-black/45 dark:text-white/45">
                    {criteria.length}/5000 characters
                  </p>
                </Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Applicant intro prompt">
                    <textarea
                      value={loiPrompt}
                      onChange={(event) => setLoiPrompt(event.target.value)}
                      className="create-textarea"
                      placeholder="Optional: Ask builders to summarize the problem, proposed approach, and intended outcome."
                    />
                  </Field>
                  <Field label="Submission guidance">
                    <textarea
                      value={applicationPrompt}
                      onChange={(event) => setApplicationPrompt(event.target.value)}
                      className="create-textarea"
                      placeholder="Optional: Ask builders for repository, demo, project notes, timeline, milestones, and supporting files."
                    />
                  </Field>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Reward pool" error={errors.rewardPool} icon={<Coins className="h-4 w-4" />}>
                  <input
                    type="number"
                    min="0"
                    value={rewardPool}
                    onChange={(event) => setRewardPool(event.target.value)}
                    className="create-input"
                  />
                </Field>
                <Field label="Minimum stake" error={errors.minStake} icon={<ShieldCheck className="h-4 w-4" />}>
                  <input
                    type="number"
                    min="0"
                    value={minStake}
                    onChange={(event) => setMinStake(event.target.value)}
                    className="create-input"
                  />
                </Field>
                <Field label="Submission deadline" error={errors.deadline} icon={<CalendarDays className="h-4 w-4" />}>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(event) => setDeadline(event.target.value)}
                    className="create-input"
                  />
                </Field>
                <Field label="Primary currency" icon={<Coins className="h-4 w-4" />}>
                  <select value={currency} onChange={(event) => setCurrency(event.target.value)} className="create-input">
                    {["GEN", "USDC", "USD", "EUR", "GBP", "NGN"].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Primary language" icon={<Globe2 className="h-4 w-4" />}>
                  <select value={language} onChange={(event) => setLanguage(event.target.value)} className="create-input">
                    {["English", "Spanish", "French", "Portuguese", "Arabic", "Hindi", "Chinese", "Japanese"].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Jurisdiction" icon={<Globe2 className="h-4 w-4" />}>
                  <select value={jurisdiction} onChange={(event) => setJurisdiction(event.target.value)} className="create-input">
                    {["Global", "United States", "European Union", "United Kingdom", "Nigeria", "Multi-jurisdiction"].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="rounded-md border border-blue-500/20 bg-blue-500/10 p-4 text-sm leading-6 text-blue-900 dark:text-blue-200">
                  <div className="mb-2 flex items-center gap-2 font-bold">
                    <BrainCircuit className="h-4 w-4" />
                    What validators will check
                  </div>
                  GenLayer validators compare each submission against your criteria, inspect the repository and demo, check originality, and score the work by consensus. Disputed results can be appealed.
                </div>

                <div className="grid gap-3">
                  {rubricPreview.map((item) => (
                    <div key={item.label} className="grid gap-3 rounded-md border border-black/10 p-4 dark:border-white/10 sm:grid-cols-[120px_1fr_auto] sm:items-center">
                      <p className="font-bold text-black dark:text-white">{item.label}</p>
                      <p className="text-sm leading-6 text-black/60 dark:text-white/60">{item.detail}</p>
                      <span className="rounded-full bg-[#282B5D]/10 px-3 py-1 text-xs font-bold text-[#282B5D] dark:bg-[#BCA2FF]/15 dark:text-[#BCA2FF]">
                        {item.weight}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {reviewOptions.map((option) => (
                    <ToggleCard
                      key={option}
                      checked={selectedReviews.includes(option)}
                      label={option}
                      onClick={() => toggleReviewOption(option)}
                    />
                  ))}
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <InfoCard icon={<BrainCircuit className="h-5 w-5" />} label="AI scoring" value="Consensus based" />
                  <InfoCard icon={<Users className="h-5 w-5" />} label="Reviewer portals" value="Included" />
                  <InfoCard icon={<Bell className="h-5 w-5" />} label="Notifications" value="Real time" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                {!isConnected && (
                  <div className="flex items-start gap-3 rounded-md border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>Connect your wallet before creating this bounty.</p>
                  </div>
                )}
                <div className="flex items-start gap-3 rounded-md border border-[#282B5D]/20 bg-[#282B5D]/10 p-4 text-sm leading-6 text-[#282B5D] dark:border-[#BCA2FF]/20 dark:bg-[#BCA2FF]/10 dark:text-[#BCA2FF]">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    StudioNet dev mode: this creates a testnet bounty for validation. Use small values while the full contract is still being finalized.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <InfoCard icon={<Coins className="h-5 w-5" />} label="Reward pool" value={`${rewardPool || "0"} ${currency}`} />
                  <InfoCard icon={<ShieldCheck className="h-5 w-5" />} label="Minimum stake" value={`${minStake || "0"} ${currency}`} />
                  <InfoCard icon={<CalendarDays className="h-5 w-5" />} label="Deadline" value={deadline || "Not set"} />
                </div>
                <section className="rounded-md border border-black/10 bg-[#f7f7f8] p-4 dark:border-white/10 dark:bg-black/30">
                  <div className="mb-3 flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-[#282B5D] dark:text-[#BCA2FF]" />
                    <h3 className="font-bold">Bounty preview</h3>
                  </div>
                  <div className="space-y-4 rounded-md bg-white p-4 text-sm leading-6 text-black/65 dark:bg-black dark:text-white/65">
                    <div>
                      <p className="text-xs font-bold uppercase text-black/40 dark:text-white/40">Title</p>
                      <p className="mt-1 font-bold text-black dark:text-white">{title}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-black/40 dark:text-white/40">Challenge</p>
                      <p className="mt-1">{criteria || "No challenge criteria added yet."}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-black/40 dark:text-white/40">Validator rubric</p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {rubricPreview.map((item) => (
                          <div key={item.label} className="rounded-md border border-black/10 p-3 dark:border-white/10">
                            <p className="font-bold text-black dark:text-white">{item.label}</p>
                            <p className="mt-1 text-xs">{item.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-black/10 pt-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => setStep((current) => Math.max(current - 1, 0))}
                disabled={step === 0}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-black/10 px-5 text-sm font-bold text-black transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              {step < steps.length - 1 ? (
                <button
                  onClick={goNext}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#282B5D] px-5 text-sm font-bold text-white shadow-xl shadow-[#282B5D]/15 transition hover:-translate-y-0.5 hover:bg-[#110FFF] dark:bg-white dark:text-black dark:hover:bg-[#BCA2FF]"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleDeploy}
                  disabled={!isConnected || isWrongNetwork || txStatus === "signing" || txStatus === "pending"}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#282B5D] px-5 text-sm font-bold text-white shadow-xl shadow-[#282B5D]/15 transition hover:-translate-y-0.5 hover:bg-[#110FFF] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-[#BCA2FF]"
                >
                  Create Bounty
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <TransactionModal
        isOpen={txStatus !== "idle"}
        status={txStatus}
        txHash={txHash}
        errorMessage={txError}
        onClose={() => {
          if (txStatus === "confirmed") router.push("/bounties");
          setTxStatus("idle");
        }}
        onRetry={txStatus === "failed" ? handleDeploy : undefined}
      />
    </div>
  );
}

function Field({
  label,
  error,
  icon,
  children,
}: {
  label: string;
  error?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-bold text-black/70 dark:text-white/70">
        {icon}
        {label}
      </span>
      {children}
      {error ? <span className="mt-2 block text-xs font-semibold text-red-500">{error}</span> : null}
    </label>
  );
}

function ToggleCard({ checked, label, onClick }: { checked: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[88px] items-start gap-3 rounded-md border p-4 text-left transition ${
        checked
          ? "border-[#282B5D] bg-[#282B5D]/10 text-[#282B5D] dark:border-[#BCA2FF] dark:bg-[#BCA2FF]/10 dark:text-[#BCA2FF]"
          : "border-black/10 text-black/60 hover:bg-black/5 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/10"
      }`}
    >
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${checked ? "border-current bg-current" : "border-current"}`}>
        {checked ? <Check className="h-3.5 w-3.5 text-white dark:text-black" /> : null}
      </span>
      <span className="text-sm font-bold leading-6">{label}</span>
    </button>
  );
}

function InfoCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-black/10 bg-[#f7f7f8] p-4 dark:border-white/10 dark:bg-black/30">
      <div className="mb-3 text-[#282B5D] dark:text-[#BCA2FF]">{icon}</div>
      <p className="text-xs font-bold uppercase text-black/45 dark:text-white/45">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}
