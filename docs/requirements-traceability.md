# OneAtlas — Requirement Traceability Matrix

This document tracks every core engineering and product requirement across Sprints 1 through 4 to its corresponding database entities, API endpoints, UI components, and automated test coverage.

## 1. Traceability Summary

| Area | Requirement | Architecture / DB | API Handler | Component / Page | Automated Test |
|---|---|---|---|---|---|
| **Foundation (Sprint 1)** | Relational DB Schema | Prisma (`prisma/schema.prisma`) | `/api/health`, `/api/ready` | Global Layout, Navbar, Footer | `tests/integration/health.test.ts`, `tests/unit/env.test.ts` |
| **Foundation (Sprint 1)** | Strict Environment Validation | `src/config/env.ts` (Zod) | N/A | Server Boot | `tests/unit/env.test.ts` |
| **Foundation (Sprint 1)** | Consistent Error Responses | `src/lib/errors`, `src/lib/api-response.ts` | All API routes | `src/components/ui/error-state.tsx` | `tests/unit/errors.test.ts` |
| **Model Discovery (Sprint 2)** | Server-driven Pagination | `ModelRepository.findMany` (take/skip) | `GET /api/models` | `src/components/discovery/pagination.tsx` | `tests/component/pagination.test.tsx` |
| **Model Discovery (Sprint 2)** | Multidimensional Filters | `ModelRepository.findMany` (AND filters) | `GET /api/models` | `src/components/discovery/model-filter-sidebar.tsx` | `tests/integration/discovery-api.test.ts` |
| **Model Discovery (Sprint 2)** | Deterministic Sorting | `ModelRepository.findMany` (orderBy) | `GET /api/models` | `src/components/discovery/sort-select.tsx` | `tests/integration/discovery-api.test.ts` |
| **Model Discovery (Sprint 2)** | Global Search Dialog | `ModelService.globalSearch` | `GET /api/search` | `src/components/shared/global-search-dialog.tsx` | `tests/integration/discovery-api.test.ts` |
| **Model Details (Sprint 3)** | Model Profile & Specifications | `ModelRepository.findBySlug` | `GET /api/models/[id]` | `src/app/models/[id]/page.tsx` | `tests/integration/model-service.test.ts` |
| **Model Details (Sprint 3)** | Modalities & Provider Pricing | `ModelProvider`, `ModelPricing` | `GET /api/models/[id]` | `src/app/models/[id]/page.tsx` | `tests/component/model-card.test.tsx` |
| **Comparison (Sprint 3)** | Multi-model Comparison | `ModelRepository.findByIds` | `GET /api/compare` | `src/components/comparison/comparison-table.tsx` | `tests/component/comparison-table.test.tsx`, `tests/integration/compare-api.test.ts` |
| **Comparison (Sprint 3)** | Difference Highlighting & Warnings | Client state & URL params | `GET /api/compare` | `src/components/comparison/comparison-table.tsx` | `tests/component/comparison-table.test.tsx` |
| **Rankings & Benchmarks (Sprint 4)** | Standardized Leaderboard | `BenchmarkRepository.getLeaderboard` | `GET /api/rankings` | `src/components/rankings/leaderboard-table.tsx` | `tests/component/rankings.test.tsx`, `tests/unit/benchmark.test.ts` |
| **Rankings & Benchmarks (Sprint 4)** | Score Direction & Tied Ranks | Competition ranking logic | `GET /api/rankings` | `src/components/rankings/leaderboard-table.tsx` | `tests/component/rankings.test.tsx`, `tests/unit/benchmark.test.ts` |
| **Directories (Sprint 4)** | AI Lab & Company Directory | `CompanyRepository.findMany` | `GET /api/companies`, `GET /api/companies/[slug]` | `src/app/companies/page.tsx`, `src/app/companies/[slug]/page.tsx` | `tests/unit/company.test.ts`, `tests/component/directory-cards.test.tsx` |
| **Directories (Sprint 4)** | Inference Provider Directory | `ProviderRepository.findMany` | `GET /api/providers`, `GET /api/providers/[slug]` | `src/app/providers/page.tsx`, `src/app/providers/[slug]/page.tsx` | `tests/unit/provider.test.ts`, `tests/component/directory-cards.test.tsx` |
| **Data Integrity (Cross-Sprint)** | Canonical Representative Pricing | `src/lib/pricing.ts` | All model list & detail endpoints | Discovery cards, details, comparison table | `tests/unit/canonical-pricing.test.ts` |

## 2. CI/CD & Production Safeguards

- **GitHub Actions Workflows**:
  - `ci.yml`: Runs on push and PR. Sets up isolated PostgreSQL 15 container service, runs `npx prisma migrate deploy`, executes code formatting, ESLint, TypeScript typecheck, schema validation, test suites (86+ tests), and Next.js production build.
  - `preview-deploy.yml`: Requires `PREVIEW_DATABASE_URL` secret, applies migrations, runs build.
  - `production-deploy.yml`: Requires `PRODUCTION_DATABASE_URL` secret, strictly rejects localhost fallbacks, validates environment variables, deploys migrations, and builds release artifacts.
- **Data Provenance**:
  - All static and curated data sources explicitly display provenance without claiming real-time or live verification status.
  - Missing metadata renders explicitly as "Unavailable".
