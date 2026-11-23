# Sprint 3 API Contracts

## `GET /api/models/compare`
Alternative alias: `GET /api/compare`

### Query Parameters
| Parameter | Type | Required | Description | Example |
|---|---|---|---|---|
| `ids` | string | Either `ids` or `models` | Comma-separated list of 1 to 3 model slugs or UUIDs | `gpt-4o,claude-3-5-sonnet` |
| `models` | string | Optional alias | Same as `ids` | `gemini-1-5-pro` |

### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "cm3r...",
        "name": "GPT-4o",
        "slug": "gpt-4o",
        "modelIdentifier": "openai/gpt-4o",
        "modelType": "multimodal",
        "contextWindow": 128000,
        "company": {
          "id": "cm3r...",
          "name": "OpenAI",
          "slug": "openai"
        },
        "providers": [
          {
            "provider": { "id": "cm3r...", "name": "OpenAI Direct", "slug": "openai-direct" },
            "pricing": [
              {
                "inputPrice": "2.500000",
                "outputPrice": "10.000000",
                "currency": "USD",
                "pricingUnit": "1M_TOKENS"
              }
            ]
          }
        ],
        "capabilities": [
          { "capability": { "id": "cm3r...", "name": "Vision", "slug": "vision" } }
        ],
        "benchmarks": [
          {
            "benchmark": { "id": "cm3r...", "name": "MMLU", "slug": "mmlu" },
            "score": "88.70",
            "scoreUnit": "percentage"
          }
        ]
      }
    ],
    "missingIds": []
  },
  "timestamp": "2026-11-21T22:30:00.000Z"
}
```

### Validation Error Response (`400 Bad Request`)
Returned when `ids` is empty or exceeds 3 items:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid comparison request parameters",
    "details": [
      {
        "field": "ids",
        "message": "Cannot compare more than 3 models simultaneously"
      }
    ]
  },
  "timestamp": "2026-11-21T22:30:00.000Z"
}
```
