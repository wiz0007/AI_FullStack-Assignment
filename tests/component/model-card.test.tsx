import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ModelCard } from "@/components/discovery/model-card";

describe("ModelCard Component Tests (Sprint 2)", () => {
  const completeModel = {
    id: "m-1",
    name: "GPT-4o",
    slug: "gpt-4o",
    modelIdentifier: "openai/gpt-4o",
    description: "Omni model for reasoning and multimodal tasks",
    modelType: "multimodal",
    contextWindow: 128000,
    releaseDate: new Date("2024-05-13"),
    status: "active",
    company: { id: "c-1", name: "OpenAI", slug: "openai" },
    providers: [
      {
        provider: { id: "p-1", name: "OpenAI Direct", slug: "openai-direct" },
        pricing: [
          {
            inputPrice: "2.500000",
            outputPrice: "10.000000",
            currency: "USD",
            pricingUnit: "1M_TOKENS",
          },
        ],
      },
    ],
    capabilities: [
      { capability: { id: "cap-1", name: "Vision", slug: "vision" } },
      { capability: { id: "cap-2", name: "Reasoning", slug: "reasoning" } },
    ],
  };

  it("renders model name, company, and capabilities", () => {
    render(<ModelCard model={completeModel} />);
    expect(screen.getByText("GPT-4o")).toBeInTheDocument();
    expect(screen.getByText("OpenAI")).toBeInTheDocument();
    expect(screen.getByText("Vision")).toBeInTheDocument();
    expect(screen.getByText("Reasoning")).toBeInTheDocument();
  });

  it("formats context window and pricing with proper units", () => {
    render(<ModelCard model={completeModel} />);
    expect(screen.getByText(/128K ctx/i)).toBeInTheDocument();
    expect(screen.getByText(/\$2\.50/i)).toBeInTheDocument();
  });

  it("handles missing pricing and missing context window gracefully (E07, E08)", () => {
    const missingMetadataModel = {
      ...completeModel,
      contextWindow: null,
      providers: [],
    };
    render(<ModelCard model={missingMetadataModel} />);

    // Must never show $0.00 or 0 ctx for missing values!
    expect(screen.getByText("Context Unavailable")).toBeInTheDocument();
    expect(screen.getByText("Pricing Unavailable")).toBeInTheDocument();
    expect(screen.queryByText("$0.00")).not.toBeInTheDocument();
    expect(screen.queryByText("0 ctx")).not.toBeInTheDocument();
  });

  it("has accessible navigation link to model detail route (Section 6.2)", () => {
    render(<ModelCard model={completeModel} />);
    const link = screen.getByRole("link", { name: /view model details for gpt-4o/i });
    expect(link).toHaveAttribute("href", "/models/gpt-4o");
  });
});
