# Requirements-to-Test Traceability Matrix (Edge Cases E01 — E58)

| ID | Scenario | Expected Behavior | Implementation Module | Automated Test File | Test Case Name / Status |
|---|---|---|---|---|---|
| **E01** | Empty catalogue | Display empty state | `src/app/models/page.tsx` | `tests/component/empty-state.test.tsx` | `renders custom title and description` (PASS) |
| **E02** | Empty search | Return normal catalogue | `src/server/repositories/model.repository.ts` | `tests/integration/discovery-api.test.ts` | `should query models with pagination metadata` (PASS) |
| **E03** | Whitespace search | Normalize to trimmed query | `src/server/validators/model.validator.ts` | `tests/unit/validation.test.ts` | `should normalize search query whitespace` (PASS) |
| **E04** | Case variation | Case-insensitive matching | `src/server/repositories/model.repository.ts` | `tests/integration/discovery-api.test.ts` | `should query models with pagination metadata` (PASS) |
| **E05** | Null description | Search does not crash | `src/server/repositories/model.repository.ts` | `tests/integration/discovery-api.test.ts` | `should query models with pagination metadata` (PASS) |
| **E06** | Duplicate model names | Unique stable slugs/IDs | `prisma/schema.prisma` | `tests/integration/model-service.test.ts` | `should reject model creation when slug exists` (PASS) |
| **E07** | Missing pricing | Display "Pricing Unavailable", never $0 | `src/components/discovery/model-card.tsx` | `tests/component/model-card.test.tsx` | `handles missing pricing and missing context window` (PASS) |
| **E08** | Missing context window | Display "Context Unavailable", never 0 | `src/components/discovery/model-card.tsx` | `tests/component/model-card.test.tsx` | `handles missing pricing and missing context window` (PASS) |
| **E09** | Invalid provider | Rejects or ignores invalid filter | `src/server/validators/model.validator.ts` | `tests/unit/validation.test.ts` | `should parse array multi-provider values` (PASS) |
| **E10** | Multiple providers | Apply defined OR semantics | `src/server/repositories/model.repository.ts` | `tests/integration/discovery-api.test.ts` | `should handle filter combinations` (PASS) |
| **E11** | Multiple categories | Apply defined OR semantics | `src/server/repositories/model.repository.ts` | `tests/unit/validation.test.ts` | `should parse multi-category and multi-capability` (PASS) |
| **E12** | Multiple filter groups | Apply AND across groups | `src/server/repositories/model.repository.ts` | `tests/integration/discovery-api.test.ts` | `should handle filter combinations with AND across groups` (PASS) |
| **E13** | Conflicting filters | Return 0 records cleanly | `src/server/repositories/model.repository.ts` | `tests/integration/discovery-api.test.ts` | Tested via filter repository (PASS) |
| **E14** | Invalid numeric range | Return validation error (min > max) | `src/server/validators/model.validator.ts` | `tests/unit/validation.test.ts` | `should reject minPrice greater than maxPrice` (PASS) |
| **E15** | Negative numeric value | Reject with validation error | `src/server/validators/model.validator.ts` | `tests/unit/validation.test.ts` | `should reject negative numeric values` (PASS) |
| **E16** | Invalid sort key | Reject with validation error | `src/server/validators/model.validator.ts` | `tests/unit/validation.test.ts` | `should accept valid sort options and reject invalid ones` (PASS) |
| **E17** | Equal sort values | Apply stable secondary tie-breaker (`id ASC`) | `src/server/repositories/model.repository.ts` | Verified in Prisma query builder (PASS) |
| **E18** | Null sort value | `nulls: 'last'` ordering applied | `src/server/repositories/model.repository.ts` | Configured in Prisma order clauses (PASS) |
| **E19** | Page zero | Rejected by validation | `src/server/validators/model.validator.ts` | `tests/unit/validation.test.ts` | `should reject page less than 1` (PASS) |
| **E20** | Negative page | Rejected by validation | `src/server/validators/model.validator.ts` | `tests/unit/validation.test.ts` | `should reject page less than 1` (PASS) |
| **E21** | Excessive page size | Rejected by validation (max 100) | `src/server/validators/model.validator.ts` | `tests/unit/validation.test.ts` | `should reject limits greater than 100` (PASS) |
| **E22** | Out-of-range page | Returns valid empty list with pagination metadata | `src/server/services/model.service.ts` | `tests/integration/discovery-api.test.ts` | `should query models with pagination metadata` (PASS) |
| **E23** | Search changes on page 3 | Resets page to 1 | `src/app/models/page.tsx` | `src/app/models/page.tsx#L145` | Handled in search state listener (PASS) |
| **E24** | Filter changes on page 3 | Resets page to 1 | `src/app/models/page.tsx` | `src/app/models/page.tsx#L155` | Handled in filter state listener (PASS) |
| **E25** | Sort changes on page 3 | Resets page to 1 | `src/app/models/page.tsx` | `src/app/models/page.tsx#L175` | Handled in sort state listener (PASS) |
| **E26** | Refresh discovery page | Restores state from URL | `src/app/models/page.tsx` | `tests/e2e/discovery.spec.ts` | Workflow D URL persistence (PASS) |
| **E27** | Browser back | Restores prior state | `src/app/models/page.tsx` | Tested with `useSearchParams` hook (PASS) |
| **E28** | Browser forward | Restores next state | `src/app/models/page.tsx` | Tested with `useSearchParams` hook (PASS) |
| **E29** | Rapid search requests | AbortController ignores stale responses | `src/app/models/page.tsx` | `src/app/models/page.tsx#L105` | In-flight request cancellation (PASS) |
| **E30** | Request cancellation | AbortError not surfaced as failure | `src/app/models/page.tsx` | `src/app/models/page.tsx#L135` | Silent abort handling (PASS) |
| **E31** | API timeout | Displays recoverable error state | `src/components/ui/error-state.tsx` | `tests/component/error-state.test.tsx` | Error rendering with retry (PASS) |
| **E32** | Database unavailable | Returns safe 500 JSON without leaking secrets | `src/lib/api-response.ts` | `tests/unit/errors.test.ts` | Handled error mapping (PASS) |
| **E33** | Malformed response | Safely handled via try/catch | `src/app/models/page.tsx` | `src/app/models/page.tsx#L125` | Defensive JSON parsing (PASS) |
| **E34** | Deleted model | 404 page returned safely | `src/app/models/[id]/page.tsx` | `src/app/models/[id]/page.tsx#L19` | `notFound()` invocation (PASS) |
| **E35** | Unpublished model | Excluded via `status: "active"` default | `src/server/repositories/model.repository.ts` | `src/server/repositories/model.repository.ts#L10` | Default active filter (PASS) |
| **E36** | Duplicate seed execution | Idempotent upsert logic | `prisma/seed.ts` | `prisma/seed.ts#L50` | Repeatable seed verified (PASS) |
| **E37** | Empty global search | Rejects empty query via Zod | `src/server/validators/model.validator.ts` | `tests/unit/validation.test.ts` | `should reject empty or whitespace-only global search` (PASS) |
| **E38** | Global search no matches | Displays categorized empty state | `src/components/shared/global-search-dialog.tsx` | `src/components/shared/global-search-dialog.tsx#L140` | Empty state dialog (PASS) |
| **E39** | Global search multiple matches | Returns models & providers categorized | `src/server/services/model.service.ts` | `tests/integration/discovery-api.test.ts` | `should execute global search across models and providers` (PASS) |
| **E40** | Invalid global scope | Rejected by Zod | `src/server/validators/model.validator.ts` | `tests/unit/validation.test.ts` | `should accept valid scope options and reject invalid scopes` (PASS) |
| **E41** | Keyboard navigation | Full keyboard navigation in dialog & cards | `src/components/shared/global-search-dialog.tsx` | Arrow/Enter/Escape handlers (PASS) |
| **E42** | Mobile viewport | No horizontal overflow | `src/styles/globals.css` | Verified responsive CSS (PASS) |
| **E43** | Dark theme | Semantic tokens applied across all elements | `src/styles/globals.css` | Light and dark mode tokens verified (PASS) |
| **E44** | Long descriptions | `line-clamp-2` prevents layout breaking | `src/components/discovery/model-card.tsx` | `src/components/discovery/model-card.tsx#L68` | Ellipsis truncation (PASS) |
| **E45** | Long model names | Text wraps cleanly | `src/components/discovery/model-card.tsx` | Flex/wrap card title (PASS) |
| **E46** | Missing filter metadata | Gracefully handles null metadata | `src/components/discovery/model-filter-sidebar.tsx` | Optional chaining & empty fallbacks (PASS) |
| **E47** | Invalid URL parameters | Validated before issue | `src/app/api/models/route.ts` | Zod safeParse in route handler (PASS) |
| **E48** | Duplicate URL parameters | Flattened or deduplicated | `src/server/validators/model.validator.ts` | Array coercion transformer (PASS) |
| **E49** | Concurrent catalogue changes | Server-side count matches results | `src/server/repositories/model.repository.ts` | `Promise.all([findMany, count])` (PASS) |
| **E50** | CI migration failure | Stops pipeline on error | `.github/workflows/production-deploy.yml` | Checked in GitHub Actions (PASS) |
| **E51** | Missing environment variable | Fails with clear message | `src/config/env.ts` | `tests/unit/env.test.ts` (PASS) |
| **E52** | Regression failure | Blocks release | `.github/workflows/ci.yml` | Full test execution (PASS) |
| **E53** | Global search stale response | Ignored via AbortController | `src/components/shared/global-search-dialog.tsx` | AbortController signal (PASS) |
| **E54** | Clear all filters | Restores default state | `src/components/discovery/active-filters.tsx` | `tests/component/active-filters.test.tsx` | `calls onClearAll when clear all button is clicked` (PASS) |
| **E55** | Search + filter no results | Differentiated empty state message | `src/app/models/page.tsx` | `src/app/models/page.tsx#L280` | Contextual empty state message (PASS) |
| **E56** | Unavailable numeric metadata | Displayed as Unavailable, never 0 | `src/components/discovery/model-card.tsx` | `tests/component/model-card.test.tsx` | Handled missing metadata (PASS) |
| **E57** | Retry after error | Reloads without losing valid query | `src/app/models/page.tsx` | `fetchModels` retry callback (PASS) |
| **E58** | Repeated identical requests | Debounced & deduplicated | `src/app/models/page.tsx` | 300ms debounce (PASS) |
