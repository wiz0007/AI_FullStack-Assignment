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
import { Pagination } from "@/components/discovery/pagination";
import { CANONICAL_MODEL_TYPES } from "@/server/validators/model.validator";

interface BenchmarkVersionMeta {
  id: string;
  version: string;
  scoreUnit: string | null;
  scoreDirection: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER";
  description: string | null;
}

interface BenchmarkMeta {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  defaultUnit: string | null;
  scoreDirection: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER";
  versions: BenchmarkVersionMeta[];
}

function RankingsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [benchmarks, setBenchmarks] = useState<BenchmarkMeta[]>([]);
  const [selectedBenchmarkSlug, setSelectedBenchmarkSlug] = useState<string>("");
  const [selectedVersion, setSelectedVersion] = useState<string>(
    searchParams.get("benchmarkVersion") || ""
  );
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedModelType, setSelectedModelType] = useState<string>(
    searchParams.get("modelType") || searchParams.get("category") || "all"
  );
  const [page, setPage] = useState<number>(parseInt(searchParams.get("page") || "1", 10) || 1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
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
          const paramVersion = searchParams.get("benchmarkVersion");

          if (paramSlug && list.some((b) => b.slug === paramSlug)) {
            setSelectedBenchmarkSlug(paramSlug);
            const matched = list.find((b) => b.slug === paramSlug);
            if (paramVersion && matched?.versions.some((v) => v.version === paramVersion)) {
              setSelectedVersion(paramVersion);
            } else if (matched?.versions[0]) {
              setSelectedVersion(matched.versions[0].version);
            }
          } else if (list.length > 0) {
            setSelectedBenchmarkSlug(list[0].slug);
            if (list[0].versions && list[0].versions[0]) {
              setSelectedVersion(list[0].versions[0].version);
            }
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

  // 2. Fetch rankings when selected benchmark, version, model type or page changes
  const fetchRankings = useCallback(
    async (slug: string, version: string, modelType: string, p: number) => {
      if (!slug) return;
      setIsLoadingRankings(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("benchmark", slug);
        if (version) {
          params.set("benchmarkVersion", version);
        }
        params.set("page", p.toString());
        params.set("limit", "20");
        if (modelType && modelType !== "all") {
          params.set("category", modelType);
        }

        const res = await fetch(`/api/rankings?${params.toString()}`);
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error?.message || "Failed to load leaderboard rankings");
        }
        const json = await res.json();
        if (json.success && json.data) {
          setRankings(json.data.rankings || []);
          if (json.data.pagination) {
            setPagination(json.data.pagination);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load leaderboard rankings");
      } finally {
        setIsLoadingRankings(false);
      }
    },
    []
  );

  useEffect(() => {
    if (selectedBenchmarkSlug) {
      fetchRankings(selectedBenchmarkSlug, selectedVersion, selectedModelType, page);
      // Synchronize URL
      const params = new URLSearchParams();
      params.set("benchmark", selectedBenchmarkSlug);
      if (selectedVersion) {
        params.set("benchmarkVersion", selectedVersion);
      }
      if (selectedModelType && selectedModelType !== "all") {
        params.set("modelType", selectedModelType);
      }
      if (page > 1) {
        params.set("page", page.toString());
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [
    selectedBenchmarkSlug,
    selectedVersion,
    selectedModelType,
    page,
    fetchRankings,
    pathname,
    router,
  ]);

  // Benchmark Domains list
  const domains = ["all", ...Array.from(new Set(benchmarks.map((b) => b.category)))];

  const filteredBenchmarks = benchmarks.filter((b) => {
    if (selectedDomain === "all") return true;
    return b.category.toLowerCase() === selectedDomain.toLowerCase();
  });

  const currentBenchmark = benchmarks.find((b) => b.slug === selectedBenchmarkSlug);
  const modelTypes = ["all", ...CANONICAL_MODEL_TYPES];

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

      {/* Benchmark Selector & Filters */}
      <div className="space-y-4">
        {/* Domain and Model Type Filter Rows */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface)]">
          {/* Benchmark Domain Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[var(--secondary-text)] mr-1 shrink-0">
              Benchmark Domain:
            </span>
            {domains.map((dom) => (
              <button
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors whitespace-nowrap shrink-0 ${
                  selectedDomain === dom
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "bg-[var(--secondary-surface)] text-[var(--secondary-text)] border border-[var(--border-color)] hover:text-[var(--primary-text)]"
                }`}
              >
                {dom}
              </button>
            ))}
          </div>

          {/* Model Category / Type Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[var(--secondary-text)] mr-1 shrink-0">
              Model Category:
            </span>
            {modelTypes.map((mt) => (
              <button
                key={mt}
                onClick={() => setSelectedModelType(mt)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors whitespace-nowrap shrink-0 ${
                  selectedModelType === mt
                    ? "bg-[var(--primary-text)] text-[var(--surface)] shadow-sm"
                    : "bg-[var(--secondary-surface)] text-[var(--secondary-text)] border border-[var(--border-color)] hover:text-[var(--primary-text)]"
                }`}
              >
                {mt === "all" ? "All Types" : mt}
              </button>
            ))}
          </div>
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
                  onClick={() => {
                    setSelectedBenchmarkSlug(b.slug);
                    if (b.versions && b.versions[0]) {
                      setSelectedVersion(b.versions[0].version);
                    } else {
                      setSelectedVersion("");
                    }
                    setPage(1);
                  }}
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

      {/* Benchmark Info Card & Protocol Selector */}
      {currentBenchmark && (
        <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
              Evaluating {pagination.total} distinct models
            </div>
          </div>

          {/* S4-02: Protocol / Version Selector */}
          {currentBenchmark.versions && currentBenchmark.versions.length > 0 && (
            <div className="pt-3 border-t border-[var(--border-color)] flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[var(--secondary-text)] mr-1 shrink-0">
                Evaluation Protocol / Version:
              </span>
              {currentBenchmark.versions.map((v) => {
                const isSelected = selectedVersion === v.version;
                return (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVersion(v.version);
                      setPage(1);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border whitespace-nowrap shrink-0 ${
                      isSelected
                        ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                        : "bg-[var(--secondary-surface)] text-[var(--secondary-text)] border-[var(--border-color)] hover:text-[var(--primary-text)]"
                    }`}
                  >
                    {v.version}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Content */}
      {error ? (
        <ErrorState
          title="Failed to Load Rankings"
          message={error}
          retry={() =>
            selectedBenchmarkSlug &&
            fetchRankings(selectedBenchmarkSlug, selectedVersion, selectedModelType, page)
          }
        />
      ) : isLoadingRankings ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ) : (
        <div className="space-y-6">
          <LeaderboardTable
            rankings={rankings}
            scoreDirection={currentBenchmark?.scoreDirection || "HIGHER_IS_BETTER"}
            benchmarkName={currentBenchmark?.name || "Benchmark"}
            benchmarkUnit={currentBenchmark?.defaultUnit}
          />

          {/* S4-03: Rankings Pagination */}
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
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
