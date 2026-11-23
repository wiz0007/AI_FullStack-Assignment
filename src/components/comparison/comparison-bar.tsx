"use client";

import React from "react";
import Link from "next/link";
import { Scale, X, ArrowRight, AlertCircle } from "lucide-react";
import { useComparison } from "@/features/comparison/comparison-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ComparisonBar() {
  const {
    selectedModelIds,
    removeModel,
    clearComparison,
    limitReachedMessage,
    clearLimitMessage,
    maxLimit,
  } = useComparison();

  if (selectedModelIds.length === 0 && !limitReachedMessage) {
    return null;
  }

  const compareUrl = `/compare?models=${selectedModelIds.join(",")}`;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 animate-slideUp">
      {/* Limit Reached Toast Notification */}
      {limitReachedMessage && (
        <div className="mb-2 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 backdrop-blur-md flex items-center justify-between text-xs shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{limitReachedMessage}</span>
          </div>
          <button
            onClick={clearLimitMessage}
            className="p-1 rounded hover:bg-amber-500/20"
            aria-label="Dismiss limit warning"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {selectedModelIds.length > 0 && (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)]/95 backdrop-blur-md shadow-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-[var(--primary-text)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">
                Comparison Drawer ({selectedModelIds.length}/{maxLimit})
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                {selectedModelIds.map((id) => (
                  <Badge key={id} variant="default" className="text-[10px] gap-1 py-0 px-2">
                    <span className="font-mono">{id}</span>
                    <button
                      onClick={() => removeModel(id)}
                      className="hover:opacity-75 focus:outline-none"
                      aria-label={`Remove ${id} from comparison`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearComparison}
              className="h-8 text-xs text-[var(--secondary-text)] hover:text-red-500 px-2 shrink-0"
            >
              Clear
            </Button>
            <Link href={compareUrl} className="shrink-0">
              <Button
                variant="primary"
                size="sm"
                className="h-8 gap-1.5 text-xs whitespace-nowrap shrink-0"
                title="Compare Side-by-Side"
              >
                <span className="hidden sm:inline">Compare Side-by-Side</span>
                <span className="sm:hidden">Compare</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
