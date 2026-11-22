"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Trophy, Award, Filter, RefreshCw } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { LeaderboardTable, RankingItem } from "@/components/rankings/leaderboard-table";

interface BenchmarkMeta {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  defaultUnit: string | null;
  scoreDirection: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER";
}

function RankingsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [benchmarks, setBenchmarks] = useState<BenchmarkMeta[]>([]);
  const [selectedBenchmarkSlug, setSelectedBenchmarkSlug] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [isLoadingBenchmarks, setIsLoadingBenchmarks] = useState<boolean>(true);
  const [isLoadingRankings, setIsLoadingRankings] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch available benchmarks
  useEffect(() => {
    async function loadBenchmarks() {
      setIsLoadingBenchmarks(true);
      setError(null);
      try {
        const res = await fetch("/api/benchmarks");
        if (!res.ok) throw new Error("Failed to load benchmarks catalog");
        const json = await res.json();
        if (json.success && json.data) {
          const list: BenchmarkMeta[] = json.data;
          setBenchmarks(list);

          const paramSlug = searchParams.get("benchmark") || searchParams.get("slug");
          if (paramSlug && list.some((b) => b.slug === paramSlug)) {
            setSelectedBenchmarkSlug(paramSlug);
          } else if (list.length > 0) {
            setSelectedBenchmarkSlug(list[0].slug);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load benchmarks");
      } finally {
        setIsLoadingBenchmarks(false);
      }
    }

    loadBenchmarks();
  }, [searchParams]);

  // 2. Fetch rankings when selected benchmark changes
  const fetchRankings = useCallback(async (slug: string) => {
    if (!slug) return;
    setIsLoadingRankings(true);
    setError(null);
    try {
      const res = await fetch(`/api/rankings?benchmark=${encodeURIComponent(slug)}&limit=50`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || "Failed to load leaderboard rankings");
      }
      const json = await res.json();
      if (json.success && json.data) {
        setRankings(json.data.rankings || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load leaderboard rankings");
    } finally {
      setIsLoadingRankings(false);
    }
  }, []);

  useEffect(() => {
    if (selectedBenchmarkSlug) {
      fetchRankings(selectedBenchmarkSlug);
      // Synchronize URL
      const params = new URLSearchParams(searchParams.toString());
      params.set("benchmark", selectedBenchmarkSlug);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [selectedBenchmarkSlug, fetchRankings, pathname, router, searchParams]);

  // Categories list
  const categories = ["all", ...Array.from(new Set(benchmarks.map((b) => b.category)))];

  const filteredBenchmarks = benchmarks.filter((b) => {
    if (selectedCategory === "all") return true;
    return b.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const currentBenchmark = benchmarks.find((b) => b.slug === selectedBenchmarkSlug);

  return (
    <Container className="py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--border-color)]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" />
            Standardized Leaderboards
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--primary-text)] mt-1">
            Rankings & Benchmark Leaderboards
          </h1>
          <p className="text-sm text-[var(--secondary-text)] mt-1 max-w-2xl">
            Evaluate and compare foundation model intelligence across academic benchmarks, reasoning
            datasets, and standardized coding tasks.
          </p>
        </div>
      </div>

      {/* Benchmark Selector & Category Filter */}
      <div className="space-y-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--secondary-text)] mr-1">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                selectedCategory === cat
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "bg-[var(--surface)] text-[var(--secondary-text)] border border-[var(--border-color)] hover:text-[var(--primary-text)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Benchmark Chips */}
        {isLoadingBenchmarks ? (
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filteredBenchmarks.map((b) => {
              const isSelected = b.slug === selectedBenchmarkSlug;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBenchmarkSlug(b.slug)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? "bg-[var(--secondary-surface)] border-[var(--accent)] text-[var(--accent)] shadow-sm ring-1 ring-[var(--accent)]"
                      : "bg-[var(--surface)] border-[var(--border-color)] text-[var(--primary-text)] hover:border-[var(--accent)]/50"
                  }`}
                >
                  {b.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Benchmark Info Card */}
      {currentBenchmark && (
        <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[var(--primary-text)]">
                {currentBenchmark.name} Leaderboard
              </h2>
              <Badge variant="outline" className="capitalize text-[10px]">
                {currentBenchmark.category}
              </Badge>
              <Badge variant="accent" className="text-[10px]">
                {currentBenchmark.scoreDirection === "HIGHER_IS_BETTER"
                  ? "Higher Score is Better"
                  : "Lower Score is Better"}
              </Badge>
            </div>
            <p className="text-xs text-[var(--secondary-text)]">
              {currentBenchmark.description ||
                "Standardized evaluation dataset measuring AI capabilities."}
            </p>
          </div>
          <div className="text-xs font-mono text-[var(--secondary-text)] shrink-0">
            Evaluating {rankings.length} models
          </div>
        </div>
      )}

      {/* Leaderboard Content */}
      {error ? (
        <ErrorState
          title="Failed to Load Rankings"
          message={error}
          retry={() => selectedBenchmarkSlug && fetchRankings(selectedBenchmarkSlug)}
        />
      ) : isLoadingRankings ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ) : (
        <LeaderboardTable
          rankings={rankings}
          scoreDirection={currentBenchmark?.scoreDirection || "HIGHER_IS_BETTER"}
          benchmarkName={currentBenchmark?.name || "Benchmark"}
          benchmarkUnit={currentBenchmark?.defaultUnit}
        />
      )}
    </Container>
  );
}

export default function RankingsPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-12 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </Container>
      }
    >
      <RankingsContent />
    </Suspense>
  );
}
