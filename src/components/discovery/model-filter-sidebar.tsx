"use client";

import React from "react";
import { Filter, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface FilterMetadata {
  companies?: Array<{ id: string; name: string; slug: string; count: number }>;
  providers: Array<{ id: string; name: string; slug: string; count: number }>;
  categories: string[];
  capabilities: Array<{ id: string; name: string; slug: string; category: string; count: number }>;
  ranges: {
    minContextWindow: number;
    maxContextWindow: number;
  };
}

export interface FilterState {
  company?: string[];
  provider: string[];
  category: string[];
  capability: string[];
  minContextWindow?: number;
  maxContextWindow?: number;
}

interface ModelFilterSidebarProps {
  metadata: FilterMetadata | null;
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
  className?: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function ModelFilterSidebar({
  metadata,
  filters,
  onFilterChange,
  onReset,
  className = "",
  isMobileOpen = false,
  onMobileClose,
}: ModelFilterSidebarProps) {
  const toggleArrayItem = (
    key: "company" | "provider" | "category" | "capability",
    item: string
  ) => {
    const current = filters[key] || [];
    const next = current.includes(item) ? current.filter((x) => x !== item) : [...current, item];
    onFilterChange({
      ...filters,
      [key]: next,
    });
  };

  const hasActiveFilters =
    (filters.company && filters.company.length > 0) ||
    (filters.provider && filters.provider.length > 0) ||
    (filters.category && filters.category.length > 0) ||
    (filters.capability && filters.capability.length > 0) ||
    filters.minContextWindow !== undefined ||
    filters.maxContextWindow !== undefined;

  const content = (
    <aside className="w-full space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold tracking-wide uppercase text-[var(--primary-text)]">
            Filters
          </h2>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 px-2 text-xs text-[var(--secondary-text)]"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* 1. Company Filter (Section 6.1) */}
      {metadata?.companies && metadata.companies.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--secondary-text)]">
            AI Companies & Labs
          </h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {metadata.companies.map((c) => {
              const isChecked = filters.company?.includes(c.slug);
              return (
                <label
                  key={c.slug}
                  className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-[var(--secondary-surface)] cursor-pointer text-[var(--primary-text)] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleArrayItem("company", c.slug)}
                      className="rounded border-[var(--border-color)] text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer"
                    />
                    <span>{c.name}</span>
                  </div>
                  <span className="text-[10px] text-[var(--secondary-text)] font-mono">
                    {c.count}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Provider Filter */}
      {metadata?.providers && metadata.providers.length > 0 && (
        <div className="space-y-2.5 pt-3 border-t border-[var(--border-color)]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--secondary-text)]">
            Infrastructure Providers
          </h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {metadata.providers.map((p) => {
              const isChecked = filters.provider?.includes(p.slug);
              return (
                <label
                  key={p.slug}
                  className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-[var(--secondary-surface)] cursor-pointer text-[var(--primary-text)] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleArrayItem("provider", p.slug)}
                      className="rounded border-[var(--border-color)] text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer"
                    />
                    <span>{p.name}</span>
                  </div>
                  <span className="text-[10px] text-[var(--secondary-text)] font-mono">
                    {p.count}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Model Type / Category Filter */}
      {metadata?.categories && metadata.categories.length > 0 && (
        <div className="space-y-2.5 pt-3 border-t border-[var(--border-color)]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--secondary-text)]">
            Model Category
          </h3>
          <div className="space-y-1.5">
            {metadata.categories.map((cat) => {
              const isChecked = filters.category?.includes(cat);
              return (
                <label
                  key={cat}
                  className="flex items-center gap-2 text-xs py-1 px-1.5 rounded hover:bg-[var(--secondary-surface)] cursor-pointer text-[var(--primary-text)] capitalize transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleArrayItem("category", cat)}
                    className="rounded border-[var(--border-color)] text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer"
                  />
                  <span>{cat}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Capabilities Filter */}
      {metadata?.capabilities && metadata.capabilities.length > 0 && (
        <div className="space-y-2.5 pt-3 border-t border-[var(--border-color)]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--secondary-text)]">
            Capabilities
          </h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {metadata.capabilities.map((cap) => {
              const isChecked = filters.capability?.includes(cap.slug);
              return (
                <label
                  key={cap.slug}
                  className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-[var(--secondary-surface)] cursor-pointer text-[var(--primary-text)] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleArrayItem("capability", cap.slug)}
                      className="rounded border-[var(--border-color)] text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer"
                    />
                    <span>{cap.name}</span>
                  </div>
                  <span className="text-[10px] text-[var(--secondary-text)] font-mono">
                    {cap.count}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );

  return (
    <>
      <div className={`hidden md:block ${className}`}>{content}</div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <div className="relative ml-auto w-full max-w-xs h-full bg-[var(--surface)] p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border-color)]">
                <span className="font-bold text-sm text-[var(--primary-text)]">Filters</span>
                <button
                  onClick={onMobileClose}
                  className="p-1 rounded-md text-[var(--secondary-text)] hover:text-[var(--primary-text)]"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {content}
            </div>
            <div className="pt-6 mt-6 border-t border-[var(--border-color)]">
              <Button variant="primary" className="w-full" onClick={onMobileClose}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
