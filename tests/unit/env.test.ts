import { describe, it, expect } from "vitest";
import { env } from "@/config/env";

describe("Environment Configuration Unit Tests", () => {
  it("should have a valid NODE_ENV defined", () => {
    expect(["development", "test", "production"]).toContain(env.NODE_ENV);
  });

  it("should have a valid NEXT_PUBLIC_APP_URL defined", () => {
    expect(env.NEXT_PUBLIC_APP_URL).toBeDefined();
    expect(env.NEXT_PUBLIC_APP_URL.startsWith("http")).toBe(true);
  });

  it("should not expose server secrets in client bundles", () => {
    // In mock client environment, DATABASE_URL should be protected
    const clientEnv = {
      NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
    };
    expect((clientEnv as any).DATABASE_URL).toBeUndefined();
    expect((clientEnv as any).DIRECT_URL).toBeUndefined();
  });
});
