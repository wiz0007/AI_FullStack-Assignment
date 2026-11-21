import { modelRepository, ModelRepository } from "../repositories/model.repository";
import { ModelQueryParams, CreateModelInput } from "../validators/model.validator";
import { NotFoundError, ConflictError } from "@/lib/errors";

export class ModelService {
  constructor(private repo: ModelRepository = modelRepository) {}

  async listModels(query: ModelQueryParams) {
    const { items, total } = await this.repo.findMany(query);
    const totalPages = Math.ceil(total / query.limit);

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    };
  }

  async getModelBySlug(slug: string) {
    const model = await this.repo.findBySlug(slug);
    if (!model) {
      throw new NotFoundError("Model", slug);
    }
    return model;
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
