"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Plus, Sparkles, Check, Minus, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCompactNumber, formatCurrency } from "@/lib/utils";

export interface ComparisonTableProps {
  models: any[];
  onRemoveModel: (slugOrId: string) => void;
  maxLimit: number;
}

export function ComparisonTable({ models, onRemoveModel, maxLimit }: ComparisonTableProps) {
  const [highlightDifferences, setHighlightDifferences] = useState(true);

  if (!models || models.length === 0) return null;

  // Extract all unique capabilities present across the compared models
  const allCapabilities: [string, string][] = Array.from(
    new Map<string, string>(
      models.flatMap((m) =>
        (m.capabilities || []).map(
          (c: any) => [c.capability.slug, c.capability.name] as [string, string]
        )
      )
    ).entries()
  );

  // Extract all unique benchmarks present across the compared models
  const allBenchmarks: [string, string][] = Array.from(
    new Map<string, string>(
      models.flatMap((m) =>
        (m.benchmarks || []).map(
          (b: any) => [b.benchmark.slug, b.benchmark.name] as [string, string]
        )
      )
    ).entries()
  );

  // Helper to check if a specification row differs across models
  const isDiff = (getter: (m: any) => any) => {
    if (models.length <= 1) return false;
    const values = models.map(getter);
    return !values.every((v) => JSON.stringify(v) === JSON.stringify(values[0]));
  };

  const hasContextDiff = isDiff((m) => m.contextWindow);
  const hasCategoryDiff = isDiff((m) => m.modelType);
  const hasInputPriceDiff = isDiff((m) => m.providers?.[0]?.pricing?.[0]?.inputPrice);
  const hasOutputPriceDiff = isDiff((m) => m.providers?.[0]?.pricing?.[0]?.outputPrice);

  const getRowClass = (differ: boolean) =>
    differ && highlightDifferences
      ? "bg-[var(--accent)]/5 border-l-2 border-l-[var(--accent)]"
      : "";

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface)]">
        <div className="text-xs text-[var(--secondary-text)]">
          Comparing <span className="font-bold text-[var(--primary-text)]">{models.length}</span> of{" "}
          <span className="font-bold text-[var(--primary-text)]">{maxLimit}</span> models
        </div>

        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-[var(--primary-text)] select-none">
          <input
            type="checkbox"
            checked={highlightDifferences}
            onChange={(e) => setHighlightDifferences(e.target.checked)}
            className="rounded border-[var(--border-color)] text-[var(--accent)] focus:ring-[var(--accent)]"
          />
          <span>Highlight Differences</span>
        </label>
      </div>

      {/* Comparison Grid Table */}
      <div className="overflow-x-auto rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-color)] bg-[var(--secondary-surface)]">
              <th className="p-4 w-48 min-w-[12rem] font-bold text-[var(--secondary-text)] uppercase tracking-wider sticky left-0 bg-[var(--secondary-surface)] z-10">
                Specification
              </th>
              {models.map((m) => (
                <th key={m.id} className="p-4 min-w-[16rem] align-top">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">
                        {m.company?.name || "AI Lab"}
                      </span>
                      <h3 className="text-base font-bold text-[var(--primary-text)] mt-0.5">
                        <Link
                          href={`/models/${m.slug}`}
                          className="hover:text-[var(--accent)] transition-colors"
                        >
                          {m.name}
                        </Link>
                      </h3>
                      <span className="text-[10px] font-mono text-[var(--secondary-text)]">
                        {m.modelIdentifier}
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveModel(m.slug)}
                      className="p-1 rounded-md text-[var(--secondary-text)] hover:text-red-500 hover:bg-[var(--surface)] transition-colors"
                      aria-label={`Remove ${m.name} from comparison`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </th>
              ))}
              {/* Empty placeholder column if fewer than maxLimit models */}
              {models.length < maxLimit && (
                <th className="p-4 min-w-[14rem] border-dashed border-l border-[var(--border-color)] align-middle text-center">
                  <Link href="/models">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      <Plus className="w-3.5 h-3.5" />
                      <span>
                        Add Model ({models.length}/{maxLimit})
                      </span>
                    </Button>
                  </Link>
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border-color)] text-[var(--primary-text)]">
            {/* Category / Architecture */}
            <tr className={getRowClass(hasCategoryDiff)}>
              <td className="p-4 font-semibold text-[var(--secondary-text)] sticky left-0 bg-[var(--surface)]">
                Category
              </td>
              {models.map((m) => (
                <td key={m.id} className="p-4 capitalize">
                  <Badge variant="outline">{m.modelType || "Unknown"}</Badge>
                </td>
              ))}
              {models.length < maxLimit && (
                <td className="p-4 border-l border-[var(--border-color)]/50" />
              )}
            </tr>

            {/* Context Window */}
            <tr className={getRowClass(hasContextDiff)}>
              <td className="p-4 font-semibold text-[var(--secondary-text)] sticky left-0 bg-[var(--surface)]">
                Context Window
              </td>
              {models.map((m) => (
                <td key={m.id} className="p-4 font-mono font-bold">
                  {m.contextWindow !== null && m.contextWindow !== undefined ? (
                    `${formatCompactNumber(m.contextWindow)} tokens`
                  ) : (
                    <span className="text-[var(--secondary-text)] font-normal italic">
                      Context Unavailable
                    </span>
                  )}
                </td>
              ))}
              {models.length < maxLimit && (
                <td className="p-4 border-l border-[var(--border-color)]/50" />
              )}
            </tr>

            {/* Input Pricing */}
            <tr className={getRowClass(hasInputPriceDiff)}>
              <td className="p-4 font-semibold text-[var(--secondary-text)] sticky left-0 bg-[var(--surface)]">
                Input Price (per 1M)
              </td>
              {models.map((m) => {
                const pricing = m.providers?.[0]?.pricing?.[0];
                return (
                  <td key={m.id} className="p-4 font-mono">
                    {pricing?.inputPrice ? (
                      formatCurrency(pricing.inputPrice)
                    ) : (
                      <span className="text-[var(--secondary-text)] italic">
                        Pricing Unavailable
                      </span>
                    )}
                  </td>
                );
              })}
              {models.length < maxLimit && (
                <td className="p-4 border-l border-[var(--border-color)]/50" />
              )}
            </tr>

            {/* Output Pricing */}
            <tr className={getRowClass(hasOutputPriceDiff)}>
              <td className="p-4 font-semibold text-[var(--secondary-text)] sticky left-0 bg-[var(--surface)]">
                Output Price (per 1M)
              </td>
              {models.map((m) => {
                const pricing = m.providers?.[0]?.pricing?.[0];
                return (
                  <td key={m.id} className="p-4 font-mono">
                    {pricing?.outputPrice ? (
                      formatCurrency(pricing.outputPrice)
                    ) : (
                      <span className="text-[var(--secondary-text)] italic">
                        Pricing Unavailable
                      </span>
                    )}
                  </td>
                );
              })}
              {models.length < maxLimit && (
                <td className="p-4 border-l border-[var(--border-color)]/50" />
              )}
            </tr>

            {/* Input Modalities */}
            <tr>
              <td className="p-4 font-semibold text-[var(--secondary-text)] sticky left-0 bg-[var(--surface)]">
                Input Modalities
              </td>
              {models.map((m) => (
                <td key={m.id} className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {(m.inputModalities || ["text"]).map((mod: string) => (
                      <Badge key={mod} variant="default" className="text-[10px] capitalize">
                        {mod}
                      </Badge>
                    ))}
                  </div>
                </td>
              ))}
              {models.length < maxLimit && (
                <td className="p-4 border-l border-[var(--border-color)]/50" />
              )}
            </tr>

            {/* Output Modalities */}
            <tr>
              <td className="p-4 font-semibold text-[var(--secondary-text)] sticky left-0 bg-[var(--surface)]">
                Output Modalities
              </td>
              {models.map((m) => (
                <td key={m.id} className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {(m.outputModalities || ["text"]).map((mod: string) => (
                      <Badge key={mod} variant="default" className="text-[10px] capitalize">
                        {mod}
                      </Badge>
                    ))}
                  </div>
                </td>
              ))}
              {models.length < maxLimit && (
                <td className="p-4 border-l border-[var(--border-color)]/50" />
              )}
            </tr>

            {/* Capabilities Matrix */}
            {allCapabilities.map(([capSlug, capName]) => {
              const diff = isDiff((m) =>
                (m.capabilities || []).some((c: any) => c.capability.slug === capSlug)
              );
              return (
                <tr key={capSlug} className={getRowClass(diff)}>
                  <td className="p-4 font-medium text-[var(--secondary-text)] sticky left-0 bg-[var(--surface)]">
                    {capName}
                  </td>
                  {models.map((m) => {
                    const hasCap = (m.capabilities || []).some(
                      (c: any) => c.capability.slug === capSlug
                    );
                    return (
                      <td key={m.id} className="p-4">
                        {hasCap ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                            <Check className="w-4 h-4" />
                            <span>Supported</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[var(--secondary-text)] text-xs">
                            <Minus className="w-4 h-4 opacity-40" />
                            <span>Not Supported</span>
                          </span>
                        )}
                      </td>
                    );
                  })}
                  {models.length < maxLimit && (
                    <td className="p-4 border-l border-[var(--border-color)]/50" />
                  )}
                </tr>
              );
            })}

            {/* Benchmarks Section Header */}
            {allBenchmarks.length > 0 && (
              <tr className="bg-[var(--secondary-surface)]/70">
                <td
                  colSpan={models.length + (models.length < maxLimit ? 2 : 1)}
                  className="p-3 font-bold uppercase tracking-wider text-[11px] text-[var(--accent)]"
                >
                  Benchmark Evaluations
                </td>
              </tr>
            )}

            {allBenchmarks.map(([bSlug, bName]) => (
              <tr key={bSlug}>
                <td className="p-4 font-medium text-[var(--secondary-text)] sticky left-0 bg-[var(--surface)]">
                  {bName}
                </td>
                {models.map((m) => {
                  const bScore = (m.benchmarks || []).find((b: any) => b.benchmark.slug === bSlug);
                  return (
                    <td key={m.id} className="p-4 font-mono font-bold">
                      {bScore ? (
                        <span>
                          {parseFloat(bScore.score)} {bScore.scoreUnit === "percentage" ? "%" : ""}
                        </span>
                      ) : (
                        <span className="text-[var(--secondary-text)] font-normal italic">
                          Not Reported
                        </span>
                      )}
                    </td>
                  );
                })}
                {models.length < maxLimit && (
                  <td className="p-4 border-l border-[var(--border-color)]/50" />
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
