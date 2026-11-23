# Database Design & Schema Architecture — OneAtlas

**Engine:** PostgreSQL (Hosted on Neon)  
**ORM:** Prisma ORM  
**Architecture:** Multi-version benchmark evaluations, canonical pricing provenance, and relational referential integrity.

---

## 1. Domain Entities & Normalized Relationships

The schema implements 10 core entities supporting all discovery, comparison, and benchmarking modules:

1. **`Company`**: AI research labs and organizations (e.g. OpenAI, Anthropic, Google).
2. **`Model`**: Foundation models (e.g. GPT-4o, Claude 3.5 Sonnet) with canonical `modelType` (`multimodal`, `chat`, `embedding`, `code`, `audio`, `reasoning`), `contextWindow`, and modalities.
3. **`Provider`**: Infrastructure hosting and cloud inference providers (e.g. Together AI, AWS Bedrock, Groq).
4. **`ModelProvider`**: Junction connecting models to inference providers with `availabilityStatus` (`available`, `limited`, `waitlist`, `retired`) and `providerModelIdentifier`.
5. **`Pricing`**: Historical and effective pricing per provider offering with Decimal precision (`Decimal(12, 6)`), explicit `currency` (`USD`, `EUR`, `GBP`), `pricingUnit` (`1M_TOKENS`, `1K_TOKENS`, `PER_REQUEST`), temporal bounds (`effectiveFrom`, `effectiveTo`), and provenance metadata (`source`, `lastVerifiedAt`, `dataClassification`).
6. **`Capability`**: High-level capabilities (e.g. Vision, Reasoning, Code Generation).
7. **`ModelCapability`**: Association table connecting models with capabilities (`@@unique([modelId, capabilityId])`).
8. **`Benchmark`**: Canonical benchmark identity (e.g. MMLU, GSM8K, HumanEval) defining immutable identity, slug, name, and domain category.
9. **`BenchmarkVersion`**: Standardized protocols and version definitions for a benchmark (e.g. MMLU 5-shot vs 0-shot-cot, HumanEval pass@1), defining `scoreUnit`, `scoreDirection` (`HIGHER_IS_BETTER` or `LOWER_IS_BETTER`), and source.
10. **`ModelBenchmark`**: Evaluated scores referencing a specific `BenchmarkVersion` (`ModelBenchmark -> BenchmarkVersion -> Benchmark`) with `score` (`Decimal(8, 4)`), `scoreUnit`, `datasetVersion`, `evaluationDate`, `evaluator`, `source`, `isPublished`, and `dataClassification`.

---

## 2. Integrity & Database Constraints

- **Unique Identifiers:**
  - `Company.slug`, `Model.slug`, `Provider.slug`, `Capability.slug`, `Benchmark.slug`.
  - `BenchmarkVersion.benchmarkId` + `BenchmarkVersion.version` (`@@unique([benchmarkId, version])`).
  - `ModelProvider`: `@@unique([modelId, providerId])`.
  - `ModelCapability`: `@@unique([modelId, capabilityId])`.
- **Database CHECK Constraints (PostgreSQL):**
  - `contextWindow > 0` on `models`.
  - `availabilityStatus IN ('available', 'limited', 'waitlist', 'retired')` on `model_providers`.
  - `inputPrice >= 0` and `outputPrice >= 0` on `pricings`.
  - `effectiveTo >= effectiveFrom OR effectiveTo IS NULL` on `pricings`.
  - `dataClassification IN ('SOURCE_VERIFIED', 'CURATED', 'SAMPLE', 'UNVERIFIED')` on `pricings` and `model_benchmarks`.
  - `scoreDirection IN ('HIGHER_IS_BETTER', 'LOWER_IS_BETTER')` on `benchmark_versions`.
- **Cascading Referential Integrity:**
  - Foreign keys enforce `onDelete: Cascade` to eliminate orphaned pricing, capabilities, or evaluations when parent models are retired.

---

## 3. Canonical Evaluation & Pricing Policies

### Canonical Evaluation Selection Policy (P0-02)
When displaying model benchmark scores or computing competition rankings:
1. **Deduplication:** A model appears **at most once** per `(benchmarkVersion, datasetVersion)` context.
2. **Selection Rule:** Among published evaluations (`isPublished = true`), the evaluation with the **latest `evaluationDate`** is selected.
3. **Deterministic Tie-Breaking:** If dates are identical or absent, records are ordered deterministically by unique `id ASC`.
4. **Ranking Semantics:** Rankings are computed in PostgreSQL using `RANK() OVER (ORDER BY score DESC/ASC)` for true competition ties (ranks 1, 1, 3). Distinct model counts use `COUNT(DISTINCT mb."modelId")`.

### Canonical Pricing Selection Policy (S3-01, S5-10)
A pricing record is valid as current if and only if:
1. `effectiveFrom <= now()`.
2. `effectiveTo IS NULL OR effectiveTo >= now()`.
3. `inputPrice >= 0`.
4. Currency and pricing unit are supported (`USD`, `1M_TOKENS`).
5. When provider filters are active, only the selected providers are eligible.
