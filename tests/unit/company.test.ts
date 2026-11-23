import { describe, it, expect, vi } from "vitest";
import { companyQuerySchema } from "@/server/validators/company.validator";
import { CompanyService } from "@/server/services/company.service";
import { CompanyRepository } from "@/server/repositories/company.repository";
import { NotFoundError } from "@/lib/errors";

describe("Sprint 4: AI Company Directory Validation & Service", () => {
  describe("companyQuerySchema", () => {
    it("should parse default parameters", () => {
      const parsed = companyQuerySchema.parse({});
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(12);
      expect(parsed.sort).toBe("models_desc");
    });

    it("should accept custom sort and search query", () => {
      const parsed = companyQuerySchema.parse({
        search: "anthropic",
        sort: "name_asc",
        page: "2",
        limit: "24",
      });
      expect(parsed.search).toBe("anthropic");
      expect(parsed.sort).toBe("name_asc");
      expect(parsed.page).toBe(2);
      expect(parsed.limit).toBe(24);
    });
  });

  describe("CompanyService", () => {
    it("should list companies with pagination and model counts", async () => {
      const mockRepo = {
        findMany: vi.fn().mockResolvedValue({
          items: [
            {
              id: "c-1",
              name: "OpenAI",
              slug: "openai",
              description: "AI research organization",
              websiteUrl: "https://openai.com",
              logoUrl: null,
              headquarters: "San Francisco, CA",
              _count: { models: 3 },
              models: [
                {
                  id: "m-1",
                  name: "GPT-4o",
                  slug: "gpt-4o",
                  modelType: "multimodal",
                  releaseDate: new Date("2024-05-13"),
                },
              ],
              createdAt: new Date("2024-01-01"),
            },
          ],
          total: 1,
        }),
        findBySlug: vi.fn(),
        globalSearchCompanies: vi.fn(),
      } as unknown as CompanyRepository;

      const service = new CompanyService(mockRepo);
      const res = await service.listCompanies({ page: 1, limit: 12, sort: "models_desc" });

      expect(res.items.length).toBe(1);
      expect(res.items[0].name).toBe("OpenAI");
      expect(res.items[0].modelCount).toBe(3);
      expect(res.pagination.total).toBe(1);
      expect(res.pagination.hasNextPage).toBe(false);
    });

    it("should throw NotFoundError when company slug is invalid", async () => {
      const mockRepo = {
        findBySlug: vi.fn().mockResolvedValue(null),
        findMany: vi.fn(),
        globalSearchCompanies: vi.fn(),
      } as unknown as CompanyRepository;

      const service = new CompanyService(mockRepo);
      await expect(service.getCompanyBySlug("non-existent-lab")).rejects.toThrow(NotFoundError);
    });
  });
});
