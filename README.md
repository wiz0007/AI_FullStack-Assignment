# OneAtlas — AI Model Discovery & Intelligence Platform

OneAtlas is a full-stack platform inspired by OpenRouter, RouterPlus, and LiteLLM designed to help developers, AI engineers, and researchers discover, explore, compare, and benchmark frontier AI models across infrastructure providers.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Frontend** | React 18, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Next.js Route Handlers |
| **Database** | PostgreSQL (Neon Database) |
| **ORM** | Prisma ORM |
| **Validation** | Zod |
| **Testing** | Vitest, React Testing Library, Playwright |
| **Theme** | Option 4: Warm Ivory, Deep Atlas Navy & Regal Gold |
| **CI/CD** | GitHub Actions |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18.18+ or v20+)
- npm / pnpm
- PostgreSQL connection (e.g. [Neon PostgreSQL](https://neon.tech))

### 2. Clone and Install
```bash
git clone https://github.com/wiz0007/AI_FullStack-Assignment.git
cd AI_FullStack-Assignment
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `DATABASE_URL` with your PostgreSQL / Neon connection string.

### 4. Database Setup & Seed
```bash
# Generate Prisma Client
npm run db:generate

# Apply Migrations
npm run db:migrate

# Seed Deterministic Sample Data
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing

OneAtlas maintains a multi-tier testing suite:
```bash
# Run all unit, component, and integration tests
npm run test

# Run unit tests only
npm run test:unit

# Run component tests only
npm run test:component

# Run integration tests only
npm run test:integration

# Run Playwright E2E smoke tests
npm run test:e2e
```

---

## 📁 Project Architecture

```text
oneatlas/
├── .github/workflows/       # CI/CD pipelines (ci.yml, preview, production)
├── prisma/                  # Schema, migrations, and seed script
├── src/
│   ├── app/                 # Next.js App Router (pages & API route handlers)
│   ├── components/          # Reusable UI components & application layout shell
│   ├── features/            # Feature-oriented modules (theme engine, etc.)
│   ├── config/              # Runtime env validation & app configuration
│   ├── lib/                 # Prisma singleton, logger, error classes, response helpers
│   ├── server/              # Backend services, repositories, and Zod validators
│   └── styles/              # Global CSS & Tailwind design tokens
├── tests/                   # Unit, component, integration, and E2E suites
└── docs/                    # System architecture, database, and API specifications
```

---

## 🎨 Design System & Theme

Implemented **Option 4: Warm Ivory, Deep Atlas Navy & Regal Gold**:
- **Light Theme (`data-theme="light"`)**: Warm ivory background (`#FAF8F5`), crisp white cards (`#FFFFFF`), deep navy typography (`#0A1128`), regal gold accent (`#C48A1E`).
- **Dark Theme (`data-theme="dark"`)**: Deep charcoal background (`#0F0F0F`), elevated surface (`#181818`), light typography (`#F5F5F5`), electric teal accent (`#14B8A6`).
- **Zero Flash**: Inlined pre-hydration script ensures theme persistence without FOUC (flash of unstyled content).

---

## 📄 Documentation Links
- [System Architecture](file:///docs/architecture/system-architecture.md)
- [Project Structure](file:///docs/architecture/project-structure.md)
- [Database Design & Schemas](file:///docs/database/database-design.md)
- [Entity Relationships Diagram](file:///docs/database/entity-relationships.md)
- [Database Migration & Seed Strategy](file:///docs/database/migration-strategy.md)
- [API Conventions](file:///docs/api/api-conventions.md)
- [Testing Strategy](file:///docs/testing/testing-strategy.md)
- [Test Execution Guide](file:///docs/testing/test-execution.md)
