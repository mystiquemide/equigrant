"use client";

import { useState, useEffect, useCallback } from "react";
import { readContract } from "@/lib/genlayer";
import type { EvaluationData } from "@/types";

function getEvaluationErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");

  if (
    message.includes("No evaluation found") ||
    message.includes("Missing or invalid parameters") ||
    message.includes("execution failed")
  ) {
    return "Evaluation has not been generated for this submission yet.";
  }

  if (message.includes("fetch failed") || message.includes("network")) {
    return "Could not reach GenLayer right now. Please try again in a moment.";
  }

  return "Evaluation not available yet.";
}

export function useEvaluation(bountyId: string | undefined, submissionId: string | undefined) {
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvaluation = useCallback(async () => {
    if (!bountyId || !submissionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await readContract("get_evaluation", [bountyId, submissionId]);
      setEvaluation(data as unknown as EvaluationData);
    } catch (err: any) {
      setError(getEvaluationErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [bountyId, submissionId]);

  useEffect(() => {
    fetchEvaluation();
    const interval = setInterval(fetchEvaluation, 10000);
    return () => clearInterval(interval);
  }, [fetchEvaluation]);

  return { evaluation, isLoading, error, refetch: fetchEvaluation };
}
