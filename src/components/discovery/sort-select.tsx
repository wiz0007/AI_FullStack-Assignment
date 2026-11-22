import React from "react";
import { ArrowDownUp } from "lucide-react";
import { ModelSortOption } from "@/server/validators/model.validator";

interface SortSelectProps {
  value: ModelSortOption;
  onChange: (sort: ModelSortOption) => void;
  className?: string;
}

export function SortSelect({ value, onChange, className = "" }: SortSelectProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ArrowDownUp className="w-3.5 h-3.5 text-[var(--secondary-text)] hidden sm:inline" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ModelSortOption)}
        aria-label="Sort models"
        className="text-xs rounded-lg border border-[var(--border-color)] bg-[var(--surface)] text-[var(--primary-text)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-pointer"
      >
        <option value="relevance">Default (Relevance)</option>
        <option value="name_asc">Name: A to Z</option>
        <option value="name_desc">Name: Z to A</option>
        <option value="pricing_asc">Price: Low to High</option>
        <option value="pricing_desc">Price: High to Low</option>
        <option value="contextWindow_desc">Context Window: Largest</option>
        <option value="contextWindow_asc">Context Window: Smallest</option>
        <option value="releaseDate_desc">Release Date: Newest</option>
        <option value="releaseDate_asc">Release Date: Oldest</option>
      </select>
    </div>
  );
}
