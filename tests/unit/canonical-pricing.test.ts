import { describe, it, expect } from "vitest";
import {
  getCurrentlyValidPricing,
  getActiveProviderPricing,
  getRepresentativeModelPrice,
} from "@/lib/pricing";

describe("Canonical Pricing Engine (Workstream B)", () => {
  const baseTime = new Date("2024-06-01T12:00:00Z");

  it("filters out future pricing (effectiveFrom > now)", () => {
    const pricing = [
      {
        id: "future-p",
        inputPrice: "1.00",
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
        effectiveFrom: new Date("2024-01-01T00:00:00Z"),
        effectiveTo: new Date("2024-05-31T23:59:59Z"),
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
        effectiveFrom: new Date("2024-01-01T00:00:00Z"),
      },
      {
        id: "p-new",
        inputPrice: "3.00",
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
