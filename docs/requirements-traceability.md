# OneAtlas — Requirements Traceability Matrix (Sprints 1–5)

This document maps every engineering and product requirement across Sprints 1 through 5 to its corresponding database entities, API endpoints, UI components, and automated test coverage.

---

## 1. Traceability Matrix

| Sprint | Requirement | Database / Architecture | API / Service Layer | UI Component / Page | Automated Test Evidence |
|---|---|---|---|---|---|
| **Sprint 1** | Relational Database Schema & Foreign Keys | PostgreSQL (Neon), `prisma/schema.prisma` | Route Handlers via Prisma singleton | Application Shell & Layout | `tests/integration/health.test.ts`, `tests/unit/env.test.ts` |
| **Sprint 1** | Database Domain Constraints (S1-01) | PostgreSQL CHECK constraints (`models`, `pricings`, `model_providers`, `model_benchmarks`) | `prisma/migrations/20241123000000_...` | N/A (database level) | `prisma/migrations/20241123000000_.../migration.sql` |
| **Sprint 1** | Canonical Model Types & Statuses (S1-02) | `CANONICAL_MODEL_TYPES`, `CANONICAL_MODEL_STATUSES` | `src/server/validators/model.validator.ts` | Model card, filters, rankings | `tests/unit/validation.test.ts` |
| **Sprint 1** | Strict Runtime Environment Validation | `src/config/env.ts` (Zod) | Server startup & Route Handlers | Server Boot | `tests/unit/env.test.ts` |
| **Sprint 1** | Consistent API Error Envelopes | `src/lib/errors.ts`, `src/lib/api-response.ts` | All API routes (`/api/**`) | `src/components/ui/error-state.tsx` | `tests/unit/errors.test.ts` |
| **Sprint 2** | Model Catalogue & Server Pagination | `ModelRepository.findMany` (offset/limit) | `GET /api/models` | `src/components/discovery/pagination.tsx` | `tests/component/pagination.test.tsx`, `tests/integration/discovery-api.test.ts` |
| **Sprint 2** | Multidimensional Filtering & PARITY counts (S2-05) | `ModelRepository.findMany`, `getFilterMetadata` | `GET /api/models`, `GET /api/models/filters` | `src/components/discovery/model-filter-sidebar.tsx` | `tests/integration/discovery-api.test.ts`, `tests/component/active-filters.test.tsx` |
| **Sprint 2** | Price Range Filtering Workflow (S2-01) | `minPrice`, `maxPrice` filters | `GET /api/models?minPrice=X&maxPrice=Y` | `ModelFilterSidebar`, `ActiveFilters` | `tests/unit/validation.test.ts`, `tests/integration/discovery-api.test.ts` |
| **Sprint 2** | Database-Driven Pricing Sorting (S2-02) | PostgreSQL SQL raw aggregation `MIN(p."inputPrice")` | `GET /api/models?sort=pricing_asc` | `src/components/discovery/sort-select.tsx` | `tests/integration/database-pricing.test.ts` |
| **Sprint 2** | Global Search Dialog | `ModelRepository.globalSearchModels` | `GET /api/search` | `src/components/shared/global-search-dialog.tsx` | `tests/integration/discovery-api.test.ts` |
| **Sprint 3** | Canonical Representative Pricing (S3-01, S5-10) | `src/lib/pricing.ts` (`getCurrentlyValidPricing`) | All model endpoints | `ModelCard`, `ComparisonTable`, details | `tests/unit/canonical-pricing.test.ts` |
| **Sprint 3** | Model Detail Profile & Specifications | `ModelRepository.findByIdOrSlug` | `GET /api/models/[id]` | `src/app/models/[id]/page.tsx` | `tests/integration/model-service.test.ts`, `tests/component/model-card.test.tsx` |
| **Sprint 3** | Multi-Model Comparison & History (S3-07, S3-09) | `ModelRepository.findByIds`, `useComparison` | `GET /api/models/compare` | `src/app/compare/page.tsx` | `tests/component/comparison-table.test.tsx`, `tests/integration/compare-api.test.ts` |
| **Sprint 3** | Comparison Difference Detection & Modalities | Dynamic diff engine & truthful modality states | `src/components/comparison/comparison-table.tsx` | `ComparisonTable` | `tests/component/comparison-table.test.tsx` |
| **Sprint 3** | Company Detail Pagination (S3-04) | `CompanyRepository.findBySlug` (pagination) | `GET /api/companies/[slug]?page=X` | `src/app/companies/[slug]/page.tsx` | `tests/unit/company.test.ts` |
| **Sprint 3** | Provider Detail Pagination & Truthful Claims (S3-05, S3-06) | `ProviderRepository.findBySlug` (pagination) | `GET /api/providers/[slug]?page=X` | `src/app/providers/[slug]/page.tsx` | `tests/unit/provider.test.ts` |
| **Sprint 4** | Multi-Version Benchmark Data Architecture (P0-01) | `BenchmarkVersion` (`ModelBenchmark -> BenchmarkVersion -> Benchmark`) | `src/lib/benchmark.ts` (`toBenchmarkEvaluationDTO`) | Model detail, comparison, rankings | `tests/unit/benchmark-contracts.test.ts` |
| **Sprint 4** | Deterministic Current-Evaluation Selection (P0-02) | Latest `evaluationDate`, unique tie-breaker | `selectCurrentEvaluations` | Model detail, comparison, rankings | `tests/unit/benchmark-contracts.test.ts`, `tests/integration/database-ranking.test.ts` |
| **Sprint 4** | PostgreSQL Competition Rankings SQL (S4-01) | PostgreSQL `RANK() OVER (ORDER BY score ...)` | `BenchmarkRepository.getRankings` | `src/components/rankings/leaderboard-table.tsx` | `tests/integration/database-ranking.test.ts`, `tests/component/rankings.test.tsx` |
| **Sprint 4** | Benchmark Version & Dataset Selectors (S4-02) | Multi-version selection pills | `GET /api/benchmarks`, `GET /api/rankings` | `src/app/rankings/page.tsx` | `tests/e2e/rankings-directories.spec.ts` |
| **Sprint 4** | Rankings Database Pagination (S4-03) | `OFFSET ${skip} LIMIT ${limit}`, distinct model counts | `GET /api/rankings?page=X` | `src/app/rankings/page.tsx` | `tests/integration/database-ranking.test.ts` |
| **Sprint 4** | Truthful Evaluation Provenance (S4-05, S4-06) | `dataClassification`, `evaluator`, `source` | `LeaderboardTable`, Model Detail | Provenance Badges & links | `tests/unit/benchmark-contracts.test.ts`, `tests/component/rankings.test.tsx` |
| **Sprint 5** | Multi-Dimensional Benchmark Comparability (P0-03) | Identity, version, dataset, unit, direction | `compareBenchmarkEvaluations` | `ComparisonTable` warning badges | `tests/unit/benchmark-contracts.test.ts` |
| **Sprint 5** | Option 4 Theme Engine & Zero FOUC (S5-07) | CSS variables, pre-hydration script | Client Layout & `ThemeToggle` | `src/components/shared/theme-toggle.tsx` | `tests/unit/theme.test.ts`, `tests/e2e/smoke.spec.ts` |
| **Sprint 5** | Real PostgreSQL Integration Suite (S5-08, S5-09, S5-10) | Live PostgreSQL container execution | Vitest Integration Suite | Repository & Service SQL queries | `tests/integration/database-ranking.test.ts`, `tests/integration/database-pricing.test.ts` |
| **Sprint 5** | Complete Playwright E2E Automation (S5-11, S5-12) | Real browser Chromium automation | Playwright Runner | End-to-end user workflows | `tests/e2e/smoke.spec.ts`, `tests/e2e/discovery.spec.ts`, `tests/e2e/comparison.spec.ts`, `tests/e2e/rankings-directories.spec.ts` |
| **Sprint 5** | CI/CD Observability & Correlation IDs (S5-16) | `x-request-id` header & redacted logs | `src/lib/api-response.ts`, `logger.ts` | API responses & logs | `tests/integration/health.test.ts` |

---

## 2. Automated Test Layering

- **Layer 1 — Unit & Component Tests (Vitest + RTL):** 109 automated tests verifying pricing calculation, benchmark contracts, comparison logic, Zod validation, error envelopes, and isolated React component rendering.
- **Layer 2 — PostgreSQL Database Integration Tests:** Real SQL execution on PostgreSQL container service verifying `RANK()` competition ties, distinct model count deduplication, raw pricing sort aggregation, and constraint compliance.
- **Layer 3 — Playwright End-to-End Tests:** Real headless Chromium browser execution driving full discovery filters, comparison table state, ranking protocol selector, and theme persistence.
