import { prisma } from "@/lib/prisma";
import { CreateModelInput, ModelQueryParams } from "../validators/model.validator";
import { Prisma } from "@prisma/client";

export class ModelRepository {
  async findMany(params: ModelQueryParams) {
    const where: Prisma.ModelWhereInput = {};

    // 1. Status Filter (exclude unpublished / deprecated by default)
    if (params.status && params.status !== "all") {
      where.status = params.status;
    }

    // 2. Search Query (name, identifier, description, company name)
    const searchQuery = params.q || params.search;
    if (searchQuery && searchQuery.trim() !== "") {
      const q = searchQuery.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { modelIdentifier: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { company: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    // 3. Company Filter (Multi-select OR within companies)
    if (params.company && params.company.length > 0) {
      where.company = {
        slug: { in: params.company },
      };
    }

    // 4. Provider & Pricing Filter Composition (Section 6.3 - guarantees both conditions apply to the same ModelProvider)
    const hasProviderFilter = params.provider && params.provider.length > 0;
    const hasPriceFilter = params.minPrice !== undefined || params.maxPrice !== undefined;

    if (hasProviderFilter || hasPriceFilter) {
      const providerCondition: Prisma.ModelProviderWhereInput = {};

      if (hasProviderFilter) {
        providerCondition.provider = {
          slug: { in: params.provider },
        };
      }

      if (hasPriceFilter) {
        const priceFilter: Prisma.DecimalFilter = {};
        if (params.minPrice !== undefined) {
          priceFilter.gte = new Prisma.Decimal(params.minPrice);
        }
        if (params.maxPrice !== undefined) {
          priceFilter.lte = new Prisma.Decimal(params.maxPrice);
        }

        providerCondition.pricing = {
          some: {
            inputPrice: priceFilter,
            OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
          },
        };
      }

      where.providers = {
        some: providerCondition,
      };
    }

    // 5. Category Filter (Multi-select OR within categories)
    if (params.category && params.category.length > 0) {
      where.modelType = { in: params.category };
    }

    // 6. Capability Filter (Multi-select OR within capabilities)
    if (params.capability && params.capability.length > 0) {
      where.capabilities = {
        some: {
          capability: {
            slug: { in: params.capability },
          },
        },
      };
    }

    // 7. Context Window Range
    if (params.minContextWindow !== undefined || params.maxContextWindow !== undefined) {
      const contextFilter: Prisma.IntNullableFilter = {};
      if (params.minContextWindow !== undefined) {
        contextFilter.gte = params.minContextWindow;
      }
      if (params.maxContextWindow !== undefined) {
        contextFilter.lte = params.maxContextWindow;
      }
      where.contextWindow = contextFilter;
    }

    const isPricingSort =
      params.sort === "pricing_asc" ||
      params.sort === "price_asc" ||
      params.sort === "pricing_desc" ||
      params.sort === "price_desc";

    const commonInclude = {
      company: true,
      providers: {
        include: {
          provider: true,
          pricing: {
            where: {
              OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
            },
            orderBy: { effectiveFrom: "desc" as const },
          },
        },
      },
      capabilities: {
        include: {
          capability: true,
        },
      },
      benchmarks: {
        include: {
          benchmark: true,
        },
      },
    };

    // If sorting by pricing across relations, fetch all matching models and sort in-memory
    if (isPricingSort) {
      const allMatching = await prisma.model.findMany({
        where,
        include: commonInclude,
      });

      const total = allMatching.length;

      const getLowestValidInputPrice = (m: any): number | null => {
        let lowest: number | null = null;
        for (const mp of m.providers || []) {
          for (const pr of mp.pricing || []) {
            if (pr.currency === "USD" && pr.pricingUnit === "1M_TOKENS") {
              const price = parseFloat(pr.inputPrice.toString());
              if (!isNaN(price)) {
                if (lowest === null || price < lowest) {
                  lowest = price;
                }
              }
            }
          }
        }
        return lowest;
      };

      const isAsc = params.sort === "pricing_asc" || params.sort === "price_asc";

      allMatching.sort((a, b) => {
        const priceA = getLowestValidInputPrice(a);
        const priceB = getLowestValidInputPrice(b);

        // Unavailable prices are placed last in both ascending and descending
        if (priceA === null && priceB === null) return a.id.localeCompare(b.id);
        if (priceA === null) return 1;
        if (priceB === null) return -1;

        if (priceA !== priceB) {
          return isAsc ? priceA - priceB : priceB - priceA;
        }

        // Deterministic secondary tie-breaker
        return a.id.localeCompare(b.id);
      });

      const skip = (params.page - 1) * params.limit;
      const items = allMatching.slice(skip, skip + params.limit);

      return { items, total };
    }

    // Standard database sorting with secondary tie-breaker
    const orderBy: Prisma.ModelOrderByWithRelationInput[] = [];
    switch (params.sort) {
      case "name_asc":
        orderBy.push({ name: "asc" }, { id: "asc" });
        break;
      case "name_desc":
        orderBy.push({ name: "desc" }, { id: "asc" });
        break;
      case "releaseDate_desc":
      case "date_desc":
        orderBy.push({ releaseDate: { sort: "desc", nulls: "last" } }, { id: "asc" });
        break;
      case "releaseDate_asc":
      case "date_asc":
        orderBy.push({ releaseDate: { sort: "asc", nulls: "last" } }, { id: "asc" });
        break;
      case "contextWindow_desc":
      case "context_desc":
        orderBy.push({ contextWindow: { sort: "desc", nulls: "last" } }, { id: "asc" });
        break;
      case "contextWindow_asc":
      case "context_asc":
        orderBy.push({ contextWindow: { sort: "asc", nulls: "last" } }, { id: "asc" });
        break;
      case "relevance":
      default:
        orderBy.push({ name: "asc" }, { id: "asc" });
        break;
    }

    const skip = (params.page - 1) * params.limit;

    const [items, total] = await Promise.all([
      prisma.model.findMany({
        where,
        include: commonInclude,
        orderBy,
        skip,
        take: params.limit,
      }),
      prisma.model.count({ where }),
    ]);

    return {
      items,
      total,
    };
  }

  async findByIdOrSlug(idOrSlug: string) {
    return prisma.model.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        company: true,
        providers: {
          include: {
            provider: true,
            pricing: {
              where: {
                OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
              },
              orderBy: { effectiveFrom: "desc" },
            },
          },
        },
        capabilities: {
          include: {
            capability: true,
          },
        },
        benchmarks: {
          include: {
            benchmark: true,
          },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return prisma.model.findUnique({
      where: { slug },
      include: {
        company: true,
        providers: {
          include: {
            provider: true,
            pricing: {
              where: {
                OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
              },
              orderBy: { effectiveFrom: "desc" },
            },
          },
        },
        capabilities: {
          include: {
            capability: true,
          },
        },
        benchmarks: {
          include: {
            benchmark: true,
          },
        },
      },
    });
  }

  // Single bounded query for multiple comparison models
  async findByIds(identifiers: string[]) {
    if (!identifiers || identifiers.length === 0) return [];

    return prisma.model.findMany({
      where: {
        OR: [{ slug: { in: identifiers } }, { id: { in: identifiers } }],
      },
      include: {
        company: true,
        providers: {
          include: {
            provider: true,
            pricing: {
              where: {
                OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
              },
              orderBy: { effectiveFrom: "desc" },
            },
          },
        },
        capabilities: {
          include: {
            capability: true,
          },
        },
        benchmarks: {
          include: {
            benchmark: true,
          },
        },
      },
    });
  }

  async getFilterMetadata() {
    const [companies, providers, capabilities, categories, contextStats] = await Promise.all([
      prisma.company.findMany({
        where: {
          models: { some: { status: "active" } },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: { models: true },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.provider.findMany({
        where: {
          models: { some: { model: { status: "active" } } },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: { models: true },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.capability.findMany({
        where: {
          models: { some: { model: { status: "active" } } },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          _count: {
            select: { models: true },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.model.findMany({
        where: { status: "active" },
        select: { modelType: true },
        distinct: ["modelType"],
      }),
      prisma.model.aggregate({
        where: { status: "active", contextWindow: { not: null } },
        _min: { contextWindow: true },
        _max: { contextWindow: true },
      }),
    ]);

    return {
      companies: companies.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        count: c._count.models,
      })),
      providers: providers.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        count: p._count.models,
      })),
      capabilities: capabilities.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        category: c.category,
        count: c._count.models,
      })),
      categories: categories.map((c) => c.modelType).filter(Boolean),
      ranges: {
        minContextWindow: contextStats._min.contextWindow ?? 0,
        maxContextWindow: contextStats._max.contextWindow ?? 2000000,
      },
    };
  }

  async globalSearchModels(query: string, limit = 5) {
    if (!query || query.trim() === "") return [];
    const q = query.trim();

    return prisma.model.findMany({
      where: {
        status: "active",
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { modelIdentifier: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      take: limit,
      orderBy: { name: "asc" },
    });
  }

  async create(data: CreateModelInput) {
    return prisma.model.create({
      data: {
        name: data.name,
        slug: data.slug,
        modelIdentifier: data.modelIdentifier,
        description: data.description,
        companyId: data.companyId,
        modelType: data.modelType,
        contextWindow: data.contextWindow,
        inputModalities: data.inputModalities,
        outputModalities: data.outputModalities,
        releaseDate: data.releaseDate,
        status: data.status,
      },
    });
  }
}

export const modelRepository = new ModelRepository();
