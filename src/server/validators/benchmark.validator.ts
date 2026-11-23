import { z } from "zod";

export const benchmarkListQuerySchema = z.object({
  category: z.string().optional(),
});

export type BenchmarkListQueryParams = z.infer<typeof benchmarkListQuerySchema>;

export const rankingsQuerySchema = z.object({
  benchmark: z.string().min(1, "Benchmark slug or ID is required"),
  category: z.string().optional(),
  benchmarkVersion: z.string().optional(),
  datasetVersion: z.string().optional(),
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce.number().int().min(1).max(100, "Limit cannot exceed 100").default(20),
  sort: z
    .enum(["score_desc", "score_asc", "rank_asc", "name_asc", "name_desc"])
    .default("rank_asc"),
});

export type RankingsQueryParams = z.infer<typeof rankingsQuerySchema>;
