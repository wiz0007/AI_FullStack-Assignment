import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { AddToComparisonButton } from "@/components/comparison/add-to-comparison-button";
import { ComparisonProvider } from "@/features/comparison/comparison-context";

describe("AddToComparisonButton Component (Sprint 3)", () => {
  it("should toggle between Compare and Added to Compare when clicked", () => {
    render(
      <ComparisonProvider>
        <AddToComparisonButton modelId="gpt-4o" modelName="GPT-4o" />
      </ComparisonProvider>
    );

    const button = screen.getByRole("button", { name: /Add GPT-4o to comparison/i });
    expect(button).toBeDefined();
    expect(screen.getByText("Compare")).toBeDefined();

    // Click to add
    fireEvent.click(button);
    expect(screen.getByText("Added to Compare")).toBeDefined();

    // Click to remove
    fireEvent.click(button);
    expect(screen.getByText("Compare")).toBeDefined();
  });
});
