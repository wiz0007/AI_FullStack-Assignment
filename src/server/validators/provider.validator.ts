import { z } from "zod";

export const providerSortOptions = ["name_asc", "name_desc", "models_desc"] as const;
export type ProviderSortOption = (typeof providerSortOptions)[number];

export const baseProviderQuerySchema = z.object({
  q: z
    .string()
    .max(100)
    .optional()
    .transform((v) => (v ? v.trim() : undefined)),
  search: z
    .string()
    .max(100)
    .optional()
    .transform((v) => (v ? v.trim() : undefined)),
  sort: z.enum(providerSortOptions).default("models_desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const providerQuerySchema = baseProviderQuerySchema.transform((data) => ({
  ...data,
  search: data.search || data.q,
  q: data.q || data.search,
}));

export interface ProviderQueryParams {
  q?: string;
  search?: string;
  sort?: ProviderSortOption;
  page: number;
  limit: number;
}
