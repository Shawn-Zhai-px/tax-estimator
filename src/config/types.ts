/**
 * Shared, non-year-specific types and constants for the tax estimator.
 *
 * Year-specific bracket/deduction data lives in `./<year>/taxData.ts`
 * (see `./index.ts` for the year → data lookup). This file only holds
 * things that don't change from one tax year to the next: the filing
 * statuses/states the app supports, and the shape of a year's data.
 */

export type FilingStatus = "single" | "mfj" | "hoh" | "mfs";

export type StateCode = "CA" | "TX";

export interface TaxBracket {
  /** Lower bound of this bracket (inclusive), in dollars of taxable income. */
  min: number;
  /** Upper bound of this bracket (exclusive). `null` means "and above". */
  max: number | null;
  /** Marginal rate applied to the slice of income within this bracket. */
  rate: number;
}

export const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  single: "Single",
  mfj: "Married Filing Jointly",
  hoh: "Head of Household",
  mfs: "Married Filing Separately",
};

export const STATES: { code: StateCode; label: string }[] = [
  { code: "CA", label: "California" },
  { code: "TX", label: "Texas (no state income tax)" },
];

/** Shape of one tax year's worth of federal + CA reference data. */
export interface YearTaxData {
  taxYear: number;
  federalStandardDeduction: Record<FilingStatus, number>;
  federalBrackets: Record<FilingStatus, TaxBracket[]>;
  caStandardDeduction: Record<FilingStatus, number>;
  caBrackets: Record<FilingStatus, TaxBracket[]>;
  /** CA Mental Health Services Tax: additional 1% on taxable income over this threshold. */
  caMentalHealthTaxThreshold: number;
  caMentalHealthTaxRate: number;
  /**
   * True if the CA figures for this year are not yet officially published
   * (FTB typically indexes brackets for inflation in the fall) and are
   * carried forward from the prior year as a placeholder. Surfaced in the
   * UI so users aren't misled into thinking these are confirmed.
   */
  caDataIsProvisional?: boolean;
}

export const SUPPORTED_TAX_YEARS = [2025, 2026] as const;
export type TaxYear = (typeof SUPPORTED_TAX_YEARS)[number];
