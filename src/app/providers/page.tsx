"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Server, Search } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Pagination } from "@/components/discovery/pagination";
import { ProviderCard } from "@/components/providers/provider-card";

function ProvidersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialQ = searchParams.get("q") || "";
  const initialSort = searchParams.get("sort") || "models_desc";
  const initialPage = parseInt(searchParams.get("page") || "1", 10) || 1;

  const [query, setQuery] = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(initialPage);

  const [providers, setProviders] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Synchronize URL
  const updateURL = useCallback(
    (q: string, s: string, p: number) => {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (s && s !== "models_desc") params.set("sort", s);
      if (p > 1) params.set("page", p.toString());

      const queryStr = params.toString();
      const target = queryStr ? `${pathname}?${queryStr}` : pathname;
      router.replace(target, { scroll: false });
    },
    [pathname, router]
  );

  // Fetch providers
  const fetchProviders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (debouncedQuery.trim()) params.set("search", debouncedQuery.trim());
      if (sort) params.set("sort", sort);
      params.set("page", page.toString());
      params.set("limit", "12");

      const res = await fetch(`/api/providers?${params.toString()}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || "Failed to load inference providers directory");
      }

      const json = await res.json();
      if (json.success) {
        setProviders(json.data || []);
        if (json.meta) {
          setPagination(json.meta);
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, sort, page]);

  useEffect(() => {
    updateURL(debouncedQuery, sort, page);
    fetchProviders();
  }, [debouncedQuery, sort, page, updateURL, fetchProviders]);

  return (
    <Container className="py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--border-color)]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5" />
            Infrastructure & Endpoints
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--primary-text)] mt-1">
            Inference Providers & Platforms
          </h1>
          <p className="text-sm text-[var(--secondary-text)] mt-1 max-w-xl">
            Compare hosted model endpoints, cloud inference platforms, and infrastructure pricing
            across leading providers.
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-80">
          <SearchInput
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            onClear={() => {
              setQuery("");
              setDebouncedQuery("");
              setPage(1);
            }}
            placeholder="Search inference providers..."
          />
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-[var(--secondary-text)] font-medium">
          {isLoading ? (
            "Loading providers..."
          ) : (
            <>
              Showing{" "}
              <span className="font-semibold text-[var(--primary-text)]">{pagination.total}</span>{" "}
              {pagination.total === 1 ? "provider" : "providers"}
            </>
          )}
        </span>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--secondary-text)] hidden sm:inline">Sort:</span>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] text-[var(--primary-text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          >
            <option value="models_desc">Most Models</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Directory Grid / States */}
      {error ? (
        <ErrorState
          title="Failed to Load Providers Directory"
          message={error}
          retry={fetchProviders}
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-56 rounded-xl border border-[var(--border-color)] p-5 space-y-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-10 w-full" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : providers.length === 0 ? (
        <EmptyState
          title={query ? `No providers match "${query}"` : "No inference providers in directory"}
          description={
            query
              ? "Try adjusting your search query or clear the filter."
              : "Provider endpoints are being updated."
          }
          actionLabel={query ? "Clear Search" : undefined}
          onAction={
            query
              ? () => {
                  setQuery("");
                  setDebouncedQuery("");
                  setPage(1);
                }
              : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={(p) => setPage(p)}
          />
        </>
      )}
    </Container>
  );
}

export default function ProvidersPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-12 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </Container>
      }
    >
      <ProvidersContent />
    </Suspense>
  );
}
