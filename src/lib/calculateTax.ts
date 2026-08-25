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
  /** Optional: net self-employment income (Schedule C profit), before self-employment tax. */
  selfEmploymentNetIncome?: number;
  /** Optional: number of qualifying children under 17 (Child Tax Credit). */
  qualifyingChildren?: number;
  /** Optional: number of other dependents (Credit for Other Dependents). */
  otherDependents?: number;
  /** Optional: student loan interest paid this year (capped/phased out below). */
  studentLoanInterestPaid?: number;
  /** Optional itemized-deduction components — federal and CA each auto-compare their own total against their own standard deduction. */
  mortgageInterest?: number;
  propertyTax?: number;
  /** State income tax paid — counts toward the federal SALT deduction only (not deductible on the CA return itself). */
  stateIncomeTaxPaid?: number;
  charitableDonations?: number;
  /** Total medical expenses paid (before the 7.5%-of-AGI threshold is applied). */
  medicalExpenses?: number;
  /** Optional: dependent care (e.g. daycare) expenses paid, for the Child and Dependent Care Credit. */
  dependentCareExpenses?: number;
  /** Optional: number of qualifying persons the dependent care expenses were for (changes the $3,000/$6,000 cap). */
  dependentCareQualifyingPersons?: number;
  /** Optional: long-term capital gains + qualified dividends (taxed at preferential 0%/15%/20% rates, and subject to the NIIT). */
  qualifiedDividendsAndLTCG?: number;
  /** Optional: HSA contribution (federal-deductible; CA does not conform — see caAGI). */
  hsaContribution?: number;
  /** HDHP coverage type, changes the HSA contribution limit. Defaults to "self-only" if omitted. */
  hsaCoverageType?: "self-only" | "family";
  /** Optional: traditional (pre-tax) 401(k)/403(b) contribution. */
  traditional401kContribution?: number;
  /** Optional: traditional (deductible) IRA contribution. */
  traditionalIraContribution?: number;
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
  /** HSA contribution entered (capped at the year/coverage-type limit for the deduction, but echoed here uncapped). */
  hsaContribution: number;
  hsaCoverageType: "self-only" | "family";
  /** HSA deduction — federal only; CA does not conform (see `caAGI`). */
  hsaDeduction: number;
  traditional401kContribution: number;
  traditional401kDeduction: number;
  traditionalIraContribution: number;
  traditionalIraDeduction: number;
  /** Sum of the above-the-line adjustments (SE tax deduction + student loan interest + HSA + 401(k) + IRA), federal only. */
  totalAdjustments: number;
  /** Wages + self-employment income + capital gains/dividends, before adjustments. */
  totalIncome: number;
  /** Total income minus adjustments — federal Adjusted Gross Income. */
  federalAGI: number;
  /**
   * CA's version of AGI — same as `federalAGI` except the HSA deduction is
   * added back, because California does not conform to the federal HSA
   * deduction (CA taxes HSA contributions/earnings as ordinary income).
   */
  caAGI: number;

  /** Long-term capital gains + qualified dividends entered (taxed at preferential rates federally; ordinary income for CA, which has no capital-gains carve-out). */
  qualifiedDividendsAndLTCG: number;
  /** Federal tax on the capital-gains/dividends portion of taxable income, at the 0%/15%/20% preferential rates (stacked on top of ordinary income). */
  capitalGainsTax: number;
  /** Net Investment Income Tax (3.8% on the lesser of net investment income or MAGI over the filing-status threshold). Federal only — CA has no NIIT. */
  netInvestmentIncomeTax: number;

  qualifyingChildren: number;
  otherDependents: number;
  /** Child Tax Credit + Credit for Other Dependents, after the MAGI phase-out. */
  dependentCreditAmount: number;

  mortgageInterest: number;
  propertyTax: number;
  stateIncomeTaxPaid: number;
  charitableDonations: number;
  medicalExpenses: number;
  /** SALT (property tax + state income tax) after the federal cap/phase-down. */
  saltDeductible: number;
  /** Medical expenses over the 7.5%-of-AGI threshold (shared by federal and CA). */
  medicalDeductible: number;
  /** Federal itemized total: mortgage interest + SALT (capped) + charitable + medical (over threshold). */
  federalItemizedTotal: number;
  /** CA itemized total: mortgage interest + property tax (no cap) + charitable + medical — excludes state income tax. */
  caItemizedTotal: number;
  caDeductionType: "standard" | "itemized";

  dependentCareExpenses: number;
  dependentCareQualifyingPersons: number;
  /** Child and Dependent Care Credit (federal only — CA has its own separate, smaller credit, not modeled). */
  dependentCareCreditAmount: number;
  /** True if this year's dependent care credit rate schedule is a best-effort approximation (2026, post-OBBBA). */
  dependentCareCreditIsApproximate: boolean;

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
  /** Federal income tax (incl. capital gains tax) + self-employment tax + NIIT (the federal "total tax" line). */
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

// Net Investment Income Tax (IRC §1411) — 3.8% flat rate; these MAGI
// thresholds are fixed by statute and have never been indexed for
// inflation since NIIT took effect in 2013, so they're the same for 2025
// and 2026 (and every other year until Congress changes them).
const NIIT_RATE = 0.038;
const NIIT_THRESHOLD_MFJ = 250_000;
const NIIT_THRESHOLD_MFS = 125_000;
const NIIT_THRESHOLD_OTHER = 200_000;

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

/** Medical/dental expenses are deductible only to the extent they exceed 7.5% of AGI — fixed by law, shared by federal and CA. */
const MEDICAL_EXPENSE_AGI_THRESHOLD_RATE = 0.075;

function calculateMedicalDeduction(medicalExpenses: number, agi: number): number {
  return clampToZero(clampToZero(medicalExpenses) - MEDICAL_EXPENSE_AGI_THRESHOLD_RATE * agi);
}

/**
 * Federal SALT (state and local tax) itemized deduction: property tax +
 * state income tax paid, capped, with the cap phased down 30% of MAGI
 * over the year's threshold (floored at the year's floor).
 */
function calculateSaltDeduction(
  propertyTax: number,
  stateIncomeTaxPaid: number,
  magi: number,
  filingStatus: FilingStatus,
  yearData: ReturnType<typeof getTaxDataForYear>
): number {
  const rawSalt = clampToZero(propertyTax) + clampToZero(stateIncomeTaxPaid);
  const isMfs = filingStatus === "mfs";
  const cap = isMfs ? yearData.saltCapMfs : yearData.saltCap;
  const threshold = isMfs ? yearData.saltPhaseDownThresholdMfs : yearData.saltPhaseDownThreshold;
  const floor = isMfs ? yearData.saltFloorMfs : yearData.saltFloor;
  const phaseDown = clampToZero(magi - threshold) * 0.3;
  const effectiveCap = Math.max(floor, cap - phaseDown);
  return Math.min(rawSalt, effectiveCap);
}

/**
 * Child and Dependent Care Credit rate for a given AGI/filing status —
 * either the well-established 2018-TCJA-era stepped schedule
 * (`stepDownStartAgi` set) or the post-OBBBA smooth piecewise-linear
 * approximation (`agiBreakpoints` set). See the sourcing comments in
 * `../config/2025/taxData.ts` / `../config/2026/taxData.ts`.
 */
function calculateDependentCareCreditRate(
  magi: number,
  filingStatus: FilingStatus,
  dc: ReturnType<typeof getTaxDataForYear>["dependentCareCredit"]
): number {
  if (dc.agiBreakpoints && dc.midRatePercent !== undefined) {
    const [t1, t2, t3, t4] = filingStatus === "mfj" ? dc.agiBreakpoints.mfj : dc.agiBreakpoints.other;
    if (magi <= t1) return dc.maxRatePercent / 100;
    if (magi <= t2) {
      const frac = (magi - t1) / (t2 - t1);
      return (dc.maxRatePercent - frac * (dc.maxRatePercent - dc.midRatePercent)) / 100;
    }
    if (magi <= t3) return dc.midRatePercent / 100;
    if (magi <= t4) {
      const frac = (magi - t3) / (t4 - t3);
      return (dc.midRatePercent - frac * (dc.midRatePercent - dc.floorRatePercent)) / 100;
    }
    return dc.floorRatePercent / 100;
  }

  const start = dc.stepDownStartAgi ?? 0;
  const steps = Math.ceil(clampToZero(magi - start) / 2000);
  return Math.max(dc.floorRatePercent, dc.maxRatePercent - steps) / 100;
}

function calculateDependentCareCredit(
  expenses: number,
  qualifyingPersons: number,
  magi: number,
  filingStatus: FilingStatus,
  dc: ReturnType<typeof getTaxDataForYear>["dependentCareCredit"]
): number {
  const persons = clampToZero(qualifyingPersons);
  const safeExpenses = clampToZero(expenses);
  if (persons <= 0 || safeExpenses <= 0) {
    return 0;
  }
  const cap = persons >= 2 ? dc.expenseCapTwoOrMorePersons : dc.expenseCapOnePerson;
  const eligibleExpenses = Math.min(safeExpenses, cap);
  return eligibleExpenses * calculateDependentCareCreditRate(magi, filingStatus, dc);
}

/**
 * Net Investment Income Tax: 3.8% of the LESSER of net investment income
 * or the amount MAGI exceeds the filing-status threshold. This estimator
 * treats entered capital gains/qualified dividends as the only net
 * investment income (interest, rental income, etc. aren't modeled).
 */
function calculateNiit(netInvestmentIncome: number, magi: number, filingStatus: FilingStatus): number {
  const threshold =
    filingStatus === "mfj" ? NIIT_THRESHOLD_MFJ : filingStatus === "mfs" ? NIIT_THRESHOLD_MFS : NIIT_THRESHOLD_OTHER;
  const magiOverThreshold = clampToZero(magi - threshold);
  return NIIT_RATE * Math.min(clampToZero(netInvestmentIncome), magiOverThreshold);
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

  // --- HSA / traditional 401(k) / traditional IRA (federal adjustments; CA does not conform to HSA) ---
  const hsaCoverageType = input.hsaCoverageType ?? "self-only";
  const hsaLimit = hsaCoverageType === "family" ? yearData.hsaLimitFamily : yearData.hsaLimitSelfOnly;
  const hsaContribution = clampToZero(input.hsaContribution ?? 0);
  const hsaDeduction = Math.min(hsaContribution, hsaLimit);
  const traditional401kContribution = clampToZero(input.traditional401kContribution ?? 0);
  const traditional401kDeduction = Math.min(traditional401kContribution, yearData.traditional401kLimit);
  const traditionalIraContribution = clampToZero(input.traditionalIraContribution ?? 0);
  const traditionalIraDeduction = Math.min(traditionalIraContribution, yearData.traditionalIraLimit);

  // --- Total income -> adjustments -> AGI ---
  const qualifiedDividendsAndLTCG = clampToZero(input.qualifiedDividendsAndLTCG ?? 0);
  const totalIncome = safeIncome + selfEmploymentNetIncome + qualifiedDividendsAndLTCG;
  // MAGI for the student loan deduction is AGI computed before that
  // deduction itself (Pub. 970) — i.e. total income minus every other
  // adjustment we model.
  const otherAdjustments = selfEmploymentTaxDeduction + hsaDeduction + traditional401kDeduction + traditionalIraDeduction;
  const magiBeforeStudentLoanDeduction = clampToZero(totalIncome - otherAdjustments);
  const studentLoanInterestDeduction = calculateStudentLoanInterestDeduction(
    clampToZero(input.studentLoanInterestPaid ?? 0),
    filingStatus,
    magiBeforeStudentLoanDeduction,
    yearData
  );
  const totalAdjustments = otherAdjustments + studentLoanInterestDeduction;
  const federalAGI = clampToZero(totalIncome - totalAdjustments);
  // CA doesn't conform to the federal HSA deduction (contributions/earnings
  // are ordinary taxable income for CA), so add it back for CA's own AGI.
  const caAGI = clampToZero(federalAGI + hsaDeduction);

  // --- Itemized deduction breakdown (federal) ---
  const mortgageInterest = clampToZero(input.mortgageInterest ?? 0);
  const propertyTax = clampToZero(input.propertyTax ?? 0);
  const stateIncomeTaxPaid = clampToZero(input.stateIncomeTaxPaid ?? 0);
  const charitableDonations = clampToZero(input.charitableDonations ?? 0);
  const medicalExpenses = clampToZero(input.medicalExpenses ?? 0);

  const saltDeductible = calculateSaltDeduction(
    propertyTax,
    stateIncomeTaxPaid,
    federalAGI,
    filingStatus,
    yearData
  );
  const medicalDeductible = calculateMedicalDeduction(medicalExpenses, federalAGI);
  const federalItemizedTotal = mortgageInterest + saltDeductible + charitableDonations + medicalDeductible;

  // --- Federal taxable income & bracket tax ---
  const standardDeduction = yearData.federalStandardDeduction[filingStatus];
  const deductionUsed = federalItemizedTotal > standardDeduction ? federalItemizedTotal : standardDeduction;
  const deductionType: "standard" | "itemized" =
    federalItemizedTotal > standardDeduction ? "itemized" : "standard";

  const federalTaxableIncome = clampToZero(federalAGI - deductionUsed);
  const federalBrackets = yearData.federalBrackets[filingStatus];

  // Long-term capital gains / qualified dividends are taxed at preferential
  // 0%/15%/20% rates, "stacked" on top of ordinary taxable income (Qualified
  // Dividends and Capital Gain Tax Worksheet). We compute this by taxing
  // ordinary income alone at ordinary rates, then finding the *incremental*
  // tax the capital-gains slice adds when taxed (at capital-gains rates)
  // on top of that same ordinary-income base — subtracting out the capital-
  // gains-rate tax on the ordinary base isolates just the stacked slice.
  const capGainsInTaxableIncome = clampToZero(Math.min(qualifiedDividendsAndLTCG, federalTaxableIncome));
  const ordinaryTaxableIncome = federalTaxableIncome - capGainsInTaxableIncome;
  const ordinaryResult = applyBrackets(ordinaryTaxableIncome, federalBrackets);
  const capitalGainsBrackets = yearData.capitalGainsBrackets[filingStatus];
  const capitalGainsTax =
    applyBrackets(ordinaryTaxableIncome + capGainsInTaxableIncome, capitalGainsBrackets).tax -
    applyBrackets(ordinaryTaxableIncome, capitalGainsBrackets).tax;
  const federalTaxBeforeCredits = ordinaryResult.tax + capitalGainsTax;

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

  // --- Child and Dependent Care Credit (federal only) ---
  const dependentCareExpenses = clampToZero(input.dependentCareExpenses ?? 0);
  const dependentCareQualifyingPersons = clampToZero(input.dependentCareQualifyingPersons ?? 0);
  const dependentCareCreditAmount = calculateDependentCareCredit(
    dependentCareExpenses,
    dependentCareQualifyingPersons,
    federalAGI,
    filingStatus,
    yearData.dependentCareCredit
  );

  const federalTax = clampToZero(federalTaxBeforeCredits - dependentCreditAmount - dependentCareCreditAmount);
  const netInvestmentIncomeTax = calculateNiit(qualifiedDividendsAndLTCG, federalAGI, filingStatus);
  const federalTotalTax = federalTax + selfEmploymentTax + netInvestmentIncomeTax;

  // --- State ---
  let stateTaxableIncome = 0;
  let stateTax = 0;
  let stateMarginalRate = 0;
  let stateBracketBreakdown: BracketBreakdownRow[] = [];
  let caDeductionUsed = 0;
  let caDeductionType: "standard" | "itemized" = "standard";
  let caItemizedTotal = 0;
  let caMentalHealthTax = 0;

  if (state === "CA") {
    // CA has its own itemization rules, independent of the federal
    // standard-vs-itemized decision: no SALT cap on property tax, and
    // state income tax paid is excluded entirely (can't deduct CA tax on
    // the CA return itself). Medical uses the same 7.5%-of-AGI threshold
    // (computed against caAGI). CA has no separate self-employment tax and
    // no preferential capital-gains rate (all income, including capital
    // gains, is ordinary CA income), but (like the IRS) generally conforms
    // to taxing net SE income as ordinary income and to the SE-tax/
    // student-loan-interest AGI adjustments — so CA taxable income is
    // computed off `caAGI` (== federalAGI, except CA doesn't allow the HSA
    // deduction, so that's added back).
    const caMedicalDeductible = calculateMedicalDeduction(medicalExpenses, caAGI);
    caItemizedTotal = mortgageInterest + propertyTax + charitableDonations + caMedicalDeductible;
    const caStandardDeduction = yearData.caStandardDeduction[filingStatus];
    caDeductionUsed = caItemizedTotal > caStandardDeduction ? caItemizedTotal : caStandardDeduction;
    caDeductionType = caItemizedTotal > caStandardDeduction ? "itemized" : "standard";
    stateTaxableIncome = clampToZero(caAGI - caDeductionUsed);
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
    hsaContribution,
    hsaCoverageType,
    hsaDeduction,
    traditional401kContribution,
    traditional401kDeduction,
    traditionalIraContribution,
    traditionalIraDeduction,
    totalAdjustments,
    totalIncome,
    federalAGI,
    caAGI,
    qualifiedDividendsAndLTCG,
    capitalGainsTax,
    netInvestmentIncomeTax,
    qualifyingChildren,
    otherDependents,
    dependentCreditAmount,
    mortgageInterest,
    propertyTax,
    stateIncomeTaxPaid,
    charitableDonations,
    medicalExpenses,
    saltDeductible,
    medicalDeductible,
    federalItemizedTotal,
    caItemizedTotal,
    caDeductionType,
    dependentCareExpenses,
    dependentCareQualifyingPersons,
    dependentCareCreditAmount,
    dependentCareCreditIsApproximate: yearData.dependentCareCredit.isRateApproximate,
    deductionUsed,
    deductionType,
    federalTaxableIncome,
    federalTaxBeforeCredits,
    federalTax,
    federalMarginalRate: ordinaryResult.marginalRate,
    federalEffectiveRate: totalIncome > 0 ? federalTax / totalIncome : 0,
    federalBracketBreakdown: ordinaryResult.breakdown,
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
