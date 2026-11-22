# System Architecture — OneAtlas

## 1. Architectural Pattern
OneAtlas follows a modern, modular, feature-oriented layered architecture built on Next.js App Router (Node.js runtime).

```text
Browser / Client (React Server & Client Components)
        │
        ▼
Next.js Route Handlers (src/app/api/*)
        │
        ▼
Request Validation (Zod Schemas in src/server/validators/*)
        │
        ▼
Service Layer (src/server/services/*)
        │
        ▼
Repository / Data Access Layer (src/server/repositories/*)
        │
        ▼
Prisma ORM (src/lib/prisma.ts)
        │
        ▼
PostgreSQL Database (Neon)
```

## 2. Layer Separation & Responsibilities

### Presentation Layer (`src/components/`, `src/features/`, `src/app/`)
- Server Components by default for optimal TTFB and zero client bundle overhead.
- Client Components strictly where user interaction occurs (theme toggle, mobile menu, search inputs).
- Design system built on Tailwind CSS and CSS custom properties (Option 4 theme tokens).

### API Layer (`src/app/api/`)
- Lightweight Next.js route handlers.
- Standardized response formatting via `src/lib/api-response.ts`.
- Structured error handling mapping known operational errors to HTTP status codes.

### Service Layer (`src/server/services/`)
- Orchestrates business workflows and cross-repository coordination.
- Enforces domain rules and business exceptions (`NotFoundError`, `ConflictError`).

### Repository Layer (`src/server/repositories/`)
- Direct interaction with Prisma ORM client.
- Abstracts raw queries, filtering conditions, and transactional consistency.

### Shared Infrastructure (`src/lib/`, `src/config/`)
- Prisma client singleton avoiding hot-reloading connection leaks.
- Structured logger sanitizing credentials and secrets.
- Environment validation powered by Zod.
