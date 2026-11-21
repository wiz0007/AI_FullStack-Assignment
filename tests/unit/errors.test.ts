import { describe, it, expect } from "vitest";
import {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
} from "@/lib/errors";

describe("Custom Error Classes Unit Tests", () => {
  it("should format ValidationError with 400 and detail payload", () => {
    const error = new ValidationError("Invalid parameters", [
      { field: "slug", message: "Required" },
    ]);
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.message).toBe("Invalid parameters");
    expect(error.details?.length).toBe(1);
  });

  it("should format NotFoundError with 404 code", () => {
    const error = new NotFoundError("Model", "gpt-5");
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe("NOT_FOUND");
    expect(error.message).toContain("gpt-5");
  });

  it("should format ConflictError with 409 code", () => {
    const error = new ConflictError("Slug already taken");
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe("CONFLICT");
  });

  it("should format DatabaseError with 500 code", () => {
    const error = new DatabaseError("Connection timeout");
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe("DATABASE_ERROR");
  });
});
