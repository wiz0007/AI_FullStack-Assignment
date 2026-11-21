"use client";

import React, { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Scale,
  ArrowLeft,
  Share2,
  Trash2,
  Plus,
  AlertTriangle,
  Check,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ComparisonTable } from "@/components/comparison/comparison-table";
import { useComparison } from "@/features/comparison/comparison-context";

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedModelIds, removeModel, clearComparison, addModel, maxLimit } = useComparison();

  const [modelsData, setModelsData] = useState<any[]>([]);
  const [missingIds, setMissingIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Read URL query parameters
  const queryParam = searchParams.get("models") || searchParams.get("ids") || "";

  // Initialize from URL or Context
  useEffect(() => {
    if (!queryParam) return;
    const queryIds = queryParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (queryIds.length > 0) {
      queryIds.slice(0, maxLimit).forEach((id) => {
        addModel(id);
      });
    }
  }, [queryParam, maxLimit, addModel]);

  // Active key for comparison IDs
  const activeKey = selectedModelIds.length > 0 ? selectedModelIds.join(",") : queryParam;
  const activeIds = activeKey
    ? activeKey
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // Sync current active IDs to URL search param
  useEffect(() => {
    if (selectedModelIds.length > 0) {
      const newUrl = `/compare?models=${selectedModelIds.join(",")}`;
      window.history.replaceState(null, "", newUrl);
    } else if (!queryParam) {
      window.history.replaceState(null, "", "/compare");
    }
  }, [selectedModelIds, queryParam]);

  // Fetch model comparison data whenever activeKey changes
  const fetchComparisonData = useCallback(async () => {
    const ids = activeKey
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, maxLimit);

    if (ids.length === 0) {
      setModelsData([]);
      setMissingIds([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/models/compare?ids=${encodeURIComponent(ids.join(","))}`);
      if (!res.ok) {
        throw new Error(`Failed to load comparison data: HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success && data.data) {
        setModelsData(data.data.models || []);
        setMissingIds(data.data.missingIds || []);
      } else {
        throw new Error(data.error?.message || "Failed to parse comparison data");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while loading comparison data.");
    } finally {
      setIsLoading(false);
    }
  }, [activeKey, maxLimit]);

  useEffect(() => {
    fetchComparisonData();
  }, [fetchComparisonData]);

  const handleRemove = (slugOrId: string) => {
    removeModel(slugOrId);
    setModelsData((prev) => prev.filter((m) => m.slug !== slugOrId && m.id !== slugOrId));
  };

  const handleClearAll = () => {
    clearComparison();
    setModelsData([]);
    setMissingIds([]);
    router.replace("/compare");
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <Container className="py-10 space-y-8">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/models">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-[var(--secondary-text)]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Model Catalogue
          </Button>
        </Link>

        {activeIds.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-1.5 text-xs"
              aria-label="Share comparison link"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Comparison</span>
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="gap-1.5 text-xs text-[var(--secondary-text)] hover:text-red-500"
              aria-label="Clear all models from comparison"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </Button>
          </div>
        )}
      </div>

      {/* Header Section */}
      <div className="space-y-2 pb-6 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <Badge variant="accent">Sprint 3 • Intelligence</Badge>
          <span className="text-xs text-[var(--secondary-text)]">
            Compare up to {maxLimit} frontier AI models
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--primary-text)]">
          Side-by-Side Model Comparison
        </h1>
        <p className="text-sm text-[var(--secondary-text)] max-w-2xl leading-relaxed">
          Evaluate architectures, context capacities, inference pricing, and benchmark scores across
          selected frontier LLMs with real-time difference detection.
        </p>
      </div>

      {/* Missing IDs Warning Banner */}
      {missingIds.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Some requested models could not be found:</p>
            <p className="font-mono">{missingIds.join(", ")}</p>
            <p className="text-[11px] opacity-80">
              These models may have been removed or the identifiers in the URL are invalid.
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-6 border-red-500/30 bg-red-500/5 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
          <CardTitle className="text-base text-red-600 dark:text-red-400">
            Error Loading Comparison
          </CardTitle>
          <CardDescription className="text-xs">{error}</CardDescription>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchComparisonData}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Comparison
          </Button>
        </Card>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-[var(--secondary-surface)] rounded-xl w-48" />
          <div className="h-96 bg-[var(--secondary-surface)] rounded-2xl border border-[var(--border-color)]" />
        </div>
      )}

      {/* Empty State when no models are selected */}
      {!isLoading && !error && modelsData.length === 0 && (
        <Card className="p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto border-[var(--border-color)] bg-[var(--surface)] shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
            <Scale className="w-8 h-8" />
          </div>
          <CardTitle className="text-xl font-bold text-[var(--primary-text)]">
            No Models Selected for Comparison
          </CardTitle>
          <CardDescription className="text-sm text-[var(--secondary-text)] leading-relaxed">
            Select up to {maxLimit} models from the catalogue to compare latency, context windows,
            input/output pricing, supported modalities, and benchmark scores side-by-side.
          </CardDescription>
          <div className="pt-2">
            <Link href="/models">
              <Button variant="primary" size="md" className="gap-2">
                <Plus className="w-4 h-4" />
                Browse Model Catalogue
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Notice when only 1 model is selected */}
      {!isLoading && !error && modelsData.length === 1 && (
        <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-blue-500" />
            <span>
              You have selected <strong>1 model</strong>. Add at least 1 more model from the
              catalogue to enable side-by-side evaluation and difference highlighting.
            </span>
          </div>
          <Link href="/models">
            <Button variant="outline" size="sm" className="h-7 text-[11px] whitespace-nowrap">
              + Add Model
            </Button>
          </Link>
        </div>
      )}

      {/* Comparison Matrix Table */}
      {!isLoading && !error && modelsData.length > 0 && (
        <ComparisonTable models={modelsData} onRemoveModel={handleRemove} maxLimit={maxLimit} />
      )}
    </Container>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <Container className="py-12 space-y-4 animate-pulse">
          <div className="h-10 bg-[var(--secondary-surface)] rounded-xl w-48" />
          <div className="h-96 bg-[var(--secondary-surface)] rounded-2xl border border-[var(--border-color)]" />
        </Container>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
