import { describe, it, expect } from "vitest";
import { GET as getHealth } from "@/app/api/health/route";

describe("Health API Integration Tests", () => {
  it("should respond with 200 OK and valid health payload", async () => {
    const response = await getHealth();
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBe("healthy");
    expect(json.data.service).toBe("oneatlas-web");
    expect(json.data.timestamp).toBeDefined();
  });
});
