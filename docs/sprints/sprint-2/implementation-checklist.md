# Sprint 2 Implementation Checklist

## Phase 1 — Repository & Data Audit
- [x] Inspected Prisma schema: `Model`, `Provider`, `ModelProvider`, `Pricing`, `Capability`.
- [x] Verified existing seed script with realistic models (GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, Llama 3.1 405B, DeepSeek-V3).
- [x] Maintained backward compatibility with Sprint 1.

## Phase 2 — Backend Discovery Foundation
- [x] Zod query schemas: `modelQuerySchema` & `globalSearchQuerySchema`.
- [x] Search normalization & trimming.
- [x] Filter parsing (multi-provider, multi-category, multi-capability, numeric ranges).
- [x] Sort allowlist with secondary tie-breaker (`id ASC`).
- [x] Server-side pagination calculation.
- [x] Route handlers: `GET /api/models`, `GET /api/models/filters`, `GET /api/search`, `GET /api/models/[id]`.

## Phase 3 — Frontend Catalogue
- [x] Discovery page: `src/app/models/page.tsx`.
- [x] Model cards: `src/components/discovery/model-card.tsx`.
- [x] Graceful metadata fallbacks (never show $0 or 0 for missing values).
- [x] Accessible link to `/models/[slug]`.

## Phase 4 — Search & Filters
- [x] Search input with 300ms debounce & clear button.
- [x] Multi-select provider, category, and capability checkboxes.
- [x] Active filter chips with individual removal & Clear All.
- [x] Page resets to 1 on search or filter changes.

## Phase 5 — Sorting & Pagination
- [x] Sort dropdown with all supported options.
- [x] Server-driven pagination controls with boundary disabling.
- [x] URL state synchronization (`router.replace`).

## Phase 6 — Global Search
- [x] `GET /api/search` endpoint.
- [x] `GlobalSearchDialog` modal with `Ctrl+K` shortcut.
- [x] Categorized results (Models, Providers).
- [x] Keyboard navigation (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`).

## Phase 7 — Quality & Release
- [x] Unit tests passing (validation, search, filters, pagination).
- [x] Integration tests passing (discovery API, filters metadata, global search).
- [x] Component tests passing (cards, active filters, pagination).
- [x] Production build clean.
- [x] Main branch clean and deployable.
