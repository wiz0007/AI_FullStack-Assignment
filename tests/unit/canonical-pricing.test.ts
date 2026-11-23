import { describe, it, expect } from "vitest";
import {
  getCurrentlyValidPricing,
  getActiveProviderPricing,
  getRepresentativeModelPrice,
} from "@/lib/pricing";

describe("Canonical Pricing Engine (Workstream B, S3-01, S5-10)", () => {
  const baseTime = new Date("2024-06-01T12:00:00Z");

  it("filters out future pricing (effectiveFrom > now)", () => {
    const pricing = [
      {
        id: "future-p",
        inputPrice: "1.00",
        currency: "USD",
        pricingUnit: "1M_TOKENS",
        effectiveFrom: new Date("2024-07-01T00:00:00Z"),
      },
    ];

    const result = getCurrentlyValidPricing(pricing, baseTime);
    expect(result).toHaveLength(0);
  });

  it("filters out expired pricing (effectiveTo < now)", () => {
    const pricing = [
      {
        id: "expired-p",
        inputPrice: "1.00",
        currency: "USD",
        pricingUnit: "1M_TOKENS",
        effectiveFrom: new Date("2024-01-01T00:00:00Z"),
        effectiveTo: new Date("2024-05-31T23:59:59Z"),
      },
    ];

    const result = getCurrentlyValidPricing(pricing, baseTime);
    expect(result).toHaveLength(0);
  });

  it("rejects pricing records with invalid effective dates (E04)", () => {
    const pricing = [
      {
        id: "invalid-date-p",
        inputPrice: "1.00",
        currency: "USD",
        pricingUnit: "1M_TOKENS",
        effectiveFrom: "not-a-valid-date",
      },
    ];

    const result = getCurrentlyValidPricing(pricing, baseTime);
    expect(result).toHaveLength(0);
  });

  it("rejects negative pricing records", () => {
    const pricing = [
      {
        id: "neg-p",
        inputPrice: "-1.50",
        currency: "USD",
        pricingUnit: "1M_TOKENS",
        effectiveFrom: new Date("2024-01-01T00:00:00Z"),
      },
    ];

    const result = getCurrentlyValidPricing(pricing, baseTime);
    expect(result).toHaveLength(0);
  });

  it("rejects pricing with unsupported or missing currency (E06)", () => {
    const pricing = [
      {
        id: "bad-currency",
        inputPrice: "1.00",
        currency: "XYZ",
        pricingUnit: "1M_TOKENS",
        effectiveFrom: new Date("2024-01-01T00:00:00Z"),
      },
      {
        id: "no-currency",
        inputPrice: "1.00",
        currency: null,
        pricingUnit: "1M_TOKENS",
        effectiveFrom: new Date("2024-01-01T00:00:00Z"),
      },
    ];

    const result = getCurrentlyValidPricing(pricing, baseTime);
    expect(result).toHaveLength(0);
  });

  it("rejects pricing with unsupported or missing pricing unit (E05)", () => {
    const pricing = [
      {
        id: "bad-unit",
        inputPrice: "1.00",
        currency: "USD",
        pricingUnit: "HOURLY_RATE",
        effectiveFrom: new Date("2024-01-01T00:00:00Z"),
      },
    ];

    const result = getCurrentlyValidPricing(pricing, baseTime);
    expect(result).toHaveLength(0);
  });

  it("selects the most recent valid pricing record deterministically", () => {
    const pricing = [
      {
        id: "p-old",
        inputPrice: "5.00",
        currency: "USD",
        pricingUnit: "1M_TOKENS",
        effectiveFrom: new Date("2024-01-01T00:00:00Z"),
      },
      {
        id: "p-new",
        inputPrice: "3.00",
        currency: "USD",
        pricingUnit: "1M_TOKENS",
        effectiveFrom: new Date("2024-04-01T00:00:00Z"),
      },
    ];

    const result = getCurrentlyValidPricing(pricing, baseTime);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("p-new");
    expect(result[0].inputPrice).toBe("3.00");
  });

  it("selects lowest input price across multiple providers for representative price", () => {
    const model = {
      providers: [
        {
          provider: { id: "p-1", name: "High Provider", slug: "high" },
          pricing: [
            {
              id: "pr-1",
              inputPrice: "5.00",
              outputPrice: "15.00",
              currency: "USD",
              pricingUnit: "1M_TOKENS",
              effectiveFrom: new Date("2024-01-01"),
            },
          ],
        },
        {
          provider: { id: "p-2", name: "Low Provider", slug: "low" },
          pricing: [
            {
              id: "pr-2",
              inputPrice: "2.50",
              outputPrice: "10.00",
              currency: "USD",
              pricingUnit: "1M_TOKENS",
              effectiveFrom: new Date("2024-01-01"),
            },
          ],
        },
      ],
    };

    const best = getRepresentativeModelPrice(model, baseTime);
    expect(best).not.toBeNull();
    expect(best?.inputPrice).toBe("2.50");
    expect(best?.providerName).toBe("Low Provider");
  });

  it("respects active provider filter when calculating representative price (S2-03, E07)", () => {
    const model = {
      providers: [
        {
          provider: { id: "p-1", name: "Provider A", slug: "provider-a" },
          pricing: [
            {
              id: "pr-1",
              inputPrice: "5.00",
              outputPrice: "15.00",
              currency: "USD",
              pricingUnit: "1M_TOKENS",
              effectiveFrom: new Date("2024-01-01"),
            },
          ],
        },
        {
          provider: { id: "p-2", name: "Provider B", slug: "provider-b" },
          pricing: [
            {
              id: "pr-2",
              inputPrice: "2.50",
              outputPrice: "10.00",
              currency: "USD",
              pricingUnit: "1M_TOKENS",
              effectiveFrom: new Date("2024-01-01"),
            },
          ],
        },
      ],
    };

    // User explicitly filtered for Provider A. Provider B is cheaper, but Provider A was selected.
    const best = getRepresentativeModelPrice(model, baseTime, ["provider-a"]);
    expect(best).not.toBeNull();
    expect(best?.inputPrice).toBe("5.00");
    expect(best?.providerName).toBe("Provider A");
  });

  it("returns null if selected provider has no valid pricing (S2-03)", () => {
    const model = {
      providers: [
        {
          provider: { id: "p-1", name: "Provider A", slug: "provider-a" },
          pricing: [],
        },
        {
          provider: { id: "p-2", name: "Provider B", slug: "provider-b" },
          pricing: [
            {
              id: "pr-2",
              inputPrice: "2.50",
              currency: "USD",
              pricingUnit: "1M_TOKENS",
              effectiveFrom: new Date("2024-01-01"),
            },
          ],
        },
      ],
    };

    const best = getRepresentativeModelPrice(model, baseTime, ["provider-a"]);
    expect(best).toBeNull();
  });

  it("breaks price ties deterministically by provider name", () => {
    const model = {
      providers: [
        {
          provider: { id: "p-z", name: "Zeta Cloud", slug: "zeta" },
          pricing: [
            {
              id: "pr-z",
              inputPrice: "2.00",
              currency: "USD",
              pricingUnit: "1M_TOKENS",
              effectiveFrom: new Date("2024-01-01"),
            },
          ],
        },
        {
          provider: { id: "p-a", name: "Alpha Direct", slug: "alpha" },
          pricing: [
            {
              id: "pr-a",
              inputPrice: "2.00",
              currency: "USD",
              pricingUnit: "1M_TOKENS",
              effectiveFrom: new Date("2024-01-01"),
            },
          ],
        },
      ],
    };

    const best = getRepresentativeModelPrice(model, baseTime);
    expect(best).not.toBeNull();
    expect(best?.providerName).toBe("Alpha Direct");
  });
});
