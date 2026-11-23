import { prisma } from "@/lib/prisma";
import { RankingsQueryParams } from "../validators/benchmark.validator";
import { Prisma } from "@prisma/client";

export class BenchmarkRepository {
  async findAll(category?: string) {
    const where: Prisma.BenchmarkWhereInput = {};
    if (category) {
      where.category = category;
    }

    return prisma.benchmark.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { modelScores: true },
        },
      },
    });
  }

  async findBySlugOrId(slugOrId: string) {
    return prisma.benchmark.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }],
      },
      include: {
        _count: {
          select: { modelScores: true },
        },
      },
    });
  }

  async getRankings(params: RankingsQueryParams) {
    const benchmark = await this.findBySlugOrId(params.benchmark);
    if (!benchmark) {
      return null;
    }

    const where: Prisma.ModelBenchmarkWhereInput = {
      benchmarkId: benchmark.id,
    };

    if (params.benchmarkVersion && benchmark.version !== params.benchmarkVersion) {
      return {
        benchmark: {
          id: benchmark.id,
          name: benchmark.name,
          slug: benchmark.slug,
          description: benchmark.description,
          category: benchmark.category,
          scoreUnit: benchmark.scoreUnit,
          scoreDirection: benchmark.scoreDirection,
          version: params.benchmarkVersion,
        },
        rankings: [],
        pagination: {
          page: params.page,
          limit: params.limit,
          total: 0,
          totalPages: 1,
        },
      };
    }

    if (params.category) {
      where.model = {
        modelType: params.category,
      };
    }

    if (params.datasetVersion) {
      where.datasetVersion = params.datasetVersion;
    }

    const allScores = await prisma.modelBenchmark.findMany({
      where,
      include: {
        model: {
          include: {
            company: true,
          },
        },
      },
    });

    const isHigherBetter = benchmark.scoreDirection !== "LOWER_IS_BETTER";

    // Sort scores based on score direction and tie-breakers
    const sorted = [...allScores].sort((a, b) => {
      const scoreA = parseFloat(a.score.toString());
      const scoreB = parseFloat(b.score.toString());

      if (scoreA !== scoreB) {
        return isHigherBetter ? scoreB - scoreA : scoreA - scoreB;
      }

      // Tie-breaker: model name, then ID
      const nameCompare = a.model.name.localeCompare(b.model.name);
      if (nameCompare !== 0) return nameCompare;
      return a.modelId.localeCompare(b.modelId);
    });

    // Compute ranks and tied rank display
    let currentRank = 1;
    const rankedRows = sorted.map((row, idx) => {
      const scoreNum = parseFloat(row.score.toString());
      if (idx > 0) {
        const prevScore = parseFloat(sorted[idx - 1].score.toString());
        if (scoreNum !== prevScore) {
          currentRank = idx + 1;
        }
      }

      return {
        rank: currentRank,
        modelId: row.model.id,
        modelName: row.model.name,
        modelSlug: row.model.slug,
        modelIdentifier: row.model.modelIdentifier,
        modelType: row.model.modelType,
        contextWindow: row.model.contextWindow,
        company: {
          id: row.model.company.id,
          name: row.model.company.name,
          slug: row.model.company.slug,
          logoUrl: row.model.company.logoUrl,
        },
        model: {
          id: row.model.id,
          name: row.model.name,
          slug: row.model.slug,
          modelType: row.model.modelType,
          company: {
            name: row.model.company.name,
            slug: row.model.company.slug,
          },
        },
        score: scoreNum,
        scoreRaw: row.score.toString(),
        scoreUnit: row.scoreUnit || benchmark.scoreUnit,
        benchmarkVersion: benchmark.version,
        datasetVersion: row.datasetVersion,
        evaluationDate: row.evaluationDate ? row.evaluationDate.toISOString() : null,
        source: row.source,
      };
    });

    // Custom sorting if user requested
    if (params.sort === "score_asc") {
      rankedRows.sort((a, b) => a.score - b.score || a.rank - b.rank);
    } else if (params.sort === "name_asc") {
      rankedRows.sort((a, b) => a.modelName.localeCompare(b.modelName));
    }

    const total = rankedRows.length;
    const skip = (params.page - 1) * params.limit;
    const items = rankedRows.slice(skip, skip + params.limit);

    return {
      benchmark: {
        id: benchmark.id,
        name: benchmark.name,
        slug: benchmark.slug,
        description: benchmark.description,
        category: benchmark.category,
        scoreUnit: benchmark.scoreUnit,
        scoreDirection: benchmark.scoreDirection,
        version: benchmark.version,
      },
      rankings: items,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit) || 1,
      },
    };
  }
}

export const benchmarkRepository = new BenchmarkRepository();
