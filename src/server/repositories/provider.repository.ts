import { prisma } from "@/lib/prisma";
import { ProviderQueryParams } from "../validators/provider.validator";
import { Prisma } from "@prisma/client";

export class ProviderRepository {
  async findMany(params: ProviderQueryParams) {
    const where: Prisma.ProviderWhereInput = {};

    if (params.q && params.q.trim() !== "") {
      const q = params.q.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
      ];
    }

    const skip = (params.page - 1) * params.limit;

    // Database-level sorting configuration
    const orderBy: Prisma.ProviderOrderByWithRelationInput[] = [];
    switch (params.sort) {
      case "name_asc":
        orderBy.push({ name: "asc" }, { id: "asc" });
        break;
      case "name_desc":
        orderBy.push({ name: "desc" }, { id: "asc" });
        break;
      case "models_desc":
        orderBy.push({ models: { _count: "desc" } }, { name: "asc" });
        break;
      default:
        orderBy.push({ models: { _count: "desc" } }, { name: "asc" });
        break;
    }

    // Database-level filtering, sorting, and pagination
    const [items, total] = await Promise.all([
      prisma.provider.findMany({
        where,
        include: {
          _count: {
            select: { models: true },
          },
          models: {
            select: {
              id: true,
              availabilityStatus: true,
              model: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  modelType: true,
                },
              },
            },
            take: 4,
          },
        },
        orderBy,
        skip,
        take: params.limit,
      }),
      prisma.provider.count({ where }),
    ]);

    return {
      items,
      total,
    };
  }

  async findBySlug(slug: string) {
    return prisma.provider.findUnique({
      where: { slug },
      include: {
        models: {
          include: {
            model: {
              include: {
                company: true,
                capabilities: {
                  include: {
                    capability: true,
                  },
                },
              },
            },
            pricing: {
              where: {
                OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
              },
              orderBy: { effectiveFrom: "desc" },
            },
          },
          orderBy: { model: { name: "asc" } },
        },
      },
    });
  }

  async globalSearchProviders(query: string, limit = 5) {
    if (!query || query.trim() === "") return [];
    const q = query.trim();

    return prisma.provider.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
        ],
      },
      take: limit,
      orderBy: { name: "asc" },
    });
  }
}

export const providerRepository = new ProviderRepository();
