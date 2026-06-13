/**
 * Supported LLM models and their pricing (USD per 1M tokens)
 * Prices as of early 2024 benchmarks.
 */

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
  const pricing = PRICING_DATA[model] || PRICING_DATA["gpt-3.5-turbo"]; // Default to 3.5 turbo if unknown
  const inputCost = (inputTokens / 1_000_000) * pricing.inputCost;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputCost;
  return inputCost + outputCost;
}
