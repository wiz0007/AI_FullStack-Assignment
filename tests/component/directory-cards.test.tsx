import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CompanyCard } from "@/components/companies/company-card";
import { ProviderCard } from "@/components/providers/provider-card";

describe("Sprint 4: Directory Cards Components", () => {
  it("renders CompanyCard with organization info and recent models", () => {
    const sampleCompany = {
      id: "c-1",
      name: "Anthropic",
      slug: "anthropic",
      description: "AI safety and research company",
      websiteUrl: "https://anthropic.com",
      logoUrl: null,
      headquarters: "San Francisco, CA",
      modelCount: 3,
      recentModels: [
        {
          id: "m-1",
          name: "Claude 3.5 Sonnet",
          slug: "claude-3-5-sonnet",
          modelType: "multimodal",
          releaseDate: "2024-06-20",
        },
      ],
    };

    render(<CompanyCard company={sampleCompany} />);

    expect(screen.getByText("Anthropic")).toBeInTheDocument();
    expect(screen.getByText("San Francisco, CA")).toBeInTheDocument();
    expect(screen.getByText("3 models")).toBeInTheDocument();
    expect(screen.getByText("Claude 3.5 Sonnet")).toBeInTheDocument();
  });

  it("renders ProviderCard with infrastructure info and hosted models", () => {
    const sampleProvider = {
      id: "p-1",
      name: "Groq",
      slug: "groq",
      description: "Ultra-fast LPU inference engine",
      websiteUrl: "https://groq.com",
      logoUrl: null,
      modelCount: 4,
      sampleModels: [
        {
          id: "m-2",
          name: "Llama 3.3 70B",
          slug: "llama-3-3-70b",
          modelType: "language",
          availabilityStatus: "active",
        },
      ],
    };

    render(<ProviderCard provider={sampleProvider} />);

    expect(screen.getByText("Groq")).toBeInTheDocument();
    expect(screen.getByText("4 models")).toBeInTheDocument();
    expect(screen.getByText("Llama 3.3 70B")).toBeInTheDocument();
  });
});
