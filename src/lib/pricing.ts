import { Prisma } from "@prisma/client";

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
 * 1. effectiveFrom <= now (if effectiveFrom is specified)
 * 2. effectiveTo is null or effectiveTo >= now
 * Deterministic ordering: most recent effectiveFrom desc, then id asc.
 */
export function getCurrentlyValidPricing(
  pricingList: PricingRecordLike[] = [],
  now: Date = new Date()
): PricingRecordLike[] {
  const currentTime = now.getTime();
  return pricingList
    .filter((p) => {
      if (p.effectiveFrom) {
        const from = new Date(p.effectiveFrom).getTime();
        if (!isNaN(from) && from > currentTime) return false;
      }
      if (p.effectiveTo) {
        const to = new Date(p.effectiveTo).getTime();
        if (!isNaN(to) && to < currentTime) return false;
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
 * Selects the provider offering the lowest currently valid input price in standard USD per 1M tokens.
 * If tied, uses deterministic provider name/id ordering.
 * Returns null if no providers offer valid normalized pricing.
 */
export function getRepresentativeModelPrice(
  model: { providers?: ModelProviderLike[] },
  now: Date = new Date()
): {
  inputPrice: string;
  outputPrice: string | null;
  currency: string;
  pricingUnit: string;
  providerName: string;
  providerSlug: string;
  effectiveFrom: string;
  source: string | null;
} | null {
  let best: {
    inputPriceNum: number;
    record: PricingRecordLike;
    provider: ModelProviderLike["provider"];
  } | null = null;

  for (const mp of model.providers || []) {
    const active = getActiveProviderPricing(mp, now);
    if (!active) continue;

    // Normalization convention: USD and 1M_TOKENS
    const currency = active.currency || "USD";
    const pricingUnit = active.pricingUnit || "1M_TOKENS";
    if (currency === "USD" && pricingUnit === "1M_TOKENS") {
      const priceNum = parseFloat(active.inputPrice.toString());
      if (!isNaN(priceNum)) {
        if (
          best === null ||
          priceNum < best.inputPriceNum ||
          (priceNum === best.inputPriceNum &&
            mp.provider.name.localeCompare(best.provider.name) < 0)
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
