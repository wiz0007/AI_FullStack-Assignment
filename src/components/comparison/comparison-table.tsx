"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Plus, Sparkles, Check, Minus, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCompactNumber, formatCurrency } from "@/lib/utils";
import { getRepresentativeModelPrice } from "@/lib/pricing";
import {
  toBenchmarkEvaluationDTO,
  compareBenchmarkEvaluations,
  BenchmarkEvaluationDTO,
} from "@/lib/benchmark";

export interface ComparisonTableProps {
  models: any[];
  onRemoveModel: (slugOrId: string) => void;
  maxLimit: number;
}

export function ComparisonTable({ models, onRemoveModel, maxLimit }: ComparisonTableProps) {
  const [highlightDifferences, setHighlightDifferences] = useState(true);
  const [mobileView, setMobileView] = useState<"cards" | "table">("cards");

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
        (m.benchmarks || []).map((b: any) => {
          const slug = b.benchmarkSlug || b.benchmark?.slug;
          const name = b.benchmarkName || b.benchmark?.name || slug;
          return [slug, name] as [string, string];
        })
      )
    ).entries()
  ).filter(([s]) => Boolean(s));

  // Helper to check if a specification row differs across models
  const isDiff = (getter: (m: any) => any) => {
    if (models.length <= 1) return false;
    const values = models.map(getter);
    return !values.every((v) => JSON.stringify(v) === JSON.stringify(values[0]));
  };

  const hasContextDiff = isDiff((m) => m.contextWindow);
  const hasCategoryDiff = isDiff((m) => m.modelType);
  const hasInputPriceDiff = isDiff((m) => getRepresentativeModelPrice(m)?.inputPrice);
  const hasOutputPriceDiff = isDiff((m) => getRepresentativeModelPrice(m)?.outputPrice);
  const hasInputModalitiesDiff = isDiff((m) =>
    (m.inputModalities || ["text"]).slice().sort().join(",")
  );
  const hasOutputModalitiesDiff = isDiff((m) =>
    (m.outputModalities || ["text"]).slice().sort().join(",")
  );

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

        <div className="flex items-center gap-3">
          {/* Mobile View Toggle */}
          <div className="flex md:hidden items-center gap-1 bg-[var(--secondary-surface)] p-0.5 rounded-lg border border-[var(--border-color)]">
            <button
              onClick={() => setMobileView("cards")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                mobileView === "cards"
                  ? "bg-[var(--accent)] text-white font-semibold"
                  : "text-[var(--secondary-text)]"
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setMobileView("table")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                mobileView === "table"
                  ? "bg-[var(--accent)] text-white font-semibold"
                  : "text-[var(--secondary-text)]"
              }`}
            >
              Table
            </button>
          </div>

          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-[var(--primary-text)] select-none">
            <input
              type="checkbox"
              checked={highlightDifferences}
              onChange={(e) => setHighlightDifferences(e.target.checked)}
              className="rounded border-[var(--border-color)] text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            <span className="hidden xs:inline">Highlight Differences</span>
            <span className="xs:hidden">Diffs</span>
          </label>
        </div>
      </div>

      {/* Mobile Stacked Cards View (< md) */}
      {mobileView === "cards" && (
        <div className="space-y-3 md:hidden">
          {/* Selected Models Header */}
          <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--secondary-text)]">
              Compared Models ({models.length}/{maxLimit})
            </span>
            <div className="flex flex-col gap-1.5">
              {models.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[var(--secondary-surface)]"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] uppercase font-semibold text-[var(--accent)] block">
                      {m.company?.name || "AI Lab"}
                    </span>
                    <Link
                      href={`/models/${m.slug}`}
                      className="text-xs font-bold text-[var(--primary-text)] hover:underline truncate block"
                    >
                      {m.name}
                    </Link>
                  </div>
                  <button
                    onClick={() => onRemoveModel(m.slug)}
                    className="p-1 text-[var(--secondary-text)] hover:text-red-500 rounded shrink-0"
                    aria-label={`Remove ${m.name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Specifications Cards */}
          <div className="space-y-2.5">
            {/* Category */}
            <div
              className={`p-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] ${getRowClass(hasCategoryDiff)}`}
            >
              <span className="text-[11px] font-bold text-[var(--secondary-text)] uppercase block mb-1.5">
                Category
              </span>
              <div className="space-y-1">
                {models.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-xs">
                    <span className="text-[var(--secondary-text)] truncate max-w-[140px]">
                      {m.name}
                    </span>
                    <Badge variant="outline" className="capitalize text-[10px]">
                      {m.modelType || "Unknown"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Context Window */}
            <div
              className={`p-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] ${getRowClass(hasContextDiff)}`}
            >
              <span className="text-[11px] font-bold text-[var(--secondary-text)] uppercase block mb-1.5">
                Context Window
              </span>
              <div className="space-y-1">
                {models.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[var(--secondary-text)] font-sans truncate max-w-[140px]">
                      {m.name}
                    </span>
                    <span className="font-bold text-[var(--primary-text)]">
                      {m.contextWindow !== null && m.contextWindow !== undefined
                        ? `${formatCompactNumber(m.contextWindow)} ctx`
                        : "Unavailable"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div
              className={`p-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] ${getRowClass(hasInputPriceDiff || hasOutputPriceDiff)}`}
            >
              <span className="text-[11px] font-bold text-[var(--secondary-text)] uppercase block mb-1.5">
                Pricing (per 1M tokens)
              </span>
              <div className="space-y-1.5">
                {models.map((m) => {
                  const pricing = getRepresentativeModelPrice(m);
                  return (
                    <div
                      key={m.id}
                      className="p-2 rounded-lg bg-[var(--secondary-surface)] text-xs"
                    >
                      <div className="font-semibold text-[var(--primary-text)] truncate">
                        {m.name}
                      </div>
                      {pricing?.inputPrice ? (
                        <div className="flex items-center justify-between mt-0.5 font-mono text-[11px]">
                          <span>
                            In: <strong>{formatCurrency(pricing.inputPrice)}</strong>
                          </span>
                          <span>
                            Out:{" "}
                            <strong>
                              {pricing.outputPrice ? formatCurrency(pricing.outputPrice) : "—"}
                            </strong>
                          </span>
                        </div>
                      ) : (
                        <span className="text-[var(--secondary-text)] italic text-[11px]">
                          Pricing unavailable
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modalities */}
            <div
              className={`p-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] ${getRowClass(hasInputModalitiesDiff || hasOutputModalitiesDiff)}`}
            >
              <span className="text-[11px] font-bold text-[var(--secondary-text)] uppercase block mb-1.5">
                Modalities
              </span>
              <div className="space-y-2">
                {models.map((m) => (
                  <div key={m.id} className="text-xs">
                    <span className="font-medium text-[var(--primary-text)] block mb-0.5">
                      {m.name}:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(m.inputModalities || ["text"]).map((mod: string) => (
                        <Badge key={mod} variant="default" className="text-[9px] capitalize">
                          in: {mod}
                        </Badge>
                      ))}
                      {(m.outputModalities || ["text"]).map((mod: string) => (
                        <Badge key={mod} variant="outline" className="text-[9px] capitalize">
                          out: {mod}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benchmarks Section in Mobile */}
            {allBenchmarks.length > 0 && (
              <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] block">
                  Benchmark Evaluations
                </span>
                <div className="space-y-2.5 divide-y divide-[var(--border-color)]/60">
                  {allBenchmarks.map(([bSlug, bName]) => {
                    const modelEvaluations = models.map((m) => {
                      const raw = (m.benchmarks || []).find(
                        (bm: any) =>
                          bm.benchmarkSlug === bSlug ||
                          bm.benchmark?.slug === bSlug ||
                          (bm.benchmarkVersion?.benchmark &&
                            bm.benchmarkVersion.benchmark.slug === bSlug)
                      );
                      return raw ? toBenchmarkEvaluationDTO(raw) : null;
                    });

                    let isComparable = true;
                    let incompatibilityReason: string | null = null;
                    let comparisonResult: any = null;

                    if (models.length === 2 && modelEvaluations[0] && modelEvaluations[1]) {
                      comparisonResult = compareBenchmarkEvaluations(
                        modelEvaluations[0],
                        modelEvaluations[1]
                      );
                      isComparable = comparisonResult.isComparable;
                      incompatibilityReason = comparisonResult.incompatibilityReason;
                    }

                    return (
                      <div key={bSlug} className="pt-2 first:pt-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[var(--primary-text)]">
                            {bName}
                          </span>
                          {!isComparable && incompatibilityReason && (
                            <span className="text-[9px] text-amber-500 bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20">
                              ⚠️ Incompatible
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          {models.map((m, idx) => {
                            const evalDto = modelEvaluations[idx];
                            const isWinner =
                              isComparable && comparisonResult?.winnerModelId === m.id;
                            return (
                              <div key={m.id} className="flex items-center justify-between text-xs">
                                <span className="text-[var(--secondary-text)] truncate max-w-[140px]">
                                  {m.name}
                                </span>
                                {evalDto ? (
                                  <span
                                    className={`font-mono font-bold ${
                                      isWinner
                                        ? "text-[var(--accent)] font-extrabold"
                                        : "text-[var(--primary-text)]"
                                    }`}
                                  >
                                    {parseFloat(evalDto.score).toLocaleString()}
                                    {evalDto.scoreUnit === "percentage"
                                      ? "%"
                                      : ` ${evalDto.scoreUnit}`}
                                    {isWinner && " 👑"}
                                  </span>
                                ) : (
                                  <span className="text-[var(--secondary-text)] italic text-[11px]">
                                    Not reported
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comparison Grid Table (Desktop default, or when Table view toggled on mobile) */}
      <div
        className={`overflow-x-auto rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] shadow-sm ${
          mobileView === "cards" ? "hidden md:block" : "block"
        }`}
      >
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-color)] bg-[var(--secondary-surface)]">
              <th className="p-4 w-36 min-w-[9rem] md:w-48 md:min-w-[12rem] font-bold text-[var(--secondary-text)] uppercase tracking-wider md:sticky md:left-0 bg-[var(--secondary-surface)] md:z-10">
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
              <td className="p-4 font-semibold text-[var(--secondary-text)] md:sticky md:left-0 bg-[var(--surface)]">
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
              <td className="p-4 font-semibold text-[var(--secondary-text)] md:sticky md:left-0 bg-[var(--surface)]">
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
              <td className="p-4 font-semibold text-[var(--secondary-text)] md:sticky md:left-0 bg-[var(--surface)]">
                Input Price (per 1M)
              </td>
              {models.map((m) => {
                const pricing = getRepresentativeModelPrice(m);
                return (
                  <td key={m.id} className="p-4 font-mono">
                    {pricing?.inputPrice ? (
                      <div>
                        <span className="font-bold">{formatCurrency(pricing.inputPrice)}</span>
                        <span className="text-[10px] text-[var(--secondary-text)] block font-sans">
                          via {pricing.providerName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[var(--secondary-text)] italic font-sans text-[11px]">
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
              <td className="p-4 font-semibold text-[var(--secondary-text)] md:sticky md:left-0 bg-[var(--surface)]">
                Output Price (per 1M)
              </td>
              {models.map((m) => {
                const pricing = getRepresentativeModelPrice(m);
                return (
                  <td key={m.id} className="p-4 font-mono">
                    {pricing?.outputPrice ? (
                      <div>
                        <span className="font-bold">{formatCurrency(pricing.outputPrice)}</span>
                        <span className="text-[10px] text-[var(--secondary-text)] block font-sans">
                          via {pricing.providerName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[var(--secondary-text)] italic font-sans text-[11px]">
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
            <tr className={getRowClass(hasInputModalitiesDiff)}>
              <td className="p-4 font-semibold text-[var(--secondary-text)] md:sticky md:left-0 bg-[var(--surface)]">
                Input Modalities
              </td>
              {models.map((m) => (
                <td key={m.id} className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {m.inputModalities && m.inputModalities.length > 0 ? (
                      m.inputModalities.map((mod: string) => (
                        <Badge key={mod} variant="default" className="text-[10px] capitalize">
                          {mod}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-[var(--secondary-text)] italic text-[11px]">
                        Not provided
                      </span>
                    )}
                  </div>
                </td>
              ))}
              {models.length < maxLimit && (
                <td className="p-4 border-l border-[var(--border-color)]/50" />
              )}
            </tr>

            {/* Output Modalities */}
            <tr className={getRowClass(hasOutputModalitiesDiff)}>
              <td className="p-4 font-semibold text-[var(--secondary-text)] md:sticky md:left-0 bg-[var(--surface)]">
                Output Modalities
              </td>
              {models.map((m) => (
                <td key={m.id} className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {m.outputModalities && m.outputModalities.length > 0 ? (
                      m.outputModalities.map((mod: string) => (
                        <Badge key={mod} variant="default" className="text-[10px] capitalize">
                          {mod}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-[var(--secondary-text)] italic text-[11px]">
                        Not provided
                      </span>
                    )}
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
                  <td className="p-4 font-medium text-[var(--secondary-text)] md:sticky md:left-0 bg-[var(--surface)]">
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

            {allBenchmarks.map(([bSlug, bName]) => {
              // Convert each model's benchmark evaluation into canonical DTO if present
              const modelEvaluations = models.map((m) => {
                const raw = (m.benchmarks || []).find(
                  (bm: any) =>
                    bm.benchmarkSlug === bSlug ||
                    bm.benchmark?.slug === bSlug ||
                    (bm.benchmarkVersion?.benchmark && bm.benchmarkVersion.benchmark.slug === bSlug)
                );
                return raw ? toBenchmarkEvaluationDTO(raw) : null;
              });

              // Multi-dimensional comparability check (P0-03)
              let comparisonResult: any = null;
              let isComparable = true;
              let incompatibilityReason: string | null = null;

              if (models.length === 2 && modelEvaluations[0] && modelEvaluations[1]) {
                comparisonResult = compareBenchmarkEvaluations(
                  modelEvaluations[0],
                  modelEvaluations[1]
                );
                isComparable = comparisonResult.isComparable;
                incompatibilityReason = comparisonResult.incompatibilityReason;
              } else if (models.length > 2) {
                // If 3 models, check pairwise compatibility
                for (let i = 0; i < modelEvaluations.length; i++) {
                  for (let j = i + 1; j < modelEvaluations.length; j++) {
                    if (modelEvaluations[i] && modelEvaluations[j]) {
                      const res = compareBenchmarkEvaluations(
                        modelEvaluations[i],
                        modelEvaluations[j]
                      );
                      if (!res.isComparable) {
                        isComparable = false;
                        incompatibilityReason = res.incompatibilityReason;
                        break;
                      }
                    }
                  }
                  if (!isComparable) break;
                }
              }

              // Only highlight differences if results are strictly comparable
              const diff = isComparable
                ? isDiff((m) => {
                    const raw = (m.benchmarks || []).find(
                      (bm: any) =>
                        bm.benchmarkSlug === bSlug ||
                        bm.benchmark?.slug === bSlug ||
                        (bm.benchmarkVersion?.benchmark &&
                          bm.benchmarkVersion.benchmark.slug === bSlug)
                    );
                    return raw ? parseFloat(raw.score) : null;
                  })
                : false;

              return (
                <tr key={bSlug} className={getRowClass(diff)}>
                  <td className="p-4 font-medium text-[var(--secondary-text)] md:sticky md:left-0 bg-[var(--surface)]">
                    <div>
                      <span className="font-semibold text-[var(--primary-text)]">{bName}</span>
                      {!isComparable && incompatibilityReason && (
                        <span
                          title={incompatibilityReason}
                          className="ml-1.5 text-[10px] text-amber-500 font-normal inline-block bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20"
                        >
                          ⚠️ Incompatible: {incompatibilityReason}
                        </span>
                      )}
                    </div>
                  </td>
                  {models.map((m, idx) => {
                    const evalDto = modelEvaluations[idx];
                    const isWinner =
                      isComparable &&
                      comparisonResult?.canHighlightWinner &&
                      comparisonResult.winnerModelId === m.id;

                    return (
                      <td key={m.id} className="p-4 font-mono font-bold">
                        {evalDto ? (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={isWinner ? "text-[var(--accent)] font-extrabold" : ""}
                              >
                                {parseFloat(evalDto.score).toLocaleString()}{" "}
                                {evalDto.scoreUnit === "percentage" ? "%" : evalDto.scoreUnit}
                              </span>
                              {isWinner && (
                                <span className="text-[10px] bg-[var(--accent)]/10 text-[var(--accent)] px-1 py-0.5 rounded font-sans font-semibold">
                                  Top
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[var(--secondary-text)] font-sans font-normal mt-0.5 space-y-0.5">
                              {evalDto.benchmarkVersion && (
                                <span className="block">Protocol: {evalDto.benchmarkVersion}</span>
                              )}
                              {evalDto.datasetVersion && (
                                <span className="block">Dataset: {evalDto.datasetVersion}</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[var(--secondary-text)] font-normal italic text-[11px]">
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
