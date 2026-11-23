import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, MapPin, ExternalLink, Calendar, Cpu, Layers } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AddToComparisonButton } from "@/components/comparison/add-to-comparison-button";
import { companyService } from "@/server/services/company.service";
import { formatCompactNumber, formatCurrency } from "@/lib/utils";
import { NotFoundError } from "@/lib/errors";

interface CompanyDetailPageProps {
  params: {
    slug: string;
  };
}

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  let company: any = null;
  try {
    company = await companyService.getCompanyBySlug(params.slug);
  } catch (err: any) {
    if (err instanceof NotFoundError || err?.statusCode === 404 || err?.name === "NotFoundError") {
      notFound();
    }
    throw err;
  }

  if (!company) {
    notFound();
  }

  return (
    <Container className="py-12 space-y-8">
      {/* Navigation & Breadcrumbs */}
      <div>
        <Link href="/companies">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-[var(--secondary-text)]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Companies Directory
          </Button>
        </Link>
      </div>

      {/* Hero Header */}
      <div className="space-y-4 pb-8 border-b border-[var(--border-color)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--secondary-surface)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent)] font-bold text-xl">
              {company.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--primary-text)]">
                  {company.name}
                </h1>
                <Badge variant="accent" className="text-xs">
                  {company.models.length} {company.models.length === 1 ? "Model" : "Models"}
                </Badge>
              </div>
              {company.headquarters && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--secondary-text)] mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{company.headquarters}</span>
                </div>
              )}
            </div>
          </div>

          {company.websiteUrl && (
            <a
              href={company.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--secondary-surface)] hover:bg-[var(--accent)] hover:text-white border border-[var(--border-color)] text-[var(--primary-text)] transition-colors"
            >
              <span>Visit Official Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <p className="text-sm text-[var(--secondary-text)] max-w-3xl leading-relaxed mt-2">
          {company.description ||
            "Pioneering artificial intelligence research organization developing cutting-edge foundation models."}
        </p>
      </div>

      {/* Models Produced */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--primary-text)]">
              Foundation Models & Releases
            </h2>
            <p className="text-xs text-[var(--secondary-text)] mt-0.5">
              Multimodal and language models engineered by {company.name}.
            </p>
          </div>
        </div>

        {company.models.length === 0 ? (
          <div className="p-8 text-center border border-[var(--border-color)] rounded-xl bg-[var(--surface)]">
            <p className="text-sm font-medium text-[var(--primary-text)]">
              No models currently catalogued for {company.name}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {company.models.map((model: any) => (
              <Card
                key={model.id}
                className="flex flex-col justify-between hover:border-[var(--accent)]/50 transition-all duration-200"
              >
                <div>
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="capitalize text-[10px]">
                        {model.modelType}
                      </Badge>
                      <span className="text-[10px] font-mono text-[var(--secondary-text)]">
                        {model.releaseDate
                          ? new Date(model.releaseDate).toLocaleDateString()
                          : "Active"}
                      </span>
                    </div>

                    <Link
                      href={`/models/${model.slug}`}
                      className="font-bold text-lg text-[var(--primary-text)] hover:text-[var(--accent)] transition-colors block mt-2"
                    >
                      {model.name}
                    </Link>
                  </CardHeader>

                  <CardContent className="px-5 py-2 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-[var(--secondary-surface)]">
                        <span className="text-[10px] text-[var(--secondary-text)] block">
                          Context
                        </span>
                        <span className="font-mono font-bold text-[var(--primary-text)]">
                          {model.contextWindow
                            ? `${formatCompactNumber(model.contextWindow)}`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[var(--secondary-surface)]">
                        <span className="text-[10px] text-[var(--secondary-text)] block">
                          Input / 1M
                        </span>
                        <span className="font-mono font-bold text-[var(--primary-text)]">
                          {model.pricing?.inputPrice
                            ? formatCurrency(model.pricing.inputPrice)
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    {model.capabilities && model.capabilities.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {model.capabilities.slice(0, 3).map((c: any) => (
                          <span
                            key={c.id}
                            className="text-[10px] px-2 py-0.5 rounded bg-[var(--secondary-surface)] text-[var(--secondary-text)]"
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </div>

                <div className="p-4 px-5 border-t border-[var(--border-color)] bg-[var(--secondary-surface)]/30 rounded-b-xl flex items-center justify-between">
                  <Link
                    href={`/models/${model.slug}`}
                    className="text-xs font-semibold text-[var(--accent)] hover:underline"
                  >
                    View Details &rarr;
                  </Link>

                  <AddToComparisonButton
                    modelId={model.slug}
                    modelName={model.name}
                    size="sm"
                    variant="outline"
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
