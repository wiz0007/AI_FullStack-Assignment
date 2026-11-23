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
        versions: {
          orderBy: { version: "asc" },
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
        versions: {
          orderBy: { version: "asc" },
        },
      },
    });
  }

  /**
   * S4-01 & S4-02: Database-driven competition rankings with PostgreSQL RANK() window function.
   * Ranks are calculated according to canonical score direction.
   * Display sorting alters row presentation order without mutating canonical competition ranks.
   */
  async getRankings(params: RankingsQueryParams) {
    const benchmark = await this.findBySlugOrId(params.benchmark);
    if (!benchmark) {
      return null;
    }

    // Determine active benchmark version
    const activeVersion = params.benchmarkVersion
      ? benchmark.versions.find((v) => v.version === params.benchmarkVersion)
      : benchmark.versions[0];

    // If requested version does not exist, return empty rankings for that version
    if (!activeVersion) {
      return {
        benchmark: {
          id: benchmark.id,
          name: benchmark.name,
          slug: benchmark.slug,
          description: benchmark.description,
          category: benchmark.category,
          scoreUnit: "percentage",
          scoreDirection: "HIGHER_IS_BETTER",
          version: params.benchmarkVersion || "1.0",
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

    const isHigherBetter = activeVersion.scoreDirection !== "LOWER_IS_BETTER";
    const skip = (params.page - 1) * params.limit;

    // Filter conditions for raw query
    const modelTypeSql = params.category
      ? Prisma.sql`AND m."modelType" = ${params.category}`
      : Prisma.empty;

    const datasetSql = params.datasetVersion
      ? Prisma.sql`AND mb."datasetVersion" = ${params.datasetVersion}`
      : Prisma.empty;

    // S4-01 & P0-02: Calculate distinct eligible models count in PostgreSQL
    const countResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT mb."modelId") as count
      FROM model_benchmarks mb
      JOIN models m ON m.id = mb."modelId"
      WHERE mb."benchmarkVersionId" = ${activeVersion.id}
        AND mb."isPublished" = true
        ${modelTypeSql}
        ${datasetSql}
    `;
    const total = Number(countResult[0]?.count || 0);

    // S4-02 & E12: Display sorting order separate from canonical competition rank
    let displayOrderSql = Prisma.sql`rank ASC, model_name ASC`;
    if (params.sort === "score_asc") {
      displayOrderSql = Prisma.sql`score_num ASC, rank ASC`;
    } else if (params.sort === "score_desc") {
      displayOrderSql = Prisma.sql`score_num DESC, rank ASC`;
    } else if (params.sort === "name_asc") {
      displayOrderSql = Prisma.sql`model_name ASC`;
    } else if (params.sort === "name_desc") {
      displayOrderSql = Prisma.sql`model_name DESC`;
    }

    // P0-02: Execute PostgreSQL ranking query with distinct model deduplication and RANK() competition ranking
    const rankedRows = await prisma.$queryRaw<
      Array<{
        id: string;
        model_id: string;
        score_num: number;
        score_raw: string;
        score_unit: string | null;
        dataset_version: string;
        evaluation_date: Date | null;
        source: string | null;
        evaluator: string | null;
        data_classification: string;
        model_name: string;
        model_slug: string;
        model_identifier: string;
        model_type: string;
        context_window: number | null;
        company_id: string;
        company_name: string;
        company_slug: string;
        company_logo_url: string | null;
        rank: bigint;
      }>
    >`
      WITH distinct_evaluations AS (
        SELECT
          mb.*,
          ROW_NUMBER() OVER (
            PARTITION BY mb."modelId"
            ORDER BY mb."evaluationDate" DESC NULLS LAST, mb.id ASC
          ) as rn
        FROM model_benchmarks mb
        WHERE mb."benchmarkVersionId" = ${activeVersion.id}
          AND mb."isPublished" = true
          ${datasetSql}
      ),
      current_evaluations AS (
        SELECT * FROM distinct_evaluations WHERE rn = 1
      ),
      ranked_scores AS (
        SELECT
          mb.id,
          mb."modelId" as model_id,
          mb.score::float as score_num,
          mb.score::text as score_raw,
          mb."scoreUnit" as score_unit,
          mb."datasetVersion" as dataset_version,
          mb."evaluationDate" as evaluation_date,
          mb.source,
          mb.evaluator,
          mb."dataClassification" as data_classification,
          m.name as model_name,
          m.slug as model_slug,
          m."modelIdentifier" as model_identifier,
          m."modelType" as model_type,
          m."contextWindow" as context_window,
          c.id as company_id,
          c.name as company_name,
          c.slug as company_slug,
          c."logoUrl" as company_logo_url,
          RANK() OVER (
            ORDER BY ${isHigherBetter ? Prisma.sql`mb.score DESC` : Prisma.sql`mb.score ASC`}
          ) as rank
        FROM current_evaluations mb
        JOIN models m ON m.id = mb."modelId"
        JOIN companies c ON c.id = m."companyId"
        WHERE 1=1
          ${modelTypeSql}
      )
      SELECT * FROM ranked_scores
      ORDER BY ${displayOrderSql}
      OFFSET ${skip}
      LIMIT ${params.limit}
    `;

    const items = rankedRows.map((r) => ({
      rank: Number(r.rank),
      modelId: r.model_id,
      modelName: r.model_name,
      modelSlug: r.model_slug,
      modelIdentifier: r.model_identifier,
      modelType: r.model_type,
      contextWindow: r.context_window,
      company: {
        id: r.company_id,
        name: r.company_name,
        slug: r.company_slug,
        logoUrl: r.company_logo_url,
      },
      model: {
        id: r.model_id,
        name: r.model_name,
        slug: r.model_slug,
        modelType: r.model_type,
        company: {
          name: r.company_name,
          slug: r.company_slug,
        },
      },
      score: r.score_num,
      scoreRaw: r.score_raw,
      scoreUnit: r.score_unit || activeVersion.scoreUnit,
      benchmarkVersion: activeVersion.version,
      datasetVersion: r.dataset_version,
      evaluationDate: r.evaluation_date ? new Date(r.evaluation_date).toISOString() : null,
      source: r.source,
      evaluator: r.evaluator,
      dataClassification: r.data_classification || "CURATED",
    }));

    return {
      benchmark: {
        id: benchmark.id,
        name: benchmark.name,
        slug: benchmark.slug,
        description: benchmark.description,
        category: benchmark.category,
        scoreUnit: activeVersion.scoreUnit,
        scoreDirection: activeVersion.scoreDirection,
        version: activeVersion.version,
        versions: benchmark.versions.map((v) => ({
          id: v.id,
          version: v.version,
          scoreUnit: v.scoreUnit,
          scoreDirection: v.scoreDirection,
          description: v.description,
          source: v.source,
        })),
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
