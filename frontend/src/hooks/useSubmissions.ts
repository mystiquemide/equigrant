"use client";

import { useState, useEffect, useCallback } from "react";
import { readContract } from "@/lib/genlayer";
import type { SubmissionData } from "@/types";

export function useSubmissions(bountyId: string | undefined) {
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    if (!bountyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await readContract("get_submissions", [bountyId]);
      setSubmissions((Array.isArray(data) ? data : []) as unknown as SubmissionData[]);
    } catch (err: any) {
      console.error("Failed to fetch submissions:", err);
      setError(err?.message || "Failed to load submissions");
    } finally {
      setIsLoading(false);
    }
  }, [bountyId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return { submissions, isLoading, error, refetch: fetchSubmissions };
}
