import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting deterministic database seed...");

  // 1. Seed AI Companies
  const companiesData = [
    {
      slug: "openai",
      name: "OpenAI",
      description: "AI research and deployment company behind GPT-4o, ChatGPT, and o1.",
      websiteUrl: "https://openai.com",
      logoUrl:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80",
      headquarters: "San Francisco, CA, USA",
    },
    {
      slug: "anthropic",
      name: "Anthropic",
      description: "AI safety and research company that builds Claude.",
      websiteUrl: "https://anthropic.com",
      logoUrl:
        "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=128&auto=format&fit=crop&q=80",
      headquarters: "San Francisco, CA, USA",
    },
    {
      slug: "google",
      name: "Google DeepMind",
      description: "World-leading artificial intelligence research laboratory creating Gemini.",
      websiteUrl: "https://deepmind.google",
      logoUrl:
        "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=128&auto=format&fit=crop&q=80",
      headquarters: "London, UK & Mountain View, CA",
    },
    {
      slug: "meta",
      name: "Meta AI",
      description: "Open source foundation model research advancing Llama.",
      websiteUrl: "https://ai.meta.com",
      logoUrl:
        "https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=128&auto=format&fit=crop&q=80",
      headquarters: "Menlo Park, CA, USA",
    },
    {
      slug: "mistral",
      name: "Mistral AI",
      description:
        "European frontier AI lab building open-weight and commercial foundation models.",
      websiteUrl: "https://mistral.ai",
      logoUrl:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80",
      headquarters: "Paris, France",
    },
    {
      slug: "deepseek",
      name: "DeepSeek",
      description:
        "Innovators in efficient open-source foundation models and reasoning architectures.",
      websiteUrl: "https://deepseek.com",
      logoUrl:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80",
      headquarters: "Hangzhou, China",
    },
  ];

  const companies: Record<string, any> = {};
  for (const c of companiesData) {
    companies[c.slug] = await prisma.company.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }

  // 2. Seed Infrastructure Providers
  const providersData = [
    {
      slug: "openai-direct",
      name: "OpenAI Direct API",
      description: "Official OpenAI Developer Platform",
      websiteUrl: "https://platform.openai.com",
    },
    {
      slug: "anthropic-direct",
      name: "Anthropic Direct API",
      description: "Anthropic Console API",
      websiteUrl: "https://console.anthropic.com",
    },
    {
      slug: "google-ai-studio",
      name: "Google AI Studio",
      description: "Google Gemini Developer Platform",
      websiteUrl: "https://aistudio.google.com",
    },
    {
      slug: "aws-bedrock",
      name: "AWS Bedrock",
      description: "Fully managed foundation model service by Amazon Web Services",
      websiteUrl: "https://aws.amazon.com/bedrock",
    },
    {
      slug: "groq",
      name: "Groq LPU",
      description: "Ultra high-speed inference engine powered by LPUs",
      websiteUrl: "https://groq.com",
    },
    {
      slug: "together-ai",
      name: "Together AI",
      description: "Fast cloud platform for open-source AI models",
      websiteUrl: "https://together.ai",
    },
    {
      slug: "openrouter",
      name: "OpenRouter",
      description: "Unified AI model routing and aggregation service",
      websiteUrl: "https://openrouter.ai",
    },
  ];

  const providers: Record<string, any> = {};
  for (const p of providersData) {
    providers[p.slug] = await prisma.provider.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  // 3. Seed Capabilities
  const capabilitiesData = [
    {
      slug: "reasoning",
      name: "Advanced Reasoning",
      category: "reasoning",
      description: "Multi-step chain-of-thought and complex problem solving.",
    },
    {
      slug: "code-generation",
      name: "Code Generation",
      category: "coding",
      description: "Synthesizing, debugging, and explaining source code across languages.",
    },
    {
      slug: "vision",
      name: "Vision Analysis",
      category: "vision",
      description: "Understanding and extracting insights from images, charts, and diagrams.",
    },
    {
      slug: "function-calling",
      name: "Function Calling",
      category: "tool_use",
      description: "Executing deterministic tool calls and structured schema generation.",
    },
    {
      slug: "structured-output",
      name: "Structured Output (JSON)",
      category: "tool_use",
      description: "Strict adherence to user-provided JSON schemas.",
    },
    {
      slug: "audio",
      name: "Audio In/Out",
      category: "audio",
      description: "Real-time speech-to-text and native audio generation.",
    },
  ];

  const capabilities: Record<string, any> = {};
  for (const cap of capabilitiesData) {
    capabilities[cap.slug] = await prisma.capability.upsert({
      where: { slug: cap.slug },
      update: cap,
      create: cap,
    });
  }

  // 4. Seed Benchmarks
  const benchmarksData = [
    {
      slug: "mmlu",
      name: "MMLU",
      description: "Massive Multitask Language Understanding across 57 academic subjects.",
      category: "knowledge",
      scoreUnit: "percentage",
      version: "5-shot",
    },
    {
      slug: "humaneval",
      name: "HumanEval",
      description: "Python code generation evaluation test set.",
      category: "coding",
      scoreUnit: "percentage",
      version: "pass@1",
    },
    {
      slug: "gsm8k",
      name: "GSM8K",
      description: "Grade School Math 8K word problems.",
      category: "math",
      scoreUnit: "percentage",
      version: "maj@1",
    },
    {
      slug: "math-benchmark",
      name: "MATH 500",
      description: "Challenging high school and collegiate competition mathematics.",
      category: "math",
      scoreUnit: "percentage",
      version: "500-test",
    },
    {
      slug: "gpqa",
      name: "GPQA Diamond",
      description: "Google-proof PhD-level multiple-choice science questions.",
      category: "reasoning",
      scoreUnit: "percentage",
      version: "diamond",
    },
  ];

  const benchmarks: Record<string, any> = {};
  for (const b of benchmarksData) {
    benchmarks[b.slug] = await prisma.benchmark.upsert({
      where: { slug: b.slug },
      update: b,
      create: b,
    });
  }

  // 5. Seed Models
  const modelsData = [
    {
      slug: "gpt-4o",
      modelIdentifier: "openai/gpt-4o-2024-08-06",
      name: "GPT-4o",
      companySlug: "openai",
      description: "Flagship multimodal intelligence model with high speed and broad capabilities.",
      modelType: "multimodal",
      contextWindow: 128000,
      inputModalities: ["text", "image", "audio"],
      outputModalities: ["text", "audio"],
      releaseDate: new Date("2024-05-13"),
      status: "active",
      providerSlugs: ["openai-direct", "aws-bedrock", "openrouter"],
      pricing: {
        "openai-direct": {
          input: new Prisma.Decimal("2.500000"),
          output: new Prisma.Decimal("10.000000"),
        },
        "aws-bedrock": {
          input: new Prisma.Decimal("2.500000"),
          output: new Prisma.Decimal("10.000000"),
        },
        openrouter: {
          input: new Prisma.Decimal("2.500000"),
          output: new Prisma.Decimal("10.000000"),
        },
      },
      capabilitySlugs: [
        "reasoning",
        "code-generation",
        "vision",
        "function-calling",
        "structured-output",
        "audio",
      ],
      benchmarkScores: [
        { benchmarkSlug: "mmlu", score: new Prisma.Decimal("88.7000") },
        { benchmarkSlug: "humaneval", score: new Prisma.Decimal("90.2000") },
        { benchmarkSlug: "gsm8k", score: new Prisma.Decimal("95.8000") },
        { benchmarkSlug: "gpqa", score: new Prisma.Decimal("53.6000") },
      ],
    },
    {
      slug: "claude-3-5-sonnet",
      modelIdentifier: "anthropic/claude-3-5-sonnet-20241022",
      name: "Claude 3.5 Sonnet",
      companySlug: "anthropic",
      description:
        "State-of-the-art coding, reasoning, and visual understanding with exceptional nuance.",
      modelType: "multimodal",
      contextWindow: 200000,
      inputModalities: ["text", "image"],
      outputModalities: ["text"],
      releaseDate: new Date("2024-10-22"),
      status: "active",
      providerSlugs: ["anthropic-direct", "aws-bedrock", "openrouter"],
      pricing: {
        "anthropic-direct": {
          input: new Prisma.Decimal("3.000000"),
          output: new Prisma.Decimal("15.000000"),
        },
        "aws-bedrock": {
          input: new Prisma.Decimal("3.000000"),
          output: new Prisma.Decimal("15.000000"),
        },
        openrouter: {
          input: new Prisma.Decimal("3.000000"),
          output: new Prisma.Decimal("15.000000"),
        },
      },
      capabilitySlugs: [
        "reasoning",
        "code-generation",
        "vision",
        "function-calling",
        "structured-output",
      ],
      benchmarkScores: [
        { benchmarkSlug: "mmlu", score: new Prisma.Decimal("88.3000") },
        { benchmarkSlug: "humaneval", score: new Prisma.Decimal("93.7000") },
        { benchmarkSlug: "gsm8k", score: new Prisma.Decimal("96.4000") },
        { benchmarkSlug: "gpqa", score: new Prisma.Decimal("65.0000") },
      ],
    },
    {
      slug: "gemini-1-5-pro",
      modelIdentifier: "google/gemini-1.5-pro-002",
      name: "Gemini 1.5 Pro",
      companySlug: "google",
      description:
        "2-million token long-context frontier model with native audio, video, and text reasoning.",
      modelType: "multimodal",
      contextWindow: 2000000,
      inputModalities: ["text", "image", "audio", "video"],
      outputModalities: ["text"],
      releaseDate: new Date("2024-09-24"),
      status: "active",
      providerSlugs: ["google-ai-studio", "openrouter"],
      pricing: {
        "google-ai-studio": {
          input: new Prisma.Decimal("1.250000"),
          output: new Prisma.Decimal("5.000000"),
        },
        openrouter: {
          input: new Prisma.Decimal("1.250000"),
          output: new Prisma.Decimal("5.000000"),
        },
      },
      capabilitySlugs: [
        "reasoning",
        "code-generation",
        "vision",
        "audio",
        "function-calling",
        "structured-output",
      ],
      benchmarkScores: [
        { benchmarkSlug: "mmlu", score: new Prisma.Decimal("85.9000") },
        { benchmarkSlug: "humaneval", score: new Prisma.Decimal("84.1000") },
        { benchmarkSlug: "gsm8k", score: new Prisma.Decimal("91.7000") },
        { benchmarkSlug: "gpqa", score: new Prisma.Decimal("58.5000") },
      ],
    },
    {
      slug: "llama-3-1-405b",
      modelIdentifier: "meta/llama-3.1-405b-instruct",
      name: "Llama 3.1 405B",
      companySlug: "meta",
      description:
        "Premier open-weight foundation model rivaling leading closed models in knowledge and coding.",
      modelType: "chat",
      contextWindow: 128000,
      inputModalities: ["text"],
      outputModalities: ["text"],
      releaseDate: new Date("2024-07-23"),
      status: "active",
      providerSlugs: ["together-ai", "groq", "openrouter"],
      pricing: {
        "together-ai": {
          input: new Prisma.Decimal("3.500000"),
          output: new Prisma.Decimal("3.500000"),
        },
        groq: { input: new Prisma.Decimal("2.900000"), output: new Prisma.Decimal("2.900000") },
        openrouter: {
          input: new Prisma.Decimal("3.000000"),
          output: new Prisma.Decimal("3.000000"),
        },
      },
      capabilitySlugs: ["reasoning", "code-generation", "function-calling", "structured-output"],
      benchmarkScores: [
        { benchmarkSlug: "mmlu", score: new Prisma.Decimal("88.6000") },
        { benchmarkSlug: "humaneval", score: new Prisma.Decimal("89.0000") },
        { benchmarkSlug: "gsm8k", score: new Prisma.Decimal("96.8000") },
      ],
    },
    {
      slug: "deepseek-v3",
      modelIdentifier: "deepseek/deepseek-chat-v3",
      name: "DeepSeek-V3",
      companySlug: "deepseek",
      description:
        "Massively parallel 671B MoE architecture delivering frontier-grade quality with low inference cost.",
      modelType: "chat",
      contextWindow: 128000,
      inputModalities: ["text"],
      outputModalities: ["text"],
      releaseDate: new Date("2024-12-26"),
      status: "active",
      providerSlugs: ["together-ai", "openrouter"],
      pricing: {
        "together-ai": {
          input: new Prisma.Decimal("0.270000"),
          output: new Prisma.Decimal("1.100000"),
        },
        openrouter: {
          input: new Prisma.Decimal("0.270000"),
          output: new Prisma.Decimal("1.100000"),
        },
      },
      capabilitySlugs: ["reasoning", "code-generation", "function-calling", "structured-output"],
      benchmarkScores: [
        { benchmarkSlug: "mmlu", score: new Prisma.Decimal("88.5000") },
        { benchmarkSlug: "humaneval", score: new Prisma.Decimal("82.6000") },
        { benchmarkSlug: "gsm8k", score: new Prisma.Decimal("89.3000") },
      ],
    },
  ];

  for (const m of modelsData) {
    const company = companies[m.companySlug];
    if (!company) continue;

    const model = await prisma.model.upsert({
      where: { slug: m.slug },
      update: {
        name: m.name,
        modelIdentifier: m.modelIdentifier,
        description: m.description,
        companyId: company.id,
        modelType: m.modelType,
        contextWindow: m.contextWindow,
        inputModalities: m.inputModalities,
        outputModalities: m.outputModalities,
        releaseDate: m.releaseDate,
        status: m.status,
      },
      create: {
        slug: m.slug,
        name: m.name,
        modelIdentifier: m.modelIdentifier,
        description: m.description,
        companyId: company.id,
        modelType: m.modelType,
        contextWindow: m.contextWindow,
        inputModalities: m.inputModalities,
        outputModalities: m.outputModalities,
        releaseDate: m.releaseDate,
        status: m.status,
      },
    });

    // Model <-> Provider associations & Pricing
    for (const provSlug of m.providerSlugs) {
      const provider = providers[provSlug];
      if (!provider) continue;

      const modelProvider = await prisma.modelProvider.upsert({
        where: {
          modelId_providerId: {
            modelId: model.id,
            providerId: provider.id,
          },
        },
        update: {
          availabilityStatus: "available",
          providerModelIdentifier: m.modelIdentifier,
        },
        create: {
          modelId: model.id,
          providerId: provider.id,
          availabilityStatus: "available",
          providerModelIdentifier: m.modelIdentifier,
        },
      });

      const pConfig = m.pricing[provSlug as keyof typeof m.pricing];
      if (pConfig) {
        await prisma.pricing.create({
          data: {
            modelProviderId: modelProvider.id,
            inputPrice: pConfig.input,
            outputPrice: pConfig.output,
            currency: "USD",
            pricingUnit: "1M_TOKENS",
            source: "official_api_pricing",
            lastVerifiedAt: new Date(),
          },
        });
      }
    }

    // Model <-> Capabilities
    for (const capSlug of m.capabilitySlugs) {
      const cap = capabilities[capSlug];
      if (!cap) continue;

      await prisma.modelCapability.upsert({
        where: {
          modelId_capabilityId: {
            modelId: model.id,
            capabilityId: cap.id,
          },
        },
        update: {},
        create: {
          modelId: model.id,
          capabilityId: cap.id,
        },
      });
    }

    // Model <-> Benchmarks
    for (const bScore of m.benchmarkScores) {
      const bench = benchmarks[bScore.benchmarkSlug];
      if (!bench) continue;

      await prisma.modelBenchmark.upsert({
        where: {
          modelId_benchmarkId_datasetVersion: {
            modelId: model.id,
            benchmarkId: bench.id,
            datasetVersion: "standard",
          },
        },
        update: {
          score: bScore.score,
          scoreUnit: bench.scoreUnit,
        },
        create: {
          modelId: model.id,
          benchmarkId: bench.id,
          score: bScore.score,
          scoreUnit: bench.scoreUnit,
          datasetVersion: "standard",
          evaluationDate: new Date(),
          source: "official_technical_report",
        },
      });
    }
  }

  console.log("Database seeded successfully with deterministic data!");
}

main()
  .catch((e) => {
    console.error("Seed execution failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
