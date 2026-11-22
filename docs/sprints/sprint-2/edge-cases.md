# Sprint 2 Edge Cases Guide

This document details the handling of release-critical edge cases specified in Section 23 of the Sprint 2 ERD:

### Data Handling & Presentation
- **Missing Pricing (E07)**: Models with null or unavailable pricing explicitly display `"Pricing Unavailable"`. The application never coerces missing values to `$0.00`.
- **Missing Context Window (E08)**: Models without recorded context windows display `"Context Unavailable"`. Missing values are never converted to `0 tokens`.
- **Long Content (E44, E45)**: Multi-line descriptions use CSS line clamping (`line-clamp-2`) to guarantee identical card heights without layout shift or horizontal overflow.

### Search & Filtering Logic
- **Search Normalization (E03, E04)**: Leading/trailing whitespace is trimmed via Zod transforms. Substring queries utilize PostgreSQL `mode: 'insensitive'`.
- **Multi-Select Semantics (E10, E11, E12)**: Multiple selections within a single filter category use `OR` semantics (e.g. `Provider in [OpenAI, Anthropic]`). Different categories combine with `AND`.
- **Numeric Range Guardrails (E14, E15)**: Min-max ranges enforce `min <= max` and reject negative values at the Zod validation layer before touching database queries.

### Request Safety & Concurrency
- **Request Cancellation (E29, E30, E53)**: In-flight requests are cancelled using `AbortController` when a user updates search input or switches filters, guaranteeing newer responses never get overwritten by stale network responses.
- **Debouncing (E58)**: Search input is debounced by 300ms to eliminate redundant database load.

### State & Navigation
- **URL Synchronization (E26, E27, E28)**: Search, active filters, sorting option, and page number are reflected in URL query strings. Full browser back/forward and page refresh state restoration are verified.
- **Page Resets (E23, E24, E25)**: Any change to search query, filter criteria, or sorting automatically resets the pagination state back to Page 1.
