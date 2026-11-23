import { prisma } from "@/lib/prisma";
import { CreateModelInput, ModelQueryParams } from "../validators/model.validator";
import { Prisma } from "@prisma/client";
import { getCurrentPricingPrismaWhere, getRepresentativeModelPrice } from "@/lib/pricing";

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

        const currentPricingCondition = getCurrentPricingPrismaWhere();
        providerCondition.pricing = {
          some: {
            ...currentPricingCondition,
            currency: "USD",
            pricingUnit: "1M_TOKENS",
            inputPrice: priceFilter,
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
            where: getCurrentPricingPrismaWhere(),
            orderBy: [{ effectiveFrom: "desc" as const }, { id: "asc" as const }],
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
          benchmarkVersion: {
            include: {
              benchmark: true,
            },
          },
        },
      },
    };

    // S2-02: Database-driven pricing sorting and pagination using PostgreSQL aggregation
    if (isPricingSort) {
      const isAsc = params.sort === "pricing_asc" || params.sort === "price_asc";
      const now = new Date();
      const skip = (params.page - 1) * params.limit;

      // 1. Get total count of matching models in the database
      const total = await prisma.model.count({ where });

      // 2. Retrieve matching model IDs using Prisma's where to preserve 100% filter parity
      const matchingIds = await prisma.model.findMany({
        where,
        select: { id: true },
      });
      const idList = matchingIds.map((m) => m.id);

      if (idList.length === 0) {
        return { items: [], total: 0 };
      }

      // 3. Execute PostgreSQL query with JOIN and MIN aggregation on current valid USD pricing
      const providerFilterSql =
        params.provider && params.provider.length > 0
          ? Prisma.sql`AND pr.slug IN (${Prisma.join(params.provider)})`
          : Prisma.empty;

      const sortedRows = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT m.id
        FROM models m
        LEFT JOIN model_providers mp ON mp."modelId" = m.id
        LEFT JOIN providers pr ON pr.id = mp."providerId"
        LEFT JOIN pricings p ON p."modelProviderId" = mp.id 
          AND p.currency = 'USD' 
          AND p."pricingUnit" = '1M_TOKENS'
          AND p."effectiveFrom" <= ${now}
          AND (p."effectiveTo" IS NULL OR p."effectiveTo" >= ${now})
          ${providerFilterSql}
        WHERE m.id IN (${Prisma.join(idList)})
        GROUP BY m.id
        ORDER BY 
          CASE WHEN MIN(p."inputPrice") IS NULL THEN 1 ELSE 0 END ASC,
          ${isAsc ? Prisma.sql`MIN(p."inputPrice") ASC` : Prisma.sql`MIN(p."inputPrice") DESC`},
          m.id ASC
        OFFSET ${skip}
        LIMIT ${params.limit}
      `;

      const pagedIds = sortedRows.map((r) => r.id);
      if (pagedIds.length === 0) {
        return { items: [], total };
      }

      // 4. Fetch the full records for this specific page (at most limit records)
      const pageModels = await prisma.model.findMany({
        where: { id: { in: pagedIds } },
        include: commonInclude,
      });

      // Preserve exact database-sorted ordering
      const idMap = new Map(pageModels.map((m) => [m.id, m]));
      const items = pagedIds.map((id) => idMap.get(id)!).filter(Boolean);

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
              where: getCurrentPricingPrismaWhere(),
              orderBy: [{ effectiveFrom: "desc" }, { id: "asc" }],
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
            benchmarkVersion: {
              include: {
                benchmark: true,
              },
            },
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
              where: getCurrentPricingPrismaWhere(),
              orderBy: [{ effectiveFrom: "desc" }, { id: "asc" }],
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
            benchmarkVersion: {
              include: {
                benchmark: true,
              },
            },
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
              where: getCurrentPricingPrismaWhere(),
              orderBy: [{ effectiveFrom: "desc" }, { id: "asc" }],
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
            benchmarkVersion: {
              include: {
                benchmark: true,
              },
            },
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
            select: {
              models: {
                where: { status: "active" },
              },
            },
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
            select: {
              models: {
                where: { model: { status: "active" } },
              },
            },
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
            select: {
              models: {
                where: { model: { status: "active" } },
              },
            },
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
