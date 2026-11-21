import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/ui/empty-state";

describe("EmptyState Component Tests", () => {
  it("renders custom title and description", () => {
    render(
      <EmptyState
        title="No Models Available"
        description="Try adjusting your filter parameters to discover matching models."
      />
    );
    expect(screen.getByText("No Models Available")).toBeInTheDocument();
    expect(
      screen.getByText("Try adjusting your filter parameters to discover matching models.")
    ).toBeInTheDocument();
  });

  it("renders action button when provided", () => {
    render(
      <EmptyState
        title="Empty"
        description="Nothing here"
        actionLabel="Reset Filters"
        onAction={() => {}}
      />
    );
    expect(screen.getByRole("button", { name: /reset filters/i })).toBeInTheDocument();
  });
});
