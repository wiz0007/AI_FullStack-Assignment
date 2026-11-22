# Testing Strategy — OneAtlas

## 1. Testing Pyramid
| Test Type | Framework | Location | Purpose |
|---|---|---|---|
| Unit | Vitest | `tests/unit/` | Utilities, env validation, Zod schemas, error classes |
| Component | Vitest + React Testing Library | `tests/component/` | UI component rendering, interactions, accessibility |
| Integration | Vitest | `tests/integration/` | Service orchestration, repository mock workflows, API health |
| E2E | Playwright | `tests/e2e/` | Browser verification, navigation, theme toggle, responsiveness |

## 2. Test Execution
```bash
# Run all unit, component, and integration tests
npm run test

# Run specific suites
npm run test:unit
npm run test:component
npm run test:integration

# Run Playwright E2E smoke tests
npm run test:e2e
```
