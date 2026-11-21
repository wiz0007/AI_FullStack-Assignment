import { z } from "zod";

export const modelQuerySchema = z.object({
  search: z.string().optional(),
  company: z.string().optional(),
  modelType: z.enum(["chat", "completion", "embedding", "multimodal"]).optional(),
  capability: z.string().optional(),
  status: z.enum(["active", "deprecated", "preview"]).default("active"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

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
