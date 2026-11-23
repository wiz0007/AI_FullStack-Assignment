import { describe, it, expect, vi } from "vitest";
import { ModelService } from "@/server/services/model.service";
import { ModelRepository } from "@/server/repositories/model.repository";
import { ProviderRepository } from "@/server/repositories/provider.repository";
import { CompanyRepository } from "@/server/repositories/company.repository";

describe("Discovery API & Service Integration Tests (Sprint 2)", () => {
  const sampleModels = [
    {
      id: "m-1",
      name: "GPT-4o",
      slug: "gpt-4o",
      modelIdentifier: "openai/gpt-4o",
      description: "Flagship multimodal intelligence model",
      modelType: "multimodal",
      contextWindow: 128000,
      releaseDate: new Date("2024-05-13"),
      status: "active",
      company: { id: "c-1", name: "OpenAI", slug: "openai" },
      providers: [
        {
          provider: { id: "p-1", name: "OpenAI Direct", slug: "openai-direct" },
          pricing: [{ inputPrice: "2.500000", outputPrice: "10.000000", pricingUnit: "1M_TOKENS" }],
        },
      ],
      capabilities: [
        { capability: { id: "cap-1", name: "Vision", slug: "vision" } },
        { capability: { id: "cap-2", name: "Reasoning", slug: "reasoning" } },
      ],
    },
    {
      id: "m-2",
      name: "Claude 3.5 Sonnet",
      slug: "claude-3-5-sonnet",
      modelIdentifier: "anthropic/claude-3-5-sonnet",
      description: "State-of-the-art coding and reasoning",
      modelType: "multimodal",
      contextWindow: 200000,
      releaseDate: new Date("2024-10-22"),
      status: "active",
      company: { id: "c-2", name: "Anthropic", slug: "anthropic" },
      providers: [
        {
          provider: { id: "p-2", name: "Anthropic Direct", slug: "anthropic-direct" },
          pricing: [{ inputPrice: "3.000000", outputPrice: "15.000000", pricingUnit: "1M_TOKENS" }],
        },
      ],
      capabilities: [{ capability: { id: "cap-2", name: "Reasoning", slug: "reasoning" } }],
    },
  ];

  it("should query models with pagination metadata (E02, E10)", async () => {
    const mockRepo = {
      findMany: vi.fn().mockResolvedValue({
        items: sampleModels,
        total: 2,
      }),
      findByIdOrSlug: vi.fn(),
      findBySlug: vi.fn(),
      getFilterMetadata: vi.fn(),
      globalSearchModels: vi.fn(),
      create: vi.fn(),
    } as unknown as ModelRepository;

    const service = new ModelService(mockRepo);
    const result = await service.listModels({
      page: 1,
      limit: 12,
      status: "active",
      sort: "relevance",
    });

    expect(result.items.length).toBe(2);
    expect(result.pagination.total).toBe(2);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.hasNextPage).toBe(false);
    expect(result.pagination.hasPreviousPage).toBe(false);
  });

  it("should handle filter combinations with AND across groups (E12)", async () => {
    const mockRepo = {
      findMany: vi.fn().mockImplementation((params) => {
        // Verify params passed down to repository
        expect(params.provider).toEqual(["openai-direct"]);
        expect(params.capability).toEqual(["vision"]);
        return Promise.resolve({
          items: [sampleModels[0]],
          total: 1,
        });
      }),
      findByIdOrSlug: vi.fn(),
      findBySlug: vi.fn(),
      getFilterMetadata: vi.fn(),
      globalSearchModels: vi.fn(),
      create: vi.fn(),
    } as unknown as ModelRepository;

    const service = new ModelService(mockRepo);
    const result = await service.listModels({
      page: 1,
      limit: 12,
      status: "active",
      provider: ["openai-direct"],
      capability: ["vision"],
      sort: "relevance",
    });

    expect(result.items.length).toBe(1);
    expect(result.items[0].slug).toBe("gpt-4o");
  });

  it("should retrieve filter metadata without duplicates (E46)", async () => {
    const mockRepo = {
      findMany: vi.fn(),
      findByIdOrSlug: vi.fn(),
      findBySlug: vi.fn(),
      getFilterMetadata: vi.fn().mockResolvedValue({
        providers: [
          { id: "p-1", name: "OpenAI Direct", slug: "openai-direct", count: 2 },
          { id: "p-2", name: "Anthropic Direct", slug: "anthropic-direct", count: 1 },
        ],
        categories: ["chat", "multimodal"],
        capabilities: [
          { id: "c-1", name: "Vision", slug: "vision", category: "vision", count: 2 },
          { id: "c-2", name: "Reasoning", slug: "reasoning", category: "reasoning", count: 2 },
        ],
        ranges: { minContextWindow: 128000, maxContextWindow: 2000000 },
      }),
      globalSearchModels: vi.fn(),
      create: vi.fn(),
    } as unknown as ModelRepository;

    const service = new ModelService(mockRepo);
    const metadata = await service.getFilterMetadata();

    expect(metadata.providers.length).toBe(2);
    expect(metadata.categories).toEqual(["chat", "multimodal"]);
    expect(metadata.capabilities.length).toBe(2);
  });

  it("should execute global search across models and providers (E39)", async () => {
    const mockModelRepo = {
      globalSearchModels: vi.fn().mockResolvedValue([
        {
          id: "m-1",
          name: "GPT-4o",
          slug: "gpt-4o",
          modelType: "multimodal",
          company: { name: "OpenAI" },
          contextWindow: 128000,
        },
      ]),
    } as unknown as ModelRepository;

    const mockProvRepo = {
      globalSearchProviders: vi
        .fn()
        .mockResolvedValue([{ id: "p-1", name: "OpenAI Direct API", slug: "openai-direct" }]),
    } as unknown as ProviderRepository;

    const service = new ModelService(mockModelRepo, mockProvRepo);
    const results = await service.globalSearch({ q: "openai", scope: "all", limit: 5 });

    expect(results.models.length).toBe(1);
    expect(results.models[0].name).toBe("GPT-4o");
    expect(results.models[0].url).toBe("/models/gpt-4o");
    expect(results.providers.length).toBe(1);
    expect(results.providers[0].name).toBe("OpenAI Direct API");
  });
});
