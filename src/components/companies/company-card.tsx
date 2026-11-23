"use client";

import React from "react";
import Link from "next/link";
import { Building2, MapPin, ExternalLink, Sparkles, Layers } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface CompanyCardProps {
  company: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    websiteUrl: string | null;
    logoUrl: string | null;
    headquarters: string | null;
    modelCount: number;
    recentModels: {
      id: string;
      name: string;
      slug: string;
      modelType: string;
      releaseDate: string | null;
    }[];
  };
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Card className="flex flex-col justify-between hover:border-[var(--accent)]/50 transition-all duration-200 group">
      <div>
        <CardHeader className="p-5 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--secondary-surface)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent)] shrink-0 font-bold text-sm">
                {company.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <Link
                  href={`/companies/${company.slug}`}
                  className="font-bold text-base text-[var(--primary-text)] hover:text-[var(--accent)] transition-colors group-hover:text-[var(--accent)]"
                >
                  {company.name}
                </Link>
                {company.headquarters && (
                  <div className="flex items-center gap-1 text-[11px] text-[var(--secondary-text)] mt-0.5">
                    <MapPin className="w-3 h-3" />
                    <span>{company.headquarters}</span>
                  </div>
                )}
              </div>
            </div>

            <Badge variant="outline" className="text-[11px] font-mono shrink-0">
              {company.modelCount} {company.modelCount === 1 ? "model" : "models"}
            </Badge>
          </div>

          <CardDescription className="text-xs text-[var(--secondary-text)] line-clamp-2 mt-3 leading-relaxed">
            {company.description || "Leading artificial intelligence research organization."}
          </CardDescription>
        </CardHeader>

        {/* Recent Models Chips */}
        {company.recentModels && company.recentModels.length > 0 && (
          <CardContent className="px-5 py-3 border-t border-[var(--border-color)]/50">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--secondary-text)] block mb-1.5">
              Featured Models
            </span>
            <div className="flex flex-wrap gap-1.5">
              {company.recentModels.slice(0, 4).map((m) => (
                <Link
                  key={m.id}
                  href={`/models/${m.slug}`}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--secondary-surface)] text-[var(--primary-text)] hover:text-[var(--accent)] hover:border-[var(--accent)] border border-[var(--border-color)] transition-colors"
                >
                  {m.name}
                </Link>
              ))}
            </div>
          </CardContent>
        )}
      </div>

      <div className="p-4 px-5 border-t border-[var(--border-color)] bg-[var(--secondary-surface)]/30 rounded-b-xl flex items-center justify-between">
        <Link
          href={`/companies/${company.slug}`}
          className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
        >
          View Profile & Models &rarr;
        </Link>

        {company.websiteUrl && (
          <a
            href={company.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-[var(--secondary-text)] hover:text-[var(--primary-text)] inline-flex items-center gap-1 transition-colors"
          >
            Website
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </Card>
  );
}
