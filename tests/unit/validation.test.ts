import { describe, it, expect } from "vitest";
import {
  modelQuerySchema,
  createModelSchema,
  globalSearchQuerySchema,
} from "@/server/validators/model.validator";

describe("Validation Layer Unit Tests (Sprint 1 & Sprint 2)", () => {
  describe("modelQuerySchema — Search, Filters, Sorting & Pagination", () => {
    it("should accept valid query parameters and set defaults", () => {
      const parsed = modelQuerySchema.parse({});
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(12);
      expect(parsed.status).toBe("active");
      expect(parsed.sort).toBe("relevance");
    });

    it("should normalize search query whitespace (E03)", () => {
      const parsed = modelQuerySchema.parse({ q: "   claude 3.5 sonnet   " });
      expect(parsed.q).toBe("claude 3.5 sonnet");
    });

    it("should parse comma-separated multi-provider values into array (E10)", () => {
      const parsed = modelQuerySchema.parse({ provider: "openai-direct,aws-bedrock,groq" });
      expect(parsed.provider).toEqual(["openai-direct", "aws-bedrock", "groq"]);
    });

    it("should parse array multi-provider values and lowercase them", () => {
      const parsed = modelQuerySchema.parse({ provider: ["OpenAI-Direct", "Groq"] });
      expect(parsed.provider).toEqual(["openai-direct", "groq"]);
    });

    it("should parse multi-category and multi-capability filter arrays (E11, E12)", () => {
      const parsed = modelQuerySchema.parse({
        category: "chat,multimodal",
        capability: "vision,reasoning",
      });
      expect(parsed.category).toEqual(["chat", "multimodal"]);
      expect(parsed.capability).toEqual(["vision", "reasoning"]);
    });

    it("should accept valid context window and pricing ranges", () => {
      const parsed = modelQuerySchema.parse({
        minContextWindow: 32000,
        maxContextWindow: 200000,
        minPrice: 1.0,
        maxPrice: 15.0,
      });
      expect(parsed.minContextWindow).toBe(32000);
      expect(parsed.maxContextWindow).toBe(200000);
      expect(parsed.minPrice).toBe(1.0);
      expect(parsed.maxPrice).toBe(15.0);
    });

    it("should reject minContextWindow greater than maxContextWindow (E14)", () => {
      expect(() =>
        modelQuerySchema.parse({ minContextWindow: 200000, maxContextWindow: 32000 })
      ).toThrow(/minContextWindow cannot be greater than maxContextWindow/);
    });

    it("should reject minPrice greater than maxPrice (E14)", () => {
      expect(() => modelQuerySchema.parse({ minPrice: 20.0, maxPrice: 5.0 })).toThrow(
        /minPrice cannot be greater than maxPrice/
      );
    });

    it("should reject negative numeric values (E15)", () => {
      expect(() => modelQuerySchema.parse({ minContextWindow: -100 })).toThrow();
      expect(() => modelQuerySchema.parse({ minPrice: -5.0 })).toThrow();
    });

    it("should accept valid sort options and reject invalid ones (E16)", () => {
      expect(modelQuerySchema.parse({ sort: "name_asc" }).sort).toBe("name_asc");
      expect(modelQuerySchema.parse({ sort: "releaseDate_desc" }).sort).toBe("releaseDate_desc");
      expect(modelQuerySchema.parse({ sort: "contextWindow_desc" }).sort).toBe(
        "contextWindow_desc"
      );
      expect(() => modelQuerySchema.parse({ sort: "invalid_sort_key" as any })).toThrow();
    });

    it("should reject page less than 1 and limits greater than 100 (E19, E20, E21)", () => {
      expect(() => modelQuerySchema.parse({ page: 0 })).toThrow();
      expect(() => modelQuerySchema.parse({ page: -1 })).toThrow();
      expect(() => modelQuerySchema.parse({ limit: 101 })).toThrow();
    });
  });

  describe("globalSearchQuerySchema (Sprint 2)", () => {
    it("should validate and trim valid global search query", () => {
      const parsed = globalSearchQuerySchema.parse({ q: "   gpt-4o   " });
      expect(parsed.q).toBe("gpt-4o");
      expect(parsed.scope).toBe("all");
      expect(parsed.limit).toBe(5);
    });

    it("should reject empty or whitespace-only global search query (E37)", () => {
      expect(() => globalSearchQuerySchema.parse({ q: "" })).toThrow();
      expect(() => globalSearchQuerySchema.parse({ q: "    " })).toThrow();
    });

    it("should reject search queries exceeding 100 characters", () => {
      const longQuery = "a".repeat(101);
      expect(() => globalSearchQuerySchema.parse({ q: longQuery })).toThrow();
    });

    it("should accept valid scope options and reject invalid scopes (E40)", () => {
      expect(globalSearchQuerySchema.parse({ q: "test", scope: "models" }).scope).toBe("models");
      expect(globalSearchQuerySchema.parse({ q: "test", scope: "providers" }).scope).toBe(
        "providers"
      );
      expect(() =>
        globalSearchQuerySchema.parse({ q: "test", scope: "invalid_scope" as any })
      ).toThrow();
    });
  });

  describe("createModelSchema (Sprint 1)", () => {
    it("should validate and accept correct model registration input", () => {
      const valid = {
        name: "Test Model",
        slug: "test-model",
        modelIdentifier: "test/test-model-v1",
        companyId: "123e4567-e89b-12d3-a456-426614174000",
        modelType: "chat" as const,
        contextWindow: 128000,
      };
      const result = createModelSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });
});
