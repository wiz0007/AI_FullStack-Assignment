# Database Design — OneAtlas

## 1. Domain Entities
The schema implements 9 core entities supporting all subsequent product modules:
1. `Company`: AI research organizations and creators (e.g. OpenAI, Anthropic, Google).
2. `Model`: Individual foundation AI models (e.g. GPT-4o, Claude 3.5 Sonnet).
3. `Provider`: Infrastructure hosting providers (e.g. AWS Bedrock, Together AI, Groq).
4. `ModelProvider`: Many-to-many association connecting models with providers.
5. `Pricing`: Input and output pricing history with Decimal precision (`db.Decimal(12, 6)`).
6. `Capability`: Supported capabilities (e.g. Reasoning, Code Generation, Vision).
7. `ModelCapability`: Join table associating models with capabilities.
8. `Benchmark`: Standardized evaluation benchmarks (e.g. MMLU, GSM8K, HumanEval).
9. `ModelBenchmark`: Benchmark evaluation scores with Decimal precision (`db.Decimal(8, 4)`).

## 2. Integrity & Constraints
- Slugs are enforced unique: `Company.slug`, `Model.slug`, `Provider.slug`, `Capability.slug`, `Benchmark.slug`.
- Association uniqueness:
  - `@@unique([modelId, providerId])` prevents duplicate provider offerings.
  - `@@unique([modelId, capabilityId])` prevents duplicate capability assignments.
  - `@@unique([modelId, benchmarkId, datasetVersion])` guarantees idempotent score entries.
- Cascading referential integrity (`onDelete: Cascade`) for joins and pricing records.
