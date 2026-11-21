import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (newPage: number) => void;
}

export function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  if (total === 0 || totalPages <= 1) return null;

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  // Generate page numbers
  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    // Show first, last, current, and adjacent pages
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[var(--border-color)]">
      <span className="text-xs text-[var(--secondary-text)]">
        Showing <span className="font-semibold text-[var(--primary-text)]">{startRecord}</span> to{" "}
        <span className="font-semibold text-[var(--primary-text)]">{endRecord}</span> of{" "}
        <span className="font-semibold text-[var(--primary-text)]">{total}</span> models
      </span>

      <div className="flex items-center gap-1.5" aria-label="Pagination Navigation">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {pages.map((p, idx) => {
          const isCurrent = p === page;
          const showEllipsisBefore = idx > 0 && p - pages[idx - 1] > 1;

          return (
            <React.Fragment key={p}>
              {showEllipsisBefore && (
                <span className="px-1 text-xs text-[var(--secondary-text)]">...</span>
              )}
              <Button
                variant={isCurrent ? "primary" : "outline"}
                size="sm"
                onClick={() => onPageChange(p)}
                aria-label={`Page ${p}`}
                aria-current={isCurrent ? "page" : undefined}
                className="h-8 w-8 p-0 text-xs"
              >
                {p}
              </Button>
            </React.Fragment>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
