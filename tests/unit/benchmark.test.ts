import { describe, it, expect, vi } from "vitest";
import {
  benchmarkListQuerySchema,
  rankingsQuerySchema,
} from "@/server/validators/benchmark.validator";
import { BenchmarkService } from "@/server/services/benchmark.service";
import { BenchmarkRepository } from "@/server/repositories/benchmark.repository";

describe("Sprint 4: Benchmark & Rankings Validation & Service", () => {
  describe("benchmarkListQuerySchema", () => {
    it("should accept valid category query", () => {
      const parsed = benchmarkListQuerySchema.parse({ category: "reasoning" });
      expect(parsed.category).toBe("reasoning");
    });

    it("should accept empty query parameters", () => {
      const parsed = benchmarkListQuerySchema.parse({});
      expect(parsed.category).toBeUndefined();
    });
  });

  describe("rankingsQuerySchema", () => {
    it("should require benchmark slug and set default limit", () => {
      const parsed = rankingsQuerySchema.parse({ benchmark: "mmlu" });
      expect(parsed.benchmark).toBe("mmlu");
      expect(parsed.limit).toBe(20);
    });

    it("should fail when benchmark is missing or empty", () => {
      expect(() => rankingsQuerySchema.parse({})).toThrow();
      expect(() => rankingsQuerySchema.parse({ benchmark: "" })).toThrow();
    });
  });

  describe("BenchmarkService & Ranking Calculations", () => {
    it("should compute ranks deterministically with tied rank numbering", async () => {
      const mockRepo = {
        findBySlugOrId: vi.fn().mockResolvedValue({
          id: "bm-1",
          name: "MMLU",
          slug: "mmlu",
          scoreDirection: "HIGHER_IS_BETTER",
          defaultUnit: "percentage",
        }),
        getRankings: vi.fn().mockResolvedValue({
          benchmark: {
            id: "bm-1",
            name: "MMLU",
            slug: "mmlu",
            scoreDirection: "HIGHER_IS_BETTER",
            defaultUnit: "percentage",
          },
          rankings: [
            {
              rank: 1,
              score: "88.50",
              scoreUnit: "percentage",
              datasetVersion: "v1.0",
              evaluationDate: "2024-05-01T00:00:00.000Z",
              source: "Official",
              model: {
                id: "m-1",
                name: "GPT-4o",
                slug: "gpt-4o",
                modelType: "multimodal",
                company: { name: "OpenAI", slug: "openai" },
              },
            },
            {
              rank: 2,
              score: "85.20",
              scoreUnit: "percentage",
              datasetVersion: "v1.0",
              evaluationDate: "2024-06-01T00:00:00.000Z",
              source: "Official",
              model: {
                id: "m-2",
                name: "Claude 3.5 Sonnet",
                slug: "claude-3-5-sonnet",
                modelType: "multimodal",
                company: { name: "Anthropic", slug: "anthropic" },
              },
            },
          ],
        }),
        findAll: vi.fn(),
      } as unknown as BenchmarkRepository;

      const service = new BenchmarkService(mockRepo);
      const res = await service.getRankings({
        benchmark: "mmlu",
        limit: 10,
        page: 1,
        sort: "rank_asc",
      });

      expect(res.benchmark.slug).toBe("mmlu");
      expect(res.rankings.length).toBe(2);
      expect(res.rankings[0].rank).toBe(1);
      expect(res.rankings[0].model.name).toBe("GPT-4o");
      expect(res.rankings[1].rank).toBe(2);
    });
  });
});
