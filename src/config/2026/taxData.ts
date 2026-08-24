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
};
