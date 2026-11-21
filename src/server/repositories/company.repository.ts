import { prisma } from "@/lib/prisma";

export class CompanyRepository {
  async findAll() {
    return prisma.company.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { models: true },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return prisma.company.findUnique({
      where: { slug },
      include: {
        models: true,
      },
    });
  }
}

export const companyRepository = new CompanyRepository();
