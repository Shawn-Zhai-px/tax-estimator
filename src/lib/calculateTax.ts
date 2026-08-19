import {
  CA_BRACKETS,
  CA_MENTAL_HEALTH_TAX_RATE,
  CA_MENTAL_HEALTH_TAX_THRESHOLD,
  CA_STANDARD_DEDUCTION,
  FEDERAL_BRACKETS,
  FEDERAL_STANDARD_DEDUCTION,
  FilingStatus,
  StateCode,
  TAX_YEAR,
  TaxBracket,
} from "./taxData";

export interface TaxEstimateInput {
  /** Gross annual income before deductions. */
  grossIncome: number;
  filingStatus: FilingStatus;
  state: StateCode;
  /**
   * Optional: use an itemized deduction amount instead of the standard
   * deduction, if it's larger. MVP only supports a single flat number
   * (no itemization breakdown).
   */
  itemizedDeduction?: number;
}

export interface BracketBreakdownRow {
  min: number;
  max: number | null;
  rate: number;
  taxableAmountInBracket: number;
  taxForBracket: number;
}

export interface TaxEstimateResult {
  taxYear: number;
  grossIncome: number;
  filingStatus: FilingStatus;
  state: StateCode;
  deductionUsed: number;
  deductionType: "standard" | "itemized";
  federalTaxableIncome: number;
  federalTax: number;
  federalMarginalRate: number;
  federalEffectiveRate: number;
  federalBracketBreakdown: BracketBreakdownRow[];
  stateTaxableIncome: number;
  stateTax: number;
  stateMarginalRate: number;
  stateEffectiveRate: number;
  stateBracketBreakdown: BracketBreakdownRow[];
  caMentalHealthTax: number;
  totalTax: number;
  totalEffectiveRate: number;
  estimatedTakeHome: number;
}

/** Clamp negative income to zero; taxable income can't be negative here. */
function clampToZero(n: number): number {
  return n < 0 ? 0 : n;
}

/**
 * Apply a progressive bracket table to a taxable-income amount.
 * Returns total tax, the marginal rate that applied to the last dollar,
 * and a row-by-row breakdown for transparency in the UI/export.
 */
export function applyBrackets(
  taxableIncome: number,
  brackets: TaxBracket[]
): { tax: number; marginalRate: number; breakdown: BracketBreakdownRow[] } {
  let remaining = clampToZero(taxableIncome);
  let tax = 0;
  let marginalRate = brackets[0]?.rate ?? 0;
  const breakdown: BracketBreakdownRow[] = [];

  for (const bracket of brackets) {
    if (remaining <= 0) {
      breakdown.push({
        min: bracket.min,
        max: bracket.max,
        rate: bracket.rate,
        taxableAmountInBracket: 0,
        taxForBracket: 0,
      });
      continue;
    }

    const bracketSpan =
      bracket.max === null ? remaining : bracket.max - bracket.min;
    const amountInBracket = Math.min(remaining, bracketSpan);
    const taxForBracket = amountInBracket * bracket.rate;

    breakdown.push({
      min: bracket.min,
      max: bracket.max,
      rate: bracket.rate,
      taxableAmountInBracket: amountInBracket,
      taxForBracket,
    });

    tax += taxForBracket;
    remaining -= amountInBracket;

    if (amountInBracket > 0) {
      marginalRate = bracket.rate;
    }
  }

  return { tax, marginalRate, breakdown };
}

export function estimateTax(input: TaxEstimateInput): TaxEstimateResult {
  const { grossIncome, filingStatus, state } = input;
  const safeIncome = clampToZero(grossIncome);

  const standardDeduction = FEDERAL_STANDARD_DEDUCTION[filingStatus];
  const deductionUsed =
    input.itemizedDeduction && input.itemizedDeduction > standardDeduction
      ? input.itemizedDeduction
      : standardDeduction;
  const deductionType: "standard" | "itemized" =
    deductionUsed === standardDeduction ? "standard" : "itemized";

  // --- Federal ---
  const federalTaxableIncome = clampToZero(safeIncome - deductionUsed);
  const federalBrackets = FEDERAL_BRACKETS[filingStatus];
  const federalResult = applyBrackets(federalTaxableIncome, federalBrackets);

  // --- State ---
  let stateTaxableIncome = 0;
  let stateTax = 0;
  let stateMarginalRate = 0;
  let stateBracketBreakdown: BracketBreakdownRow[] = [];
  let caMentalHealthTax = 0;

  if (state === "CA") {
    const caDeduction = CA_STANDARD_DEDUCTION[filingStatus];
    // CA deduction is not swapped for the federal itemized amount in this
    // MVP (CA itemization rules differ from federal); we always use CA's
    // own standard deduction.
    stateTaxableIncome = clampToZero(safeIncome - caDeduction);
    const caResult = applyBrackets(stateTaxableIncome, CA_BRACKETS[filingStatus]);
    stateTax = caResult.tax;
    stateMarginalRate = caResult.marginalRate;
    stateBracketBreakdown = caResult.breakdown;

    if (stateTaxableIncome > CA_MENTAL_HEALTH_TAX_THRESHOLD) {
      caMentalHealthTax =
        (stateTaxableIncome - CA_MENTAL_HEALTH_TAX_THRESHOLD) *
        CA_MENTAL_HEALTH_TAX_RATE;
      stateMarginalRate += CA_MENTAL_HEALTH_TAX_RATE;
    }
  } else if (state === "TX") {
    stateTaxableIncome = 0;
    stateTax = 0;
    stateMarginalRate = 0;
    stateBracketBreakdown = [];
  }

  const totalStateTax = stateTax + caMentalHealthTax;
  const totalTax = federalResult.tax + totalStateTax;

  return {
    taxYear: TAX_YEAR,
    grossIncome: safeIncome,
    filingStatus,
    state,
    deductionUsed,
    deductionType,
    federalTaxableIncome,
    federalTax: federalResult.tax,
    federalMarginalRate: federalResult.marginalRate,
    federalEffectiveRate: safeIncome > 0 ? federalResult.tax / safeIncome : 0,
    federalBracketBreakdown: federalResult.breakdown,
    stateTaxableIncome,
    stateTax: totalStateTax,
    stateMarginalRate,
    stateEffectiveRate: safeIncome > 0 ? totalStateTax / safeIncome : 0,
    stateBracketBreakdown,
    caMentalHealthTax,
    totalTax,
    totalEffectiveRate: safeIncome > 0 ? totalTax / safeIncome : 0,
    estimatedTakeHome: safeIncome - totalTax,
  };
}
