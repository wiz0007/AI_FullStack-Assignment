import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LeaderboardTable } from "@/components/rankings/leaderboard-table";

describe("Sprint 4: LeaderboardTable Component", () => {
  const sampleRankings = [
    {
      rank: 1,
      score: "88.70",
      scoreUnit: "percentage",
      datasetVersion: "v1.2",
      evaluationDate: "2024-05-13T00:00:00.000Z",
      source: "Academic Eval",
      model: {
        id: "m-1",
        name: "GPT-4o",
        slug: "gpt-4o",
        modelType: "multimodal",
        company: {
          name: "OpenAI",
          slug: "openai",
        },
      },
    },
    {
      rank: 2,
      score: "85.20",
      scoreUnit: "percentage",
      datasetVersion: "v1.2",
      evaluationDate: "2024-06-20T00:00:00.000Z",
      source: "Academic Eval",
      model: {
        id: "m-2",
        name: "Claude 3.5 Sonnet",
        slug: "claude-3-5-sonnet",
        modelType: "multimodal",
        company: {
          name: "Anthropic",
          slug: "anthropic",
        },
      },
    },
  ];

  it("renders leaderboard rankings with model names, creator labs and scores", () => {
    render(
      <LeaderboardTable
        rankings={sampleRankings}
        scoreDirection="HIGHER_IS_BETTER"
        benchmarkName="MMLU"
        benchmarkUnit="percentage"
      />
    );

    expect(screen.getByText("GPT-4o")).toBeInTheDocument();
    expect(screen.getByText("OpenAI")).toBeInTheDocument();
    expect(screen.getByText("Claude 3.5 Sonnet")).toBeInTheDocument();
    expect(screen.getByText("Anthropic")).toBeInTheDocument();
    expect(screen.getByText("88.7")).toBeInTheDocument();
    expect(screen.getByText("85.2")).toBeInTheDocument();
  });

  it("renders empty state message when no rankings are available", () => {
    render(
      <LeaderboardTable
        rankings={[]}
        scoreDirection="HIGHER_IS_BETTER"
        benchmarkName="GSM8K"
        benchmarkUnit="percentage"
      />
    );

    expect(screen.getByText(/no model evaluations found/i)).toBeInTheDocument();
  });
});
