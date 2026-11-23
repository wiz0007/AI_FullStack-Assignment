"use client";

import React from "react";
import Link from "next/link";
import { Trophy, Medal, Award, ArrowUpRight, ArrowDown, ArrowUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddToComparisonButton } from "@/components/comparison/add-to-comparison-button";

export interface RankingItem {
  rank: number;
  score: string;
  scoreUnit?: string | null;
  datasetVersion?: string | null;
  evaluationDate?: string | null;
  source?: string | null;
  model: {
    id: string;
    name: string;
    slug: string;
    modelType: string;
    company: {
      name: string;
      slug: string;
    };
  };
}

export interface LeaderboardTableProps {
  rankings: RankingItem[];
  scoreDirection: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER";
  benchmarkName: string;
  benchmarkUnit?: string | null;
}

export function LeaderboardTable({
  rankings,
  scoreDirection,
  benchmarkName,
  benchmarkUnit,
}: LeaderboardTableProps) {
  if (rankings.length === 0) {
    return (
      <div className="p-8 text-center border border-[var(--border-color)] rounded-xl bg-[var(--surface)]">
        <p className="text-sm font-medium text-[var(--primary-text)]">
          No model evaluations found for this benchmark.
        </p>
        <p className="text-xs text-[var(--secondary-text)] mt-1">
          Select another benchmark or check back as new evaluations are published.
        </p>
      </div>
    );
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center text-xs">
            <Trophy className="w-3.5 h-3.5" />
          </span>
        );
      case 2:
        return (
          <span className="w-7 h-7 rounded-full bg-slate-300/20 border border-slate-400/30 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center text-xs">
            <Medal className="w-3.5 h-3.5" />
          </span>
        );
      case 3:
        return (
          <span className="w-7 h-7 rounded-full bg-amber-700/15 border border-amber-700/30 text-amber-700 dark:text-amber-500 font-bold flex items-center justify-center text-xs">
            <Award className="w-3.5 h-3.5" />
          </span>
        );
      default:
        return (
          <span className="w-7 h-7 rounded-full bg-[var(--secondary-surface)] text-[var(--secondary-text)] font-mono font-semibold flex items-center justify-center text-xs">
            #{rank}
          </span>
        );
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--surface)] shadow-sm">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-[var(--secondary-surface)] text-[var(--secondary-text)] uppercase tracking-wider border-b border-[var(--border-color)]">
          <tr>
            <th className="p-4 w-16 text-center">Rank</th>
            <th className="p-4">Model & Creator</th>
            <th className="p-4">Type</th>
            <th className="p-4">
              <div className="flex items-center gap-1">
                <span>Score</span>
                {scoreDirection === "HIGHER_IS_BETTER" ? (
                  <span
                    title="Higher is better"
                    className="inline-flex items-center text-[10px] lowercase font-normal text-emerald-500"
                  >
                    <ArrowUp className="w-3 h-3" />
                    high
                  </span>
                ) : (
                  <span
                    title="Lower is better"
                    className="inline-flex items-center text-[10px] lowercase font-normal text-blue-500"
                  >
                    <ArrowDown className="w-3 h-3" />
                    low
                  </span>
                )}
              </div>
            </th>
            <th className="p-4">Dataset Version</th>
            <th className="p-4">Evaluation Date</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-color)] text-[var(--primary-text)]">
          {rankings.map((item) => {
            const formattedScore = parseFloat(item.score).toLocaleString();
            const unitLabel =
              item.scoreUnit === "percentage" || benchmarkUnit === "percentage"
                ? "%"
                : item.scoreUnit || "";

            return (
              <tr
                key={`${item.model.id}-${item.rank}`}
                className="hover:bg-[var(--secondary-surface)]/50 transition-colors"
              >
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center">{getRankBadge(item.rank)}</div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <Link
                      href={`/models/${item.model.slug}`}
                      className="font-bold text-sm text-[var(--primary-text)] hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1 group"
                    >
                      {item.model.name}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <Link
                      href={`/companies/${item.model.company.slug}`}
                      className="text-[11px] text-[var(--secondary-text)] hover:underline mt-0.5"
                    >
                      {item.model.company.name}
                    </Link>
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant="outline" className="capitalize text-[10px]">
                    {item.model.modelType}
                  </Badge>
                </td>
                <td className="p-4">
                  <span className="font-mono font-extrabold text-sm text-[var(--accent)]">
                    {formattedScore}
                    {unitLabel && <span className="text-xs font-normal ml-0.5">{unitLabel}</span>}
                  </span>
                </td>
                <td className="p-4 font-mono text-[11px] text-[var(--secondary-text)]">
                  {item.datasetVersion || "Standard"}
                </td>
                <td className="p-4 font-mono text-[11px] text-[var(--secondary-text)]">
                  {item.evaluationDate
                    ? new Date(item.evaluationDate).toLocaleDateString()
                    : "Verified"}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <AddToComparisonButton
                      modelId={item.model.slug}
                      modelName={item.model.name}
                      size="sm"
                      variant="outline"
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
