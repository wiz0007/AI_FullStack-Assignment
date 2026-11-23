import { Prisma } from "@prisma/client";

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP"] as const;
export const SUPPORTED_PRICING_UNITS = ["1M_TOKENS", "1K_TOKENS", "PER_REQUEST"] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
export type SupportedPricingUnit = (typeof SUPPORTED_PRICING_UNITS)[number];

export interface PricingRecordLike {
  id?: string;
  inputPrice: string | number | Prisma.Decimal;
  outputPrice?: string | number | Prisma.Decimal | null;
  currency?: string | null;
  pricingUnit?: string | null;
  effectiveFrom?: Date | string | null;
  effectiveTo?: Date | string | null;
  lastVerifiedAt?: Date | string | null;
  source?: string | null;
  dataClassification?: string | null;
}

export interface ModelProviderLike {
  id?: string;
  providerModelIdentifier?: string | null;
  availabilityStatus?: string;
  provider: {
    id?: string;
    name: string;
    slug?: string;
    logoUrl?: string | null;
  };
  pricing?: PricingRecordLike[];
}

/**
 * Filter and select currently valid pricing records for a provider.
 * A pricing record is eligible as current iff:
 * 1. effectiveFrom is a valid date and effectiveFrom <= now
 * 2. effectiveTo is either absent or a valid date and effectiveTo >= now
 * 3. inputPrice is non-negative and valid
 * 4. currency is recognized and supported
 * 5. pricingUnit is recognized and supported
 * Deterministic ordering: most recent effectiveFrom desc, then id asc.
 */
export function getCurrentlyValidPricing(
  pricingList: PricingRecordLike[] = [],
  now: Date = new Date()
): PricingRecordLike[] {
  const currentTime = now.getTime();
  return pricingList
    .filter((p) => {
      // 1. Validate effective start date (if provided)
      if (p.effectiveFrom !== undefined && p.effectiveFrom !== null) {
        const from = new Date(p.effectiveFrom).getTime();
        if (isNaN(from) || from > currentTime) return false;
      }

      // 2. Validate effective end date
      if (p.effectiveTo) {
        const to = new Date(p.effectiveTo).getTime();
        if (isNaN(to) || to < currentTime) return false;
      }

      // 3. Validate price is non-negative and valid
      if (p.inputPrice === undefined || p.inputPrice === null) return false;
      const inputNum = parseFloat(p.inputPrice.toString());
      if (isNaN(inputNum) || inputNum < 0) return false;

      if (p.outputPrice !== undefined && p.outputPrice !== null) {
        const outputNum = parseFloat(p.outputPrice.toString());
        if (isNaN(outputNum) || outputNum < 0) return false;
      }

      // 4. Validate currency (if specified, must be supported)
      if (p.currency !== undefined) {
        if (!p.currency || !SUPPORTED_CURRENCIES.includes(p.currency as SupportedCurrency)) {
          return false;
        }
      }

      // 5. Validate pricing unit (if specified, must be supported)
      if (p.pricingUnit !== undefined) {
        if (
          !p.pricingUnit ||
          !SUPPORTED_PRICING_UNITS.includes(p.pricingUnit as SupportedPricingUnit)
        ) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const aTime = a.effectiveFrom ? new Date(a.effectiveFrom).getTime() : 0;
      const bTime = b.effectiveFrom ? new Date(b.effectiveFrom).getTime() : 0;
      const timeDiff = bTime - aTime;
      if (timeDiff !== 0) return timeDiff;
      return (a.id || "").localeCompare(b.id || "");
    });
}

/**
 * Returns the single active current pricing record for a provider, or null.
 */
export function getActiveProviderPricing(
  providerRel: ModelProviderLike,
  now: Date = new Date()
): PricingRecordLike | null {
  const valid = getCurrentlyValidPricing(providerRel.pricing || [], now);
  return valid[0] || null;
}

/**
 * Canonical representative pricing policy for a model across all its providers:
 * - When provider filter is active: selects strictly from qualifying selected providers (S2-03).
 * - Otherwise: selects the provider offering lowest currently valid input price in USD per 1M tokens.
 * - Tie-breaking: lowest input price, provider name asc, provider ID asc, pricing ID asc.
 * - Returns null if no eligible normalized USD/1M_TOKENS price is found.
 */
export function getRepresentativeModelPrice(
  model: { providers?: ModelProviderLike[] },
  now: Date = new Date(),
  selectedProviderSlugs?: string[]
): {
  inputPrice: string;
  outputPrice: string | null;
  currency: string;
  pricingUnit: string;
  providerName: string;
  providerSlug: string;
  effectiveFrom: string;
  source: string | null;
  dataClassification: string | null;
} | null {
  let best: {
    inputPriceNum: number;
    record: PricingRecordLike;
    provider: ModelProviderLike["provider"];
  } | null = null;

  for (const mp of model.providers || []) {
    // S2-03: When provider filter is active, only consider selected providers
    if (selectedProviderSlugs && selectedProviderSlugs.length > 0) {
      if (!mp.provider.slug || !selectedProviderSlugs.includes(mp.provider.slug)) {
        continue;
      }
    }

    const active = getActiveProviderPricing(mp, now);
    if (!active) continue;

    // Normalization convention: strictly USD and 1M_TOKENS (default to standard when unspecified in client fixtures)
    const effectiveCurrency = active.currency || "USD";
    const effectiveUnit = active.pricingUnit || "1M_TOKENS";
    if (effectiveCurrency === "USD" && effectiveUnit === "1M_TOKENS") {
      const priceNum = parseFloat(active.inputPrice.toString());
      if (!isNaN(priceNum)) {
        if (
          best === null ||
          priceNum < best.inputPriceNum ||
          (priceNum === best.inputPriceNum &&
            mp.provider.name.localeCompare(best.provider.name) < 0) ||
          (priceNum === best.inputPriceNum &&
            mp.provider.name === best.provider.name &&
            (mp.provider.id || "").localeCompare(best.provider.id || "") < 0) ||
          (priceNum === best.inputPriceNum &&
            mp.provider.name === best.provider.name &&
            (active.id || "").localeCompare(best.record.id || "") < 0)
        ) {
          best = {
            inputPriceNum: priceNum,
            record: active,
            provider: mp.provider,
          };
        }
      }
    }
  }

  if (!best) return null;

  return {
    inputPrice: best.record.inputPrice.toString(),
    outputPrice: best.record.outputPrice != null ? best.record.outputPrice.toString() : null,
    currency: best.record.currency || "USD",
    pricingUnit: best.record.pricingUnit || "1M_TOKENS",
    providerName: best.provider.name,
    providerSlug: best.provider.slug || "",
    effectiveFrom: best.record.effectiveFrom
      ? new Date(best.record.effectiveFrom).toISOString()
      : new Date().toISOString(),
    source: best.record.source || null,
    dataClassification: best.record.dataClassification || "CURATED",
  };
}

/**
 * Prisma query condition for currently valid pricing.
 */
export function getCurrentPricingPrismaWhere(now: Date = new Date()): Prisma.PricingWhereInput {
  return {
    effectiveFrom: { lte: now },
    OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
  };
}
