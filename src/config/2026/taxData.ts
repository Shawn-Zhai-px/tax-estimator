/**
 * Tax year 2026 (return filed in 2027) reference data.
 *
 * Sources (retrieved August 2026):
 * - Federal brackets & standard deduction: IRS Rev. Proc. 2025-32 ("IRS
 *   releases tax inflation adjustments for tax year 2026, including
 *   amendments from the One, Big, Beautiful Bill"), irs.gov, cross-checked
 *   against https://taxfoundation.org/data/all/federal/2026-tax-brackets/.
 *   MFS brackets are not separately published by the IRS; per standard IRS
 *   methodology they are exactly half of the MFJ brackets at every
 *   threshold (same approach used in ../2025/taxData.ts).
 * - California: as of this writing (August 2026), the FTB has NOT yet
 *   published the inflation-indexed 2026 Form 540 tax rate schedule or
 *   standard deduction (they're typically released in the fall for the
 *   upcoming filing season). The known facts are only the *rates*
 *   (1/2/4/6/8/9.3/10.3/11.3/12.3%, plus the 1% Mental Health Services Tax
 *   over $1M) — the dollar bracket thresholds are unconfirmed. Rather than
 *   guess inflation-adjusted thresholds, this file carries forward the
 *   2025 CA thresholds/standard deduction as a clearly-flagged placeholder
 *   (`caDataIsProvisional: true`) until FTB publishes the real 2026
 *   figures. Do not treat the CA numbers under the 2026 selector as final.
 */

import { TaxBracket, YearTaxData } from "../types";
import { TAX_DATA_2025 } from "../2025/taxData";

const FEDERAL_STANDARD_DEDUCTION = {
  single: 16100,
  mfj: 32200,
  hoh: 24150,
  mfs: 16100,
};

const FEDERAL_BRACKETS = {
  single: [
    { min: 0, max: 12400, rate: 0.1 },
    { min: 12400, max: 50400, rate: 0.12 },
    { min: 50400, max: 105700, rate: 0.22 },
    { min: 105700, max: 201775, rate: 0.24 },
    { min: 201775, max: 256225, rate: 0.32 },
    { min: 256225, max: 640600, rate: 0.35 },
    { min: 640600, max: null, rate: 0.37 },
  ],
  mfj: [
    { min: 0, max: 24800, rate: 0.1 },
    { min: 24800, max: 100800, rate: 0.12 },
    { min: 100800, max: 211400, rate: 0.22 },
    { min: 211400, max: 403550, rate: 0.24 },
    { min: 403550, max: 512450, rate: 0.32 },
    { min: 512450, max: 768700, rate: 0.35 },
    { min: 768700, max: null, rate: 0.37 },
  ],
  hoh: [
    { min: 0, max: 17700, rate: 0.1 },
    { min: 17700, max: 67450, rate: 0.12 },
    { min: 67450, max: 105700, rate: 0.22 },
    { min: 105700, max: 201775, rate: 0.24 },
    { min: 201775, max: 256200, rate: 0.32 },
    { min: 256200, max: 640600, rate: 0.35 },
    { min: 640600, max: null, rate: 0.37 },
  ],
  // MFS brackets are exactly half of the MFJ brackets at every threshold
  // (IRS convention — not independently published).
  mfs: [
    { min: 0, max: 12400, rate: 0.1 },
    { min: 12400, max: 50400, rate: 0.12 },
    { min: 50400, max: 105700, rate: 0.22 },
    { min: 105700, max: 201775, rate: 0.24 },
    { min: 201775, max: 256225, rate: 0.32 },
    { min: 256225, max: 384350, rate: 0.35 },
    { min: 384350, max: null, rate: 0.37 },
  ],
} satisfies Record<string, TaxBracket[]>;

export const TAX_DATA_2026: YearTaxData = {
  taxYear: 2026,
  federalStandardDeduction: FEDERAL_STANDARD_DEDUCTION,
  federalBrackets: FEDERAL_BRACKETS,
  // CA figures for 2026 are not yet published — carried forward from 2025.
  // See the file-level source note above.
  caStandardDeduction: TAX_DATA_2025.caStandardDeduction,
  caBrackets: TAX_DATA_2025.caBrackets,
  caMentalHealthTaxThreshold: TAX_DATA_2025.caMentalHealthTaxThreshold,
  caMentalHealthTaxRate: TAX_DATA_2025.caMentalHealthTaxRate,
  caDataIsProvisional: true,
  // SSA: 2026 Social Security wage base (taxable maximum) is $184,500 (same
  // figure independently sourced from the EDD/IRS 2026 payroll tables used
  // in ../../lib/paycheckData.ts's SS_WAGE_BASE).
  ssWageBase: 184_500,
  // IRS Rev. Proc. 2025-32: 2026 Child Tax Credit remains $2,200/child and
  // Credit for Other Dependents remains $500, same $400,000 (MFJ) /
  // $200,000 (other) phase-out thresholds as 2025 (OBBBA fixed these,
  // indexed going forward but unchanged for 2026).
  childTaxCredit: 2200,
  otherDependentCredit: 500,
  ctcPhaseOutThresholdMfj: 400_000,
  ctcPhaseOutThresholdOther: 200_000,
  // IRS Rev. Proc. 2025-32: 2026 student loan interest deduction, $2,500
  // max. Single/HoH phase-out unchanged at $85,000-$100,000; MFJ phase-out
  // rises to $175,000-$205,000. Not available for Married Filing Separately.
  studentLoanInterestMax: 2500,
  studentLoanPhaseOut: {
    singleHoh: { lower: 85_000, upper: 100_000 },
    mfj: { lower: 175_000, upper: 205_000 },
  },
  // IRC §164(b)(7): 2026 SALT cap and phase-down threshold are indexed +1%
  // over 2025 — $40,400 ($20,200 MFS) cap, $505,000 ($252,500 MFS)
  // phase-down threshold, same 30% rate and $10,000/$5,000 floor.
  saltCap: 40_400,
  saltCapMfs: 20_200,
  saltPhaseDownThreshold: 505_000,
  saltPhaseDownThresholdMfs: 252_500,
  saltFloor: 10_000,
  saltFloorMfs: 5_000,
  // Form 2441 / IRC §21, as amended by OBBBA: starting 2026 the maximum
  // Dependent Care Credit rate rises from 35% to 50%. Sources agree on the
  // overall shape (50% at AGI <= $15,000/$30,000 MFJ, a flat 35% plateau
  // from $43,000-$75,000 ($86,000-$150,000 MFJ), floor 20% above
  // $103,000/$206,000) but disagree on the exact intermediate step
  // mechanics, so this is modeled as a smooth piecewise-linear
  // approximation between those anchor points rather than the real
  // (still-unconfirmed) stepped table — flagged via `isRateApproximate`
  // and surfaced in the UI. Revisit once the IRS publishes the final 2026
  // Form 2441 instructions.
  dependentCareCredit: {
    schedule: "smooth",
    expenseCapOnePerson: 3000,
    expenseCapTwoOrMorePersons: 6000,
    maxRatePercent: 50,
    midRatePercent: 35,
    floorRatePercent: 20,
    isRateApproximate: true,
    agiBreakpoints: {
      other: [15_000, 43_000, 75_000, 103_000],
      mfj: [30_000, 86_000, 150_000, 206_000],
    },
  },
  // IRS Rev. Proc. 2025-32: 2026 long-term capital gains / qualified
  // dividends preferential-rate brackets (inflation-indexed from 2025).
  capitalGainsBrackets: {
    single: [
      { min: 0, max: 49_450, rate: 0 },
      { min: 49_450, max: 545_500, rate: 0.15 },
      { min: 545_500, max: null, rate: 0.2 },
    ],
    mfj: [
      { min: 0, max: 98_900, rate: 0 },
      { min: 98_900, max: 613_700, rate: 0.15 },
      { min: 613_700, max: null, rate: 0.2 },
    ],
    hoh: [
      { min: 0, max: 66_200, rate: 0 },
      { min: 66_200, max: 579_600, rate: 0.15 },
      { min: 579_600, max: null, rate: 0.2 },
    ],
    mfs: [
      { min: 0, max: 49_450, rate: 0 },
      { min: 49_450, max: 306_850, rate: 0.15 },
      { min: 306_850, max: null, rate: 0.2 },
    ],
  },
  // IRS 2026 HSA/401(k)/IRA limit announcements: HSA $4,400 self-only /
  // $8,750 family; 401(k)/403(b) elective deferral $24,500 (same figure
  // independently used in ../../lib/paycheckData.ts's
  // FOUR_ZERO_ONE_K_ANNUAL_LIMIT); traditional IRA $7,500. Age-50+/55+
  // catch-up amounts are not modeled.
  hsaLimitSelfOnly: 4_400,
  hsaLimitFamily: 8_750,
  traditional401kLimit: 24_500,
  traditionalIraLimit: 7_500,
};
