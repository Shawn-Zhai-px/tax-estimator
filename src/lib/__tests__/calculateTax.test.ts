/**
 * Lightweight self-contained test runner (no test framework dependency,
 * so it can run via `npx tsx` without `npm install`).
 * Run with: npm test   (== tsx src/lib/__tests__/calculateTax.test.ts)
 */
import { applyBrackets, estimateTax } from "../calculateTax";
import { getTaxDataForYear } from "../../config";

const DATA_2025 = getTaxDataForYear(2025);
const DATA_2026 = getTaxDataForYear(2026);
const FEDERAL_BRACKETS = DATA_2025.federalBrackets;
const CA_BRACKETS = DATA_2025.caBrackets;

let passed = 0;
let failed = 0;

function approxEqual(a: number, b: number, epsilon = 0.01): boolean {
  return Math.abs(a - b) <= epsilon;
}

function check(label: string, actual: number, expected: number) {
  if (approxEqual(actual, expected)) {
    passed++;
    console.log(`  PASS  ${label}: ${actual.toFixed(2)}`);
  } else {
    failed++;
    console.error(
      `  FAIL  ${label}: expected ${expected.toFixed(2)}, got ${actual.toFixed(2)}`
    );
  }
}

console.log("== applyBrackets: bracket-boundary sanity checks ==");
{
  // Single filer, federal, taxable income exactly at the top of the 10% bracket.
  const r = applyBrackets(11925, FEDERAL_BRACKETS.single);
  check("tax at end of 10% bracket (single)", r.tax, 11925 * 0.1);
  check("marginal rate at end of 10% bracket (single)", r.marginalRate, 0.1);
}
{
  // One dollar into the 12% bracket.
  const r = applyBrackets(11926, FEDERAL_BRACKETS.single);
  check(
    "tax just into 12% bracket (single)",
    r.tax,
    11925 * 0.1 + 1 * 0.12
  );
  check("marginal rate just into 12% bracket (single)", r.marginalRate, 0.12);
}
{
  // Very high income should hit the top federal bracket.
  const r = applyBrackets(1_000_000, FEDERAL_BRACKETS.single);
  check("marginal rate at $1M taxable (single)", r.marginalRate, 0.37);
}
{
  // Zero/negative taxable income -> zero tax.
  const r = applyBrackets(0, FEDERAL_BRACKETS.single);
  check("tax at $0 taxable income", r.tax, 0);
}

console.log("\n== estimateTax: federal + CA end-to-end checks ==");
{
  // $75,000 gross, single, CA. Manually cross-check federal + CA.
  const result = estimateTax({
    grossIncome: 75000,
    filingStatus: "single",
    state: "CA",
    taxYear: 2025,
  });
  const expectedFederalTaxable = 75000 - 15750; // 59250
  check("federal taxable income", result.federalTaxableIncome, expectedFederalTaxable);

  // Manual federal bracket math for 59250:
  // 10%: 11925 -> 1192.50
  // 12%: (48475-11925)=36550 -> 4386.00
  // 22%: (59250-48475)=10775 -> 2370.50
  const expectedFederalTax = 11925 * 0.1 + 36550 * 0.12 + 10775 * 0.22;
  check("federal tax", result.federalTax, expectedFederalTax);
  check("federal marginal rate", result.federalMarginalRate, 0.22);

  const expectedCATaxable = 75000 - 5706; // 69294
  check("CA taxable income", result.stateTaxableIncome, expectedCATaxable);

  // Manual CA Schedule X math for 69294:
  // 1%: 11079 -> 110.79
  // 2%: (26264-11079)=15185 -> 303.70
  // 4%: (41452-26264)=15188 -> 607.52
  // 6%: (57542-41452)=16090 -> 965.40
  // 8%: (69294-57542)=11752 -> 940.16
  const expectedCATax =
    11079 * 0.01 + 15185 * 0.02 + 15188 * 0.04 + 16090 * 0.06 + 11752 * 0.08;
  check("CA tax", result.stateTax, expectedCATax);

  check("total tax", result.totalTax, expectedFederalTax + expectedCATax);
  check(
    "take-home pay",
    result.estimatedTakeHome,
    75000 - (expectedFederalTax + expectedCATax)
  );
}

{
  // Texas: no state income tax at any income level.
  const result = estimateTax({
    grossIncome: 500000,
    filingStatus: "mfj",
    state: "TX",
    taxYear: 2025,
  });
  check("TX state tax is always zero", result.stateTax, 0);
}

{
  // CA Mental Health Services Tax kicks in above $1,000,000 of CA taxable income.
  const result = estimateTax({
    grossIncome: 1_100_000,
    filingStatus: "single",
    state: "CA",
    taxYear: 2025,
  });
  const caTaxable = 1_100_000 - 5706; // 1,094,294
  const expectedMHT = (caTaxable - 1_000_000) * 0.01;
  check("CA Mental Health Services Tax amount", result.caMentalHealthTax, expectedMHT);
}

{
  // MFS brackets should be exactly half of MFJ thresholds.
  for (let i = 0; i < FEDERAL_BRACKETS.mfj.length; i++) {
    const mfjMin = FEDERAL_BRACKETS.mfj[i].min;
    const mfsMin = FEDERAL_BRACKETS.mfs[i].min;
    check(`MFS bracket ${i} min == half of MFJ min`, mfsMin, mfjMin / 2);
  }
}

console.log("\n== 2026 config: sanity checks against IRS Rev. Proc. 2025-32 ==");
{
  check("2026 single standard deduction", DATA_2026.federalStandardDeduction.single, 16100);
  check("2026 MFJ standard deduction", DATA_2026.federalStandardDeduction.mfj, 32200);
  check("2026 HoH standard deduction", DATA_2026.federalStandardDeduction.hoh, 24150);

  // $80,000 gross, single, 2026: taxable = 80000 - 16100 = 63900.
  // 10%: 12400 -> 1240.00; 12%: (50400-12400)=38000 -> 4560.00;
  // 22%: (63900-50400)=13500 -> 2970.00
  const result = estimateTax({
    grossIncome: 80000,
    filingStatus: "single",
    state: "TX",
    taxYear: 2026,
  });
  check("2026 federal taxable income", result.federalTaxableIncome, 63900);
  check("2026 federal tax", result.federalTax, 1240 + 4560 + 2970);
  check("2026 federal marginal rate", result.federalMarginalRate, 0.22);

  // MFS should still be exactly half of MFJ at every 2026 threshold.
  for (let i = 0; i < DATA_2026.federalBrackets.mfj.length; i++) {
    const mfjMin = DATA_2026.federalBrackets.mfj[i].min;
    const mfsMin = DATA_2026.federalBrackets.mfs[i].min;
    check(`2026 MFS bracket ${i} min == half of MFJ min`, mfsMin, mfjMin / 2);
  }

  // CA 2026 figures are an explicitly-flagged placeholder pending FTB publication.
  const caResult = estimateTax({
    grossIncome: 80000,
    filingStatus: "single",
    state: "CA",
    taxYear: 2026,
  });
  if (caResult.caDataIsProvisional) {
    passed++;
    console.log("  PASS  2026 CA data is flagged as provisional");
  } else {
    failed++;
    console.error("  FAIL  2026 CA data should be flagged as provisional");
  }
}

{
  // CA Schedule X is shared by single and mfs.
  const sameRef = CA_BRACKETS.single === CA_BRACKETS.mfs;
  if (sameRef) {
    passed++;
    console.log("  PASS  CA single/mfs share Schedule X");
  } else {
    failed++;
    console.error("  FAIL  CA single/mfs should share Schedule X");
  }
}

console.log("\n== Phase A: self-employment tax ==");
{
  // Pure self-employment income, no W-2 wages: SS portion uncapped (well
  // under the 2025 wage base), Medicare portion always uncapped.
  const result = estimateTax({
    grossIncome: 0,
    selfEmploymentNetIncome: 100_000,
    filingStatus: "single",
    state: "TX",
    taxYear: 2025,
  });
  const netEarnings = 100_000 * 0.9235; // 92,350
  const expectedSeTax = netEarnings * 0.124 + netEarnings * 0.029; // 14,129.55
  check("SE tax, no W-2 wages", result.selfEmploymentTax, expectedSeTax);
  check("SE tax deduction is half of SE tax", result.selfEmploymentTaxDeduction, expectedSeTax / 2);

  const expectedAGI = 100_000 - expectedSeTax / 2;
  check("federal AGI after SE tax deduction", result.federalAGI, expectedAGI);

  const expectedTaxable = expectedAGI - 15750;
  const expectedFederalTax =
    11925 * 0.1 + 36550 * 0.12 + (expectedTaxable - 48475) * 0.22;
  check("federal tax on SE income", result.federalTax, expectedFederalTax);
  check(
    "federal total tax includes SE tax",
    result.federalTotalTax,
    expectedFederalTax + expectedSeTax
  );
}

{
  // W-2 wages + self-employment income together: the Social Security
  // portion of SE tax should only apply to the wage-base room left after
  // the W-2 wages (2025 wage base: $176,100).
  const result = estimateTax({
    grossIncome: 170_000,
    selfEmploymentNetIncome: 50_000,
    filingStatus: "single",
    state: "TX",
    taxYear: 2025,
  });
  const netEarnings = 50_000 * 0.9235; // 46,175
  const ssRoom = 176_100 - 170_000; // 6,100
  const expectedSeTax = Math.min(netEarnings, ssRoom) * 0.124 + netEarnings * 0.029;
  check("SE tax caps SS portion at remaining wage base", result.selfEmploymentTax, expectedSeTax);
}

{
  // 2026 self-employment tax should use the 2026 SS wage base ($184,500).
  const result = estimateTax({
    grossIncome: 180_000,
    selfEmploymentNetIncome: 20_000,
    filingStatus: "single",
    state: "TX",
    taxYear: 2026,
  });
  const netEarnings = 20_000 * 0.9235; // 18,470
  const ssRoom = 184_500 - 180_000; // 4,500
  const expectedSeTax = Math.min(netEarnings, ssRoom) * 0.124 + netEarnings * 0.029;
  check("2026 SE tax uses 2026 SS wage base", result.selfEmploymentTax, expectedSeTax);
}

console.log("\n== Phase A: Child Tax Credit / Credit for Other Dependents ==");
{
  // Well under the phase-out threshold: full credit.
  const result = estimateTax({
    grossIncome: 100_000,
    filingStatus: "mfj",
    state: "TX",
    taxYear: 2025,
    qualifyingChildren: 2,
    otherDependents: 1,
  });
  const rawCredit = 2 * 2200 + 1 * 500; // 4,900
  check("full dependent credit under phase-out threshold", result.dependentCreditAmount, rawCredit);

  const expectedFederalTaxBeforeCredit = 23850 * 0.1 + (68500 - 23850) * 0.12; // taxable 68,500
  check("federal tax before credit (MFJ)", result.federalTaxBeforeCredits, expectedFederalTaxBeforeCredit);
  check(
    "federal tax after dependent credit",
    result.federalTax,
    expectedFederalTaxBeforeCredit - rawCredit
  );
}

{
  // $1,000 over the $400,000 MFJ threshold -> $50 reduction (one $1,000 step).
  const result = estimateTax({
    grossIncome: 401_000,
    filingStatus: "mfj",
    state: "TX",
    taxYear: 2025,
    qualifyingChildren: 1,
  });
  check("dependent credit partial phase-out", result.dependentCreditAmount, 2200 - 50);
}

{
  // Comfortably past the threshold -> credit fully phased out (clamped at 0).
  const result = estimateTax({
    grossIncome: 450_000,
    filingStatus: "mfj",
    state: "TX",
    taxYear: 2025,
    qualifyingChildren: 1,
  });
  check("dependent credit fully phased out", result.dependentCreditAmount, 0);
}

console.log("\n== Phase A: student loan interest deduction ==");
{
  // Comfortably under the phase-out range: full deduction, capped at $2,500.
  const result = estimateTax({
    grossIncome: 50_000,
    filingStatus: "single",
    state: "TX",
    taxYear: 2025,
    studentLoanInterestPaid: 3000,
  });
  check("student loan deduction capped at $2,500", result.studentLoanInterestDeduction, 2500);
}

{
  // Halfway through the 2025 single/HoH phase-out range ($85k-$100k) -> 50%.
  const result = estimateTax({
    grossIncome: 92_500,
    filingStatus: "single",
    state: "TX",
    taxYear: 2025,
    studentLoanInterestPaid: 2000,
  });
  check("student loan deduction at 50% phase-out", result.studentLoanInterestDeduction, 1000);
}

{
  // Married Filing Separately is never eligible, regardless of income.
  const result = estimateTax({
    grossIncome: 30_000,
    filingStatus: "mfs",
    state: "TX",
    taxYear: 2025,
    studentLoanInterestPaid: 1000,
  });
  check("student loan deduction is $0 for MFS", result.studentLoanInterestDeduction, 0);
}

{
  // 2026 MFJ phase-out range is $175k-$205k (differs from 2025's $170k-$200k).
  const result = estimateTax({
    grossIncome: 190_000,
    filingStatus: "mfj",
    state: "TX",
    taxYear: 2026,
    studentLoanInterestPaid: 2500,
  });
  // (205,000 - 190,000) / (205,000 - 175,000) = 0.5
  check("2026 MFJ student loan phase-out uses 2026 range", result.studentLoanInterestDeduction, 1250);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
