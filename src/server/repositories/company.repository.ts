import { prisma } from "@/lib/prisma";
import { CompanyQueryParams } from "../validators/company.validator";
import { Prisma } from "@prisma/client";

export class CompanyRepository {
  async findMany(params: CompanyQueryParams) {
    const where: Prisma.CompanyWhereInput = {};

    if (params.q && params.q.trim() !== "") {
      const q = params.q.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
      ];
    }

    const skip = (params.page - 1) * params.limit;

    // Fetch companies with model count and latest model release date
    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          _count: {
            select: { models: true },
          },
          models: {
            select: {
              id: true,
              name: true,
              slug: true,
              modelType: true,
              releaseDate: true,
            },
            orderBy: { releaseDate: { sort: "desc", nulls: "last" } },
            take: 3,
          },
        },
      }),
      prisma.company.count({ where }),
    ]);

    // Apply sorting
    const sorted = [...companies].sort((a, b) => {
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
        case "release_desc": {
          const dateA = a.models[0]?.releaseDate ? new Date(a.models[0].releaseDate).getTime() : 0;
          const dateB = b.models[0]?.releaseDate ? new Date(b.models[0].releaseDate).getTime() : 0;
          if (dateA !== dateB) return dateB - dateA;
          return a.name.localeCompare(b.name);
        }
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
    return prisma.company.findUnique({
      where: { slug },
      include: {
        models: {
          include: {
            capabilities: {
              include: {
                capability: true,
              },
            },
            providers: {
              include: {
                provider: true,
                pricing: {
                  where: {
                    OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
                  },
                  orderBy: { effectiveFrom: "desc" },
                  take: 1,
                },
              },
            },
          },
          orderBy: { releaseDate: { sort: "desc", nulls: "last" } },
        },
      },
    });
  }

  async globalSearchCompanies(query: string, limit = 5) {
    if (!query || query.trim() === "") return [];
    const q = query.trim();

    return prisma.company.findMany({
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

export const companyRepository = new CompanyRepository();
