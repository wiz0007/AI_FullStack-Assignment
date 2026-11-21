import React from "react";
import Link from "next/link";
import { Sparkles, Cpu, Layers, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { formatCompactNumber, formatCurrency } from "@/lib/utils";

export interface ModelCardProps {
  model: {
    id: string;
    name: string;
    slug: string;
    modelIdentifier: string;
    description: string | null;
    modelType: string;
    contextWindow: number | null;
    releaseDate: string | Date | null;
    status: string;
    company: {
      id: string;
      name: string;
      slug: string;
      logoUrl?: string | null;
    };
    providers?: Array<{
      provider: {
        id: string;
        name: string;
        slug: string;
      };
      pricing?: Array<{
        inputPrice: string | number;
        outputPrice: string | number;
        currency: string;
        pricingUnit: string;
      }>;
    }>;
    capabilities?: Array<{
      capability: {
        id: string;
        name: string;
        slug: string;
      };
    }>;
  };
}

export function ModelCard({ model }: ModelCardProps) {
  // Extract primary pricing from first provider if available
  const primaryPricing = model.providers?.[0]?.pricing?.[0];
  const hasPricing =
    primaryPricing && primaryPricing.inputPrice !== undefined && primaryPricing.inputPrice !== null;

  // Format context window (e.g. 128k ctx, or Unavailable)
  const contextFormatted =
    model.contextWindow !== null && model.contextWindow !== undefined
      ? `${formatCompactNumber(model.contextWindow)} ctx`
      : "Context Unavailable";

  return (
    <Link
      href={`/models/${model.slug}`}
      className="group block h-full focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded-xl"
      aria-label={`View model details for ${model.name}`}
    >
      <Card className="h-full flex flex-col justify-between border-[var(--border-color)] bg-[var(--surface)] hover:border-[var(--accent)] transition-all duration-200">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[var(--accent)] tracking-wide uppercase">
              {model.company.name}
            </span>
            <Badge variant="outline" className="text-[10px] capitalize">
              {model.modelType}
            </Badge>
          </div>
          <CardTitle className="text-lg font-bold mt-1.5 text-[var(--primary-text)] group-hover:text-[var(--accent)] transition-colors">
            {model.name}
          </CardTitle>
          <CardDescription className="text-xs text-[var(--secondary-text)] line-clamp-2 mt-1">
            {model.description || "No description provided for this foundation model."}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 pt-0 space-y-3">
          {/* Metadata Specs Bar */}
          <div className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-[var(--secondary-surface)] text-[var(--secondary-text)]">
            <div className="flex items-center gap-1.5 font-mono">
              <Cpu className="w-3.5 h-3.5 text-[var(--accent)]" aria-hidden="true" />
              <span>{contextFormatted}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[var(--accent)]" aria-hidden="true" />
              {hasPricing ? (
                <span className="font-medium text-[var(--primary-text)]">
                  {formatCurrency(primaryPricing.inputPrice)} /{" "}
                  {formatCurrency(primaryPricing.outputPrice)}
                </span>
              ) : (
                <span className="italic text-[var(--secondary-text)]">Pricing Unavailable</span>
              )}
            </div>
          </div>

          {/* Capabilities Badges */}
          {model.capabilities && model.capabilities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {model.capabilities.slice(0, 4).map((c) => (
                <Badge key={c.capability.slug} variant="default" className="text-[10px]">
                  {c.capability.name}
                </Badge>
              ))}
              {model.capabilities.length > 4 && (
                <Badge variant="outline" className="text-[10px]">
                  +{model.capabilities.length - 4} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-5 pt-0 border-t border-[var(--border-color)]/50 mt-auto flex items-center justify-between text-xs text-[var(--secondary-text)]">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              {model.providers?.length || 0}{" "}
              {model.providers?.length === 1 ? "provider" : "providers"}
            </span>
          </div>
          <span className="text-[var(--accent)] font-medium group-hover:translate-x-0.5 transition-transform">
            Details &rarr;
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
