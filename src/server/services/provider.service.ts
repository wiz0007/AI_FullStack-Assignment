import { providerRepository, ProviderRepository } from "../repositories/provider.repository";
import { ProviderQueryParams } from "../validators/provider.validator";
import { NotFoundError } from "@/lib/errors";

export class ProviderService {
  constructor(private repo: ProviderRepository = providerRepository) {}

  async listProviders(params: ProviderQueryParams) {
    const { items, total } = await this.repo.findMany(params);
    const totalPages = Math.ceil(total / params.limit) || 1;

    return {
      items: items.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        websiteUrl: p.websiteUrl,
        logoUrl: p.logoUrl,
        modelCount: p._count.models,
        sampleModels: p.models.map((mp) => ({
          id: mp.model.id,
          name: mp.model.name,
          slug: mp.model.slug,
          modelType: mp.model.modelType,
          availabilityStatus: mp.availabilityStatus,
        })),
        createdAt: p.createdAt.toISOString(),
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

  async getProviderBySlug(slug: string) {
    const provider = await this.repo.findBySlug(slug);
    if (!provider) {
      throw new NotFoundError(`Inference Provider with slug '${slug}' was not found`);
    }

    return {
      id: provider.id,
      name: provider.name,
      slug: provider.slug,
      description: provider.description,
      websiteUrl: provider.websiteUrl,
      logoUrl: provider.logoUrl,
      models: provider.models.map((mp) => {
        const activePricing = mp.pricing?.[0];
        return {
          modelId: mp.model.id,
          name: mp.model.name,
          slug: mp.model.slug,
          modelIdentifier: mp.model.modelIdentifier,
          providerModelIdentifier: mp.providerModelIdentifier || mp.model.modelIdentifier,
          modelType: mp.model.modelType,
          company: {
            name: mp.model.company?.name || "AI Lab",
            slug: mp.model.company?.slug || "",
          },
          availabilityStatus: mp.availabilityStatus,
          pricing: activePricing
            ? {
                inputPrice: activePricing.inputPrice.toString(),
                outputPrice: activePricing.outputPrice.toString(),
                currency: activePricing.currency,
                pricingUnit: activePricing.pricingUnit,
                effectiveFrom: activePricing.effectiveFrom.toISOString(),
                lastVerifiedAt: activePricing.lastVerifiedAt.toISOString(),
                source: activePricing.source,
              }
            : null,
          capabilities: (mp.model.capabilities || []).map((c) => ({
            id: c.capability.id,
            name: c.capability.name,
            slug: c.capability.slug,
          })),
        };
      }),
      createdAt: provider.createdAt.toISOString(),
    };
  }
}

export const providerService = new ProviderService();
