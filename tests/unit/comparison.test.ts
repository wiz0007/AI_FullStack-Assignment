import { describe, it, expect } from "vitest";
import {
  compareModelsQuerySchema,
  MAX_COMPARISON_MODELS,
} from "@/server/validators/model.validator";

describe("Sprint 3: Comparison Validator & Logic Unit Tests", () => {
  describe("compareModelsQuerySchema (C01 - C07)", () => {
    it("should accept single model ID in 'ids' query parameter", () => {
      const parsed = compareModelsQuerySchema.parse({ ids: "gpt-4o" });
      expect(parsed.ids).toEqual(["gpt-4o"]);
    });

    it("should accept up to 3 comma-separated models in 'ids' query parameter (C01)", () => {
      const parsed = compareModelsQuerySchema.parse({
        ids: "gpt-4o,claude-3-5-sonnet,gemini-1-5-pro",
      });
      expect(parsed.ids).toEqual(["gpt-4o", "claude-3-5-sonnet", "gemini-1-5-pro"]);
    });

    it("should accept fallback 'models' query parameter", () => {
      const parsed = compareModelsQuerySchema.parse({
        models: "gpt-4o,claude-3-5-sonnet",
      });
      expect(parsed.ids).toEqual(["gpt-4o", "claude-3-5-sonnet"]);
    });

    it("should normalize whitespace and remove duplicates while preserving order (C06)", () => {
      const parsed = compareModelsQuerySchema.parse({
        ids: "  gpt-4o , claude-3-5-sonnet , gpt-4o  ",
      });
      expect(parsed.ids).toEqual(["gpt-4o", "claude-3-5-sonnet"]);
    });

    it("should reject query with 0 models (C02)", () => {
      expect(() => compareModelsQuerySchema.parse({ ids: "" })).toThrow(
        /At least one model identifier is required for comparison/
      );
      expect(() => compareModelsQuerySchema.parse({})).toThrow(
        /At least one model identifier is required for comparison/
      );
    });

    it("should reject query with more than MAX_COMPARISON_MODELS (3) (C05)", () => {
      expect(() =>
        compareModelsQuerySchema.parse({
          ids: "gpt-4o,claude-3-5-sonnet,gemini-1-5-pro,deepseek-v3",
        })
      ).toThrow(new RegExp(`Cannot compare more than ${MAX_COMPARISON_MODELS} models`));
    });
  });

  describe("Comparison Difference Highlighting Logic (C10 - C15)", () => {
    const isDiff = (models: any[], getter: (m: any) => any) => {
      if (models.length <= 1) return false;
      const values = models.map(getter);
      return !values.every((v) => JSON.stringify(v) === JSON.stringify(values[0]));
    };

    it("should return false for single model comparison", () => {
      const singleModel = [{ contextWindow: 128000 }];
      expect(isDiff(singleModel, (m) => m.contextWindow)).toBe(false);
    });

    it("should detect differing context windows across 2 models", () => {
      const models = [{ contextWindow: 128000 }, { contextWindow: 200000 }];
      expect(isDiff(models, (m) => m.contextWindow)).toBe(true);
    });

    it("should return false when context windows are identical across models", () => {
      const models = [{ contextWindow: 128000 }, { contextWindow: 128000 }];
      expect(isDiff(models, (m) => m.contextWindow)).toBe(false);
    });

    it("should detect differing pricing across models", () => {
      const models = [
        { pricing: { input: "2.50", output: "10.00" } },
        { pricing: { input: "3.00", output: "15.00" } },
      ];
      expect(isDiff(models, (m) => m.pricing?.input)).toBe(true);
    });
  });
});
