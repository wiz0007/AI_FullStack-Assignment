# Project Structure — OneAtlas

```text
oneatlas/
│
├── .github/
│   └── workflows/
│       ├── ci.yml                 # PR & push validation pipeline
│       ├── preview-deploy.yml     # Preview environment build
│       └── production-deploy.yml  # Production deployment & migrations
│
├── prisma/
│   ├── schema.prisma              # PostgreSQL schema with 9 domain models
│   └── seed.ts                    # Repeatable deterministic seed dataset
│
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout with ThemeProvider & Navbar
│   │   ├── page.tsx               # Homepage / Hero & Module overview
│   │   ├── loading.tsx            # Global loading UI
│   │   ├── error.tsx              # Error boundary
│   │   ├── not-found.tsx          # 404 handler
│   │   ├── models/                # Models discovery route
│   │   ├── compare/               # Comparison matrix route
│   │   ├── rankings/              # Leaderboard route
│   │   ├── companies/             # AI Labs route
│   │   ├── providers/             # Infrastructure providers route
│   │   └── api/
│   │       ├── health/route.ts    # Application health check
│   │       └── ready/route.ts     # Database readiness check
│   │
│   ├── components/
│   │   ├── layout/                # Container, Navbar, Footer
│   │   └── ui/                    # Button, Input, SearchInput, Badge, Card, etc.
│   │
│   ├── features/
│   │   └── theme/                 # ThemeProvider, ThemeToggle, tokens
│   │
│   ├── config/
│   │   ├── env.ts                 # Zod-validated environment config
│   │   └── app.ts                 # Navigation items & metadata
│   │
│   ├── lib/
│   │   ├── prisma.ts              # PrismaClient singleton
│   │   ├── logger.ts              # Structured logger with secret redaction
│   │   ├── errors/                # Custom error hierarchy
│   │   ├── api-response.ts        # Standardized API response formatting
│   │   └── utils/                 # Formatting & class merging utilities
│   │
│   ├── server/
│   │   ├── repositories/          # ModelRepository, CompanyRepository
│   │   ├── services/              # ModelService
│   │   └── validators/            # Zod validation schemas
│   │
│   ├── styles/
│   │   └── globals.css            # Tailwind directives & CSS variables
│   │
│   └── types/                     # Shared TypeScript interfaces
│
├── tests/
│   ├── unit/                      # Environment, validation, errors, theme logic
│   ├── component/                 # Button, ThemeToggle, EmptyState
│   ├── integration/               # Health endpoint, ModelService workflows
│   └── e2e/                       # Playwright smoke test scenarios
│
├── docs/                          # Internal engineering specifications
│
├── .env.example                   # Environment configuration template
├── .gitignore                     # Git ignore rules (ignoring docs/, node_modules)
├── .prettierrc                    # Code formatting configuration
├── .eslintrc.json                 # ESLint rules
├── next.config.mjs                # Next.js build configuration
├── tailwind.config.ts             # Tailwind CSS tokens
├── tsconfig.json                  # TypeScript compiler options & aliases
├── package.json                   # Dependency definitions & scripts
└── README.md                      # Comprehensive developer setup guide
```
