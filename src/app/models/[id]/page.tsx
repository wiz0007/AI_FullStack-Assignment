import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Cpu, Layers, DollarSign, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddToComparisonButton } from "@/components/comparison/add-to-comparison-button";
import { modelService } from "@/server/services/model.service";
import { formatCompactNumber, formatCurrency } from "@/lib/utils";

interface ModelDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ModelDetailPage({ params }: ModelDetailPageProps) {
  let model: any = null;
  try {
    model = await modelService.getModelBySlugOrId(params.id);
  } catch (err) {
    notFound();
  }

  if (!model) {
    notFound();
  }

  const primaryPricing = model.providers?.[0]?.pricing?.[0];

  return (
    <Container className="py-12 space-y-8">
      {/* Back button and actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/models">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-[var(--secondary-text)]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Model Catalogue
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <AddToComparisonButton
            modelId={model.slug}
            modelName={model.name}
            variant="outline"
            size="sm"
          />
        </div>
      </div>

      {/* Hero Header */}
      <div className="space-y-4 pb-6 border-b border-[var(--border-color)]">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">{model.company.name}</Badge>
          <Badge variant="outline" className="capitalize">
            {model.modelType}
          </Badge>
          <span className="text-xs font-mono text-[var(--secondary-text)]">
            {model.modelIdentifier}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[var(--primary-text)]">
            {model.name}
          </h1>
          <AddToComparisonButton
            modelId={model.slug}
            modelName={model.name}
            variant="primary"
            size="md"
          />
        </div>

        <p className="text-base text-[var(--secondary-text)] max-w-3xl leading-relaxed">
          {model.description || "No description provided for this foundation model."}
        </p>

        {/* Specs Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface)]">
            <div className="text-xs text-[var(--secondary-text)] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[var(--accent)]" />
              Context Window
            </div>
            <div className="text-lg font-bold text-[var(--primary-text)] mt-1 font-mono">
              {model.contextWindow
                ? `${formatCompactNumber(model.contextWindow)} tokens`
                : "Unavailable"}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface)]">
            <div className="text-xs text-[var(--secondary-text)] flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[var(--accent)]" />
              Input Price (1M)
            </div>
            <div className="text-lg font-bold text-[var(--primary-text)] mt-1">
              {primaryPricing?.inputPrice
                ? formatCurrency(primaryPricing.inputPrice)
                : "Unavailable"}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface)]">
            <div className="text-xs text-[var(--secondary-text)] flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[var(--accent)]" />
              Output Price (1M)
            </div>
            <div className="text-lg font-bold text-[var(--primary-text)] mt-1">
              {primaryPricing?.outputPrice
                ? formatCurrency(primaryPricing.outputPrice)
                : "Unavailable"}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface)]">
            <div className="text-xs text-[var(--secondary-text)] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[var(--accent)]" />
              Hosting Providers
            </div>
            <div className="text-lg font-bold text-[var(--primary-text)] mt-1">
              {model.providers?.length || 0} Available
            </div>
          </div>
        </div>
      </div>

      {/* Available Providers Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--primary-text)]">
          Infrastructure Providers & Pricing
        </h2>
        {model.providers && model.providers.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--surface)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--secondary-surface)] text-[var(--secondary-text)] uppercase tracking-wider border-b border-[var(--border-color)]">
                <tr>
                  <th className="p-4">Provider</th>
                  <th className="p-4">Input / 1M Tokens</th>
                  <th className="p-4">Output / 1M Tokens</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--primary-text)]">
                {model.providers.map((mp: any) => {
                  const pricing = mp.pricing?.[0];
                  return (
                    <tr
                      key={mp.id}
                      className="hover:bg-[var(--secondary-surface)]/50 transition-colors"
                    >
                      <td className="p-4 font-semibold">{mp.provider.name}</td>
                      <td className="p-4 font-mono">
                        {pricing?.inputPrice ? formatCurrency(pricing.inputPrice) : "Unavailable"}
                      </td>
                      <td className="p-4 font-mono">
                        {pricing?.outputPrice ? formatCurrency(pricing.outputPrice) : "Unavailable"}
                      </td>
                      <td className="p-4">
                        <Badge variant="success" className="capitalize">
                          {mp.availabilityStatus || "Available"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-[var(--secondary-text)]">
            No provider mappings currently registered for this model.
          </p>
        )}
      </div>

      {/* Capabilities */}
      {model.capabilities && model.capabilities.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
          <h2 className="text-xl font-bold text-[var(--primary-text)]">Supported Capabilities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {model.capabilities.map((c: any) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-[var(--primary-text)]">
                    {c.capability.name}
                  </h3>
                  <p className="text-xs text-[var(--secondary-text)] mt-0.5">
                    {c.capability.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}
