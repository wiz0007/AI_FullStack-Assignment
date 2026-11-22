import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  // In browser context, only NEXT_PUBLIC_ variables are exposed
  if (typeof window !== "undefined") {
    return {
      DATABASE_URL: "",
      DIRECT_URL: "",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      NODE_ENV: (process.env.NODE_ENV as any) || "development",
    };
  }

  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      const errors = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      throw new Error(`Production environment configuration error: ${errors}`);
    }
    return result.data;
  }

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    console.warn(`Environment configuration warning: ${errors}`);
    // Provide safe defaults for development/test if not fully configured
    return {
      DATABASE_URL:
        process.env.DATABASE_URL ||
        "postgresql://postgres:postgres@localhost:5432/oneatlas?schema=public",
      DIRECT_URL: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      NODE_ENV: (process.env.NODE_ENV as any) || "development",
    };
  }

  return result.data;
}

export const env = parseEnv();
