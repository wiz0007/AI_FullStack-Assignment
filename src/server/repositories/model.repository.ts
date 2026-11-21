import { prisma } from "@/lib/prisma";
import { CreateModelInput, ModelQueryParams } from "../validators/model.validator";

export class ModelRepository {
  async findMany(params: ModelQueryParams) {
    const where: any = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.modelType) {
      where.modelType = params.modelType;
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
        { modelIdentifier: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.company) {
      where.company = { slug: params.company };
    }

    if (params.capability) {
      where.capabilities = {
        some: {
          capability: { slug: params.capability },
        },
      };
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
        orderBy: { name: "asc" },
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
