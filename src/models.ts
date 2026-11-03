/**
 * Supported LLM models and their pricing (USD per 1M tokens).
 *
 * Prices are hard-coded list prices captured as of PRICING_AS_OF (early-2024
 * benchmarks). Every cost report built on this table inherits that vintage:
 * consumers should surface `PRICING_AS_OF` (the API exposes it on /health and
 * every /summary response as `pricingAsOf`) rather than presenting stale
 * numbers as current market rates.
 */

/** Date (ISO) of the last manual capture of PRICING_DATA. */
export const PRICING_AS_OF = "2024-03-01";

/** Thrown when a cost is requested for a model outside PRICING_DATA. */
export class PricingError extends Error {
  constructor(modelId: string) {
    super(`unknown model "${modelId}" — no pricing entry; refusing to bill silently`);
    this.name = "PricingError";
  }
}

export interface ModelPricing {
  id: string;
  inputCost: number; // Cost per 1M tokens
  outputCost: number; // Cost per 1M tokens
}

export const PRICING_DATA: Record<string, ModelPricing> = {
  "gpt-4-turbo": {
    id: "gpt-4-turbo",
    inputCost: 10.00,
    outputCost: 30.00,
  },
  "gpt-4o": {
    id: "gpt-4o",
    inputCost: 5.00,
    outputCost: 15.00,
  },
  "gpt-3.5-turbo": {
    id: "gpt-3.5-turbo",
    inputCost: 0.50,
    outputCost: 1.50,
  },
  "claude-3-opus": {
    id: "claude-3-opus",
    inputCost: 15.00,
    outputCost: 75.00,
  },
  "claude-3-sonnet": {
    id: "claude-3-sonnet",
    inputCost: 3.00,
    outputCost: 15.00,
  },
  "claude-3-haiku": {
    id: "claude-3-haiku",
    inputCost: 0.25,
    outputCost: 1.25,
  },
  "gemini-1.5-pro": {
    id: "gemini-1.5-pro",
    inputCost: 3.50,
    outputCost: 10.50,
  },
  "gemini-1.5-flash": {
    id: "gemini-1.5-flash",
    inputCost: 0.35,
    outputCost: 1.05,
  },
  "llama-3-70b": {
    id: "llama-3-70b",
    inputCost: 0.90,
    outputCost: 0.90,
  },
  "llama-3-8b": {
    id: "llama-3-8b",
    inputCost: 0.20,
    outputCost: 0.20,
  }
};

export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = PRICING_DATA[model];
  if (!pricing) throw new PricingError(model);
  const inputCost = (inputTokens / 1_000_000) * pricing.inputCost;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputCost;
  return inputCost + outputCost;
}

/**
 * Best-effort variant: returns null instead of throwing when the model has no
 * pricing entry. Use this only where a missing estimate is acceptable —
 * billing paths should surface PricingError instead of under-billing.
 */
export function tryCalculateCost(model: string, inputTokens: number, outputTokens: number): number | null {
  if (!PRICING_DATA[model]) return null;
  return calculateCost(model, inputTokens, outputTokens);
}
