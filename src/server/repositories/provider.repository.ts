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

    const [providers, total] = await Promise.all([
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
      }),
      prisma.provider.count({ where }),
    ]);

    const sorted = [...providers].sort((a, b) => {
      switch (params.sort) {
        case "name_asc":
          return a.name.localeCompare(b.name) || a.id.localeCompare(b.id);
        case "name_desc":
          return b.name.localeCompare(a.name) || a.id.localeCompare(b.id);
        case "models_desc":
          if (b._count.models !== a._count.models) {
            return b._count.models - a._count.models;
          }
          return a.name.localeCompare(b.name);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    const items = sorted.slice(skip, skip + params.limit);

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
