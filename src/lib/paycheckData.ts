/**
 * Paycheck withholding reference data (2026).
 *
 * IMPORTANT: This data is for PAYCHECK WITHHOLDING ESTIMATION only (how
 * much an employer would withhold from each paycheck in 2026), which is a
 * different purpose from `taxData.ts` (estimating the actual federal/state
 * tax owed when filing a 2025 return). The two are intentionally kept
 * separate — do not merge them, even though the bracket shape is similar.
 *
 * Sources (retrieved August 2026):
 * - Federal Percentage Method Annual Withholding brackets: IRS Publication
 *   15-T (2026), Percentage Method Tables for Automated Payroll Systems.
 * - California Method B (Exact Calculation) annual withholding brackets and
 *   standard deduction / exemption credit tables: EDD, California
 *   Withholding Schedules for 2026.
 * - Social Security wage base, FICA/Medicare/Additional Medicare rates,
 *   401(k)/403(b) and Roth catch-up contribution limits, dependent care
 *   FSA limit: SSA / IRS 2026 figures.
 */

import { TaxBracket } from "./taxData";

export const PAYCHECK_TAX_YEAR = 2026;

export type FederalFilingStatus = "single" | "mfj" | "hoh";
export type CAFilingStatus = "single" | "married" | "hoh";
export type PayFrequency = "weekly" | "biweekly" | "semimonthly" | "monthly";
export type CatchUpEligibility = "none" | "standard" | "super";

export const FEDERAL_FILING_STATUS_LABELS: Record<FederalFilingStatus, string> = {
  single: "Single",
  mfj: "Married Filing Jointly",
  hoh: "Head of Household",
};

export const CA_FILING_STATUS_LABELS: Record<CAFilingStatus, string> = {
  single: "Single",
  married: "Married/RDP",
  hoh: "Unmarried Head of Household",
};

export const PAY_FREQUENCY_LABELS: Record<PayFrequency, string> = {
  weekly: "Weekly",
  biweekly: "Biweekly",
  semimonthly: "Semimonthly",
  monthly: "Monthly",
};

export const CATCH_UP_LABELS: Record<CatchUpEligibility, string> = {
  none: "None",
  standard: "Standard (age 50-59 or 64+, $8,000 limit)",
  super: "Super (age 60-63, $11,250 limit)",
};

export const PAY_PERIODS_PER_YEAR: Record<PayFrequency, number> = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
};

// ---------------------------------------------------------------------------
// Federal (IRS Pub 15-T) — 2026 Percentage Method Annual Withholding brackets
// ---------------------------------------------------------------------------

export const FEDERAL_WITHHOLDING_BRACKETS: Record<
  FederalFilingStatus,
  { standard: TaxBracket[]; checkbox: TaxBracket[] }
> = {
  mfj: {
    standard: [
      { min: 0, max: 19300, rate: 0 },
      { min: 19300, max: 44100, rate: 0.1 },
      { min: 44100, max: 120100, rate: 0.12 },
      { min: 120100, max: 230700, rate: 0.22 },
      { min: 230700, max: 422850, rate: 0.24 },
      { min: 422850, max: 531750, rate: 0.32 },
      { min: 531750, max: 788000, rate: 0.35 },
      { min: 788000, max: null, rate: 0.37 },
    ],
    checkbox: [
      { min: 0, max: 16100, rate: 0 },
      { min: 16100, max: 28500, rate: 0.1 },
      { min: 28500, max: 66500, rate: 0.12 },
      { min: 66500, max: 121800, rate: 0.22 },
      { min: 121800, max: 217875, rate: 0.24 },
      { min: 217875, max: 272325, rate: 0.32 },
      { min: 272325, max: 400450, rate: 0.35 },
      { min: 400450, max: null, rate: 0.37 },
    ],
  },
  single: {
    standard: [
      { min: 0, max: 7500, rate: 0 },
      { min: 7500, max: 19900, rate: 0.1 },
      { min: 19900, max: 57900, rate: 0.12 },
      { min: 57900, max: 113200, rate: 0.22 },
      { min: 113200, max: 209275, rate: 0.24 },
      { min: 209275, max: 263725, rate: 0.32 },
      { min: 263725, max: 648100, rate: 0.35 },
      { min: 648100, max: null, rate: 0.37 },
    ],
    checkbox: [
      { min: 0, max: 8050, rate: 0 },
      { min: 8050, max: 14250, rate: 0.1 },
      { min: 14250, max: 33250, rate: 0.12 },
      { min: 33250, max: 60900, rate: 0.22 },
      { min: 60900, max: 108938, rate: 0.24 },
      { min: 108938, max: 136163, rate: 0.32 },
      { min: 136163, max: 328350, rate: 0.35 },
      { min: 328350, max: null, rate: 0.37 },
    ],
  },
  hoh: {
    standard: [
      { min: 0, max: 15550, rate: 0 },
      { min: 15550, max: 33250, rate: 0.1 },
      { min: 33250, max: 83000, rate: 0.12 },
      { min: 83000, max: 121250, rate: 0.22 },
      { min: 121250, max: 217300, rate: 0.24 },
      { min: 217300, max: 271750, rate: 0.32 },
      { min: 271750, max: 656150, rate: 0.35 },
      { min: 656150, max: null, rate: 0.37 },
    ],
    checkbox: [
      { min: 0, max: 12075, rate: 0 },
      { min: 12075, max: 20925, rate: 0.1 },
      { min: 20925, max: 45800, rate: 0.12 },
      { min: 45800, max: 64925, rate: 0.22 },
      { min: 64925, max: 112950, rate: 0.24 },
      { min: 112950, max: 140175, rate: 0.32 },
      { min: 140175, max: 332375, rate: 0.35 },
      { min: 332375, max: null, rate: 0.37 },
    ],
  },
};

// ---------------------------------------------------------------------------
// California (EDD) — 2026 Method B (Exact Calculation) annual brackets
// ---------------------------------------------------------------------------

export const CA_WITHHOLDING_BRACKETS: Record<CAFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 11079, rate: 0.011 },
    { min: 11079, max: 26264, rate: 0.022 },
    { min: 26264, max: 41452, rate: 0.044 },
    { min: 41452, max: 57542, rate: 0.066 },
    { min: 57542, max: 72724, rate: 0.088 },
    { min: 72724, max: 371479, rate: 0.1023 },
    { min: 371479, max: 445771, rate: 0.1133 },
    { min: 445771, max: 742953, rate: 0.1243 },
    { min: 742953, max: 1000000, rate: 0.1353 },
    { min: 1000000, max: null, rate: 0.1463 },
  ],
  married: [
    { min: 0, max: 22158, rate: 0.011 },
    { min: 22158, max: 52528, rate: 0.022 },
    { min: 52528, max: 82904, rate: 0.044 },
    { min: 82904, max: 115084, rate: 0.066 },
    { min: 115084, max: 145448, rate: 0.088 },
    { min: 145448, max: 742958, rate: 0.1023 },
    { min: 742958, max: 891542, rate: 0.1133 },
    { min: 891542, max: 1000000, rate: 0.1243 },
    { min: 1000000, max: 1485906, rate: 0.1353 },
    { min: 1485906, max: null, rate: 0.1463 },
  ],
  hoh: [
    { min: 0, max: 22173, rate: 0.011 },
    { min: 22173, max: 52530, rate: 0.022 },
    { min: 52530, max: 67716, rate: 0.044 },
    { min: 67716, max: 83805, rate: 0.066 },
    { min: 83805, max: 98990, rate: 0.088 },
    { min: 98990, max: 505208, rate: 0.1023 },
    { min: 505208, max: 606251, rate: 0.1133 },
    { min: 606251, max: 1000000, rate: 0.1243 },
    { min: 1000000, max: 1010417, rate: 0.1353 },
    { min: 1010417, max: null, rate: 0.1463 },
  ],
};

// ---------------------------------------------------------------------------
// 2026 reference constants
// ---------------------------------------------------------------------------

export const SS_WAGE_BASE = 184500;
export const SS_RATE = 0.062;
export const MEDICARE_RATE = 0.0145;
export const ADDL_MEDICARE_RATE = 0.009;
/** Flat $200,000 — same for all filing statuses for EMPLOYER withholding purposes. */
export const ADDL_MEDICARE_THRESHOLD = 200000;

/** Form W-4 Worksheet 1A, line 1g: std. deduction add-back if Step 2 is NOT checked. */
export const STD_ADDBACK_MFJ = 12900;
export const STD_ADDBACK_OTHER = 8600;

export const FOUR_ZERO_ONE_K_ANNUAL_LIMIT = 24500;
/** 2026 IRS limit: $5,000 for Single/MFJ/HoH. */
export const DEP_CARE_FSA_ANNUAL_LIMIT = 5000;

export const CA_SDI_RATE = 0.013;

/** CA Method B Table 3 (annual). Single and Married-0-or-1-allowance share one figure; HoH and Married-2+-allowances share another. */
export function getCaStandardDeduction(
  status: CAFilingStatus,
  married2PlusAllowances: boolean
): number {
  if (status === "single") return 5706;
  if (status === "married") return married2PlusAllowances ? 11412 : 5706;
  return 11412; // hoh
}

/** CA Method B Table 4 (annual), per allowance on DE 4. */
export const CA_EXEMPTION_CREDIT_PER_ALLOWANCE = 168.3;
/** CA Method B Table 2 (annual column), per additional DE 4 line-2 allowance. */
export const CA_EST_DED_PER_ALLOWANCE = 1000;

/** 2026 IRS limits: $8,000 standard (age 50-59 or 64+), $11,250 super catch-up (age 60-63, SECURE 2.0). */
export const ROTH_CATCHUP_ANNUAL_LIMIT: Record<CatchUpEligibility, number> = {
  none: 0,
  standard: 8000,
  super: 11250,
};

/** IRS optional flat-rate supplemental wage method. */
export const FEDERAL_BONUS_LOW_RATE = 0.22;
export const FEDERAL_BONUS_HIGH_RATE = 0.37;
export const FEDERAL_BONUS_SUPPLEMENTAL_THRESHOLD = 1_000_000;

/** California's mandatory flat supplemental rate. */
export const CA_BONUS_FLAT_RATE = 0.1023;

/**
 * NOTE on scope: this tool assumes level pay all year (no raises/bonuses
 * beyond the single optional bonus modeled here), a single employer, and
 * that Additional Medicare withholding is computed per-employer (not
 * combined with a spouse's wages or other jobs) — consistent with how
 * employers actually compute it. Not tax or payroll advice; always confirm
 * against irs.gov, edd.ca.gov, or your payroll provider.
 */
