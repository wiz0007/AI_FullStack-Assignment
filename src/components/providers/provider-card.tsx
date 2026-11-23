"use client";

import React from "react";
import Link from "next/link";
import { Server, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface ProviderCardProps {
  provider: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    websiteUrl: string | null;
    logoUrl: string | null;
    modelCount: number;
    sampleModels: {
      id: string;
      name: string;
      slug: string;
      modelType: string;
      availabilityStatus: string;
    }[];
  };
}

export function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <Card className="flex flex-col justify-between hover:border-[var(--accent)]/50 transition-all duration-200 group">
      <div>
        <CardHeader className="p-5 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--secondary-surface)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent)] shrink-0 font-bold text-sm">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <Link
                  href={`/providers/${provider.slug}`}
                  className="font-bold text-base text-[var(--primary-text)] hover:text-[var(--accent)] transition-colors group-hover:text-[var(--accent)]"
                >
                  {provider.name}
                </Link>
                <div className="text-[11px] text-[var(--secondary-text)] mt-0.5">
                  Cloud Infrastructure
                </div>
              </div>
            </div>

            <Badge variant="outline" className="text-[11px] font-mono shrink-0">
              {provider.modelCount} {provider.modelCount === 1 ? "model" : "models"}
            </Badge>
          </div>

          <CardDescription className="text-xs text-[var(--secondary-text)] line-clamp-2 mt-3 leading-relaxed">
            {provider.description ||
              "Cloud inference provider hosting optimized foundation model endpoints."}
          </CardDescription>
        </CardHeader>

        {/* Sample Models */}
        {provider.sampleModels && provider.sampleModels.length > 0 && (
          <CardContent className="px-5 py-3 border-t border-[var(--border-color)]/50">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--secondary-text)] block mb-1.5">
              Hosted Models
            </span>
            <div className="flex flex-wrap gap-1.5">
              {provider.sampleModels.slice(0, 4).map((m) => (
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
          href={`/providers/${provider.slug}`}
          className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
        >
          View Endpoints & Pricing &rarr;
        </Link>

        {provider.websiteUrl && (
          <a
            href={provider.websiteUrl}
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
