export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Every numeric input in this app (dollar amounts, counts, rates) is
 * structurally non-negative — the calculation engines already clamp
 * negative values to zero so they can never produce impossible results,
 * but a user who typos a negative number gets no feedback that their entry
 * was silently discarded. This surfaces that as an inline warning instead.
 */
export function getNegativeInputWarning(value: string): string | null {
  const n = Number(value);
  return Number.isFinite(n) && n < 0 ? "Enter a non-negative amount — negative values are treated as $0." : null;
}

/** Same idea as getNegativeInputWarning, for a 0-1 rate/fraction input (e.g. a contribution rate). */
export function getRateInputWarning(value: string): string | null {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n < 0) return "Enter a non-negative rate — negative values are treated as 0%.";
  if (n > 1) return "Enter a rate between 0 and 1 (e.g. 0.10 for 10%).";
  return null;
}
