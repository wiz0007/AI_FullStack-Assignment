import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActiveFilters } from "@/components/discovery/active-filters";

describe("ActiveFilters Component Tests (Sprint 2)", () => {
  const mockMetadata = {
    providers: [{ id: "p-1", name: "OpenAI Direct", slug: "openai-direct", count: 2 }],
    categories: ["chat", "multimodal"],
    capabilities: [
      { id: "c-1", name: "Vision Analysis", slug: "vision", category: "vision", count: 2 },
    ],
    ranges: { minContextWindow: 0, maxContextWindow: 2000000 },
  };

  const activeFilters = {
    provider: ["openai-direct"],
    category: ["multimodal"],
    capability: ["vision"],
  };

  it("renders active filter chips with formatted names", () => {
    render(
      <ActiveFilters
        filters={activeFilters}
        metadata={mockMetadata}
        onRemoveFilter={() => {}}
        onClearAll={() => {}}
      />
    );

    expect(screen.getByText(/Provider: OpenAI Direct/i)).toBeInTheDocument();
    expect(screen.getByText(/Category: multimodal/i)).toBeInTheDocument();
    expect(screen.getByText(/Vision Analysis/i)).toBeInTheDocument();
  });

  it("calls onRemoveFilter when filter chip remove button is clicked", () => {
    const handleRemove = vi.fn();
    render(
      <ActiveFilters
        filters={activeFilters}
        metadata={mockMetadata}
        onRemoveFilter={handleRemove}
        onClearAll={() => {}}
      />
    );

    const removeBtn = screen.getByRole("button", { name: /remove provider filter openai-direct/i });
    fireEvent.click(removeBtn);
    expect(handleRemove).toHaveBeenCalledWith("provider", "openai-direct");
  });

  it("calls onClearAll when clear all button is clicked (E54)", () => {
    const handleClearAll = vi.fn();
    render(
      <ActiveFilters
        filters={activeFilters}
        metadata={mockMetadata}
        onRemoveFilter={() => {}}
        onClearAll={handleClearAll}
      />
    );

    const clearAllBtn = screen.getByRole("button", { name: /clear all/i });
    fireEvent.click(clearAllBtn);
    expect(handleClearAll).toHaveBeenCalledTimes(1);
  });
});
