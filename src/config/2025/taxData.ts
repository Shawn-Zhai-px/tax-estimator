/**
 * Tax year 2025 (return filed in 2026) reference data.
 *
 * Sources (retrieved August 2026):
 * - Federal brackets & standard deduction: IRS Rev. Proc. 2024-40, as
 *   amended by the One Big Beautiful Bill Act (OBBBA) 2025 standard
 *   deduction increase. See https://www.irs.gov and https://taxfoundation.org/data/all/federal/2025-tax-brackets/
 * - California brackets & standard deduction: CA FTB 2025 Form 540 tax rate
 *   schedules, https://www.ftb.ca.gov/forms/2025/2025-540-tax-rate-schedules.pdf
 */

import { TaxBracket, YearTaxData } from "../types";

const FEDERAL_STANDARD_DEDUCTION = {
  single: 15750,
  mfj: 31500,
  hoh: 23625,
  mfs: 15750,
};

const FEDERAL_BRACKETS = {
  single: [
    { min: 0, max: 11925, rate: 0.1 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: null, rate: 0.37 },
  ],
  mfj: [
    { min: 0, max: 23850, rate: 0.1 },
    { min: 23850, max: 96950, rate: 0.12 },
    { min: 96950, max: 206700, rate: 0.22 },
    { min: 206700, max: 394600, rate: 0.24 },
    { min: 394600, max: 501050, rate: 0.32 },
    { min: 501050, max: 751600, rate: 0.35 },
    { min: 751600, max: null, rate: 0.37 },
  ],
  hoh: [
    { min: 0, max: 17000, rate: 0.1 },
    { min: 17000, max: 64850, rate: 0.12 },
    { min: 64850, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250500, rate: 0.32 },
    { min: 250500, max: 626350, rate: 0.35 },
    { min: 626350, max: null, rate: 0.37 },
  ],
  // MFS brackets are exactly half of the MFJ brackets at every threshold.
  mfs: [
    { min: 0, max: 11925, rate: 0.1 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 375800, rate: 0.35 },
    { min: 375800, max: null, rate: 0.37 },
  ],
} satisfies Record<string, TaxBracket[]>;

const CA_STANDARD_DEDUCTION = {
  single: 5706,
  mfj: 11412,
  hoh: 11412,
  mfs: 5706,
};

// CA Schedule X (Single / MFS)
const CA_SCHEDULE_X: TaxBracket[] = [
  { min: 0, max: 11079, rate: 0.01 },
  { min: 11079, max: 26264, rate: 0.02 },
  { min: 26264, max: 41452, rate: 0.04 },
  { min: 41452, max: 57542, rate: 0.06 },
  { min: 57542, max: 72724, rate: 0.08 },
  { min: 72724, max: 371479, rate: 0.093 },
  { min: 371479, max: 445771, rate: 0.103 },
  { min: 445771, max: 742953, rate: 0.113 },
  { min: 742953, max: null, rate: 0.123 },
];

// CA Schedule Y (Married/RDP Filing Jointly or Qualifying Surviving Spouse)
const CA_SCHEDULE_Y: TaxBracket[] = [
  { min: 0, max: 22158, rate: 0.01 },
  { min: 22158, max: 52528, rate: 0.02 },
  { min: 52528, max: 82904, rate: 0.04 },
  { min: 82904, max: 115084, rate: 0.06 },
  { min: 115084, max: 145448, rate: 0.08 },
  { min: 145448, max: 742958, rate: 0.093 },
  { min: 742958, max: 891542, rate: 0.103 },
  { min: 891542, max: 1485906, rate: 0.113 },
  { min: 1485906, max: null, rate: 0.123 },
];

// CA Schedule Z (Head of Household)
const CA_SCHEDULE_Z: TaxBracket[] = [
  { min: 0, max: 22173, rate: 0.01 },
  { min: 22173, max: 52530, rate: 0.02 },
  { min: 52530, max: 67716, rate: 0.04 },
  { min: 67716, max: 83805, rate: 0.06 },
  { min: 83805, max: 98990, rate: 0.08 },
  { min: 98990, max: 505208, rate: 0.093 },
  { min: 505208, max: 606251, rate: 0.103 },
  { min: 606251, max: 1010417, rate: 0.113 },
  { min: 1010417, max: null, rate: 0.123 },
];

export const TAX_DATA_2025: YearTaxData = {
  taxYear: 2025,
  federalStandardDeduction: FEDERAL_STANDARD_DEDUCTION,
  federalBrackets: FEDERAL_BRACKETS,
  caStandardDeduction: CA_STANDARD_DEDUCTION,
  caBrackets: {
    single: CA_SCHEDULE_X,
    mfs: CA_SCHEDULE_X,
    mfj: CA_SCHEDULE_Y,
    hoh: CA_SCHEDULE_Z,
  },
  caMentalHealthTaxThreshold: 1_000_000,
  caMentalHealthTaxRate: 0.01,
  // SSA: 2025 Social Security wage base (taxable maximum) is $176,100.
  ssWageBase: 176_100,
  // IRS Pub 972 / OBBBA: 2025 Child Tax Credit is $2,200/child; Credit for
  // Other Dependents is $500; both phase out $50 per $1,000 of MAGI over
  // $400,000 (MFJ) / $200,000 (other statuses).
  childTaxCredit: 2200,
  otherDependentCredit: 500,
  ctcPhaseOutThresholdMfj: 400_000,
  ctcPhaseOutThresholdOther: 200_000,
  // IRC §221 / IRS Topic 456: 2025 student loan interest deduction, $2,500
  // max, phases out $85,000-$100,000 MAGI (Single/HoH) or $170,000-$200,000
  // (MFJ). Not available at all for Married Filing Separately.
  studentLoanInterestMax: 2500,
  studentLoanPhaseOut: {
    singleHoh: { lower: 85_000, upper: 100_000 },
    mfj: { lower: 170_000, upper: 200_000 },
  },
  // IRC §164(b)(7), as amended by OBBBA: 2025 SALT itemized-deduction cap
  // is $40,000 ($20,000 MFS), phased down 30% of the amount MAGI exceeds
  // $500,000 ($250,000 MFS), floored at $10,000 ($5,000 MFS).
  saltCap: 40_000,
  saltCapMfs: 20_000,
  saltPhaseDownThreshold: 500_000,
  saltPhaseDownThresholdMfs: 250_000,
  saltFloor: 10_000,
  saltFloorMfs: 5_000,
  // Form 2441 / IRC §21: 2025 Child and Dependent Care Credit. Expense caps
  // $3,000 (one qualifying person) / $6,000 (two or more). Rate is 35% at
  // AGI <= $15,000, stepping down 1 point per $2,000 (or fraction) of AGI
  // above that, floored at 20% (reached once AGI exceeds $43,000) — same
  // dollar thresholds for every filing status (this credit, unlike CTC,
  // has never doubled its AGI thresholds for MFJ).
  dependentCareCredit: {
    expenseCapOnePerson: 3000,
    expenseCapTwoOrMorePersons: 6000,
    maxRatePercent: 35,
    floorRatePercent: 20,
    isRateApproximate: false,
    stepDownStartAgi: 15_000,
  },
  // IRS Rev. Proc. 2024-40: 2025 long-term capital gains / qualified
  // dividends preferential-rate brackets. MFS's 0% threshold matches
  // Single's, but its 15%/20% threshold ($300,000) is its own figure, not
  // simply half of MFJ's ($600,050).
  capitalGainsBrackets: {
    single: [
      { min: 0, max: 48_350, rate: 0 },
      { min: 48_350, max: 533_400, rate: 0.15 },
      { min: 533_400, max: null, rate: 0.2 },
    ],
    mfj: [
      { min: 0, max: 96_700, rate: 0 },
      { min: 96_700, max: 600_050, rate: 0.15 },
      { min: 600_050, max: null, rate: 0.2 },
    ],
    hoh: [
      { min: 0, max: 64_750, rate: 0 },
      { min: 64_750, max: 566_700, rate: 0.15 },
      { min: 566_700, max: null, rate: 0.2 },
    ],
    mfs: [
      { min: 0, max: 48_350, rate: 0 },
      { min: 48_350, max: 300_000, rate: 0.15 },
      { min: 300_000, max: null, rate: 0.2 },
    ],
  },
  // IRS Rev. Proc. 2024-39 (HSA) / IRS 401(k) & IRA limit announcements:
  // 2025 HSA $4,300 self-only / $8,550 family; 401(k)/403(b) elective
  // deferral $23,500; traditional IRA $7,000. Age-50+/55+ catch-up amounts
  // are not modeled.
  hsaLimitSelfOnly: 4_300,
  hsaLimitFamily: 8_550,
  traditional401kLimit: 23_500,
  traditionalIraLimit: 7_000,
};
