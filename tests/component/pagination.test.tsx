import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "@/components/discovery/pagination";

describe("Pagination Component Tests (Sprint 2)", () => {
  it("renders record count and page indicators", () => {
    render(<Pagination page={2} totalPages={5} total={50} limit={10} onPageChange={() => {}} />);

    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
  });

  it("disables previous button on page 1", () => {
    render(<Pagination page={1} totalPages={3} total={30} limit={10} onPageChange={() => {}} />);

    const prevBtn = screen.getByRole("button", { name: /previous page/i });
    expect(prevBtn).toBeDisabled();
  });

  it("disables next button on the last page", () => {
    render(<Pagination page={3} totalPages={3} total={30} limit={10} onPageChange={() => {}} />);

    const nextBtn = screen.getByRole("button", { name: /next page/i });
    expect(nextBtn).toBeDisabled();
  });

  it("triggers onPageChange when clicking a page number", () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination page={1} totalPages={4} total={40} limit={10} onPageChange={handlePageChange} />
    );

    const page2Btn = screen.getByRole("button", { name: "Page 2" });
    fireEvent.click(page2Btn);
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });
});
