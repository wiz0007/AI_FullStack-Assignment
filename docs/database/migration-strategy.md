# Database Migration & Seed Strategy

## 1. Migration Commands
- **Development**:
  ```bash
  npm run db:migrate
  ```
  Generates and applies timestamped migration files in `prisma/migrations/`.
- **Production / CI**:
  ```bash
  npm run db:migrate:deploy
  ```
  Applies all pending migrations deterministically without interactive prompts.
- **Client Generation**:
  ```bash
  npm run db:generate
  ```

## 2. Seed Infrastructure
- Deterministic and idempotent using `upsert`.
- Seed data can be run repeatedly without duplicating companies, models, or capabilities:
  ```bash
  npm run db:seed
  ```
