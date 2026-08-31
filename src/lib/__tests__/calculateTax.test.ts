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

  const expectedTaxableBeforeQbi = expectedAGI - 15750;
  // QBI deduction (Phase D): 20% of qualified business income (net of the
  // SE-tax deduction), capped at 20% of taxable income before QBI — the
  // income cap binds here since taxable income is well under the business
  // income itself.
  const qbiBase = 100_000 - expectedSeTax / 2;
  const expectedQbiDeduction = Math.min(0.2 * qbiBase, 0.2 * expectedTaxableBeforeQbi);
  const expectedTaxable = expectedTaxableBeforeQbi - expectedQbiDeduction;
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

console.log("\n== Phase B: SALT deduction (cap + phase-down) ==");
{
  // Well under the phase-down threshold: SALT simply capped at $40,000.
  const result = estimateTax({
    grossIncome: 200_000,
    filingStatus: "single",
    state: "TX",
    taxYear: 2025,
    propertyTax: 30_000,
    stateIncomeTaxPaid: 25_000,
  });
  check("SALT capped at $40,000 (2025, no phase-down)", result.saltDeductible, 40_000);
  check("federal itemized total equals capped SALT", result.federalItemizedTotal, 40_000);
  check("federal itemizes when SALT exceeds standard deduction", result.deductionUsed, 40_000);
  if (result.deductionType === "itemized") {
    passed++;
    console.log("  PASS  deductionType is itemized");
  } else {
    failed++;
    console.error(`  FAIL  deductionType should be itemized, got ${result.deductionType}`);
  }
}

{
  // $100,000 over the $500,000 2025 phase-down threshold -> cap reduced by
  // 30% of the excess ($30,000), landing at the $10,000 floor.
  const result = estimateTax({
    grossIncome: 600_000,
    filingStatus: "single",
    state: "TX",
    taxYear: 2025,
    propertyTax: 50_000,
  });
  check("SALT cap phased down to the $10,000 floor", result.saltDeductible, 10_000);
}

{
  // 2026 uses the indexed $40,400 cap / $505,000 threshold.
  const result = estimateTax({
    grossIncome: 200_000,
    filingStatus: "single",
    state: "TX",
    taxYear: 2026,
    propertyTax: 50_000,
  });
  check("2026 SALT cap is $40,400", result.saltDeductible, 40_400);
}

console.log("\n== Phase B: medical expense deduction ==");
{
  // Only the amount over 7.5% of AGI is deductible.
  const result = estimateTax({
    grossIncome: 100_000,
    filingStatus: "single",
    state: "TX",
    taxYear: 2025,
    medicalExpenses: 20_000,
  });
  check("medical deduction excludes 7.5% of AGI", result.medicalDeductible, 20_000 - 0.075 * 100_000);
}

console.log("\n== Phase B: CA itemizes independently of federal ==");
{
  // $10,000 property tax: below the federal standard deduction ($15,750
  // single 2025) so federal still uses standard, but above CA's much
  // smaller standard deduction ($5,706) so CA itemizes with the same
  // input — proving the two jurisdictions' decisions are decoupled.
  const result = estimateTax({
    grossIncome: 100_000,
    filingStatus: "single",
    state: "CA",
    taxYear: 2025,
    propertyTax: 10_000,
  });
  check("federal itemized total", result.federalItemizedTotal, 10_000);
  if (result.deductionType === "standard") {
    passed++;
    console.log("  PASS  federal still uses the standard deduction");
  } else {
    failed++;
    console.error(`  FAIL  federal should use standard, got ${result.deductionType}`);
  }
  check("CA itemized total (property tax, uncapped)", result.caItemizedTotal, 10_000);
  if (result.caDeductionType === "itemized") {
    passed++;
    console.log("  PASS  CA itemizes independently");
  } else {
    failed++;
    console.error(`  FAIL  CA should itemize, got ${result.caDeductionType}`);
  }
  check("CA deduction used", result.caDeductionUsed, 10_000);
}

console.log("\n== Phase B: Dependent Care Credit ==");
{
  // 2025 stepped rate: AGI $20,000 is $5,000 over the $15,000 start,
  // ceil(5000/2000)=3 steps -> 35-3=32%. Two qualifying persons -> $6,000
  // cap (expenses under the cap, so the full $5,000 counts).
  const result = estimateTax({
    grossIncome: 20_000,
    filingStatus: "single",
    state: "TX",
    taxYear: 2025,
    dependentCareExpenses: 5000,
    dependentCareQualifyingPersons: 2,
  });
  check("2025 dependent care credit, stepped rate", result.dependentCareCreditAmount, 5000 * 0.32);
  if (!result.dependentCareCreditIsApproximate) {
    passed++;
    console.log("  PASS  2025 rate is not flagged approximate");
  } else {
    failed++;
    console.error("  FAIL  2025 rate should not be flagged approximate");
  }
}

{
  // One qualifying person caps expenses at $3,000 even though $5,000 was
  // paid; AGI $10,000 <= $15,000 -> max 35% rate.
  const result = estimateTax({
    grossIncome: 10_000,
    filingStatus: "single",
    state: "TX",
    taxYear: 2025,
    dependentCareExpenses: 5000,
    dependentCareQualifyingPersons: 1,
  });
  check("dependent care credit caps expenses at $3,000 (one person)", result.dependentCareCreditAmount, 3000 * 0.35);
}

{
  // 2026: AGI <= $15,000 -> the new 50% max rate (up from 35% in 2025).
  const result = estimateTax({
    grossIncome: 10_000,
    filingStatus: "single",
    state: "TX",
    taxYear: 2026,
    dependentCareExpenses: 3000,
    dependentCareQualifyingPersons: 1,
  });
  check("2026 dependent care credit uses the 50% OBBBA rate", result.dependentCareCreditAmount, 3000 * 0.5);
  if (result.dependentCareCreditIsApproximate) {
    passed++;
    console.log("  PASS  2026 rate is flagged approximate");
  } else {
    failed++;
    console.error("  FAIL  2026 rate should be flagged approximate");
  }
}

{
  // 2026 mid-plateau: AGI $60,000 falls in the flat 35% band ($43k-$75k).
  const result = estimateTax({
    grossIncome: 60_000,
    filingStatus: "single",
    state: "TX",
    taxYear: 2026,
    dependentCareExpenses: 3000,
    dependentCareQualifyingPersons: 1,
  });
  check("2026 dependent care credit mid-plateau (35%)", result.dependentCareCreditAmount, 3000 * 0.35);
}

{
  // 2026 floor: AGI well above $103,000 -> 20% floor rate.
  const result = estimateTax({
    grossIncome: 150_000,
    filingStatus: "single",
    state: "TX",
    taxYear: 2026,
    dependentCareExpenses: 3000,
    dependentCareQualifyingPersons: 1,
  });
  check("2026 dependent care credit floor (20%)", result.dependentCareCreditAmount, 3000 * 0.2);
}

{
  // 2026 linear interpolation: AGI $29,000 is halfway between $15,000 and
  // $43,000 -> rate halfway between 50% and 35% = 42.5%.
  const result = estimateTax({
    grossIncome: 29_000,
    filingStatus: "single",
    state: "TX",
    taxYear: 2026,
    dependentCareExpenses: 3000,
    dependentCareQualifyingPersons: 1,
  });
  check("2026 dependent care credit interpolated rate (42.5%)", result.dependentCareCreditAmount, 3000 * 0.425);
}

console.log("\n== Phase C: capital gains / qualified dividends preferential rates ==");
{
  // All taxable income (including the LTCG) sits within the 2025 single
  // 0% bracket ($0-$48,350) -> zero capital gains tax.
  const result = estimateTax({
    grossIncome: 0,
    filingStatus: "single",
    state: "TX",
    taxYear: 2025,
    qualifiedDividendsAndLTCG: 40_000,
  });
  check("LTCG fully within the 0% bracket", result.capitalGainsTax, 0);
  check("federal tax is $0 (all in 0% bracket)", result.federalTaxBeforeCredits, 0);
}

{
  // $60,000 ordinary wages + $20,000 LTCG, single, 2025: ordinary taxable
  // income is $44,250 (< the $48,350 0%/15% breakpoint); the $20,000 LTCG
  // stacks on top, straddling the breakpoint — $4,100 at 0%, $15,900 at 15%.
  const result = estimateTax({
    grossIncome: 60_000,
    filingStatus: "single",
    state: "TX",
    taxYear: 2025,
    qualifiedDividendsAndLTCG: 20_000,
  });
  const expectedOrdinaryTax = 11_925 * 0.1 + (44_250 - 11_925) * 0.12;
  const expectedCapGainsTax = (64_250 - 48_350) * 0.15;
  check("ordinary + capital gains tax stacks correctly", result.federalTaxBeforeCredits, expectedOrdinaryTax + expectedCapGainsTax);
  check("capital gains tax isolates the stacked slice", result.capitalGainsTax, expectedCapGainsTax);
}

console.log("\n== Phase C: Net Investment Income Tax ==");
{
  // $230,000 AGI, single (threshold $200,000): NIIT applies to the lesser
  // of net investment income ($50,000) or the $30,000 MAGI excess.
  const result = estimateTax({
    grossIncome: 180_000,
    filingStatus: "single",
    state: "TX",
    taxYear: 2025,
    qualifiedDividendsAndLTCG: 50_000,
  });
  check("NIIT capped by MAGI excess over threshold", result.netInvestmentIncomeTax, 0.038 * 30_000);
}

{
  // MFS uses its own $125,000 threshold (half of MFJ's $250,000, not the
  // $200,000 "other statuses" figure).
  const result = estimateTax({
    grossIncome: 100_000,
    filingStatus: "mfs",
    state: "TX",
    taxYear: 2025,
    qualifiedDividendsAndLTCG: 50_000,
  });
  check("NIIT uses the $125,000 MFS threshold", result.netInvestmentIncomeTax, 0.038 * 25_000);
}

console.log("\n== Phase C: HSA / traditional 401(k) / traditional IRA ==");
{
  // HSA capped at the 2025 self-only limit ($4,300) even though more was entered.
  const result = estimateTax({
    grossIncome: 100_000,
    filingStatus: "single",
    state: "TX",
    taxYear: 2025,
    hsaContribution: 6000,
    hsaCoverageType: "self-only",
  });
  check("HSA deduction capped at 2025 self-only limit", result.hsaDeduction, 4300);
}

{
  // 2026 family HSA limit is $8,750.
  const result = estimateTax({
    grossIncome: 100_000,
    filingStatus: "single",
    state: "TX",
    taxYear: 2026,
    hsaContribution: 9000,
    hsaCoverageType: "family",
  });
  check("HSA deduction capped at 2026 family limit", result.hsaDeduction, 8750);
}

{
  // California does not conform to the federal HSA deduction: CA AGI adds
  // it back, so with only an HSA adjustment, CA AGI == total income.
  const result = estimateTax({
    grossIncome: 100_000,
    filingStatus: "single",
    state: "CA",
    taxYear: 2025,
    hsaContribution: 4300,
    hsaCoverageType: "self-only",
  });
  check("federal AGI reduced by HSA", result.federalAGI, 95_700);
  check("CA AGI adds the HSA deduction back", result.caAGI, 100_000);
}

{
  // Traditional 401(k) and IRA contributions are capped at the 2025 limits
  // ($23,500 / $7,000) and reduce AGI for both federal and CA.
  const result = estimateTax({
    grossIncome: 100_000,
    filingStatus: "single",
    state: "CA",
    taxYear: 2025,
    traditional401kContribution: 30_000,
    traditionalIraContribution: 10_000,
  });
  check("401(k) deduction capped at 2025 limit", result.traditional401kDeduction, 23_500);
  check("IRA deduction capped at 2025 limit", result.traditionalIraDeduction, 7000);
  const expectedAgi = 100_000 - 23_500 - 7000;
  check("federal AGI reflects both deductions", result.federalAGI, expectedAgi);
  check("CA AGI also reflects both deductions (CA conforms)", result.caAGI, expectedAgi);
}

console.log("\n== Phase D: QBI deduction ==");
{
  // Below the phase-in threshold: full 20% of QBI (net of the SE-tax
  // deduction adjustment), well under the 20%-of-taxable-income cap.
  const result = estimateTax({
    grossIncome: 80_000,
    selfEmploymentNetIncome: 20_000,
    filingStatus: "single",
    state: "TX",
    taxYear: 2025,
  });
  const seNetEarnings = 20_000 * 0.9235;
  const seTax = seNetEarnings * 0.124 + seNetEarnings * 0.029; // well under the SS wage base, so uncapped
  const qbiBase = 20_000 - seTax / 2;
  check("QBI deduction below threshold: full 20%", result.qbiDeduction, 0.2 * qbiBase);
}

{
  // SSTB, taxable income above the upper threshold (single, 2025:
  // $247,300) -> deduction is $0.
  const result = estimateTax({
    grossIncome: 0,
    selfEmploymentNetIncome: 400_000,
    isSpecifiedServiceTradeOrBusiness: true,
    filingStatus: "single",
    state: "TX",
    taxYear: 2025,
  });
  check("QBI deduction: SSTB above upper threshold is $0", result.qbiDeduction, 0);
}

{
  // Non-SSTB, taxable income above the upper threshold -> limited to the
  // greater of 50% of W-2 wages or 25% of wages + 2.5% of UBIA (UBIA left
  // at 0 here, so the wage-based half of the formula binds).
  const result = estimateTax({
    grossIncome: 0,
    selfEmploymentNetIncome: 400_000,
    qualifiedBusinessW2Wages: 100_000,
    filingStatus: "single",
    state: "TX",
    taxYear: 2025,
  });
  check("QBI deduction: non-SSTB wage-limited above upper threshold", result.qbiDeduction, 50_000);
}

{
  // Non-SSTB, taxable income exactly halfway through the phase-in range
  // (single, 2025: $197,300-$247,300) -> deduction is halfway between the
  // unlimited 20% and the wage-limited amount.
  const seIncome = 50_000;
  const w2Wages = 10_000;
  const seNetEarnings = seIncome * 0.9235;
  const seTax = seNetEarnings * 0.029; // grossIncome below is set high enough to zero out the SS portion
  const seTaxDeduction = seTax / 2;
  const standardDeduction = DATA_2025.federalStandardDeduction.single;
  const lower = DATA_2025.qbi.thresholdLower.single;
  const upper = DATA_2025.qbi.thresholdUpper.single;
  const midpoint = lower + (upper - lower) / 2;
  const grossIncome = midpoint - seIncome + seTaxDeduction + standardDeduction;

  const result = estimateTax({
    grossIncome,
    selfEmploymentNetIncome: seIncome,
    qualifiedBusinessW2Wages: w2Wages,
    filingStatus: "single",
    state: "TX",
    taxYear: 2025,
  });

  const qbiBase = seIncome - seTaxDeduction;
  const tentativeDeduction = 0.2 * qbiBase;
  const wageLimit = 0.5 * w2Wages;
  const expected = tentativeDeduction - 0.5 * Math.max(0, tentativeDeduction - wageLimit);
  check("QBI deduction: halfway through the phase-in range", result.qbiDeduction, expected);
}

{
  // OBBBA minimum deduction ($400, 2026+): a tiny QBI amount that the
  // regular formula would reduce to $0 (taxable income fully absorbed by
  // the standard deduction) still gets at least $400 once QBI >= $1,000.
  const result2026 = estimateTax({
    grossIncome: 0,
    selfEmploymentNetIncome: 1500,
    filingStatus: "single",
    state: "TX",
    taxYear: 2026,
  });
  check("QBI minimum deduction applies in 2026", result2026.qbiDeduction, 400);

  const result2025 = estimateTax({
    grossIncome: 0,
    selfEmploymentNetIncome: 1500,
    filingStatus: "single",
    state: "TX",
    taxYear: 2025,
  });
  check("QBI minimum deduction does not apply in 2025 (pre-OBBBA)", result2025.qbiDeduction, 0);
}

console.log("\n== Phase D: Alternative Minimum Tax ==");
{
  // Modest income, no preference items -> the exemption comfortably covers
  // AMTI and regular tax dominates. Confirms adding AMT doesn't disturb
  // ordinary scenarios (backward compatible).
  const result = estimateTax({
    grossIncome: 75_000,
    filingStatus: "single",
    state: "TX",
    taxYear: 2025,
  });
  check("AMT does not trigger for a modest-income W-2 filer", result.amtAmount, 0);
}

{
  // A large ISO exercise spread (an AMT preference item with no equivalent
  // in regular taxable income) pushes AMTI well above the exemption,
  // triggering AMT even though regular income alone wouldn't.
  const isoSpread = 300_000;
  const result = estimateTax({
    grossIncome: 150_000,
    isoExerciseSpread: isoSpread,
    filingStatus: "single",
    state: "TX",
    taxYear: 2025,
  });
  const amti = result.federalTaxableIncome + result.deductionUsed + isoSpread;
  const availableExemption = Math.max(
    0,
    DATA_2025.amt.exemption.single - Math.max(0, amti - DATA_2025.amt.phaseOutThreshold.single) * DATA_2025.amt.phaseOutRate
  );
  const amtBase = Math.max(0, amti - availableExemption);
  const breakpoint = DATA_2025.amt.rate28Breakpoint.single;
  const tmt = Math.min(amtBase, breakpoint) * 0.26 + Math.max(0, amtBase - breakpoint) * 0.28;
  check("AMT triggers from a large ISO exercise spread", result.amtAmount, tmt - result.federalTaxBeforeCredits);
  if (result.amtAmount > 0) {
    passed++;
    console.log("  PASS  AMT amount is positive");
  } else {
    failed++;
    console.error("  FAIL  AMT amount should be positive");
  }
}

{
  // AMTI above the phase-out threshold (single, 2025: $626,350) reduces
  // the available exemption — exercises the phase-out math specifically.
  const isoSpread = 500_000;
  const result = estimateTax({
    grossIncome: 300_000,
    isoExerciseSpread: isoSpread,
    filingStatus: "single",
    state: "TX",
    taxYear: 2025,
  });
  const amti = result.federalTaxableIncome + result.deductionUsed + isoSpread;
  if (amti > DATA_2025.amt.phaseOutThreshold.single) {
    passed++;
    console.log("  PASS  AMTI clears the phase-out threshold");
  } else {
    failed++;
    console.error("  FAIL  AMTI should clear the phase-out threshold");
  }
  const availableExemption = Math.max(
    0,
    DATA_2025.amt.exemption.single - (amti - DATA_2025.amt.phaseOutThreshold.single) * DATA_2025.amt.phaseOutRate
  );
  const amtBase = Math.max(0, amti - availableExemption);
  const breakpoint = DATA_2025.amt.rate28Breakpoint.single;
  const tmt = Math.min(amtBase, breakpoint) * 0.26 + Math.max(0, amtBase - breakpoint) * 0.28;
  check("AMT amount with exemption phase-out", result.amtAmount, tmt - result.federalTaxBeforeCredits);
}

{
  // Same inputs compared across years: OBBBA lowers the 2026 phase-out
  // threshold ($626,350 -> $500,000) and doubles the phase-out rate
  // (25% -> 50%), so an AMTI that clears the 2026 threshold but not
  // 2025's owes more AMT in 2026 despite 2026's slightly higher exemption.
  const isoSpread = 350_000;
  const shared = {
    grossIncome: 200_000,
    isoExerciseSpread: isoSpread,
    filingStatus: "single" as const,
    state: "TX" as const,
  };
  const result2025 = estimateTax({ ...shared, taxYear: 2025 });
  const result2026 = estimateTax({ ...shared, taxYear: 2026 });

  // AMTI = federalAGI - qbiDeduction + iso + privateActivityBondInterest,
  // independent of deductionUsed (it's added back and then subtracted out
  // again) — so with no QBI here, it's the same in both years.
  const amti = 200_000 + isoSpread;
  if (amti > DATA_2026.amt.phaseOutThreshold.single && amti < DATA_2025.amt.phaseOutThreshold.single) {
    passed++;
    console.log("  PASS  AMTI clears the 2026 OBBBA threshold but not 2025's");
  } else {
    failed++;
    console.error("  FAIL  AMTI should clear the 2026 OBBBA threshold but not 2025's");
  }
  if (result2026.amtAmount > result2025.amtAmount) {
    passed++;
    console.log(`  PASS  2026 OBBBA rules produce more AMT (${result2026.amtAmount.toFixed(2)} > ${result2025.amtAmount.toFixed(2)})`);
  } else {
    failed++;
    console.error(`  FAIL  2026 AMT (${result2026.amtAmount.toFixed(2)}) should exceed 2025 AMT (${result2025.amtAmount.toFixed(2)})`);
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
