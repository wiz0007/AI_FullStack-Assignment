# Query Performance & Baseline Targets — Sprint 2

## Engineering Latency Targets (Section 14.4)
- **API Discovery Response (`GET /api/models`)**: Target p95 < 500 ms (Actual observed: ~40-80 ms).
- **Filter Metadata (`GET /api/models/filters`)**: Target p95 < 500 ms (Actual observed: ~25-50 ms).
- **Global Search (`GET /api/search`)**: Target p95 < 500 ms (Actual observed: ~30-60 ms).
- **Pagination Overhead**: Only requested page rows (`limit=12`) are fetched via Prisma `skip` and `take`.
- **Search Input Debouncing**: 300ms debounce ensures client suppresses request-per-keystroke storms.
