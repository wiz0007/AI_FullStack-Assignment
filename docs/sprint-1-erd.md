# ENGINEERING REQUIREMENT DOCUMENT (ERD)
# Sprint 1 — Foundation, Architecture & Database Infrastructure

**Project:** OneAtlas (Working Name)  
**Sprint:** 01  
**Sprint Name:** Foundation, Architecture & Database Infrastructure  
**Project Type:** Full Stack Web Application  
**Engineering Role:** Full Stack Engineer  
**Document Status:** Implementation Specification  
**Priority:** Critical — Foundational Sprint

---

# 1. Sprint Objective

The objective of Sprint 1 is to establish a reliable, scalable, maintainable and production-ready application foundation for the AI Model Discovery and Intelligence Platform.

This sprint must establish the infrastructure required to implement all subsequent product modules without requiring architectural restructuring.

The application must support the future implementation of:

1. AI Model Discovery and Search.
2. Individual Model Detail Pages.
3. Model Comparison.
4. Rankings and Benchmarks.
5. AI Labs and Company Directory.
6. Provider Directory.

Sprint 1 is not intended to implement these complete product modules. It must establish their underlying infrastructure, data relationships, application architecture and development workflows.

## 1.1 Primary outcomes

At the end of this sprint:

- The Next.js application must be running.
- TypeScript must be configured across the application.
- Tailwind CSS must be configured.
- PostgreSQL must be connected.
- Prisma ORM must be operational.
- Initial database schema and migrations must be established.
- Seed data must be available.
- Light and dark themes must work.
- Shared application layouts and foundational UI components must exist.
- API infrastructure and validation must be implemented.
- Automated testing must be configured.
- CI/CD pipelines must be operational.
- A working staging deployment must be available.
- The main branch must remain deployable.

---

# 2. Technology Stack

The following technologies are mandatory or selected for this project.

| Layer | Technology |
|---|---|
| Framework | Next.js |
| Frontend | React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Runtime | Node.js |
| Backend | Next.js Route Handlers |
| Database | PostgreSQL |
| ORM | Prisma |
| Validation | Zod |
| Unit Testing | Vitest |
| Component Testing | React Testing Library |
| E2E Testing | Playwright |
| Code Quality | ESLint + Prettier |
| Version Control | Git + GitHub |
| CI/CD | GitHub Actions |
| Deployment | Vercel |
| Database Hosting | Neon PostgreSQL |

## 2.1 Version management

- Use stable, mutually compatible releases.
- Avoid experimental or canary releases.
- Pin dependency versions through the lockfile.
- Use the same package manager and lockfile locally and in CI.
- Document runtime and package-manager versions.
- Commit all dependency changes through reviewed pull requests.

The project must not introduce unnecessary libraries when native Next.js, React or TypeScript functionality is sufficient.

---

# 3. Application Architecture

## 3.1 Architectural pattern

Use a modular, feature-oriented architecture with clear separation between presentation, HTTP handling, business logic and data access.

The application should follow this request lifecycle:

Browser / Client
↓
Next.js Application
↓
Route Handler
↓
Request Validation (Zod)
↓
Service Layer
↓
Repository / Data Access Layer
↓
Prisma ORM
↓
PostgreSQL

For responses, data should travel back through the same layers.

## 3.2 Layer responsibilities

### A. Presentation Layer

Responsible for:

- Pages and layouts.
- Shared UI components.
- Forms and interactions.
- Theme handling.
- Client-side state.
- Responsive design.

Presentation components must not directly execute database queries.

### B. API Layer

Responsible for:

- HTTP request handling.
- HTTP response formatting.
- Query parameter parsing.
- Input validation.
- Appropriate HTTP status codes.
- Error responses.

Route handlers should remain lightweight.

### C. Service Layer

Responsible for:

- Business rules.
- Workflow orchestration.
- Data transformation.
- Coordination between repositories.
- Business-level error handling.

### D. Data Access Layer

Responsible for:

- Prisma queries.
- Database interactions.
- Transaction execution.
- Query optimization.
- Data retrieval and persistence.

Database access must not be duplicated across unrelated route handlers.

### E. Shared Infrastructure

Responsible for:

- Environment configuration.
- Prisma client lifecycle.
- Logging.
- Error handling.
- Validation utilities.
- Common types.
- Theme configuration.

## 3.3 Server and Client Components

Use React Server Components by default.

Use Client Components only when browser-side interaction is necessary, such as:

- Theme switching.
- Interactive navigation.
- Comparison selection.
- Search input interactions.
- Dropdowns.
- Interactive filtering.

Do not mark entire page trees as Client Components unnecessarily.

Do not expose database credentials, Prisma clients or server-only modules to browser bundles.

---

# 4. Project Structure

Establish the following initial structure.

```text
oneatlas/
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── preview-deploy.yml
│       └── production-deploy.yml
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── src/
│   │
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   │
│   │   └── api/
│   │       └── health/
│   │           └── route.ts
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── shared/
│   │
│   ├── features/
│   │   ├── theme/
│   │   └── shared/
│   │
│   ├── config/
│   │   ├── env.ts
│   │   └── app.ts
│   │
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── logger.ts
│   │   ├── errors/
│   │   └── utils/
│   │
│   ├── server/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── validators/
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   └── types/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/
│   ├── architecture/
│   ├── database/
│   ├── api/
│   └── testing/
│
├── .env.example
├── .gitignore
├── .prettierrc
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── tsconfig.json
├── postcss.config.mjs
└── README.md
```

### Structural requirements

1. Follow feature-oriented organization as product modules are introduced.
2. Avoid creating unnecessary abstractions before there is a genuine need.
3. Keep shared components separate from feature-specific components.
4. Keep server-only functionality isolated.
5. Maintain consistent import paths.
6. Avoid circular dependencies.
7. Do not create multiple competing implementations of the same utility.
8. Document architectural changes.

---

# 5. Database Architecture and Schema

## 5.1 Database selection

Use PostgreSQL with Prisma ORM. Database hosting: Neon PostgreSQL.

## 5.2 Initial database entities

1. Company
2. Model
3. Provider
4. ModelProvider
5. Pricing
6. Capability
7. ModelCapability
8. Benchmark
9. ModelBenchmark

## 5.3 Entity responsibilities

### Company
- id, name, slug, description, websiteUrl, logoUrl, headquarters, createdAt, updatedAt

### Model
- id, name, slug, modelIdentifier, description, companyId, modelType, contextWindow, inputModalities, outputModalities, releaseDate, status, createdAt, updatedAt

### Provider
- id, name, slug, description, websiteUrl, logoUrl, createdAt, updatedAt

### ModelProvider
- id, modelId, providerId, providerModelIdentifier, availabilityStatus, createdAt, updatedAt

### Pricing
- id, modelProviderId, inputPrice (Decimal), outputPrice (Decimal), currency, pricingUnit, effectiveFrom, effectiveTo, source, lastVerifiedAt, createdAt, updatedAt

### Capability
- id, name, slug, description, category, createdAt, updatedAt

### ModelCapability
- id, modelId, capabilityId, createdAt

### Benchmark
- id, name, slug, description, category, scoreUnit, version, createdAt, updatedAt

### ModelBenchmark
- id, modelId, benchmarkId, score, scoreUnit, datasetVersion, evaluationDate, source, createdAt, updatedAt

## 5.4 Relationships
- Company -> Model (1:N)
- Model <-> Provider (M:N via ModelProvider)
- ModelProvider -> Pricing (1:N)
- Model <-> Capability (M:N via ModelCapability)
- Model <-> Benchmark (M:N via ModelBenchmark)

---

# 6. Database Seed Infrastructure

Deterministic, repeatable seed data for development and testing.

---

# 7. Theme and Design System

**Option 4 — Warm Ivory, Deep Atlas Navy & Regal Gold**

### Light theme
- Background: #FAF8F5
- Surface: #FFFFFF
- Secondary surface: #F4EFE6
- Primary text: #0A1128
- Secondary text: #475569
- Accent: #C48A1E
- CTA: #0A1128

### Dark theme
- Background: #0F0F0F
- Surface: #181818
- Secondary surface: #212121
- Primary text: #F5F5F5
- Secondary text: #A3A3A3
- Accent: #14B8A6
- CTA: #14B8A6

Use `data-theme="light"` and `data-theme="dark"`.

---

# 8. Shared UI Foundation & Navigation

Navigation routes:
- `/models`
- `/compare`
- `/rankings`
- `/companies`
- `/providers`

---

# 9. API Infrastructure

Consistent response envelopes:
- Success: `{ "success": true, "data": {}, "meta": null }`
- Error: `{ "success": false, "error": { "code": "...", "message": "...", "details": [] } }`
Endpoints:
- `GET /api/health`
- Readiness check
Zod validation at server boundary.
