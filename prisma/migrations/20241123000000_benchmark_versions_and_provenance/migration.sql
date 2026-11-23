-- CreateTable: benchmark_versions
CREATE TABLE "benchmark_versions" (
    "id" TEXT NOT NULL,
    "benchmarkId" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "scoreUnit" TEXT NOT NULL DEFAULT 'percentage',
    "scoreDirection" TEXT NOT NULL DEFAULT 'HIGHER_IS_BETTER',
    "description" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "benchmark_versions_pkey" PRIMARY KEY ("id")
);

-- Backfill benchmark_versions from existing benchmarks
INSERT INTO "benchmark_versions" ("id", "benchmarkId", "version", "scoreUnit", "scoreDirection", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    "id",
    COALESCE("version", '1.0'),
    COALESCE("scoreUnit", 'percentage'),
    COALESCE("scoreDirection", 'HIGHER_IS_BETTER'),
    "createdAt",
    "updatedAt"
FROM "benchmarks";

-- Add columns to model_benchmarks
ALTER TABLE "model_benchmarks" ADD COLUMN "benchmarkVersionId" TEXT;
ALTER TABLE "model_benchmarks" ADD COLUMN "evaluator" TEXT;
ALTER TABLE "model_benchmarks" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "model_benchmarks" ADD COLUMN "dataClassification" TEXT NOT NULL DEFAULT 'CURATED';
ALTER TABLE "model_benchmarks" ALTER COLUMN "scoreUnit" DROP NOT NULL;

-- Backfill benchmarkVersionId in model_benchmarks
UPDATE "model_benchmarks" mb
SET "benchmarkVersionId" = bv."id"
FROM "benchmark_versions" bv
WHERE bv."benchmarkId" = mb."benchmarkId";

-- Drop old foreign key & constraints on model_benchmarks
ALTER TABLE "model_benchmarks" DROP CONSTRAINT IF EXISTS "model_benchmarks_benchmarkId_fkey";
DROP INDEX IF EXISTS "model_benchmarks_benchmarkId_idx";
DROP INDEX IF EXISTS "model_benchmarks_modelId_benchmarkId_datasetVersion_key";

-- Make benchmarkVersionId NOT NULL
ALTER TABLE "model_benchmarks" ALTER COLUMN "benchmarkVersionId" SET NOT NULL;
ALTER TABLE "model_benchmarks" DROP COLUMN "benchmarkId";

-- Drop deprecated columns from benchmarks
ALTER TABLE "benchmarks" DROP COLUMN IF EXISTS "scoreUnit";
ALTER TABLE "benchmarks" DROP COLUMN IF EXISTS "scoreDirection";
ALTER TABLE "benchmarks" DROP COLUMN IF EXISTS "version";

-- Add columns to pricings
ALTER TABLE "pricings" ADD COLUMN "dataClassification" TEXT NOT NULL DEFAULT 'CURATED';
ALTER TABLE "pricings" ALTER COLUMN "lastVerifiedAt" DROP NOT NULL;

-- Create Indexes
CREATE UNIQUE INDEX "benchmark_versions_benchmarkId_version_key" ON "benchmark_versions"("benchmarkId", "version");
CREATE INDEX "benchmark_versions_benchmarkId_idx" ON "benchmark_versions"("benchmarkId");
CREATE INDEX "model_benchmarks_benchmarkVersionId_idx" ON "model_benchmarks"("benchmarkVersionId");
CREATE INDEX "model_benchmarks_evaluationDate_idx" ON "model_benchmarks"("evaluationDate");

-- Add Foreign Keys
ALTER TABLE "benchmark_versions" ADD CONSTRAINT "benchmark_versions_benchmarkId_fkey" FOREIGN KEY ("benchmarkId") REFERENCES "benchmarks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "model_benchmarks" ADD CONSTRAINT "model_benchmarks_benchmarkVersionId_fkey" FOREIGN KEY ("benchmarkVersionId") REFERENCES "benchmark_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add Domain Constraints (S1-01)
ALTER TABLE "models" ADD CONSTRAINT "models_context_window_check" CHECK ("contextWindow" IS NULL OR "contextWindow" > 0);
ALTER TABLE "models" ADD CONSTRAINT "models_name_not_empty" CHECK (length(trim("name")) > 0);
ALTER TABLE "models" ADD CONSTRAINT "models_identifier_not_empty" CHECK (length(trim("modelIdentifier")) > 0);
ALTER TABLE "model_providers" ADD CONSTRAINT "model_providers_availability_status_check" CHECK ("availabilityStatus" IN ('available', 'limited', 'waitlist', 'retired'));
ALTER TABLE "pricings" ADD CONSTRAINT "pricings_input_price_check" CHECK ("inputPrice" >= 0);
ALTER TABLE "pricings" ADD CONSTRAINT "pricings_output_price_check" CHECK ("outputPrice" >= 0);
ALTER TABLE "pricings" ADD CONSTRAINT "pricings_effective_dates_check" CHECK ("effectiveTo" IS NULL OR "effectiveTo" >= "effectiveFrom");
ALTER TABLE "pricings" ADD CONSTRAINT "pricings_unit_check" CHECK ("pricingUnit" IN ('1M_TOKENS', '1K_TOKENS', 'PER_REQUEST'));
ALTER TABLE "benchmark_versions" ADD CONSTRAINT "benchmark_versions_direction_check" CHECK ("scoreDirection" IN ('HIGHER_IS_BETTER', 'LOWER_IS_BETTER'));
ALTER TABLE "model_benchmarks" ADD CONSTRAINT "model_benchmarks_classification_check" CHECK ("dataClassification" IN ('SAMPLE', 'CURATED', 'SOURCE_VERIFIED', 'UNVERIFIED'));
ALTER TABLE "pricings" ADD CONSTRAINT "pricings_classification_check" CHECK ("dataClassification" IN ('SAMPLE', 'CURATED', 'SOURCE_VERIFIED', 'UNVERIFIED'));
