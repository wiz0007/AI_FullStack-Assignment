"use client";

import React from "react";
import { Filter, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface FilterMetadata {
  providers: Array<{ id: string; name: string; slug: string; count: number }>;
  categories: string[];
  capabilities: Array<{ id: string; name: string; slug: string; category: string; count: number }>;
  ranges: {
    minContextWindow: number;
    maxContextWindow: number;
  };
}

export interface FilterState {
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
  const toggleArrayItem = (key: "provider" | "category" | "capability", item: string) => {
    const current = filters[key] || [];
    const next = current.includes(item) ? current.filter((x) => x !== item) : [...current, item];
    onFilterChange({
      ...filters,
      [key]: next,
    });
  };

  const hasActiveFilters =
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

      {/* 1. Provider Filter */}
      {metadata?.providers && metadata.providers.length > 0 && (
        <div className="space-y-2.5">
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

      {/* 2. Model Type / Category Filter */}
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

      {/* 3. Capabilities Filter */}
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
      {/* Desktop view */}
      <div className={`hidden lg:block w-64 shrink-0 ${className}`}>{content}</div>

      {/* Mobile drawer view */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-80 max-w-[85vw] h-full bg-[var(--surface)] p-6 overflow-y-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <span className="font-bold text-sm text-[var(--primary-text)]">Filter Catalogue</span>
              <button
                onClick={onMobileClose}
                className="p-1 rounded text-[var(--secondary-text)] hover:text-[var(--primary-text)]"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {content}
            <div className="pt-4">
              <Button variant="primary" className="w-full" onClick={onMobileClose}>
                Apply & View Results
              </Button>
            </div>
          </div>
          <div className="flex-1" onClick={onMobileClose} />
        </div>
      )}
    </>
  );
}
