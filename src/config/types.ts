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

interface DependentCareCreditBase {
  /** Expense cap when claiming for one qualifying person. */
  expenseCapOnePerson: number;
  /** Expense cap when claiming for two or more qualifying persons. */
  expenseCapTwoOrMorePersons: number;
  maxRatePercent: number;
  floorRatePercent: number;
  /** True if this year's rate schedule is a best-effort approximation (see calculateDependentCareCreditRate). */
  isRateApproximate: boolean;
}

/**
 * 2018-TCJA-style stepped schedule: rate steps down 1 point per $2,000 (or
 * fraction) of AGI over `stepDownStartAgi`, floored at `floorRatePercent`.
 * Same dollar amount for every filing status.
 */
export interface DependentCareCreditStepped extends DependentCareCreditBase {
  schedule: "stepped";
  stepDownStartAgi: number;
}

/**
 * OBBBA-style smooth approximation: four AGI breakpoints per filing-status
 * group — [maxRateEndsAt, midPlateauStarts, midPlateauEnds, floorStartsAt].
 * Rate is `maxRatePercent` up to the first breakpoint, linearly interpolates
 * down to `midRatePercent` by the second, holds flat until the third, then
 * linearly interpolates down to `floorRatePercent` by the fourth.
 */
export interface DependentCareCreditSmooth extends DependentCareCreditBase {
  schedule: "smooth";
  midRatePercent: number;
  agiBreakpoints: {
    other: [number, number, number, number];
    mfj: [number, number, number, number];
  };
}

export type DependentCareCreditConfig = DependentCareCreditStepped | DependentCareCreditSmooth;

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

  /** Social Security wage base (OASDI taxable maximum) for this year — used for the Social Security portion of self-employment tax. */
  ssWageBase: number;
  /** Child Tax Credit, per qualifying child under 17. */
  childTaxCredit: number;
  /** Credit for Other Dependents, per dependent who doesn't qualify for the CTC. */
  otherDependentCredit: number;
  /** CTC/ODC phase-out begins above this MAGI for Married Filing Jointly. */
  ctcPhaseOutThresholdMfj: number;
  /** CTC/ODC phase-out begins above this MAGI for Single/HoH/MFS. */
  ctcPhaseOutThresholdOther: number;
  /** Maximum student loan interest deduction (per return, not per person). */
  studentLoanInterestMax: number;
  /** Student loan interest deduction MAGI phase-out range, by filing-status group. MFS is not eligible at all (not modeled here). */
  studentLoanPhaseOut: {
    singleHoh: { lower: number; upper: number };
    mfj: { lower: number; upper: number };
  };

  /** Federal SALT (state/local tax) itemized-deduction cap, before phase-down. */
  saltCap: number;
  saltCapMfs: number;
  /** SALT cap phases down 30% of MAGI over this threshold (floored at saltFloor). */
  saltPhaseDownThreshold: number;
  saltPhaseDownThresholdMfs: number;
  saltFloor: number;
  saltFloorMfs: number;

  /** Child and Dependent Care Credit (Form 2441 / IRC §21) parameters. */
  dependentCareCredit: DependentCareCreditConfig;

  /** Long-term capital gains / qualified dividends preferential-rate brackets (0%/15%/20%). */
  capitalGainsBrackets: Record<FilingStatus, TaxBracket[]>;

  /** HSA annual contribution limits (excludes the $1,000 age-55+ catch-up, not modeled). */
  hsaLimitSelfOnly: number;
  hsaLimitFamily: number;
  /** Traditional (pre-tax) 401(k)/403(b) elective deferral limit (excludes age-50+ catch-up, not modeled). */
  traditional401kLimit: number;
  /** Traditional IRA contribution limit (excludes age-50+ catch-up, not modeled; active-participant deduction phase-out also not modeled). */
  traditionalIraLimit: number;
}

export const SUPPORTED_TAX_YEARS = [2025, 2026] as const;
export type TaxYear = (typeof SUPPORTED_TAX_YEARS)[number];
