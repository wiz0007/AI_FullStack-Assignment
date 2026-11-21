import { describe, it, expect, vi } from "vitest";
import { ModelService } from "@/server/services/model.service";
import { ModelRepository } from "@/server/repositories/model.repository";

describe("Model Service Integration Workflows (Workflows A-G)", () => {
  it("Workflow A: should query and list models with pagination", async () => {
    const mockRepo = {
      findMany: vi.fn().mockResolvedValue({
        items: [
          {
            id: "m-1",
            name: "GPT-4o",
            slug: "gpt-4o",
            company: { name: "OpenAI", slug: "openai" },
            providers: [],
            capabilities: [],
            benchmarks: [],
          },
        ],
        total: 1,
      }),
      findBySlug: vi.fn(),
      create: vi.fn(),
    } as unknown as ModelRepository;

    const service = new ModelService(mockRepo);
    const result = await service.listModels({ page: 1, limit: 10, status: "active" });

    expect(result.items.length).toBe(1);
    expect(result.pagination.total).toBe(1);
    expect(result.items[0].name).toBe("GPT-4o");
  });

  it("Workflow B: should retrieve model by slug with relationships", async () => {
    const mockRepo = {
      findMany: vi.fn(),
      findBySlug: vi.fn().mockResolvedValue({
        id: "m-2",
        name: "Claude 3.5 Sonnet",
        slug: "claude-3-5-sonnet",
        company: { name: "Anthropic" },
        providers: [
          {
            provider: { name: "Anthropic Console API" },
            pricing: [{ inputPrice: "3.00", outputPrice: "15.00" }],
          },
        ],
      }),
      create: vi.fn(),
    } as unknown as ModelRepository;

    const service = new ModelService(mockRepo);
    const model = await service.getModelBySlug("claude-3-5-sonnet");

    expect(model.name).toBe("Claude 3.5 Sonnet");
    expect(model.providers.length).toBe(1);
  });

  it("Workflow C: should reject model creation when slug already exists (conflict prevention)", async () => {
    const mockRepo = {
      findMany: vi.fn(),
      findBySlug: vi.fn().mockResolvedValue({ id: "existing-id", slug: "gpt-4o" }),
      create: vi.fn(),
    } as unknown as ModelRepository;

    const service = new ModelService(mockRepo);

    await expect(
      service.registerModel({
        name: "Duplicate GPT-4o",
        slug: "gpt-4o",
        modelIdentifier: "openai/gpt-4o",
        companyId: "123e4567-e89b-12d3-a456-426614174000",
        modelType: "chat",
        inputModalities: ["text"],
        outputModalities: ["text"],
        status: "active",
      })
    ).rejects.toThrow(/already exists/);
  });
});
