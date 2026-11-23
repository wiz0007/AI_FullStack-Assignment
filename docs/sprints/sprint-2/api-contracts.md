# API Contracts — Sprint 2

## 1. Model Discovery Endpoint
`GET /api/models`

### Request Parameters
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `q` | string | No | - | Substring query (matches name, identifier, description, company) |
| `provider` | string or string[] | No | - | Comma-separated or repeated provider slugs |
| `category` | string or string[] | No | - | Comma-separated or repeated model types |
| `capability` | string or string[] | No | - | Comma-separated or repeated capability slugs |
| `minContextWindow` | integer | No | - | Minimum context window (tokens) |
| `maxContextWindow` | integer | No | - | Maximum context window (tokens) |
| `minPrice` | number | No | - | Minimum input price per 1M tokens (USD) |
| `maxPrice` | number | No | - | Maximum input price per 1M tokens (USD) |
| `sort` | enum | No | `relevance` | Sort option (`name_asc`, `name_desc`, `releaseDate_desc`, `contextWindow_desc`, etc.) |
| `page` | integer | No | `1` | Page number (>= 1) |
| `limit` | integer | No | `12` | Items per page (1 to 100) |

### Response Structure
```json
{
  "success": true,
  "data": [
    {
      "id": "model_uuid",
      "name": "GPT-4o",
      "slug": "gpt-4o",
      "modelIdentifier": "openai/gpt-4o",
      "description": "Flagship multimodal intelligence model",
      "modelType": "multimodal",
      "contextWindow": 128000,
      "releaseDate": "2024-05-13T00:00:00.000Z",
      "status": "active",
      "company": {
        "id": "company_uuid",
        "name": "OpenAI",
        "slug": "openai"
      },
      "providers": [
        {
          "provider": { "id": "p_uuid", "name": "OpenAI Direct", "slug": "openai-direct" },
          "pricing": [{ "inputPrice": "2.500000", "outputPrice": "10.000000", "pricingUnit": "1M_TOKENS" }]
        }
      ],
      "capabilities": [
        { "capability": { "id": "c_uuid", "name": "Vision", "slug": "vision" } }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

---

## 2. Filter Metadata Endpoint
`GET /api/models/filters`

### Response Structure
```json
{
  "success": true,
  "data": {
    "providers": [
      { "id": "uuid", "name": "OpenAI Direct API", "slug": "openai-direct", "count": 2 }
    ],
    "categories": ["chat", "multimodal"],
    "capabilities": [
      { "id": "uuid", "name": "Advanced Reasoning", "slug": "reasoning", "category": "reasoning", "count": 5 }
    ],
    "ranges": {
      "minContextWindow": 128000,
      "maxContextWindow": 2000000
    }
  },
  "meta": null
}
```

---

## 3. Global Search Endpoint
`GET /api/search`

### Request Parameters
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `q` | string | Yes | - | Search query (1 to 100 characters) |
| `scope` | enum | No | `all` | Search scope: `all`, `models`, `providers`, `companies` |
| `limit` | integer | No | `5` | Results per category (1 to 20) |

### Response Structure
```json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "uuid",
        "name": "GPT-4o",
        "slug": "gpt-4o",
        "modelType": "multimodal",
        "companyName": "OpenAI",
        "contextWindow": 128000,
        "url": "/models/gpt-4o"
      }
    ],
    "providers": [
      {
        "id": "uuid",
        "name": "OpenAI Direct API",
        "slug": "openai-direct",
        "url": "/providers"
      }
    ],
    "query": "gpt"
  },
  "meta": null
}
```
