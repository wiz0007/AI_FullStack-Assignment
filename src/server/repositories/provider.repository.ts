import { prisma } from "@/lib/prisma";

export class ProviderRepository {
  async findAll() {
    return prisma.provider.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { models: true },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return prisma.provider.findUnique({
      where: { slug },
      include: {
        models: {
          include: {
            model: true,
            pricing: true,
          },
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
