import React from "react";
import Link from "next/link";
import { Cpu, Layers, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { AddToComparisonButton } from "@/components/comparison/add-to-comparison-button";
import { formatCompactNumber, formatCurrency } from "@/lib/utils";
import { getRepresentativeModelPrice } from "@/lib/pricing";

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
  // Canonical representative pricing across all providers
  const primaryPricing = getRepresentativeModelPrice(model);
  const hasPricing = primaryPricing !== null;

  // Format context window (e.g. 128k ctx, or Unavailable)
  const contextFormatted =
    model.contextWindow !== null && model.contextWindow !== undefined
      ? `${formatCompactNumber(model.contextWindow)} ctx`
      : "Context Unavailable";

  return (
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
        <CardTitle className="text-lg font-bold mt-1.5 text-[var(--primary-text)]">
          <Link
            href={`/models/${model.slug}`}
            className="hover:text-[var(--accent)] transition-colors focus:outline-none focus:underline"
            aria-label={`View model details for ${model.name}`}
          >
            {model.name}
          </Link>
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
                {formatCurrency(primaryPricing.inputPrice)}
                {primaryPricing.outputPrice
                  ? ` / ${formatCurrency(primaryPricing.outputPrice)}`
                  : ""}
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

      <CardFooter className="p-5 pt-3 border-t border-[var(--border-color)]/50 mt-auto flex items-center justify-between gap-2 text-xs text-[var(--secondary-text)]">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" aria-hidden="true" />
          <span>
            {model.providers?.length || 0}{" "}
            {model.providers?.length === 1 ? "provider" : "providers"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <AddToComparisonButton modelId={model.slug} modelName={model.name} size="sm" />
          <Link
            href={`/models/${model.slug}`}
            className="text-[var(--accent)] font-medium hover:underline flex items-center gap-0.5 text-xs"
          >
            Details &rarr;
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
