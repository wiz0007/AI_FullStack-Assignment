import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Server, ExternalLink, Cpu, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddToComparisonButton } from "@/components/comparison/add-to-comparison-button";
import { providerService } from "@/server/services/provider.service";
import { formatCurrency } from "@/lib/utils";

interface ProviderDetailPageProps {
  params: {
    slug: string;
  };
}

export default async function ProviderDetailPage({ params }: ProviderDetailPageProps) {
  let provider: any = null;
  try {
    provider = await providerService.getProviderBySlug(params.slug);
  } catch (err) {
    notFound();
  }

  if (!provider) {
    notFound();
  }

  return (
    <Container className="py-12 space-y-8">
      {/* Navigation */}
      <div>
        <Link href="/providers">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-[var(--secondary-text)]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Providers Directory
          </Button>
        </Link>
      </div>

      {/* Hero Header */}
      <div className="space-y-4 pb-8 border-b border-[var(--border-color)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--secondary-surface)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent)] font-bold text-xl">
              <Server className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--primary-text)]">
                  {provider.name}
                </h1>
                <Badge variant="accent" className="text-xs">
                  {provider.models.length}{" "}
                  {provider.models.length === 1 ? "Hosted Model" : "Hosted Models"}
                </Badge>
              </div>
              <div className="text-xs text-[var(--secondary-text)] mt-1">
                Cloud Inference & Hosted Endpoints Platform
              </div>
            </div>
          </div>

          {provider.websiteUrl && (
            <a
              href={provider.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--secondary-surface)] hover:bg-[var(--accent)] hover:text-white border border-[var(--border-color)] text-[var(--primary-text)] transition-colors"
            >
              <span>Visit Provider Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <p className="text-sm text-[var(--secondary-text)] max-w-3xl leading-relaxed mt-2">
          {provider.description ||
            "Cloud infrastructure and inference provider offering optimized endpoints and API access for foundation models."}
        </p>
      </div>

      {/* Hosted Models & Pricing Table */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--primary-text)]">
            Hosted Models & Inference Pricing
          </h2>
          <p className="text-xs text-[var(--secondary-text)] mt-0.5">
            Real-time pricing per 1M tokens and verified availability for endpoints hosted by{" "}
            {provider.name}.
          </p>
        </div>

        {provider.models.length === 0 ? (
          <div className="p-8 text-center border border-[var(--border-color)] rounded-xl bg-[var(--surface)]">
            <p className="text-sm font-medium text-[var(--primary-text)]">
              No models currently registered under {provider.name}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--surface)] shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[var(--secondary-surface)] text-[var(--secondary-text)] uppercase tracking-wider border-b border-[var(--border-color)]">
                <tr>
                  <th className="p-4">Model & Creator</th>
                  <th className="p-4">Endpoint Identifier</th>
                  <th className="p-4">Input / 1M Tokens</th>
                  <th className="p-4">Output / 1M Tokens</th>
                  <th className="p-4">Effective Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--primary-text)]">
                {provider.models.map((item: any) => (
                  <tr
                    key={item.modelId}
                    className="hover:bg-[var(--secondary-surface)]/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex flex-col">
                        <Link
                          href={`/models/${item.slug}`}
                          className="font-bold text-sm text-[var(--primary-text)] hover:text-[var(--accent)] transition-colors"
                        >
                          {item.name}
                        </Link>
                        {item.company?.slug ? (
                          <Link
                            href={`/companies/${item.company.slug}`}
                            className="text-[11px] text-[var(--secondary-text)] hover:underline mt-0.5"
                          >
                            {item.company.name}
                          </Link>
                        ) : (
                          <span className="text-[11px] text-[var(--secondary-text)]">
                            {item.company?.name || "AI Lab"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-[var(--secondary-text)]">
                      {item.providerModelIdentifier}
                    </td>
                    <td className="p-4 font-mono font-bold text-[var(--accent)]">
                      {item.pricing?.inputPrice
                        ? formatCurrency(item.pricing.inputPrice)
                        : "Unavailable"}
                    </td>
                    <td className="p-4 font-mono font-bold text-[var(--accent)]">
                      {item.pricing?.outputPrice
                        ? formatCurrency(item.pricing.outputPrice)
                        : "Unavailable"}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-[var(--secondary-text)]">
                      {item.pricing?.effectiveFrom
                        ? new Date(item.pricing.effectiveFrom).toLocaleDateString()
                        : "Current"}
                    </td>
                    <td className="p-4">
                      <Badge variant="success" className="capitalize text-[10px]">
                        {item.availabilityStatus || "Available"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <AddToComparisonButton
                          modelId={item.slug}
                          modelName={item.name}
                          size="sm"
                          variant="outline"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Container>
  );
}
