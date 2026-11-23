# Sprint 3 Implementation Checklist

## 1. Model Details Route (`/models/[id]`)
- [x] Fetch model by slug or ID with company, providers, pricing, capabilities, and benchmarks.
- [x] Display comprehensive specifications: context window, input/output price per 1M tokens, modalities.
- [x] Display provider mapping table with status badges.
- [x] Render supported capabilities with descriptive badges.
- [x] Add `<AddToComparisonButton>` to details hero header and top actions.
- [x] Handle non-existent models with Next.js `notFound()`.

## 2. Comparison State Management (`useComparison`)
- [x] React Context provider with localStorage synchronization (`oneatlas_comparison_models`).
- [x] Enforce maximum 3 models limit with user feedback warning.
- [x] Prevent duplicate additions.
- [x] Provide `addModel`, `removeModel`, `clearComparison`, `isModelSelected`.
- [x] Safe fallback defaults for unparented/standalone component rendering.

## 3. Comparison UI & Drawer
- [x] Global floating `<ComparisonBar />` showing selected count (x/3), model chips with remove buttons, clear button, and link to `/compare`.
- [x] Warning toast when 4th model addition is attempted.
- [x] Interactive `<AddToComparisonButton />` with checked and default states.

## 4. Side-by-Side Comparison Matrix (`/compare`)
- [x] Server/client hydration handling URL params (`?models=...` or `?ids=...`).
- [x] Interactive `ComparisonTable` component.
- [x] Dynamic difference detection with visual row highlighting.
- [x] Toggle checkbox for "Highlight Differences".
- [x] Empty state prompt when 0 models are selected.
- [x] Informational banner when 1 model is selected.
- [x] Missing ID recovery banner when invalid models are requested in URL.
- [x] One-click "Share Comparison" link copy to clipboard.

## 5. API Endpoints
- [x] `GET /api/models/compare?ids=id1,id2,id3` (and alias `/api/compare`).
- [x] Validated with `compareModelsQuerySchema` (rejects 0 or >3 models).
- [x] Returns ordered models and `missingIds` array.
