import { z } from "zod";

// Helper to coerce string or array of strings into string[]
const stringOrArray = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((val) => {
    if (!val) return undefined;
    if (Array.isArray(val)) {
      return val
        .flatMap((v) => v.split(","))
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    }
    return val
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  });

export const modelSortOptions = [
  "relevance",
  "name_asc",
  "name_desc",
  "releaseDate_desc",
  "releaseDate_asc",
  "contextWindow_desc",
  "contextWindow_asc",
  "pricing_asc",
  "pricing_desc",
] as const;

export type ModelSortOption = (typeof modelSortOptions)[number];

export const modelQuerySchema = z
  .object({
    q: z
      .string()
      .max(100, "Search query must be 100 characters or less")
      .optional()
      .transform((val) => (val ? val.trim() : undefined)),
    search: z
      .string()
      .max(100, "Search query must be 100 characters or less")
      .optional()
      .transform((val) => (val ? val.trim() : undefined)),
    provider: stringOrArray,
    category: stringOrArray,
    capability: stringOrArray,
    status: z.enum(["active", "deprecated", "preview", "all"]).default("active"),
    minContextWindow: z.coerce
      .number()
      .int()
      .min(0, "Context window cannot be negative")
      .optional(),
    maxContextWindow: z.coerce
      .number()
      .int()
      .min(0, "Context window cannot be negative")
      .optional(),
    minPrice: z.coerce.number().min(0, "Price cannot be negative").optional(),
    maxPrice: z.coerce.number().min(0, "Price cannot be negative").optional(),
    sort: z.enum(modelSortOptions).default("relevance"),
    page: z.coerce.number().int().min(1, "Page must be greater than or equal to 1").default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1, "Limit must be at least 1")
      .max(100, "Limit cannot exceed 100")
      .default(12),
  })
  .refine(
    (data) => {
      if (
        data.minContextWindow !== undefined &&
        data.maxContextWindow !== undefined &&
        data.minContextWindow > data.maxContextWindow
      ) {
        return false;
      }
      return true;
    },
    {
      message: "minContextWindow cannot be greater than maxContextWindow",
      path: ["minContextWindow"],
    }
  )
  .refine(
    (data) => {
      if (
        data.minPrice !== undefined &&
        data.maxPrice !== undefined &&
        data.minPrice > data.maxPrice
      ) {
        return false;
      }
      return true;
    },
    {
      message: "minPrice cannot be greater than maxPrice",
      path: ["minPrice"],
    }
  );

export type ModelQueryParams = z.infer<typeof modelQuerySchema>;

export const createModelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  modelIdentifier: z.string().min(1, "Model identifier is required"),
  description: z.string().optional(),
  companyId: z.string().uuid("Invalid company ID"),
  modelType: z.enum(["chat", "completion", "embedding", "multimodal"]).default("chat"),
  contextWindow: z.number().int().positive("Context window must be positive").optional(),
  inputModalities: z.array(z.string()).default(["text"]),
  outputModalities: z.array(z.string()).default(["text"]),
  status: z.enum(["active", "deprecated", "preview"]).default("active"),
});

export type CreateModelInput = z.infer<typeof createModelSchema>;

export const globalSearchQuerySchema = z.object({
  q: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(1, "Search query must not be empty")
        .max(100, "Search query must be 100 characters or less")
    ),
  scope: z.enum(["all", "models", "providers", "companies"]).default("all"),
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

export type GlobalSearchQueryParams = z.infer<typeof globalSearchQuerySchema>;
