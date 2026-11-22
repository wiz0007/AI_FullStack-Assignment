import { companyRepository, CompanyRepository } from "../repositories/company.repository";
import { CompanyQueryParams } from "../validators/company.validator";
import { NotFoundError } from "@/lib/errors";

export class CompanyService {
  constructor(private repo: CompanyRepository = companyRepository) {}

  async listCompanies(params: CompanyQueryParams) {
    const { items, total } = await this.repo.findMany(params);
    const totalPages = Math.ceil(total / params.limit) || 1;

    return {
      items: items.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        websiteUrl: c.websiteUrl,
        logoUrl: c.logoUrl,
        headquarters: c.headquarters,
        modelCount: c._count.models,
        recentModels: c.models.map((m) => ({
          id: m.id,
          name: m.name,
          slug: m.slug,
          modelType: m.modelType,
          releaseDate: m.releaseDate ? m.releaseDate.toISOString() : null,
        })),
        createdAt: c.createdAt.toISOString(),
      })),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
        hasNextPage: params.page < totalPages,
        hasPreviousPage: params.page > 1,
      },
    };
  }

  async getCompanyBySlug(slug: string) {
    const company = await this.repo.findBySlug(slug);
    if (!company) {
      throw new NotFoundError(`AI Company or Lab with slug '${slug}' was not found`);
    }

    return {
      id: company.id,
      name: company.name,
      slug: company.slug,
      description: company.description,
      websiteUrl: company.websiteUrl,
      logoUrl: company.logoUrl,
      headquarters: company.headquarters,
      models: company.models.map((m) => {
        const primaryPricing = m.providers?.[0]?.pricing?.[0];
        return {
          id: m.id,
          name: m.name,
          slug: m.slug,
          modelIdentifier: m.modelIdentifier,
          modelType: m.modelType,
          status: m.status,
          contextWindow: m.contextWindow,
          inputModalities: m.inputModalities,
          outputModalities: m.outputModalities,
          releaseDate: m.releaseDate ? m.releaseDate.toISOString() : null,
          pricing: primaryPricing
            ? {
                inputPrice: primaryPricing.inputPrice.toString(),
                outputPrice: primaryPricing.outputPrice.toString(),
                currency: primaryPricing.currency,
                pricingUnit: primaryPricing.pricingUnit,
              }
            : null,
          capabilities: (m.capabilities || []).map((c) => ({
            id: c.capability.id,
            name: c.capability.name,
            slug: c.capability.slug,
          })),
        };
      }),
      createdAt: company.createdAt.toISOString(),
    };
  }
}

export const companyService = new CompanyService();
