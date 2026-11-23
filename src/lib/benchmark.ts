/**
 * Canonical Benchmark Evaluation Contract & Domain Utilities (P0-01, P0-02, P0-03)
 * Provides canonical DTO mapping, deterministic current-evaluation selection,
 * and multi-dimensional benchmark comparability verification.
 */

export type ScoreDirection = "HIGHER_IS_BETTER" | "LOWER_IS_BETTER";
export type DataClassification = "SOURCE_VERIFIED" | "CURATED" | "SAMPLE" | "UNVERIFIED";

export interface BenchmarkEvaluationDTO {
  id: string;
  modelId: string;
  benchmarkId: string;
  benchmarkSlug: string;
  benchmarkName: string;
  benchmarkCategory: string;
  benchmarkVersionId: string;
  benchmarkVersion: string;
  datasetVersion: string | null;
  score: string;
  scoreNumeric: number;
  scoreUnit: string;
  scoreDirection: ScoreDirection;
  evaluationDate: string | null;
  evaluationProtocol: string | null;
  source: string | null;
  evaluator: string | null;
  dataClassification: DataClassification;
  isPublished: boolean;
  isCurrent: boolean;
  benchmark?: {
    id: string;
    slug: string;
    name: string;
    category: string;
  };
}

/**
 * Maps raw database/Prisma ModelBenchmark records (with nested benchmarkVersion and benchmark)
 * into a canonical, flat BenchmarkEvaluationDTO.
 */
export function toBenchmarkEvaluationDTO(raw: any, isCurrent = true): BenchmarkEvaluationDTO {
  const bv = raw.benchmarkVersion || {};
  const b = bv.benchmark || raw.benchmark || {};

  const scoreRaw = raw.score != null ? String(raw.score) : "0";
  const scoreNum = parseFloat(scoreRaw);

  const scoreDirection: ScoreDirection =
    bv.scoreDirection === "LOWER_IS_BETTER" || raw.scoreDirection === "LOWER_IS_BETTER"
      ? "LOWER_IS_BETTER"
      : "HIGHER_IS_BETTER";

  // Score unit: evaluation override takes precedence if present, otherwise version default, otherwise empty string (no silent "percentage" fabrication)
  const scoreUnit = raw.scoreUnit || bv.scoreUnit || "";

  let evalDateStr: string | null = null;
  if (raw.evaluationDate) {
    const d = new Date(raw.evaluationDate);
    evalDateStr = !isNaN(d.getTime()) ? d.toISOString() : null;
  }

  return {
    id: String(raw.id || ""),
    modelId: String(raw.modelId || ""),
    benchmarkId: String(b.id || raw.benchmarkId || ""),
    benchmarkSlug: String(b.slug || raw.benchmarkSlug || ""),
    benchmarkName: String(b.name || raw.benchmarkName || "Benchmark"),
    benchmarkCategory: String(b.category || raw.benchmarkCategory || "general"),
    benchmarkVersionId: String(bv.id || raw.benchmarkVersionId || ""),
    benchmarkVersion: String(bv.version || raw.benchmarkVersion || "default"),
    datasetVersion: raw.datasetVersion ? String(raw.datasetVersion) : null,
    score: scoreRaw,
    scoreNumeric: isNaN(scoreNum) ? 0 : scoreNum,
    scoreUnit,
    scoreDirection,
    evaluationDate: evalDateStr,
    evaluationProtocol: raw.evaluationProtocol ? String(raw.evaluationProtocol) : null,
    source: raw.source ? String(raw.source) : null,
    evaluator: raw.evaluator ? String(raw.evaluator) : null,
    dataClassification: (raw.dataClassification as DataClassification) || "CURATED",
    isPublished: raw.isPublished !== false,
    isCurrent,
    benchmark: {
      id: String(b.id || raw.benchmarkId || ""),
      slug: String(b.slug || raw.benchmarkSlug || ""),
      name: String(b.name || raw.benchmarkName || "Benchmark"),
      category: String(b.category || raw.benchmarkCategory || "general"),
    },
  };
}

/**
 * P0-02: Deterministic current-evaluation selection policy.
 * For each model and (benchmarkSlug, benchmarkVersion, datasetVersion) context:
 * 1. Filter out unpublished evaluations.
 * 2. Select the evaluation with the latest evaluationDate.
 * 3. Stable tie-breaker: deterministic comparison on id.
 * 4. Distinct output: exactly one current evaluation per benchmark version + dataset context.
 */
export function selectCurrentEvaluations(
  evaluations: BenchmarkEvaluationDTO[]
): BenchmarkEvaluationDTO[] {
  // Group by benchmark context: benchmarkSlug + benchmarkVersion + (datasetVersion || "default")
  const groups = new Map<string, BenchmarkEvaluationDTO[]>();

  for (const ev of evaluations) {
    // Only published evaluations can be current
    if (!ev.isPublished) continue;

    const key = `${ev.benchmarkSlug}:::${ev.benchmarkVersion}:::${ev.datasetVersion || "default"}`;
    const list = groups.get(key) || [];
    list.push(ev);
    groups.set(key, list);
  }

  const selected: BenchmarkEvaluationDTO[] = [];

  Array.from(groups.values()).forEach((list) => {
    list.sort((a: BenchmarkEvaluationDTO, b: BenchmarkEvaluationDTO) => {
      // 1. Latest valid evaluationDate first
      const timeA = a.evaluationDate ? new Date(a.evaluationDate).getTime() : -Infinity;
      const timeB = b.evaluationDate ? new Date(b.evaluationDate).getTime() : -Infinity;
      if (timeB !== timeA) return timeB - timeA;

      // 2. Stable tie-breaker: id asc
      return a.id.localeCompare(b.id);
    });

    // Mark the chosen record as current
    if (list[0]) {
      selected.push({
        ...list[0],
        isCurrent: true,
      });
    }
  });

  // Deterministic final sorting by benchmarkName asc, benchmarkVersion asc
  return selected.sort((a: BenchmarkEvaluationDTO, b: BenchmarkEvaluationDTO) => {
    const nameDiff = a.benchmarkName.localeCompare(b.benchmarkName);
    if (nameDiff !== 0) return nameDiff;
    return a.benchmarkVersion.localeCompare(b.benchmarkVersion);
  });
}

export interface BenchmarkComparisonResult {
  isComparable: boolean;
  incompatibilityReason: string | null;
  matchingContext: {
    benchmarkSlug: string;
    benchmarkVersion: string;
    datasetVersion: string | null;
    scoreUnit: string;
    scoreDirection: ScoreDirection;
  } | null;
  canCalculateDifference: boolean;
  canHighlightWinner: boolean;
  numericDifference?: number;
  winnerModelId?: string | null;
  isTie?: boolean;
}

/**
 * P0-03: Multi-dimensional benchmark comparability engine.
 * A benchmark result may be compared numerically only when:
 * 1. Benchmark identity matches
 * 2. Benchmark version matches
 * 3. Dataset version matches
 * 4. Score unit matches
 * 5. Score direction matches
 * 6. Protocol matches (if specified on both)
 */
export function compareBenchmarkEvaluations(
  evalA?: BenchmarkEvaluationDTO | null,
  evalB?: BenchmarkEvaluationDTO | null
): BenchmarkComparisonResult {
  if (!evalA || !evalB) {
    return {
      isComparable: false,
      incompatibilityReason: "Missing evaluation data for one or both models",
      matchingContext: null,
      canCalculateDifference: false,
      canHighlightWinner: false,
    };
  }

  // 1. Benchmark identity
  if (evalA.benchmarkSlug !== evalB.benchmarkSlug && evalA.benchmarkId !== evalB.benchmarkId) {
    return {
      isComparable: false,
      incompatibilityReason: `Different benchmarks (${evalA.benchmarkName} vs ${evalB.benchmarkName})`,
      matchingContext: null,
      canCalculateDifference: false,
      canHighlightWinner: false,
    };
  }

  // 2. Benchmark version
  if (evalA.benchmarkVersion !== evalB.benchmarkVersion) {
    return {
      isComparable: false,
      incompatibilityReason: `Incompatible benchmark versions (${evalA.benchmarkVersion} vs ${evalB.benchmarkVersion})`,
      matchingContext: null,
      canCalculateDifference: false,
      canHighlightWinner: false,
    };
  }

  // 3. Dataset version
  const dsA = evalA.datasetVersion || "default";
  const dsB = evalB.datasetVersion || "default";
  if (dsA !== dsB) {
    return {
      isComparable: false,
      incompatibilityReason: `Incompatible dataset versions (${dsA} vs ${dsB})`,
      matchingContext: null,
      canCalculateDifference: false,
      canHighlightWinner: false,
    };
  }

  // 4. Score unit
  if (evalA.scoreUnit.toLowerCase() !== evalB.scoreUnit.toLowerCase()) {
    return {
      isComparable: false,
      incompatibilityReason: `Incompatible score units (${evalA.scoreUnit || "none"} vs ${evalB.scoreUnit || "none"})`,
      matchingContext: null,
      canCalculateDifference: false,
      canHighlightWinner: false,
    };
  }

  // 5. Score direction
  if (evalA.scoreDirection !== evalB.scoreDirection) {
    return {
      isComparable: false,
      incompatibilityReason: `Opposite score directions (${evalA.scoreDirection} vs ${evalB.scoreDirection})`,
      matchingContext: null,
      canCalculateDifference: false,
      canHighlightWinner: false,
    };
  }

  // 6. Protocol (if present on both)
  if (
    evalA.evaluationProtocol &&
    evalB.evaluationProtocol &&
    evalA.evaluationProtocol !== evalB.evaluationProtocol
  ) {
    return {
      isComparable: false,
      incompatibilityReason: `Different evaluation protocols (${evalA.evaluationProtocol} vs ${evalB.evaluationProtocol})`,
      matchingContext: null,
      canCalculateDifference: false,
      canHighlightWinner: false,
    };
  }

  // Compatible! Calculate numeric difference
  const numA = evalA.scoreNumeric;
  const numB = evalB.scoreNumeric;
  const diff = Number((numA - numB).toFixed(4));

  let winnerModelId: string | null = null;
  let isTie = false;

  if (numA === numB) {
    isTie = true;
    winnerModelId = null;
  } else if (evalA.scoreDirection === "HIGHER_IS_BETTER") {
    winnerModelId = numA > numB ? evalA.modelId : evalB.modelId;
  } else {
    // LOWER_IS_BETTER
    winnerModelId = numA < numB ? evalA.modelId : evalB.modelId;
  }

  return {
    isComparable: true,
    incompatibilityReason: null,
    matchingContext: {
      benchmarkSlug: evalA.benchmarkSlug,
      benchmarkVersion: evalA.benchmarkVersion,
      datasetVersion: evalA.datasetVersion,
      scoreUnit: evalA.scoreUnit,
      scoreDirection: evalA.scoreDirection,
    },
    canCalculateDifference: true,
    canHighlightWinner: true,
    numericDifference: diff,
    winnerModelId,
    isTie,
  };
}
