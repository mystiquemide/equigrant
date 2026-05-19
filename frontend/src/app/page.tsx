"use client";

import { Hero } from "@/components/home/Hero";
import { JudgingLayerPreview } from "@/components/home/JudgingLayerPreview";
import { BountyTeaser } from "@/components/home/BountyTeaser";
import { HowItWorks } from "@/components/home/HowItWorks";
import { LeaderboardTeaser } from "@/components/home/LeaderboardTeaser";
import { Testimonials } from "@/components/home/Testimonials";
import { CTASection } from "@/components/home/CTASection";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-white text-black dark:bg-black dark:text-white">
      <Hero />
      <JudgingLayerPreview />
      <BountyTeaser />
      <LeaderboardTeaser />
      <HowItWorks />
      <Testimonials />
      <CTASection />
    </div>
  );
}
