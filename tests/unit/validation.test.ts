import { describe, it, expect } from "vitest";
import { modelQuerySchema, createModelSchema } from "@/server/validators/model.validator";

describe("Validation Layer Unit Tests", () => {
  describe("modelQuerySchema", () => {
    it("should accept valid query parameters and set defaults", () => {
      const parsed = modelQuerySchema.parse({});
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(20);
      expect(parsed.status).toBe("active");
    });

    it("should accept valid custom filter params", () => {
      const parsed = modelQuerySchema.parse({
        search: "gpt",
        company: "openai",
        modelType: "chat",
        page: "2",
        limit: "10",
      });
      expect(parsed.search).toBe("gpt");
      expect(parsed.company).toBe("openai");
      expect(parsed.modelType).toBe("chat");
      expect(parsed.page).toBe(2);
      expect(parsed.limit).toBe(10);
    });

    it("should reject negative or 0 page number", () => {
      expect(() => modelQuerySchema.parse({ page: 0 })).toThrow();
      expect(() => modelQuerySchema.parse({ page: -1 })).toThrow();
    });

    it("should reject limit greater than 100", () => {
      expect(() => modelQuerySchema.parse({ limit: 101 })).toThrow();
    });
  });

  describe("createModelSchema", () => {
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

    it("should reject non-positive context window", () => {
      const invalid = {
        name: "Test Model",
        slug: "test-model",
        modelIdentifier: "test/test-model-v1",
        companyId: "123e4567-e89b-12d3-a456-426614174000",
        contextWindow: -100,
      };
      const result = createModelSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject invalid slug formats with uppercase or spaces", () => {
      const invalid = {
        name: "Test Model",
        slug: "Test Model with Spaces",
        modelIdentifier: "test/test-model-v1",
        companyId: "123e4567-e89b-12d3-a456-426614174000",
      };
      const result = createModelSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
