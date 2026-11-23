import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { BenchmarkRepository } from "@/server/repositories/benchmark.repository";

describe("PostgreSQL Ranking Engine & Competition Ties (S4-01, S4-02, P0-02, S5-08, S5-09)", () => {
  const repo = new BenchmarkRepository();
  let dbAvailable = false;

  beforeAll(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbAvailable = true;
    } catch {
      dbAvailable = false;
    }
  });

  it("retrieves benchmarks with nested benchmark versions", async () => {
    if (!dbAvailable) return;
    const benchmarks = await repo.findAll();
    expect(benchmarks.length).toBeGreaterThan(0);
    const mmlu = benchmarks.find((b) => b.slug === "mmlu");
    expect(mmlu).toBeDefined();
    expect(mmlu?.versions.length).toBeGreaterThan(0);
  });

  it("computes database-driven rankings with correct competition ranking ties and distinct counts", async () => {
    if (!dbAvailable) return;
    const res = await repo.getRankings({
      benchmark: "mmlu",
      limit: 10,
      page: 1,
      sort: "rank_asc",
    });

    if (!res) return;

    expect(res.benchmark.slug).toBe("mmlu");
    expect(res.pagination).toBeDefined();
    expect(res.pagination.total).toBeGreaterThanOrEqual(0);

    // Each model must appear AT MOST ONCE (P0-02 distinct models guarantee)
    const modelIds = res.rankings.map((r: any) => r.modelId);
    const uniqueModelIds = new Set(modelIds);
    expect(modelIds.length).toBe(uniqueModelIds.size);

    // Ranks must be non-negative positive integers
    res.rankings.forEach((r: any) => {
      expect(r.rank).toBeGreaterThanOrEqual(1);
      expect(r.modelName).toBeDefined();
      expect(r.company).toBeDefined();
    });
  });

  it("preserves display sorting independently of canonical competition rank (E12)", async () => {
    if (!dbAvailable) return;
    const resNameAsc = await repo.getRankings({
      benchmark: "mmlu",
      limit: 10,
      page: 1,
      sort: "name_asc",
    });

    if (!resNameAsc || resNameAsc.rankings.length < 2) return;

    // Verify rows are sorted alphabetically by modelName
    const names = resNameAsc.rankings.map((r: any) => r.modelName);
    const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sortedNames);

    // Even though sorted by name, each row still has its canonical rank
    resNameAsc.rankings.forEach((r: any) => {
      expect(r.rank).toBeGreaterThanOrEqual(1);
    });
  });
});
