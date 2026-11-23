import { describe, it, expect } from "vitest";
import {
  toBenchmarkEvaluationDTO,
  selectCurrentEvaluations,
  compareBenchmarkEvaluations,
  BenchmarkEvaluationDTO,
} from "@/lib/benchmark";

describe("Benchmark Evaluation Contracts & Compatibility (P0-01, P0-02, P0-03)", () => {
  describe("P0-01: Canonical Benchmark Evaluation DTO Mapping", () => {
    it("maps raw nested benchmarkVersion relationship correctly", () => {
      const raw = {
        id: "eval-1",
        modelId: "m-1",
        score: "88.70",
        scoreUnit: "percentage",
        datasetVersion: "2024-v1",
        evaluationDate: "2024-05-15T00:00:00Z",
        source: "https://arxiv.org/abs/example",
        evaluator: "Independent Benchmarks Lab",
        dataClassification: "SOURCE_VERIFIED",
        isPublished: true,
        benchmarkVersion: {
          id: "bv-1",
          version: "5-shot",
          scoreDirection: "HIGHER_IS_BETTER",
          scoreUnit: "percentage",
          benchmark: {
            id: "b-1",
            slug: "mmlu",
            name: "MMLU",
            category: "reasoning",
          },
        },
      };

      const dto = toBenchmarkEvaluationDTO(raw);
      expect(dto.id).toBe("eval-1");
      expect(dto.modelId).toBe("m-1");
      expect(dto.benchmarkSlug).toBe("mmlu");
      expect(dto.benchmarkName).toBe("MMLU");
      expect(dto.benchmarkVersion).toBe("5-shot");
      expect(dto.score).toBe("88.70");
      expect(dto.scoreNumeric).toBe(88.7);
      expect(dto.scoreUnit).toBe("percentage");
      expect(dto.scoreDirection).toBe("HIGHER_IS_BETTER");
      expect(dto.datasetVersion).toBe("2024-v1");
      expect(dto.evaluationDate).toBe("2024-05-15T00:00:00.000Z");
      expect(dto.source).toBe("https://arxiv.org/abs/example");
      expect(dto.evaluator).toBe("Independent Benchmarks Lab");
      expect(dto.dataClassification).toBe("SOURCE_VERIFIED");
      expect(dto.isPublished).toBe(true);
    });

    it("handles missing optional metadata without fabricating values", () => {
      const raw = {
        id: "eval-empty",
        modelId: "m-2",
        score: "12.5",
        benchmarkVersion: {
          id: "bv-2",
          version: "0-shot",
          benchmark: {
            id: "b-2",
            slug: "humaneval",
            name: "HumanEval",
          },
        },
      };

      const dto = toBenchmarkEvaluationDTO(raw);
      expect(dto.datasetVersion).toBeNull();
      expect(dto.evaluationDate).toBeNull();
      expect(dto.source).toBeNull();
      expect(dto.evaluator).toBeNull();
      expect(dto.evaluationProtocol).toBeNull();
    });
  });

  describe("P0-02: Deterministic Current-Evaluation Selection", () => {
    it("selects the latest published evaluation by evaluationDate", () => {
      const evals: BenchmarkEvaluationDTO[] = [
        {
          id: "eval-old",
          modelId: "m-1",
          benchmarkId: "b-1",
          benchmarkSlug: "mmlu",
          benchmarkName: "MMLU",
          benchmarkCategory: "reasoning",
          benchmarkVersionId: "bv-1",
          benchmarkVersion: "5-shot",
          datasetVersion: "v1",
          score: "85.0",
          scoreNumeric: 85.0,
          scoreUnit: "%",
          scoreDirection: "HIGHER_IS_BETTER",
          evaluationDate: "2024-01-01T00:00:00Z",
          evaluationProtocol: null,
          source: null,
          evaluator: null,
          dataClassification: "CURATED",
          isPublished: true,
          isCurrent: false,
        },
        {
          id: "eval-new",
          modelId: "m-1",
          benchmarkId: "b-1",
          benchmarkSlug: "mmlu",
          benchmarkName: "MMLU",
          benchmarkCategory: "reasoning",
          benchmarkVersionId: "bv-1",
          benchmarkVersion: "5-shot",
          datasetVersion: "v1",
          score: "88.0",
          scoreNumeric: 88.0,
          scoreUnit: "%",
          scoreDirection: "HIGHER_IS_BETTER",
          evaluationDate: "2024-06-01T00:00:00Z",
          evaluationProtocol: null,
          source: null,
          evaluator: null,
          dataClassification: "CURATED",
          isPublished: true,
          isCurrent: false,
        },
      ];

      const current = selectCurrentEvaluations(evals);
      expect(current).toHaveLength(1);
      expect(current[0].id).toBe("eval-new");
      expect(current[0].score).toBe("88.0");
      expect(current[0].isCurrent).toBe(true);
    });

    it("filters out unpublished evaluations even if newer", () => {
      const evals: BenchmarkEvaluationDTO[] = [
        {
          id: "eval-published",
          modelId: "m-1",
          benchmarkId: "b-1",
          benchmarkSlug: "mmlu",
          benchmarkName: "MMLU",
          benchmarkCategory: "reasoning",
          benchmarkVersionId: "bv-1",
          benchmarkVersion: "5-shot",
          datasetVersion: "v1",
          score: "85.0",
          scoreNumeric: 85.0,
          scoreUnit: "%",
          scoreDirection: "HIGHER_IS_BETTER",
          evaluationDate: "2024-01-01T00:00:00Z",
          evaluationProtocol: null,
          source: null,
          evaluator: null,
          dataClassification: "CURATED",
          isPublished: true,
          isCurrent: false,
        },
        {
          id: "eval-unpublished-new",
          modelId: "m-1",
          benchmarkId: "b-1",
          benchmarkSlug: "mmlu",
          benchmarkName: "MMLU",
          benchmarkCategory: "reasoning",
          benchmarkVersionId: "bv-1",
          benchmarkVersion: "5-shot",
          datasetVersion: "v1",
          score: "99.0",
          scoreNumeric: 99.0,
          scoreUnit: "%",
          scoreDirection: "HIGHER_IS_BETTER",
          evaluationDate: "2024-10-01T00:00:00Z",
          evaluationProtocol: null,
          source: null,
          evaluator: null,
          dataClassification: "CURATED",
          isPublished: false,
          isCurrent: false,
        },
      ];

      const current = selectCurrentEvaluations(evals);
      expect(current).toHaveLength(1);
      expect(current[0].id).toBe("eval-published");
    });

    it("uses deterministic tie-breaker when evaluation dates are identical", () => {
      const evals: BenchmarkEvaluationDTO[] = [
        {
          id: "eval-b",
          modelId: "m-1",
          benchmarkId: "b-1",
          benchmarkSlug: "mmlu",
          benchmarkName: "MMLU",
          benchmarkCategory: "reasoning",
          benchmarkVersionId: "bv-1",
          benchmarkVersion: "5-shot",
          datasetVersion: "v1",
          score: "85.0",
          scoreNumeric: 85.0,
          scoreUnit: "%",
          scoreDirection: "HIGHER_IS_BETTER",
          evaluationDate: "2024-01-01T00:00:00Z",
          evaluationProtocol: null,
          source: null,
          evaluator: null,
          dataClassification: "CURATED",
          isPublished: true,
          isCurrent: false,
        },
        {
          id: "eval-a",
          modelId: "m-1",
          benchmarkId: "b-1",
          benchmarkSlug: "mmlu",
          benchmarkName: "MMLU",
          benchmarkCategory: "reasoning",
          benchmarkVersionId: "bv-1",
          benchmarkVersion: "5-shot",
          datasetVersion: "v1",
          score: "85.0",
          scoreNumeric: 85.0,
          scoreUnit: "%",
          scoreDirection: "HIGHER_IS_BETTER",
          evaluationDate: "2024-01-01T00:00:00Z",
          evaluationProtocol: null,
          source: null,
          evaluator: null,
          dataClassification: "CURATED",
          isPublished: true,
          isCurrent: false,
        },
      ];

      const current = selectCurrentEvaluations(evals);
      expect(current).toHaveLength(1);
      expect(current[0].id).toBe("eval-a");
    });
  });

  describe("P0-03: Benchmark Comparability Engine", () => {
    const baseEvalA: BenchmarkEvaluationDTO = {
      id: "eval-1",
      modelId: "m-1",
      benchmarkId: "b-1",
      benchmarkSlug: "mmlu",
      benchmarkName: "MMLU",
      benchmarkCategory: "reasoning",
      benchmarkVersionId: "bv-1",
      benchmarkVersion: "5-shot",
      datasetVersion: "v1.0",
      score: "88.0",
      scoreNumeric: 88.0,
      scoreUnit: "percentage",
      scoreDirection: "HIGHER_IS_BETTER",
      evaluationDate: "2024-05-01T00:00:00Z",
      evaluationProtocol: null,
      source: null,
      evaluator: null,
      dataClassification: "CURATED",
      isPublished: true,
      isCurrent: true,
    };

    const baseEvalB: BenchmarkEvaluationDTO = {
      id: "eval-2",
      modelId: "m-2",
      benchmarkId: "b-1",
      benchmarkSlug: "mmlu",
      benchmarkName: "MMLU",
      benchmarkCategory: "reasoning",
      benchmarkVersionId: "bv-1",
      benchmarkVersion: "5-shot",
      datasetVersion: "v1.0",
      score: "82.5",
      scoreNumeric: 82.5,
      scoreUnit: "percentage",
      scoreDirection: "HIGHER_IS_BETTER",
      evaluationDate: "2024-05-01T00:00:00Z",
      evaluationProtocol: null,
      source: null,
      evaluator: null,
      dataClassification: "CURATED",
      isPublished: true,
      isCurrent: true,
    };

    it("compares fully compatible benchmarks and computes correct winner", () => {
      const res = compareBenchmarkEvaluations(baseEvalA, baseEvalB);
      expect(res.isComparable).toBe(true);
      expect(res.canCalculateDifference).toBe(true);
      expect(res.numericDifference).toBe(5.5);
      expect(res.winnerModelId).toBe("m-1");
      expect(res.isTie).toBe(false);
    });

    it("correctly handles LOWER_IS_BETTER score direction (e.g. error rate)", () => {
      const lowerIsBetterA: BenchmarkEvaluationDTO = {
        ...baseEvalA,
        score: "4.2",
        scoreNumeric: 4.2,
        scoreDirection: "LOWER_IS_BETTER",
      };
      const lowerIsBetterB: BenchmarkEvaluationDTO = {
        ...baseEvalB,
        score: "2.1",
        scoreNumeric: 2.1,
        scoreDirection: "LOWER_IS_BETTER",
      };

      const res = compareBenchmarkEvaluations(lowerIsBetterA, lowerIsBetterB);
      expect(res.isComparable).toBe(true);
      expect(res.winnerModelId).toBe("m-2"); // Lower score wins!
    });

    it("detects and rejects incompatible benchmark versions", () => {
      const incompatibleVersion: BenchmarkEvaluationDTO = {
        ...baseEvalB,
        benchmarkVersion: "0-shot",
      };

      const res = compareBenchmarkEvaluations(baseEvalA, incompatibleVersion);
      expect(res.isComparable).toBe(false);
      expect(res.canCalculateDifference).toBe(false);
      expect(res.canHighlightWinner).toBe(false);
      expect(res.incompatibilityReason).toContain("Incompatible benchmark versions");
    });

    it("detects and rejects incompatible dataset versions", () => {
      const incompatibleDataset: BenchmarkEvaluationDTO = {
        ...baseEvalB,
        datasetVersion: "v2.0-experimental",
      };

      const res = compareBenchmarkEvaluations(baseEvalA, incompatibleDataset);
      expect(res.isComparable).toBe(false);
      expect(res.incompatibilityReason).toContain("Incompatible dataset versions");
    });

    it("detects and rejects incompatible score units", () => {
      const incompatibleUnit: BenchmarkEvaluationDTO = {
        ...baseEvalB,
        scoreUnit: "raw_score",
      };

      const res = compareBenchmarkEvaluations(baseEvalA, incompatibleUnit);
      expect(res.isComparable).toBe(false);
      expect(res.incompatibilityReason).toContain("Incompatible score units");
    });

    it("detects and rejects opposite score directions", () => {
      const oppositeDirection: BenchmarkEvaluationDTO = {
        ...baseEvalB,
        scoreDirection: "LOWER_IS_BETTER",
      };

      const res = compareBenchmarkEvaluations(baseEvalA, oppositeDirection);
      expect(res.isComparable).toBe(false);
      expect(res.incompatibilityReason).toContain("Opposite score directions");
    });

    it("detects ties accurately", () => {
      const tieEvalB: BenchmarkEvaluationDTO = {
        ...baseEvalB,
        score: "88.0",
        scoreNumeric: 88.0,
      };

      const res = compareBenchmarkEvaluations(baseEvalA, tieEvalB);
      expect(res.isComparable).toBe(true);
      expect(res.isTie).toBe(true);
      expect(res.winnerModelId).toBeNull();
      expect(res.numericDifference).toBe(0);
    });
  });
});
