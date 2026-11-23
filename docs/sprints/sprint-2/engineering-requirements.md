# OneAtlas — Sprint 2 Engineering Requirements
## Model Discovery, Search, Filtering, Sorting, Pagination and Global Search

**Sprint:** 2 of 5  
**Document Status:** Implementation Complete  
**Prerequisites:** Sprint 1 foundation verified and deployed.

### 1. Delivered Modules
1. **Model Discovery Route (`/models`)**: Server-driven catalogue with responsive sidebar, active filter chips, search input, sort selector, and pagination.
2. **Search Infrastructure**: Case-insensitive substring search matching model names, model identifiers, descriptions, and companies with 300ms debouncing and AbortController request cancellation.
3. **Multi-Select Filtering**: Multi-provider (OR semantics within group), multi-category (OR), multi-capability (OR), combined with AND across groups.
4. **Deterministic Sorting**: Stable secondary tie-breaker (`id ASC`) preventing pagination shift across duplicate sort keys.
5. **Server-Driven Pagination**: Paginated responses with `page`, `limit`, `total`, `totalPages`, `hasNextPage`, and `hasPreviousPage`.
6. **URL State Synchronization**: Complete state reflection in query parameters for deep linking and back/forward navigation.
7. **Global Search (`/api/search` + Command Palette)**: Quick search trigger (`Ctrl+K`) categorizing results across models and infrastructure providers with keyboard arrow navigation.
8. **Navigation Contract to Detail Route (`/models/[id]`)**: Stable slug-based URL navigation displaying full specs, provider tables, and capabilities.
