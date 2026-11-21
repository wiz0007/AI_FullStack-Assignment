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

    // 3. Provider Filter (Multi-select OR within providers)
    if (params.provider && params.provider.length > 0) {
      where.providers = {
        some: {
          provider: {
            slug: { in: params.provider },
          },
        },
      };
    }

    // 4. Category Filter (Multi-select OR within categories)
    if (params.category && params.category.length > 0) {
      where.modelType = { in: params.category };
    }

    // 5. Capability Filter (Multi-select OR within capabilities)
    if (params.capability && params.capability.length > 0) {
      where.capabilities = {
        some: {
          capability: {
            slug: { in: params.capability },
          },
        },
      };
    }

    // 6. Context Window Range (exclude nulls from numerical match)
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

    // 7. Pricing Range
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      const priceFilter: Prisma.DecimalFilter = {};
      if (params.minPrice !== undefined) {
        priceFilter.gte = new Prisma.Decimal(params.minPrice);
      }
      if (params.maxPrice !== undefined) {
        priceFilter.lte = new Prisma.Decimal(params.maxPrice);
      }
      where.providers = {
        ...(where.providers as any),
        some: {
          ...((where.providers as any)?.some || {}),
          pricing: {
            some: {
              inputPrice: priceFilter,
            },
          },
        },
      };
    }

    // 8. Sorting with stable secondary tie-breaker
    const orderBy: Prisma.ModelOrderByWithRelationInput[] = [];
    switch (params.sort) {
      case "name_asc":
        orderBy.push({ name: "asc" }, { id: "asc" });
        break;
      case "name_desc":
        orderBy.push({ name: "desc" }, { id: "asc" });
        break;
      case "releaseDate_desc":
        orderBy.push({ releaseDate: { sort: "desc", nulls: "last" } }, { id: "asc" });
        break;
      case "releaseDate_asc":
        orderBy.push({ releaseDate: { sort: "asc", nulls: "last" } }, { id: "asc" });
        break;
      case "contextWindow_desc":
        orderBy.push({ contextWindow: { sort: "desc", nulls: "last" } }, { id: "asc" });
        break;
      case "contextWindow_asc":
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
        include: {
          company: true,
          providers: {
            include: {
              provider: true,
              pricing: {
                orderBy: { effectiveFrom: "desc" },
                take: 1,
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
        skip,
        take: params.limit,
        orderBy,
      }),
      prisma.model.count({ where }),
    ]);

    return { items, total };
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

  async findByIdOrSlug(identifier: string) {
    // Check by slug first, then by id
    const bySlug = await this.findBySlug(identifier);
    if (bySlug) return bySlug;

    return prisma.model.findUnique({
      where: { id: identifier },
      include: {
        company: true,
        providers: {
          include: {
            provider: true,
            pricing: {
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
    const [providers, capabilities, categories, contextStats] = await Promise.all([
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
          select: { name: true, slug: true },
        },
      },
      take: limit,
      orderBy: { name: "asc" },
    });
  }

  async create(data: CreateModelInput) {
    return prisma.model.create({
      data,
      include: {
        company: true,
      },
    });
  }
}

export const modelRepository = new ModelRepository();
