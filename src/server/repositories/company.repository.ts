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

    // Database-level sorting configuration
    const orderBy: Prisma.CompanyOrderByWithRelationInput[] = [];
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
      case "release_desc":
        orderBy.push({ createdAt: "desc" }, { name: "asc" });
        break;
      default:
        orderBy.push({ models: { _count: "desc" } }, { name: "asc" });
        break;
    }

    // Database-level filtering, sorting, and pagination
    const [items, total] = await Promise.all([
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
        orderBy,
        skip,
        take: params.limit,
      }),
      prisma.company.count({ where }),
    ]);

    return {
      items,
      total,
    };
  }

  /**
   * S3-05: Company detail with database-level model pagination and canonical pricing conditions.
   */
  async findBySlug(slug: string, pagination?: { page?: number; limit?: number }) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const company = await prisma.company.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { models: true },
        },
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
                    effectiveFrom: { lte: new Date() },
                    OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
                  },
                  orderBy: [{ effectiveFrom: "desc" }, { id: "asc" }],
                },
              },
            },
          },
          orderBy: { releaseDate: { sort: "desc", nulls: "last" } },
          skip,
          take: limit,
        },
      },
    });

    if (!company) return null;

    return {
      ...company,
      pagination: {
        page,
        limit,
        total: company._count.models,
        totalPages: Math.ceil(company._count.models / limit) || 1,
      },
    };
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
