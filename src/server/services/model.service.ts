import { modelRepository, ModelRepository } from "../repositories/model.repository";
import { companyRepository, CompanyRepository } from "../repositories/company.repository";
import { providerRepository, ProviderRepository } from "../repositories/provider.repository";
import {
  ModelQueryParams,
  CreateModelInput,
  GlobalSearchQueryParams,
} from "../validators/model.validator";
import { NotFoundError, ConflictError } from "@/lib/errors";

export class ModelService {
  constructor(
    private repo: ModelRepository = modelRepository,
    private provRepo: ProviderRepository = providerRepository,
    private compRepo: CompanyRepository = companyRepository
  ) {}

  async listModels(query: ModelQueryParams) {
    const { items, total } = await this.repo.findMany(query);
    const totalPages = Math.ceil(total / query.limit) || 1;
    const page = query.page;

    return {
      items,
      pagination: {
        page,
        limit: query.limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getModelBySlugOrId(slugOrId: string) {
    const model = await this.repo.findByIdOrSlug(slugOrId);
    if (!model) {
      throw new NotFoundError(`Model with identifier '${slugOrId}' was not found`);
    }
    return model;
  }

  async getModelBySlug(slug: string) {
    return this.getModelBySlugOrId(slug);
  }

  // Model Comparison Service
  async compareModels(identifiers: string[]) {
    if (!identifiers || identifiers.length === 0) {
      return { models: [], missingIds: [] };
    }

    const fetchedModels = await this.repo.findByIds(identifiers);

    // Map fetched models by slug and id for constant-time lookup
    const modelMap = new Map<string, any>();
    fetchedModels.forEach((m) => {
      modelMap.set(m.slug.toLowerCase(), m);
      modelMap.set(m.id.toLowerCase(), m);
    });

    const orderedModels: any[] = [];
    const missingIds: string[] = [];

    // Maintain requested ordering and identify missing IDs
    identifiers.forEach((id) => {
      const match = modelMap.get(id.toLowerCase());
      if (match) {
        if (!orderedModels.some((m) => m.id === match.id)) {
          orderedModels.push(match);
        }
      } else {
        if (!missingIds.includes(id)) {
          missingIds.push(id);
        }
      }
    });

    return {
      models: orderedModels,
      missingIds,
    };
  }

  async getFilterMetadata() {
    return this.repo.getFilterMetadata();
  }

  async globalSearch(params: GlobalSearchQueryParams) {
    const query = params.q.trim();
    if (!query) {
      return {
        models: [],
        providers: [],
        companies: [],
        query: "",
      };
    }

    const tasks: Promise<any>[] = [];

    if (params.scope === "all" || params.scope === "models") {
      tasks.push(this.repo.globalSearchModels(query, params.limit));
    } else {
      tasks.push(Promise.resolve([]));
    }

    if (params.scope === "all" || params.scope === "providers") {
      tasks.push(this.provRepo.globalSearchProviders(query, params.limit));
    } else {
      tasks.push(Promise.resolve([]));
    }

    if (params.scope === "all" || params.scope === "companies") {
      tasks.push(this.compRepo.globalSearchCompanies(query, params.limit));
    } else {
      tasks.push(Promise.resolve([]));
    }

    const [models, providers, companies] = await Promise.all(tasks);

    return {
      models: models.map((m: any) => ({
        id: m.id,
        name: m.name,
        slug: m.slug,
        modelType: m.modelType,
        companyName: m.company?.name || null,
        contextWindow: m.contextWindow,
        url: `/models/${m.slug}`,
      })),
      providers: providers.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        url: `/providers/${p.slug}`,
      })),
      companies: companies.map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        url: `/companies/${c.slug}`,
      })),
      query,
    };
  }

  async registerModel(data: CreateModelInput) {
    const existing = await this.repo.findBySlug(data.slug);
    if (existing) {
      throw new ConflictError(`Model with slug '${data.slug}' already exists`);
    }
    return this.repo.create(data);
  }
}

export const modelService = new ModelService();
