# CI/CD Pipeline Verification — Sprint 2

The automated GitHub Actions workflow (`.github/workflows/ci.yml`) runs the following quality gates on every Pull Request and merge to `main`:

1. **Static Analysis & Linting**:
   - `npm run format:check`: Enforces Prettier code style.
   - `npm run lint`: Verifies ESLint rules and Next.js Best Practices.
   - `npm run typecheck`: TypeScript compiler (`tsc --noEmit`) validates 100% type safety.
2. **Database Verification**:
   - `npx prisma validate`: Asserts schema constraints and relationships.
   - `npx prisma generate`: Builds deterministic Prisma Client.
3. **Automated Test Suites**:
   - Unit tests (`tests/unit/`): Validates environment, search normalization, query Zod schemas, error classes, and theme logic.
   - Component tests (`tests/component/`): Verifies UI components (Button, ModelCard, ActiveFilters, Pagination, EmptyState).
   - Integration tests (`tests/integration/`): Tests health endpoints and multi-filter discovery service workflows.
4. **Production Build Gate**:
   - `npm run build`: Verifies zero build-time syntax or route errors.
