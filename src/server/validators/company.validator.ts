import { z } from "zod";

export const companySortOptions = ["name_asc", "name_desc", "models_desc", "release_desc"] as const;
export type CompanySortOption = (typeof companySortOptions)[number];

export const baseCompanyQuerySchema = z.object({
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
  sort: z.enum(companySortOptions).default("models_desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const companyQuerySchema = baseCompanyQuerySchema.transform((data) => ({
  ...data,
  search: data.search || data.q,
  q: data.q || data.search,
}));

export interface CompanyQueryParams {
  q?: string;
  search?: string;
  sort?: CompanySortOption;
  page: number;
  limit: number;
}
