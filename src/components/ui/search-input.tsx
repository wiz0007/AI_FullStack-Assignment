import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      value,
      onChange,
      onClear,
      placeholder = "Search models, providers, capabilities...",
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative w-full flex items-center">
        <Search
          className="absolute left-3.5 w-4 h-4 text-[var(--secondary-text)] pointer-events-none"
          aria-hidden="true"
        />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn(
            "w-full pl-10 pr-9 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--surface)] text-[var(--primary-text)] placeholder-[var(--secondary-text)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent)]",
            className
          )}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 p-1 rounded hover:bg-[var(--secondary-surface)] text-[var(--secondary-text)]"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
