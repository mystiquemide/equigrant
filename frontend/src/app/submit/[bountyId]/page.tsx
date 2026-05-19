"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LegacySubmitRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const bountyId = params?.bountyId as string;

  useEffect(() => {
    if (bountyId) {
      router.replace(`/bounties/${bountyId}/submit`);
    }
  }, [bountyId, router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold text-black/55 dark:text-white/55">
        Redirecting to the bounty submission page...
      </p>
    </div>
  );
}
