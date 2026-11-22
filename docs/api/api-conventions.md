# API Conventions — OneAtlas

## 1. Standard Response Envelope

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "model_uuid",
    "name": "GPT-4o"
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "contextWindow",
        "message": "Context window must be positive"
      }
    ]
  }
}
```

## 2. HTTP Status Code Mapping
- `200 OK`: Successful retrieval or query
- `201 Created`: Resource successfully registered
- `400 Bad Request`: Input validation failure (`ValidationError`)
- `404 Not Found`: Resource not found (`NotFoundError`)
- `409 Conflict`: Uniqueness constraint violation (`ConflictError`)
- `500 Internal Server Error`: Unhandled database or system exception (`InternalServerError`)
