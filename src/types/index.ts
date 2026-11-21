export type ThemeMode = "light" | "dark";

export interface CompanySummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  headquarters: string | null;
}

export interface ProviderSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  websiteUrl: string | null;
}

export interface PricingSummary {
  id: string;
  inputPrice: string;
  outputPrice: string;
  currency: string;
  pricingUnit: string;
}

export interface ModelSummary {
  id: string;
  name: string;
  slug: string;
  modelIdentifier: string;
  description: string | null;
  modelType: string;
  contextWindow: number | null;
  inputModalities: string[];
  outputModalities: string[];
  releaseDate: string | null;
  status: string;
  company: CompanySummary;
  providers?: {
    provider: ProviderSummary;
    pricing: PricingSummary[];
  }[];
  capabilities?: {
    id: string;
    name: string;
    slug: string;
  }[];
}
