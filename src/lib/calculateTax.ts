import {
  FilingStatus,
  StateCode,
  TaxBracket,
  TaxYear,
  getTaxDataForYear,
} from "@/config";

export interface TaxEstimateInput {
  /** Gross annual W-2/wage income before deductions. */
  grossIncome: number;
  filingStatus: FilingStatus;
  state: StateCode;
  taxYear: TaxYear;
  /**
   * Optional: use an itemized deduction amount instead of the standard
   * deduction, if it's larger. MVP only supports a single flat number
   * (no itemization breakdown).
   */
  itemizedDeduction?: number;
  /** Optional: net self-employment income (Schedule C profit), before self-employment tax. */
  selfEmploymentNetIncome?: number;
  /** Optional: number of qualifying children under 17 (Child Tax Credit). */
  qualifyingChildren?: number;
  /** Optional: number of other dependents (Credit for Other Dependents). */
  otherDependents?: number;
  /** Optional: student loan interest paid this year (capped/phased out below). */
  studentLoanInterestPaid?: number;
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

  /** Net self-employment income entered (0 if none). */
  selfEmploymentNetIncome: number;
  /** Self-employment tax (Social Security + Medicare portions on net SE earnings). Not modeled: the Additional Medicare surtax on SE income. */
  selfEmploymentTax: number;
  /** The deductible half of self-employment tax (an above-the-line adjustment). */
  selfEmploymentTaxDeduction: number;
  /** Student loan interest deduction after the $2,500 cap and MAGI phase-out (0 for MFS). */
  studentLoanInterestDeduction: number;
  /** Sum of the above-the-line adjustments (SE tax deduction + student loan interest deduction). */
  totalAdjustments: number;
  /** Wages + self-employment income, before adjustments. */
  totalIncome: number;
  /** Total income minus adjustments — federal Adjusted Gross Income. */
  federalAGI: number;

  qualifyingChildren: number;
  otherDependents: number;
  /** Child Tax Credit + Credit for Other Dependents, after the MAGI phase-out. */
  dependentCreditAmount: number;

  deductionUsed: number;
  deductionType: "standard" | "itemized";
  federalTaxableIncome: number;
  /** Federal income tax from the bracket table, before the dependent credit (1040 line 16). */
  federalTaxBeforeCredits: number;
  /** Federal income tax after the dependent credit (does NOT include self-employment tax). */
  federalTax: number;
  federalMarginalRate: number;
  federalEffectiveRate: number;
  federalBracketBreakdown: BracketBreakdownRow[];
  /** Federal income tax + self-employment tax (the federal "total tax" line). */
  federalTotalTax: number;

  stateTaxableIncome: number;
  stateTax: number;
  stateMarginalRate: number;
  stateEffectiveRate: number;
  stateBracketBreakdown: BracketBreakdownRow[];
  /** CA standard deduction actually used (0 for non-CA states). */
  caDeductionUsed: number;
  /** True if this tax year's CA figures are a carried-forward placeholder (FTB hasn't published them yet). */
  caDataIsProvisional: boolean;
  caMentalHealthTax: number;
  totalTax: number;
  totalEffectiveRate: number;
  estimatedTakeHome: number;
}

/** Clamp negative income to zero; taxable income can't be negative here. */
function clampToZero(n: number): number {
  return n < 0 ? 0 : n;
}

// Self-employment tax (Schedule SE) statutory rates — fixed by law, not
// indexed by tax year.
const SE_NET_EARNINGS_FACTOR = 0.9235;
const SE_TAX_SOCIAL_SECURITY_RATE = 0.124;
const SE_TAX_MEDICARE_RATE = 0.029;

// CTC/ODC phase-out rate — $50 reduction per $1,000 (or fraction) of MAGI
// over the threshold. Fixed by law, not indexed by tax year.
const CTC_PHASEOUT_PER_1000 = 50;

/**
 * Self-employment tax on net Schedule C profit: 92.35% of net earnings is
 * subject to 12.4% Social Security (capped at the year's wage base, net of
 * any W-2 wages that already used up that base) + 2.9% Medicare (no cap).
 * The Additional Medicare surtax on self-employment income is not modeled
 * (same omission as the rest of this estimator).
 */
function calculateSelfEmploymentTax(
  netSelfEmploymentIncome: number,
  w2Wages: number,
  ssWageBase: number
): number {
  const netEarnings = clampToZero(netSelfEmploymentIncome) * SE_NET_EARNINGS_FACTOR;
  const ssWageBaseRemaining = clampToZero(ssWageBase - clampToZero(w2Wages));
  const socialSecurityPortion = Math.min(netEarnings, ssWageBaseRemaining) * SE_TAX_SOCIAL_SECURITY_RATE;
  const medicarePortion = netEarnings * SE_TAX_MEDICARE_RATE;
  return socialSecurityPortion + medicarePortion;
}

/**
 * Student loan interest deduction: the smaller of interest paid or the
 * annual cap, reduced pro-rata as MAGI moves through the phase-out range.
 * Not available at all for Married Filing Separately.
 */
function calculateStudentLoanInterestDeduction(
  interestPaid: number,
  filingStatus: FilingStatus,
  magi: number,
  yearData: ReturnType<typeof getTaxDataForYear>
): number {
  if (filingStatus === "mfs" || interestPaid <= 0) {
    return 0;
  }
  const range =
    filingStatus === "mfj" ? yearData.studentLoanPhaseOut.mfj : yearData.studentLoanPhaseOut.singleHoh;
  const phaseOutFraction = clampToZero(
    Math.min(1, (range.upper - magi) / (range.upper - range.lower))
  );
  return Math.min(interestPaid, yearData.studentLoanInterestMax) * phaseOutFraction;
}

/**
 * Child Tax Credit + Credit for Other Dependents, reduced by $50 per
 * $1,000 (or fraction) of MAGI over the filing-status threshold.
 */
function calculateDependentCredit(
  qualifyingChildren: number,
  otherDependents: number,
  magi: number,
  yearData: ReturnType<typeof getTaxDataForYear>,
  filingStatus: FilingStatus
): number {
  const rawCredit =
    clampToZero(qualifyingChildren) * yearData.childTaxCredit +
    clampToZero(otherDependents) * yearData.otherDependentCredit;
  if (rawCredit <= 0) {
    return 0;
  }
  const threshold =
    filingStatus === "mfj" ? yearData.ctcPhaseOutThresholdMfj : yearData.ctcPhaseOutThresholdOther;
  const reduction = Math.ceil(clampToZero(magi - threshold) / 1000) * CTC_PHASEOUT_PER_1000;
  return clampToZero(rawCredit - reduction);
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
  const { filingStatus, state } = input;
  const safeIncome = clampToZero(input.grossIncome);
  const yearData = getTaxDataForYear(input.taxYear);

  // --- Self-employment tax + its above-the-line deduction ---
  const selfEmploymentNetIncome = clampToZero(input.selfEmploymentNetIncome ?? 0);
  const selfEmploymentTax = calculateSelfEmploymentTax(
    selfEmploymentNetIncome,
    safeIncome,
    yearData.ssWageBase
  );
  const selfEmploymentTaxDeduction = selfEmploymentTax / 2;

  // --- Total income -> adjustments -> AGI ---
  const totalIncome = safeIncome + selfEmploymentNetIncome;
  // MAGI for the student loan deduction is AGI computed before that
  // deduction itself (Pub. 970) — i.e. total income minus every other
  // adjustment we model (just the SE tax deduction here).
  const magiBeforeStudentLoanDeduction = clampToZero(totalIncome - selfEmploymentTaxDeduction);
  const studentLoanInterestDeduction = calculateStudentLoanInterestDeduction(
    clampToZero(input.studentLoanInterestPaid ?? 0),
    filingStatus,
    magiBeforeStudentLoanDeduction,
    yearData
  );
  const totalAdjustments = selfEmploymentTaxDeduction + studentLoanInterestDeduction;
  const federalAGI = clampToZero(totalIncome - totalAdjustments);

  // --- Federal taxable income & bracket tax ---
  const standardDeduction = yearData.federalStandardDeduction[filingStatus];
  const deductionUsed =
    input.itemizedDeduction && input.itemizedDeduction > standardDeduction
      ? input.itemizedDeduction
      : standardDeduction;
  const deductionType: "standard" | "itemized" =
    deductionUsed === standardDeduction ? "standard" : "itemized";

  const federalTaxableIncome = clampToZero(federalAGI - deductionUsed);
  const federalBrackets = yearData.federalBrackets[filingStatus];
  const federalResult = applyBrackets(federalTaxableIncome, federalBrackets);

  // --- Child Tax Credit / Credit for Other Dependents ---
  const qualifyingChildren = clampToZero(input.qualifyingChildren ?? 0);
  const otherDependents = clampToZero(input.otherDependents ?? 0);
  const dependentCreditAmount = calculateDependentCredit(
    qualifyingChildren,
    otherDependents,
    federalAGI,
    yearData,
    filingStatus
  );
  const federalTax = clampToZero(federalResult.tax - dependentCreditAmount);
  const federalTotalTax = federalTax + selfEmploymentTax;

  // --- State ---
  let stateTaxableIncome = 0;
  let stateTax = 0;
  let stateMarginalRate = 0;
  let stateBracketBreakdown: BracketBreakdownRow[] = [];
  let caDeductionUsed = 0;
  let caMentalHealthTax = 0;

  if (state === "CA") {
    caDeductionUsed = yearData.caStandardDeduction[filingStatus];
    // CA deduction is not swapped for the federal itemized amount in this
    // MVP (CA itemization rules differ from federal); we always use CA's
    // own standard deduction. CA has no separate self-employment tax, but
    // (like the IRS) generally conforms to taxing net SE income as
    // ordinary income and to the SE-tax/student-loan-interest AGI
    // adjustments, so CA taxable income is computed off the same AGI.
    stateTaxableIncome = clampToZero(federalAGI - caDeductionUsed);
    const caResult = applyBrackets(stateTaxableIncome, yearData.caBrackets[filingStatus]);
    stateTax = caResult.tax;
    stateMarginalRate = caResult.marginalRate;
    stateBracketBreakdown = caResult.breakdown;

    if (stateTaxableIncome > yearData.caMentalHealthTaxThreshold) {
      caMentalHealthTax =
        (stateTaxableIncome - yearData.caMentalHealthTaxThreshold) *
        yearData.caMentalHealthTaxRate;
      stateMarginalRate += yearData.caMentalHealthTaxRate;
    }
  } else if (state === "TX") {
    stateTaxableIncome = 0;
    stateTax = 0;
    stateMarginalRate = 0;
    stateBracketBreakdown = [];
  }

  const totalStateTax = stateTax + caMentalHealthTax;
  const totalTax = federalTotalTax + totalStateTax;

  return {
    taxYear: yearData.taxYear,
    grossIncome: safeIncome,
    filingStatus,
    state,
    selfEmploymentNetIncome,
    selfEmploymentTax,
    selfEmploymentTaxDeduction,
    studentLoanInterestDeduction,
    totalAdjustments,
    totalIncome,
    federalAGI,
    qualifyingChildren,
    otherDependents,
    dependentCreditAmount,
    deductionUsed,
    deductionType,
    federalTaxableIncome,
    federalTaxBeforeCredits: federalResult.tax,
    federalTax,
    federalMarginalRate: federalResult.marginalRate,
    federalEffectiveRate: totalIncome > 0 ? federalTax / totalIncome : 0,
    federalBracketBreakdown: federalResult.breakdown,
    federalTotalTax,
    stateTaxableIncome,
    stateTax: totalStateTax,
    stateMarginalRate,
    stateEffectiveRate: totalIncome > 0 ? totalStateTax / totalIncome : 0,
    stateBracketBreakdown,
    caDeductionUsed,
    caDataIsProvisional: state === "CA" ? Boolean(yearData.caDataIsProvisional) : false,
    caMentalHealthTax,
    totalTax,
    totalEffectiveRate: totalIncome > 0 ? totalTax / totalIncome : 0,
    estimatedTakeHome: totalIncome - totalTax,
  };
}
