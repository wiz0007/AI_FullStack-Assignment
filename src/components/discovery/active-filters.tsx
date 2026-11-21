import React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterState, FilterMetadata } from "./model-filter-sidebar";

interface ActiveFiltersProps {
  filters: FilterState;
  metadata: FilterMetadata | null;
  onRemoveFilter: (key: keyof FilterState, value?: string) => void;
  onClearAll: () => void;
}

export function ActiveFilters({
  filters,
  metadata,
  onRemoveFilter,
  onClearAll,
}: ActiveFiltersProps) {
  const getProviderName = (slug: string) => {
    return metadata?.providers.find((p) => p.slug === slug)?.name || slug;
  };

  const getCapabilityName = (slug: string) => {
    return metadata?.capabilities.find((c) => c.slug === slug)?.name || slug;
  };

  const hasAnyFilter =
    (filters.provider && filters.provider.length > 0) ||
    (filters.category && filters.category.length > 0) ||
    (filters.capability && filters.capability.length > 0);

  if (!hasAnyFilter) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <span className="text-xs text-[var(--secondary-text)] font-medium">Active Filters:</span>

      {/* Provider chips */}
      {filters.provider?.map((p) => (
        <Badge key={`prov-${p}`} variant="accent" className="gap-1 py-1 px-2.5">
          <span>Provider: {getProviderName(p)}</span>
          <button
            onClick={() => onRemoveFilter("provider", p)}
            className="hover:opacity-75 focus:outline-none"
            aria-label={`Remove provider filter ${p}`}
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}

      {/* Category chips */}
      {filters.category?.map((c) => (
        <Badge key={`cat-${c}`} variant="accent" className="gap-1 py-1 px-2.5 capitalize">
          <span>Category: {c}</span>
          <button
            onClick={() => onRemoveFilter("category", c)}
            className="hover:opacity-75 focus:outline-none"
            aria-label={`Remove category filter ${c}`}
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}

      {/* Capability chips */}
      {filters.capability?.map((cap) => (
        <Badge key={`cap-${cap}`} variant="accent" className="gap-1 py-1 px-2.5">
          <span>{getCapabilityName(cap)}</span>
          <button
            onClick={() => onRemoveFilter("capability", cap)}
            className="hover:opacity-75 focus:outline-none"
            aria-label={`Remove capability filter ${cap}`}
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-6 text-[11px] px-2 text-[var(--secondary-text)] hover:text-red-500"
      >
        Clear All
      </Button>
    </div>
  );
}
