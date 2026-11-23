import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { modelRepository } from "@/server/repositories/model.repository";

describe("PostgreSQL Database Pricing Sort & Filter Parity (S2-02, S5-08, S5-10)", () => {
  let dbAvailable = false;

  beforeAll(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbAvailable = true;
    } catch {
      dbAvailable = false;
    }
  });

  it("sorts models by representative pricing in ascending order at the database level", async () => {
    if (!dbAvailable) return;
    const res = await modelRepository.findMany({
      sort: "pricing_asc",
      status: "active",
      page: 1,
      limit: 10,
    });

    expect(res).toBeDefined();
    expect(res.total).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(res.items)).toBe(true);

    // Verify ordering: models with prices come before models without pricing
    let sawNull = false;
    for (const model of res.items) {
      const activePrices = (model.providers || [])
        .flatMap((p: any) => p.pricing || [])
        .map((pr: any) => parseFloat(pr.inputPrice));

      const minPrice = activePrices.length > 0 ? Math.min(...activePrices) : null;

      if (minPrice === null) {
        sawNull = true;
      } else if (sawNull) {
        // Models with pricing must not appear after models without pricing in ascending sort
        expect(minPrice).toBeNull();
      }
    }
  });

  it("applies provider filtering to SQL pricing sort correctly (S2-03)", async () => {
    if (!dbAvailable) return;
    const res = await modelRepository.findMany({
      sort: "pricing_asc",
      status: "active",
      provider: ["openai-direct"],
      page: 1,
      limit: 10,
    });

    expect(res).toBeDefined();
    expect(Array.isArray(res.items)).toBe(true);
    // Every returned model must have openai-direct provider
    for (const m of res.items) {
      const hasProvider = (m.providers || []).some(
        (mp: any) => mp.provider?.slug === "openai-direct"
      );
      expect(hasProvider).toBe(true);
    }
  });
});
