# Sprint 3 Requirements and Test Matrix

| Req ID | Requirement | Test File | Test Case | Status |
|---|---|---|---|---|
| C01 | Support comparing up to 3 models simultaneously | `tests/unit/comparison.test.ts` | `accepts up to 3 comma-separated models` | Passed |
| C02 | Reject empty comparison queries | `tests/unit/comparison.test.ts` | `reject query with 0 models` | Passed |
| C03 | Preserve requested model order | `tests/integration/compare-api.test.ts` | `compare models by slug or ID and maintain requested ordering` | Passed |
| C05 | Enforce max 3 model limit on API and context | `tests/unit/comparison.test.ts` | `reject query with more than MAX_COMPARISON_MODELS` | Passed |
| C06 | Deduplicate repeated IDs in comparison query | `tests/unit/comparison.test.ts` | `normalize whitespace and remove duplicates` | Passed |
| C08 | Graceful handling of missing model IDs | `tests/integration/compare-api.test.ts` | `report missing or invalid model identifiers without failing` | Passed |
| C10 | Difference detection across specifications | `tests/unit/comparison.test.ts` | `detect differing context windows across 2 models` | Passed |
| C11 | Comparison table rendering | `tests/component/comparison-table.test.tsx` | `render comparison headers and model names` | Passed |
| C12 | Unit formatting (currency & context tokens) | `tests/component/comparison-table.test.tsx` | `display context windows and pricing correctly` | Passed |
| C13 | Model removal from table | `tests/component/comparison-table.test.tsx` | `call onRemoveModel when remove button is clicked` | Passed |
| C14 | Empty slot placeholder button | `tests/component/comparison-table.test.tsx` | `render empty slot placeholder when fewer than maxLimit models` | Passed |
| C15 | Add-to-comparison button toggle | `tests/component/add-to-comparison-button.test.tsx` | `toggle between Compare and Added to Compare when clicked` | Passed |
