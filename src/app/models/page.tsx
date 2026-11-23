"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Filter, RotateCcw } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ModelCard } from "@/components/discovery/model-card";
import {
  ModelFilterSidebar,
  FilterMetadata,
  FilterState,
} from "@/components/discovery/model-filter-sidebar";
import { ActiveFilters } from "@/components/discovery/active-filters";
import { SortSelect } from "@/components/discovery/sort-select";
import { Pagination } from "@/components/discovery/pagination";
import { ModelSortOption } from "@/server/validators/model.validator";

export default function ModelsDiscoveryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Initial State from URL
  const initialQ = searchParams.get("q") || searchParams.get("search") || "";
  const initialSort = (searchParams.get("sort") as ModelSortOption) || "relevance";
  const initialPage = parseInt(searchParams.get("page") || "1", 10) || 1;

  const parseArrayParam = (key: string): string[] => {
    const val = searchParams.get(key);
    if (!val) return [];
    return val
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  };

  const parseNumParam = (key: string): number | undefined => {
    const val = searchParams.get(key);
    if (!val) return undefined;
    const n = parseFloat(val);
    return isNaN(n) || n < 0 ? undefined : n;
  };

  const initialFilters: FilterState = {
    provider: parseArrayParam("provider"),
    category: parseArrayParam("category"),
    capability: parseArrayParam("capability"),
    company: parseArrayParam("company"),
    minPrice: parseNumParam("minPrice"),
    maxPrice: parseNumParam("maxPrice"),
  };

  // State
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [sort, setSort] = useState<ModelSortOption>(initialSort);
  const [page, setPage] = useState<number>(initialPage);

  const [models, setModels] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  const [metadata, setMetadata] = useState<FilterMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef<number>(0);

  // S2-04: Synchronize browser back/forward navigation from URL
  useEffect(() => {
    const urlQ = searchParams.get("q") || "";
    const urlProvider = searchParams.get("provider")?.split(",").filter(Boolean) || [];
    const urlCategory = searchParams.get("category")?.split(",").filter(Boolean) || [];
    const urlCapability = searchParams.get("capability")?.split(",").filter(Boolean) || [];
    const urlCompany = searchParams.get("company")?.split(",").filter(Boolean) || [];
    const urlSort = (searchParams.get("sort") as ModelSortOption) || "relevance";
    const urlPage = parseInt(searchParams.get("page") || "1", 10);

    const minVal = searchParams.get("minPrice");
    const parsedMin = minVal ? parseFloat(minVal) : NaN;
    const urlMinPrice = !isNaN(parsedMin) && parsedMin >= 0 ? parsedMin : undefined;

    const maxVal = searchParams.get("maxPrice");
    const parsedMax = maxVal ? parseFloat(maxVal) : NaN;
    const urlMaxPrice = !isNaN(parsedMax) && parsedMax >= 0 ? parsedMax : undefined;

    setSearchQuery(urlQ);
    setDebouncedQuery(urlQ);
    setFilters({
      provider: urlProvider,
      category: urlCategory,
      capability: urlCapability,
      company: urlCompany,
      minPrice: urlMinPrice,
      maxPrice: urlMaxPrice,
    });
    setSort(urlSort);
    setPage(isNaN(urlPage) || urlPage < 1 ? 1 : urlPage);
  }, [searchParams]);

  // Debounce search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Synchronize state with URL
  const updateURL = useCallback(
    (q: string, flt: FilterState, s: ModelSortOption, p: number) => {
      const params = new URLSearchParams();

      if (q.trim()) params.set("q", q.trim());
      if (flt.provider && flt.provider.length > 0) params.set("provider", flt.provider.join(","));
      if (flt.category && flt.category.length > 0) params.set("category", flt.category.join(","));
      if (flt.capability && flt.capability.length > 0)
        params.set("capability", flt.capability.join(","));
      if (flt.company && flt.company.length > 0) params.set("company", flt.company.join(","));
      if (flt.minPrice !== undefined && !isNaN(flt.minPrice))
        params.set("minPrice", flt.minPrice.toString());
      if (flt.maxPrice !== undefined && !isNaN(flt.maxPrice))
        params.set("maxPrice", flt.maxPrice.toString());
      if (s && s !== "relevance") params.set("sort", s);
      if (p > 1) params.set("page", p.toString());

      const queryStr = params.toString();
      const target = queryStr ? `${pathname}?${queryStr}` : pathname;
      const currentUrl =
        typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "";

      if (currentUrl !== target) {
        router.push(target, { scroll: false });
      }
    },
    [pathname, router]
  );

  // Fetch filter metadata on mount
  useEffect(() => {
    async function loadMetadata() {
      try {
        const res = await fetch("/api/models/filters");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setMetadata(json.data);
          }
        }
      } catch (err) {
        console.warn("Could not load filter metadata:", err);
      }
    }
    loadMetadata();
  }, []);

  // Fetch models with S2-05 request race handling
  const fetchModels = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const params = new URLSearchParams();
      if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
      if (filters.provider?.length) params.set("provider", filters.provider.join(","));
      if (filters.category?.length) params.set("category", filters.category.join(","));
      if (filters.capability?.length) params.set("capability", filters.capability.join(","));
      if (filters.company?.length) params.set("company", filters.company.join(","));
      if (filters.minPrice !== undefined && !isNaN(filters.minPrice))
        params.set("minPrice", filters.minPrice.toString());
      if (filters.maxPrice !== undefined && !isNaN(filters.maxPrice))
        params.set("maxPrice", filters.maxPrice.toString());
      if (sort && sort !== "relevance") params.set("sort", sort);
      params.set("page", page.toString());
      params.set("limit", "12");

      const res = await fetch(`/api/models?${params.toString()}`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || "Failed to fetch model catalogue");
      }

      const json = await res.json();
      if (currentRequestId === requestIdRef.current && json.success) {
        setModels(json.data || []);
        if (json.meta) {
          setPagination(json.meta);
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError" && currentRequestId === requestIdRef.current) {
        setError(err.message || "An unexpected error occurred");
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [debouncedQuery, filters, sort, page]);

  // Execute fetch and URL sync
  useEffect(() => {
    updateURL(debouncedQuery, filters, sort, page);
    fetchModels();
  }, [debouncedQuery, filters, sort, page, updateURL, fetchModels]);

  // Handlers
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1); // Reset page on search change
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setPage(1);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1); // Reset page on filter change
  };

  const handleRemoveFilter = (key: keyof FilterState, val?: string) => {
    if (key === "minPrice" || key === "maxPrice") {
      setFilters((prev) => ({ ...prev, [key]: undefined }));
      setPage(1);
      return;
    }

    if (!val) {
      setFilters((prev) => ({ ...prev, [key]: [] }));
    } else {
      setFilters((prev) => {
        const current = prev[key];
        if (Array.isArray(current)) {
          return {
            ...prev,
            [key]: current.filter((x: string) => x !== val),
          };
        }
        return {
          ...prev,
          [key]: undefined,
        };
      });
    }
    setPage(1);
  };

  const handleClearAllFilters = () => {
    setFilters({
      provider: [],
      category: [],
      capability: [],
      company: [],
      minPrice: undefined,
      maxPrice: undefined,
    });
    setSearchQuery("");
    setDebouncedQuery("");
    setSort("relevance");
    setPage(1);
  };

  const handleSortChange = (newSort: ModelSortOption) => {
    setSort(newSort);
    setPage(1); // Reset page on sort change
  };

  // Determine empty state message
  const hasSearch = debouncedQuery.trim() !== "";
  const hasFilter =
    (filters.provider && filters.provider.length > 0) ||
    (filters.category && filters.category.length > 0) ||
    (filters.capability && filters.capability.length > 0) ||
    (filters.company && filters.company.length > 0);

  const activeFilterCount =
    (filters.provider?.length || 0) +
    (filters.category?.length || 0) +
    (filters.capability?.length || 0) +
    (filters.company?.length || 0);

  return (
    <Container className="py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--border-color)]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
            Explore & Discover
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--primary-text)] mt-1">
            Foundation AI Models
          </h1>
          <p className="text-sm text-[var(--secondary-text)] mt-1 max-w-xl">
            Browse, filter, and compare multimodal intelligence models across cloud inference
            providers.
          </p>
        </div>

        {/* Search Bar + Mobile Filter Button on small screens */}
        <div className="w-full md:w-80 flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <SearchInput
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onClear={handleClearSearch}
              placeholder="Search models, providers, specs..."
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden shrink-0 h-10 px-3 text-xs gap-1.5"
            aria-label="Open filter sidebar"
          >
            <Filter className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="hidden xs:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Main Layout: Sidebar + Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Desktop Sidebar & Mobile Drawer */}
        <ModelFilterSidebar
          metadata={metadata}
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleClearAllFilters}
          isMobileOpen={mobileFilterOpen}
          onMobileClose={() => setMobileFilterOpen(false)}
        />

        {/* Content Area */}
        <div className="flex-1 w-full space-y-6">
          {/* Controls Bar: Item count and Sort */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-[var(--secondary-text)] font-medium">
                {isLoading ? (
                  "Loading catalogue..."
                ) : (
                  <>
                    Found{" "}
                    <span className="font-semibold text-[var(--primary-text)]">
                      {pagination.total}
                    </span>{" "}
                    {pagination.total === 1 ? "model" : "models"}
                  </>
                )}
              </span>

              <div className="shrink-0">
                <SortSelect value={sort} onChange={handleSortChange} />
              </div>
            </div>

            {/* Active Filter Chips */}
            <ActiveFilters
              filters={filters}
              metadata={metadata}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
            />
          </div>

          {/* Results Grid / States */}
          {error ? (
            <ErrorState
              title="Failed to Load Model Catalogue"
              message={error}
              retry={fetchModels}
            />
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-xl border border-[var(--border-color)] p-5 space-y-4"
                >
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-8 w-full rounded-lg" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : models.length === 0 ? (
            <EmptyState
              title={
                hasSearch && hasFilter
                  ? `No models match "${debouncedQuery}" with the active filters`
                  : hasSearch
                    ? `No models found matching "${debouncedQuery}"`
                    : hasFilter
                      ? "No models match the selected filters"
                      : "No models in catalogue"
              }
              description={
                hasSearch || hasFilter
                  ? "Try checking your spelling, removing some filters, or clearing the search query."
                  : "The model repository is currently being updated. Please check back shortly."
              }
              actionLabel={hasSearch || hasFilter ? "Clear Filters & Search" : undefined}
              onAction={hasSearch || hasFilter ? handleClearAllFilters : undefined}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {models.map((m) => (
                  <ModelCard key={m.id} model={m} selectedProviders={filters.provider} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={(newPage) => setPage(newPage)}
              />
            </>
          )}
        </div>
      </div>
    </Container>
  );
}
