import { describe, it, expect, vi } from "vitest";
import { providerQuerySchema } from "@/server/validators/provider.validator";
import { ProviderService } from "@/server/services/provider.service";
import { ProviderRepository } from "@/server/repositories/provider.repository";
import { NotFoundError } from "@/lib/errors";

describe("Sprint 4: Inference Provider Directory Validation & Service", () => {
  describe("providerQuerySchema", () => {
    it("should parse default parameters", () => {
      const parsed = providerQuerySchema.parse({});
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(12);
      expect(parsed.sort).toBe("models_desc");
    });

    it("should accept custom sort and search query", () => {
      const parsed = providerQuerySchema.parse({
        search: "together",
        sort: "name_asc",
        page: "3",
        limit: "15",
      });
      expect(parsed.search).toBe("together");
      expect(parsed.sort).toBe("name_asc");
      expect(parsed.page).toBe(3);
      expect(parsed.limit).toBe(15);
    });
  });

  describe("ProviderService", () => {
    it("should list providers with pagination and sample models", async () => {
      const mockRepo = {
        findMany: vi.fn().mockResolvedValue({
          items: [
            {
              id: "p-1",
              name: "Together AI",
              slug: "together-ai",
              description: "High-performance inference platform",
              websiteUrl: "https://together.ai",
              logoUrl: null,
              _count: { models: 5 },
              models: [
                {
                  model: {
                    id: "m-1",
                    name: "Llama 3.1 70B",
                    slug: "llama-3-1-70b",
                    modelType: "multimodal",
                  },
                  availabilityStatus: "active",
                },
              ],
              createdAt: new Date("2024-01-01"),
            },
          ],
          total: 1,
        }),
        findBySlug: vi.fn(),
        globalSearchProviders: vi.fn(),
      } as unknown as ProviderRepository;

      const service = new ProviderService(mockRepo);
      const res = await service.listProviders({ page: 1, limit: 12, sort: "models_desc" });

      expect(res.items.length).toBe(1);
      expect(res.items[0].name).toBe("Together AI");
      expect(res.items[0].modelCount).toBe(5);
      expect(res.items[0].sampleModels.length).toBe(1);
      expect(res.pagination.total).toBe(1);
    });

    it("should throw NotFoundError when provider slug is invalid", async () => {
      const mockRepo = {
        findBySlug: vi.fn().mockResolvedValue(null),
        findMany: vi.fn(),
        globalSearchProviders: vi.fn(),
      } as unknown as ProviderRepository;

      const service = new ProviderService(mockRepo);
      await expect(service.getProviderBySlug("non-existent-provider")).rejects.toThrow(
        NotFoundError
      );
    });
  });
});
