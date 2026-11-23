# Sprint 3 Edge Cases Specification

| Code | Scenario | Expected Behavior |
|---|---|---|
| C01 | User opens `/compare` with no URL params and empty storage | Render `ComparisonEmptyState` with prompt and direct link to `/models`. |
| C02 | User passes empty `ids=` or whitespace to API | Return `400 Bad Request` with `VALIDATION_ERROR`. |
| C03 | User supplies 1 model | Render table with single model column and informative banner encouraging adding 2nd model. |
| C04 | User supplies 2 or 3 models | Render side-by-side matrix with difference highlighting toggle enabled. |
| C05 | User tries adding 4th model | Action rejected. Floating drawer displays toast: "Comparison limit reached. You can compare up to 3 models simultaneously." |
| C06 | User supplies duplicate IDs (e.g. `gpt-4o,gpt-4o`) | Deduplicate preserving first appearance. |
| C07 | User supplies more than 3 models in URL | Trim or validate according to schema; API returns 400 with clear message. |
| C08 | User requests non-existent or deleted model in comparison URL | Render valid models, display amber warning banner with list of missing model IDs. |
| C09 | Missing pricing or context window on one model | Render "Pricing Unavailable" or "Context Unavailable" (never `$0.00` or `0`). |
| C10 | Differing capabilities between models | Rows where one model has a capability and another does not are highlighted when "Highlight Differences" is checked. |
| C11 | User clears comparison | Reset context, update URL to `/compare`, render empty state. |
| C12 | User shares comparison link | Click copies full URL to clipboard with "Link Copied!" feedback. |
