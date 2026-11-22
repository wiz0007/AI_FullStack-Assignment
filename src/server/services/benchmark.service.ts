import { benchmarkRepository, BenchmarkRepository } from "../repositories/benchmark.repository";
import { RankingsQueryParams } from "../validators/benchmark.validator";
import { NotFoundError } from "@/lib/errors";

export class BenchmarkService {
  constructor(private repo: BenchmarkRepository = benchmarkRepository) {}

  async listBenchmarks(category?: string) {
    const benchmarks = await this.repo.findAll(category);
    return benchmarks.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      description: b.description,
      category: b.category,
      scoreUnit: b.scoreUnit,
      scoreDirection: b.scoreDirection,
      version: b.version,
      modelCount: b._count.modelScores,
    }));
  }

  async getBenchmarkBySlug(slug: string) {
    const benchmark = await this.repo.findBySlugOrId(slug);
    if (!benchmark) {
      throw new NotFoundError(`Benchmark with slug '${slug}' was not found`);
    }
    return benchmark;
  }

  async getRankings(params: RankingsQueryParams) {
    const result = await this.repo.getRankings(params);
    if (!result) {
      throw new NotFoundError(`Benchmark '${params.benchmark}' was not found`);
    }
    return result;
  }
}

export const benchmarkService = new BenchmarkService();
