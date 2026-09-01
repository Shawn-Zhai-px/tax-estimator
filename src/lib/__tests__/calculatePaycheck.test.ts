/**
 * Lightweight self-contained test runner (no test framework dependency,
 * so it can run via `npx tsx` without `npm install`), mirroring the
 * conventions in calculateTax.test.ts.
 * Run with: npm test   (runs this file alongside calculateTax.test.ts)
 */
import { applyBrackets } from "../calculateTax";
import { computeAnnualSchedule, computeBonusAfterPaycheckNum, PaycheckInput } from "../calculatePaycheck";
import {
  ADDL_MEDICARE_RATE,
  ADDL_MEDICARE_THRESHOLD,
  CA_BONUS_FLAT_RATE,
  CA_WITHHOLDING_BRACKETS,
  FEDERAL_BONUS_HIGH_RATE,
  FEDERAL_BONUS_LOW_RATE,
  FEDERAL_WITHHOLDING_BRACKETS,
  FOUR_ZERO_ONE_K_ANNUAL_LIMIT,
  MEDICARE_RATE,
  SS_RATE,
  SS_WAGE_BASE,
  STD_ADDBACK_OTHER,
  getCaStandardDeduction,
} from "../paycheckData";

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
    console.error(`  FAIL  ${label}: expected ${expected.toFixed(2)}, got ${actual.toFixed(2)}`);
  }
}

// Base input with every optional feature zeroed out; individual tests
// override just the fields they're exercising.
const BASE_INPUT: PaycheckInput = {
  annualBase: 130_000,
  federalFilingStatus: "single",
  payFrequency: "biweekly",
  multipleJobsCheckbox: false,
  step3Credits: 0,
  step4aOtherIncome: 0,
  step4bDeductions: 0,
  step4cExtraWithholding: 0,
  annualHealthPremium: 0,

  fourZeroOneKRate: 0,
  fourZeroOneKAnnualLimit: FOUR_ZERO_ONE_K_ANNUAL_LIMIT,
  depCareFsaRate: 0,
  depCareFsaAnnualLimit: 5000,
  catchUpEligibility: "none",
  rothCatchUpRate: 0,

  applyCA: false,
  caFilingStatus: "single",
  caRegularAllowances: 0,
  caEstDedAllowances: 0,
  caMarried2PlusAllowances: false,
  caAdditionalWithholding: 0,

  includeBonus: false,
  bonusAmount: 0,
  bonusAfterPaycheckNum: 0,
  ytdSupplementalWages: 0,
};

console.log("== Regular paycheck: FICA + annualized federal withholding ==");
{
  // $130,000/yr, biweekly (26 periods), single, no deductions, no CA.
  const result = computeAnnualSchedule(BASE_INPUT);
  const grossPay = 130_000 / 26;
  check("gross pay per period", result.rows[0].grossPay, grossPay);

  const ficaWages = grossPay;
  check("SS withheld (uncapped)", result.rows[0].socSecWithheld, ficaWages * SS_RATE);
  check("Medicare withheld", result.rows[0].medicareWithheld, ficaWages * MEDICARE_RATE);
  check("Additional Medicare withheld ($0, well under threshold)", result.rows[0].addlMedicareWithheld, 0);

  const annualWage = ficaWages * 26 - STD_ADDBACK_OTHER;
  const annualTax = applyBrackets(annualWage, FEDERAL_WITHHOLDING_BRACKETS.single.standard).tax;
  check("federal income tax withheld per period", result.rows[0].fedIncTaxWithheld, annualTax / 26);

  const expectedNetPay =
    grossPay - result.rows[0].fedIncTaxWithheld - result.rows[0].socSecWithheld - result.rows[0].medicareWithheld;
  check("net pay", result.rows[0].netPay, expectedNetPay);
}

console.log("\n== Social Security wage base cap, mid-year ==");
{
  // $390,000/yr, weekly (52 periods) -> $7,500/period. Cumulative FICA
  // wages cross the $184,500 SS wage base partway through period 25
  // (24 * 7,500 = 180,000 before it; 187,500 after).
  const input: PaycheckInput = { ...BASE_INPUT, annualBase: 390_000, payFrequency: "weekly" };
  const result = computeAnnualSchedule(input);

  check("period 25: SS taxable is only the remaining wage-base room", result.rows[24].socSecTaxable, 4500);
  check("period 25: SS withheld on the capped amount", result.rows[24].socSecWithheld, 4500 * SS_RATE);
  check("period 26: wage base already exhausted -> $0 SS taxable", result.rows[25].socSecTaxable, 0);
  check("period 26: $0 SS withheld", result.rows[25].socSecWithheld, 0);
  // Medicare has no wage-base cap -> still withheld in full both periods.
  check("period 26: Medicare still withheld in full (no cap)", result.rows[25].medicareWithheld, 7500 * MEDICARE_RATE);
}

console.log("\n== Additional Medicare Tax threshold crossing ==");
{
  // Same $390,000/yr weekly scenario: cumulative wages cross the flat
  // $200,000 Additional Medicare threshold partway through period 27
  // (26 * 7,500 = 195,000 before it; 202,500 after).
  const input: PaycheckInput = { ...BASE_INPUT, annualBase: 390_000, payFrequency: "weekly" };
  const result = computeAnnualSchedule(input);

  check(
    "period 27: Additional Medicare only on the portion crossing $200k",
    result.rows[26].addlMedicareWithheld,
    2500 * ADDL_MEDICARE_RATE
  );
  check(
    "period 28: fully above threshold -> Additional Medicare on the whole period",
    result.rows[27].addlMedicareWithheld,
    7500 * ADDL_MEDICARE_RATE
  );
  if (ADDL_MEDICARE_THRESHOLD === 200_000) {
    passed++;
    console.log("  PASS  Additional Medicare threshold constant is $200,000");
  } else {
    failed++;
    console.error("  FAIL  Additional Medicare threshold constant changed — test assumptions are stale");
  }
}

console.log("\n== 401(k) annual elective-deferral limit ==");
{
  // $130,000/yr biweekly ($5,000/period) at a 20% deferral rate ($1,000/
  // period desired) hits the $24,500 annual limit partway through period
  // 25 (24 * 1,000 = 24,000 before it).
  const input: PaycheckInput = { ...BASE_INPUT, fourZeroOneKRate: 0.2 };
  const result = computeAnnualSchedule(input);

  check("period 25: 401(k) capped at remaining room under the annual limit", result.rows[24].fourZeroOneK, 500);
  check("period 26: annual limit already reached -> $0 further 401(k)", result.rows[25].fourZeroOneK, 0);
}

console.log("\n== California withholding + SDI ==");
{
  // $100,000/yr, monthly (12 periods), CA single, no allowances.
  const input: PaycheckInput = {
    ...BASE_INPUT,
    annualBase: 100_000,
    payFrequency: "monthly",
    applyCA: true,
    caFilingStatus: "single",
  };
  const result = computeAnnualSchedule(input);
  const grossPay = 100_000 / 12;

  check("CA SDI withheld", result.rows[0].caSdiWithheld, grossPay * 0.013);

  const caStandardDeduction = getCaStandardDeduction("single", false);
  const caTaxableAnnual = grossPay * 12 - caStandardDeduction;
  const annualCaTax = applyBrackets(caTaxableAnnual, CA_WITHHOLDING_BRACKETS.single).tax;
  check("CA state income tax withheld per period", result.rows[0].caStateIncTaxWithheld, annualCaTax / 12);
}

{
  // applyCA: false (e.g. the user selected TX on the Paycheck Withholding
  // tab) -> no CA state tax and no CA SDI, regardless of income.
  const input: PaycheckInput = { ...BASE_INPUT, annualBase: 100_000, payFrequency: "monthly", applyCA: false };
  const result = computeAnnualSchedule(input);

  check("applyCA=false: no CA state income tax withheld", result.rows[0].caStateIncTaxWithheld, 0);
  check("applyCA=false: no CA SDI withheld", result.rows[0].caSdiWithheld, 0);
}

console.log("\n== Bonus paycheck: flat supplemental rate, not the annualized bracket method ==");
{
  // $52,000/yr, weekly ($1,000/period), a $50,000 bonus landing as the
  // 11th pay event (after 10 regular paychecks), CA applied, no 401(k) so
  // the bonus math isn't entangled with the elective-deferral cap.
  const input: PaycheckInput = {
    ...BASE_INPUT,
    annualBase: 52_000,
    payFrequency: "weekly",
    applyCA: true,
    caFilingStatus: "single",
    includeBonus: true,
    bonusAmount: 50_000,
    bonusAfterPaycheckNum: 10,
    ytdSupplementalWages: 0,
  };
  const result = computeAnnualSchedule(input);
  const bonusRow = result.rows[10]; // eventNum 11, 0-indexed

  if (bonusRow.type === "BONUS") {
    passed++;
    console.log("  PASS  event 11 is the bonus event");
  } else {
    failed++;
    console.error(`  FAIL  event 11 should be the bonus event, got type ${bonusRow.type}`);
  }
  check("bonus federal withholding uses the flat 22% supplemental rate", bonusRow.fedIncTaxWithheld, 50_000 * FEDERAL_BONUS_LOW_RATE);
  check("bonus CA withholding uses the flat CA supplemental rate", bonusRow.caStateIncTaxWithheld, 50_000 * CA_BONUS_FLAT_RATE);
  // SS/Medicare still apply normally to a bonus (cumulative wages before
  // the bonus: 10 * $1,000 = $10,000, well under both caps/thresholds).
  check("bonus SS withheld normally (uncapped)", bonusRow.socSecWithheld, 50_000 * SS_RATE);
  check("bonus Medicare withheld normally", bonusRow.medicareWithheld, 50_000 * MEDICARE_RATE);

  if (FEDERAL_BONUS_HIGH_RATE === 0.37) {
    passed++;
    console.log("  PASS  federal supplemental high rate constant is 37%");
  } else {
    failed++;
    console.error("  FAIL  federal supplemental high rate constant changed — test assumptions are stale");
  }
}

console.log("\n== computeBonusAfterPaycheckNum ==");
{
  // 59 days between 2026-01-01 and 2026-03-01 (31 days in Jan + 28 in
  // Feb, 2026 is not a leap year); weekly pay period length is 365/52
  // days, so floor(59 / (365/52)) + 1 = 9.
  const n = computeBonusAfterPaycheckNum("2026-01-01", "2026-03-01", 52);
  check("bonus lands after the 9th weekly paycheck", n, 9);
}

{
  // A bonus dated before the first paycheck clamps to 0 rather than going negative.
  const n = computeBonusAfterPaycheckNum("2026-06-01", "2026-01-01", 26);
  check("bonus before the first paycheck clamps to 0", n, 0);
}

{
  // A bonus dated far beyond the last paycheck of the year clamps to periodsPerYear.
  const n = computeBonusAfterPaycheckNum("2026-01-01", "2026-12-31", 12);
  check("bonus after the last paycheck clamps to periodsPerYear", n, 12);
}

console.log("\n== Negative/malformed inputs never fabricate money (all deduction/withholding figures floor at $0) ==");
{
  // A negative 401(k) rate must not add money to net pay relative to a 0% rate.
  const zeroRate = computeAnnualSchedule({ ...BASE_INPUT, fourZeroOneKRate: 0 }).rows[0];
  const negativeRate = computeAnnualSchedule({ ...BASE_INPUT, fourZeroOneKRate: -0.5 }).rows[0];
  check("negative 401(k) rate contributes $0, not negative", negativeRate.fourZeroOneK, 0);
  check("negative 401(k) rate doesn't inflate net pay above the 0% baseline", negativeRate.netPay, zeroRate.netPay);
}

{
  // Same class of bug on the Roth catch-up and Dependent Care FSA rates.
  const zeroRates = computeAnnualSchedule({ ...BASE_INPUT, rothCatchUpRate: 0, depCareFsaRate: 0 }).rows[0];
  const negativeRates = computeAnnualSchedule({ ...BASE_INPUT, rothCatchUpRate: -0.5, depCareFsaRate: -0.5 }).rows[0];
  check("negative Roth catch-up rate contributes $0", negativeRates.rothCatchUp, 0);
  check("negative Dep. Care FSA rate contributes $0", negativeRates.depCareFsa, 0);
  check("negative rates don't inflate net pay above the 0% baseline", negativeRates.netPay, zeroRates.netPay);
}

{
  // A large negative per-paycheck extra withholding must floor withheld tax
  // at $0, not drive it negative (a "tax withheld" line can't be negative).
  const result = computeAnnualSchedule({ ...BASE_INPUT, step4cExtraWithholding: -5000 });
  check("negative federal extra withholding floors fedIncTaxWithheld at $0", result.rows[0].fedIncTaxWithheld, 0);
}

{
  // Same fix, CA additional withholding.
  const result = computeAnnualSchedule({
    ...BASE_INPUT,
    applyCA: true,
    caFilingStatus: "single",
    caAdditionalWithholding: -50_000,
  });
  check("negative CA additional withholding floors caStateIncTaxWithheld at $0", result.rows[0].caStateIncTaxWithheld, 0);
}

{
  // $0 salary plus the (positive, default-sized) health premium used to
  // drive FICA wages negative, which fabricated negative Medicare/SDI
  // withholding. Both must floor at $0 instead.
  const result = computeAnnualSchedule({
    ...BASE_INPUT,
    annualBase: 0,
    annualHealthPremium: 8500,
    applyCA: true,
    caFilingStatus: "single",
  });
  check("gross pay below pre-tax deductions floors FICA wages at $0", result.rows[0].ficaWagesThisPeriod, 0);
  check("...so Medicare withheld floors at $0, not negative", result.rows[0].medicareWithheld, 0);
  check("...so CA SDI withheld floors at $0, not negative", result.rows[0].caSdiWithheld, 0);
}

{
  // A negative health premium must not act as a bonus (it used to increase
  // net pay above the $0-premium baseline via the direct "- healthPremium"
  // term in the net pay formula).
  const zeroPremium = computeAnnualSchedule({ ...BASE_INPUT, annualHealthPremium: 0 }).rows[0];
  const negativePremium = computeAnnualSchedule({ ...BASE_INPUT, annualHealthPremium: -50_000 }).rows[0];
  check("negative health premium doesn't inflate net pay above the $0-premium baseline", negativePremium.netPay, zeroPremium.netPay);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
