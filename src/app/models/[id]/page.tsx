import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Cpu,
  Layers,
  DollarSign,
  CheckCircle2,
  Trophy,
  Calendar,
  Building2,
  ExternalLink,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddToComparisonButton } from "@/components/comparison/add-to-comparison-button";
import { modelService } from "@/server/services/model.service";
import { formatCompactNumber, formatCurrency } from "@/lib/utils";
import { getRepresentativeModelPrice, getActiveProviderPricing } from "@/lib/pricing";
import { NotFoundError } from "@/lib/errors";

interface ModelDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ModelDetailPage({ params }: ModelDetailPageProps) {
  let model: any = null;
  try {
    model = await modelService.getModelBySlugOrId(params.id);
  } catch (err: any) {
    if (err instanceof NotFoundError || err?.statusCode === 404 || err?.name === "NotFoundError") {
      notFound();
    }
    throw err;
  }

  if (!model) {
    notFound();
  }

  const primaryPricing = getRepresentativeModelPrice(model);

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
          <Link href={`/companies/${model.company.slug}`}>
            <Badge variant="accent" className="hover:opacity-80 transition-opacity cursor-pointer">
              {model.company.name}
            </Badge>
          </Link>
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

        {/* Modalities Section (Workstream E1) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--border-color)]">
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--secondary-text)]">
              Input Modalities
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(model.inputModalities && model.inputModalities.length > 0
                ? model.inputModalities
                : ["text"]
              ).map((mod: string) => (
                <Badge key={mod} variant="default" className="text-xs capitalize">
                  {mod}
                </Badge>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--secondary-text)]">
              Output Modalities
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(model.outputModalities && model.outputModalities.length > 0
                ? model.outputModalities
                : ["text"]
              ).map((mod: string) => (
                <Badge key={mod} variant="default" className="text-xs capitalize">
                  {mod}
                </Badge>
              ))}
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
                  <th className="p-4">Effective Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--primary-text)]">
                {model.providers.map((mp: any) => {
                  const pricing = getActiveProviderPricing(mp);
                  const isAvailable =
                    mp.availabilityStatus === "active" || mp.availabilityStatus === "available";
                  return (
                    <tr
                      key={mp.id}
                      className="hover:bg-[var(--secondary-surface)]/50 transition-colors"
                    >
                      <td className="p-4 font-semibold">
                        <Link
                          href={`/providers/${mp.provider.slug}`}
                          className="hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1"
                        >
                          {mp.provider.name}
                        </Link>
                      </td>
                      <td className="p-4 font-mono">
                        {pricing?.inputPrice
                          ? formatCurrency(pricing.inputPrice.toString())
                          : "Unavailable"}
                      </td>
                      <td className="p-4 font-mono">
                        {pricing?.outputPrice
                          ? formatCurrency(pricing.outputPrice.toString())
                          : "Unavailable"}
                      </td>
                      <td className="p-4 text-[var(--secondary-text)] font-mono text-[11px]">
                        {pricing?.effectiveFrom
                          ? new Date(pricing.effectiveFrom).toLocaleDateString()
                          : "Current"}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={isAvailable ? "success" : "outline"}
                          className="capitalize text-[10px]"
                        >
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

      {/* Benchmark Evaluations */}
      <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--primary-text)] flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[var(--accent)]" />
            Benchmark Evaluations & Leaderboards
          </h2>
          <Link
            href="/rankings"
            className="text-xs text-[var(--accent)] hover:underline font-medium"
          >
            View Full Rankings &rarr;
          </Link>
        </div>

        {model.benchmarks && model.benchmarks.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--surface)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--secondary-surface)] text-[var(--secondary-text)] uppercase tracking-wider border-b border-[var(--border-color)]">
                <tr>
                  <th className="p-4">Benchmark</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Dataset Version</th>
                  <th className="p-4">Evaluation Date</th>
                  <th className="p-4">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--primary-text)]">
                {model.benchmarks.map((bm: any) => {
                  const bSlug = bm.benchmarkSlug || bm.benchmark?.slug;
                  const bName = bm.benchmarkName || bm.benchmark?.name || "Benchmark";
                  const bCategory = bm.benchmarkCategory || bm.benchmark?.category || "general";
                  const bVersion = bm.benchmarkVersion || "default";

                  return (
                    <tr
                      key={bm.id}
                      className="hover:bg-[var(--secondary-surface)]/50 transition-colors"
                    >
                      <td className="p-4 font-semibold">
                        <Link
                          href={`/rankings?benchmark=${bSlug}&benchmarkVersion=${encodeURIComponent(bVersion)}`}
                          className="hover:text-[var(--accent)] transition-colors"
                        >
                          {bName}
                        </Link>
                        <span className="text-[10px] text-[var(--secondary-text)] block font-mono font-normal">
                          Protocol: {bVersion}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {bCategory}
                        </Badge>
                      </td>
                      <td className="p-4 font-mono font-bold text-sm text-[var(--accent)]">
                        {parseFloat(bm.score).toLocaleString()}{" "}
                        {bm.scoreUnit === "percentage" ? "%" : bm.scoreUnit || ""}
                      </td>
                      <td className="p-4 text-[var(--secondary-text)] font-mono text-[11px]">
                        {bm.datasetVersion || "Not specified"}
                      </td>
                      <td className="p-4 text-[var(--secondary-text)] font-mono text-[11px]">
                        {bm.evaluationDate
                          ? new Date(bm.evaluationDate).toLocaleDateString()
                          : "Not provided"}
                      </td>
                      <td className="p-4 text-[var(--secondary-text)] text-[11px]">
                        <div className="flex flex-col gap-1">
                          <span>
                            {bm.source ? (
                              bm.source.startsWith("http") ? (
                                <a
                                  href={bm.source}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline text-[var(--accent)]"
                                >
                                  {bm.evaluator || "Evaluation Source"} ↗
                                </a>
                              ) : (
                                bm.source
                              )
                            ) : (
                              "Not provided"
                            )}
                          </span>
                          {bm.dataClassification && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold w-fit bg-[var(--secondary-surface)] border border-[var(--border-color)] text-[var(--secondary-text)]">
                              {bm.dataClassification}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-[var(--secondary-text)]">
            No standardized benchmark results registered yet for this model.
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
