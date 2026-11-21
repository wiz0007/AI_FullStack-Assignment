import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ComparisonTable } from "@/components/comparison/comparison-table";

describe("ComparisonTable Component (Sprint 3)", () => {
  const sampleModels = [
    {
      id: "m-1",
      name: "GPT-4o",
      slug: "gpt-4o",
      modelIdentifier: "openai/gpt-4o",
      modelType: "multimodal",
      contextWindow: 128000,
      company: { id: "c-1", name: "OpenAI" },
      providers: [
        {
          provider: { name: "OpenAI Direct" },
          pricing: [{ inputPrice: "2.500000", outputPrice: "10.000000" }],
        },
      ],
      capabilities: [{ capability: { slug: "vision", name: "Vision" } }],
      benchmarks: [
        { benchmark: { slug: "mmlu", name: "MMLU" }, score: "88.7", scoreUnit: "percentage" },
      ],
    },
    {
      id: "m-2",
      name: "Claude 3.5 Sonnet",
      slug: "claude-3-5-sonnet",
      modelIdentifier: "anthropic/claude-3-5-sonnet",
      modelType: "multimodal",
      contextWindow: 200000,
      company: { id: "c-2", name: "Anthropic" },
      providers: [
        {
          provider: { name: "Anthropic Direct" },
          pricing: [{ inputPrice: "3.000000", outputPrice: "15.000000" }],
        },
      ],
      capabilities: [{ capability: { slug: "vision", name: "Vision" } }],
      benchmarks: [
        { benchmark: { slug: "mmlu", name: "MMLU" }, score: "88.7", scoreUnit: "percentage" },
      ],
    },
  ];

  it("should render comparison headers and model names", () => {
    const handleRemove = vi.fn();
    render(<ComparisonTable models={sampleModels} onRemoveModel={handleRemove} maxLimit={3} />);

    expect(screen.getByText("GPT-4o")).toBeDefined();
    expect(screen.getByText("Claude 3.5 Sonnet")).toBeDefined();
    expect(screen.getByText("Specification")).toBeDefined();
  });

  it("should display context windows and pricing correctly", () => {
    const handleRemove = vi.fn();
    render(<ComparisonTable models={sampleModels} onRemoveModel={handleRemove} maxLimit={3} />);

    expect(screen.getByText("128K tokens")).toBeDefined();
    expect(screen.getByText("200K tokens")).toBeDefined();
    expect(screen.getByText("$2.50")).toBeDefined();
    expect(screen.getByText("$3.00")).toBeDefined();
  });

  it("should call onRemoveModel when remove button is clicked", () => {
    const handleRemove = vi.fn();
    render(<ComparisonTable models={sampleModels} onRemoveModel={handleRemove} maxLimit={3} />);

    const removeButtons = screen.getAllByRole("button", { name: /Remove .* from comparison/ });
    expect(removeButtons.length).toBe(2);

    fireEvent.click(removeButtons[0]);
    expect(handleRemove).toHaveBeenCalledWith("gpt-4o");
  });

  it("should render empty slot placeholder when fewer than maxLimit models are loaded", () => {
    const handleRemove = vi.fn();
    render(<ComparisonTable models={sampleModels} onRemoveModel={handleRemove} maxLimit={3} />);

    expect(screen.getByText("Add Model (2/3)")).toBeDefined();
  });
});
