# Database Migration, Recovery & Seed Strategy — OneAtlas

**Engine:** PostgreSQL (Neon)  
**Strategy:** Additive Expand-Contract, Immutable Past Migrations, Zero-Downtime Rollouts.

---

## 1. Migration Immutability & Ordering (S1-05, DOC-03)

- **Rule:** Historical migrations (e.g. `20241121000000_init`) are strictly immutable. Once applied to staging or production, migration files must never be edited or retrofitted.
- **Additive Evolution:** All schema enhancements are isolated in new forward-only migration directories:
  - `20241121000000_init`: Base foundation schema (models, companies, providers, capabilities, pricing, benchmarks).
  - `20241123000000_benchmark_versions_and_provenance`: Multi-version benchmark architecture (`BenchmarkVersion`), data provenance classifications (`dataClassification`), and PostgreSQL domain check constraints.
- **Fresh Deployment:** Tested and verified on clean database instances (`npx prisma migrate deploy`).
- **Existing Upgrade:** Includes automated SQL backfill migrating existing benchmark associations into default `BenchmarkVersion` rows prior to adding foreign key constraints.

---

## 2. Expand-Contract Pattern & Breaking Change Protocol (S5-15)

When evolving production database schemas without downtime:
1. **Expand Phase:** Add new nullable columns, tables, or non-conflicting constraints alongside existing structures.
2. **Backfill Phase:** Run idempotent background backfill scripts migrating legacy records to the new structures.
3. **Dual-Write / DTO Compatibility:** Services read from new structures with automatic fallbacks for un-migrated records.
4. **Contract Phase:** Once all consumers point to the new fields and old fields are unreferenced, mark legacy columns deprecated or remove them in a subsequent scheduled migration.

---

## 3. Disaster Recovery & Rollback Limitations (S5-15)

- **Roll-forward Preference:** PostgreSQL DDL migrations within Prisma transactions roll back cleanly on SQL failure during deployment. If a migration succeeds but application code fails, roll forward with a hotfix migration rather than manual down-migrations that risk data loss.
- **Connection Isolation:** Prisma migrations require direct TCP connections (`DIRECT_URL`) to acquire PostgreSQL advisory locks; pooled endpoints (`DATABASE_URL` with `-pooler`) must not be used for DDL migrations.
- **Neon Point-In-Time Restore (PITR):** Neon provides continuous WAL archiving and instant point-in-time recovery to restore state prior to catastrophic DDL incidents.

---

## 4. Deterministic Seed Idempotency (S1-06)

- Deterministic and idempotent using `upsert` across all entities.
- Seed runs execute with zero duplicate creation:
  ```bash
  npm run db:seed
  ```
- Evaluator names, data provenance (`CURATED`), and protocols are seeded truthfully without fabricating verification claims.
