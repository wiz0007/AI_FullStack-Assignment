import { describe, it, expect, vi } from "vitest";
import { ModelService } from "@/server/services/model.service";
import { ModelRepository } from "@/server/repositories/model.repository";
import { ProviderRepository } from "@/server/repositories/provider.repository";
import { CompanyRepository } from "@/server/repositories/company.repository";

describe("Sprint 3: Comparison Service & API Integration Tests", () => {
  const sampleModels = [
    {
      id: "m-1",
      name: "GPT-4o",
      slug: "gpt-4o",
      modelIdentifier: "openai/gpt-4o",
      modelType: "multimodal",
      contextWindow: 128000,
      company: { id: "c-1", name: "OpenAI", slug: "openai" },
      providers: [
        {
          provider: { id: "p-1", name: "OpenAI Direct", slug: "openai-direct" },
          pricing: [{ inputPrice: "2.500000", outputPrice: "10.000000", pricingUnit: "1M_TOKENS" }],
        },
      ],
      capabilities: [{ capability: { id: "cap-1", name: "Vision", slug: "vision" } }],
      benchmarks: [
        {
          benchmark: { id: "b-1", name: "MMLU", slug: "mmlu" },
          score: "88.7",
          scoreUnit: "percentage",
        },
      ],
    },
    {
      id: "m-2",
      name: "Claude 3.5 Sonnet",
      slug: "claude-3-5-sonnet",
      modelIdentifier: "anthropic/claude-3-5-sonnet",
      modelType: "multimodal",
      contextWindow: 200000,
      company: { id: "c-2", name: "Anthropic", slug: "anthropic" },
      providers: [
        {
          provider: { id: "p-2", name: "Anthropic Direct", slug: "anthropic-direct" },
          pricing: [{ inputPrice: "3.000000", outputPrice: "15.000000", pricingUnit: "1M_TOKENS" }],
        },
      ],
      capabilities: [{ capability: { id: "cap-1", name: "Vision", slug: "vision" } }],
      benchmarks: [
        {
          benchmark: { id: "b-1", name: "MMLU", slug: "mmlu" },
          score: "88.7",
          scoreUnit: "percentage",
        },
      ],
    },
  ];

  it("should compare models by slug or ID and maintain requested ordering (C01, C03)", async () => {
    const mockRepo = {
      findByIds: vi.fn().mockResolvedValue(sampleModels),
      findMany: vi.fn(),
      findByIdOrSlug: vi.fn(),
      findBySlug: vi.fn(),
      getFilterMetadata: vi.fn(),
      globalSearchModels: vi.fn(),
      create: vi.fn(),
    } as unknown as ModelRepository;

    const service = new ModelService(mockRepo, {} as ProviderRepository, {} as CompanyRepository);

    const result = await service.compareModels(["claude-3-5-sonnet", "gpt-4o"]);
    expect(mockRepo.findByIds).toHaveBeenCalledWith(["claude-3-5-sonnet", "gpt-4o"]);
    expect(result.models).toHaveLength(2);
    // Preserves requested order: Claude first, then GPT-4o
    expect(result.models[0].slug).toBe("claude-3-5-sonnet");
    expect(result.models[1].slug).toBe("gpt-4o");
    expect(result.missingIds).toEqual([]);
  });

  it("should report missing or invalid model identifiers without failing (C08)", async () => {
    const mockRepo = {
      findByIds: vi.fn().mockResolvedValue([sampleModels[0]]),
      findMany: vi.fn(),
      findByIdOrSlug: vi.fn(),
      findBySlug: vi.fn(),
      getFilterMetadata: vi.fn(),
      globalSearchModels: vi.fn(),
      create: vi.fn(),
    } as unknown as ModelRepository;

    const service = new ModelService(mockRepo, {} as ProviderRepository, {} as CompanyRepository);

    const result = await service.compareModels(["gpt-4o", "non-existent-model"]);
    expect(result.models).toHaveLength(1);
    expect(result.models[0].slug).toBe("gpt-4o");
    expect(result.missingIds).toEqual(["non-existent-model"]);
  });

  it("should return empty arrays when no identifiers are provided", async () => {
    const mockRepo = {
      findByIds: vi.fn(),
    } as unknown as ModelRepository;

    const service = new ModelService(mockRepo, {} as ProviderRepository, {} as CompanyRepository);

    const result = await service.compareModels([]);
    expect(result.models).toEqual([]);
    expect(result.missingIds).toEqual([]);
    expect(mockRepo.findByIds).not.toHaveBeenCalled();
  });
});
