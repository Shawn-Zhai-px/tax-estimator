import { applyBrackets } from "./calculateTax";
import {
  ADDL_MEDICARE_RATE,
  ADDL_MEDICARE_THRESHOLD,
  CAFilingStatus,
  CA_BONUS_FLAT_RATE,
  CA_EST_DED_PER_ALLOWANCE,
  CA_EXEMPTION_CREDIT_PER_ALLOWANCE,
  CA_SDI_RATE,
  CA_WITHHOLDING_BRACKETS,
  CatchUpEligibility,
  FEDERAL_BONUS_HIGH_RATE,
  FEDERAL_BONUS_LOW_RATE,
  FEDERAL_BONUS_SUPPLEMENTAL_THRESHOLD,
  FEDERAL_WITHHOLDING_BRACKETS,
  FederalFilingStatus,
  MEDICARE_RATE,
  PAY_PERIODS_PER_YEAR,
  PayFrequency,
  ROTH_CATCHUP_ANNUAL_LIMIT,
  SS_RATE,
  SS_WAGE_BASE,
  STD_ADDBACK_MFJ,
  STD_ADDBACK_OTHER,
  getCaStandardDeduction,
} from "./paycheckData";

export interface PaycheckInput {
  annualBase: number;
  federalFilingStatus: FederalFilingStatus;
  payFrequency: PayFrequency;
  multipleJobsCheckbox: boolean;
  step3Credits: number;
  step4aOtherIncome: number;
  step4bDeductions: number;
  step4cExtraWithholding: number;
  annualHealthPremium: number;

  fourZeroOneKRate: number;
  fourZeroOneKAnnualLimit: number;
  depCareFsaRate: number;
  depCareFsaAnnualLimit: number;
  catchUpEligibility: CatchUpEligibility;
  rothCatchUpRate: number;

  applyCA: boolean;
  caFilingStatus: CAFilingStatus;
  caRegularAllowances: number;
  caEstDedAllowances: number;
  caMarried2PlusAllowances: boolean;
  caAdditionalWithholding: number;

  includeBonus: boolean;
  bonusAmount: number;
  bonusAfterPaycheckNum: number;
  ytdSupplementalWages: number;
}

export interface ScheduleRow {
  eventNum: number;
  type: "Regular" | "BONUS";
  regPaycheckNum: number | null;
  grossPay: number;
  fourZeroOneK: number;
  rothCatchUp: number;
  depCareFsa: number;
  healthPremium: number;
  ficaWagesThisPeriod: number;
  cumulativeFicaWagesBefore: number;
  socSecTaxable: number;
  socSecWithheld: number;
  medicareWithheld: number;
  addlMedicareWithheld: number;
  fedIncTaxWithheld: number;
  caStateIncTaxWithheld: number;
  caSdiWithheld: number;
  totalWithholding: number;
  netPay: number;
  fedCaTaxableWages: number;
  fedAdjustedAnnualWage: number | null;
  caTaxableIncomeAnnual: number | null;
}

export type ScheduleTotals = Pick<
  ScheduleRow,
  | "grossPay"
  | "fourZeroOneK"
  | "rothCatchUp"
  | "depCareFsa"
  | "healthPremium"
  | "ficaWagesThisPeriod"
  | "socSecTaxable"
  | "socSecWithheld"
  | "medicareWithheld"
  | "addlMedicareWithheld"
  | "fedIncTaxWithheld"
  | "caStateIncTaxWithheld"
  | "caSdiWithheld"
  | "totalWithholding"
  | "netPay"
  | "fedCaTaxableWages"
>;

export interface AnnualScheduleResult {
  periodsPerYear: number;
  rows: ScheduleRow[];
  totals: ScheduleTotals;
}

function clampToZero(n: number): number {
  return n < 0 ? 0 : n;
}

export function computeAnnualSchedule(input: PaycheckInput): AnnualScheduleResult {
  const periodsPerYear = PAY_PERIODS_PER_YEAR[input.payFrequency];
  const rothAnnualLimit = ROTH_CATCHUP_ANNUAL_LIMIT[input.catchUpEligibility];
  const bonusAfterPaycheckNum = Math.min(
    Math.max(0, Math.round(input.bonusAfterPaycheckNum)),
    periodsPerYear
  );

  const federalTable =
    FEDERAL_WITHHOLDING_BRACKETS[input.federalFilingStatus][
      input.multipleJobsCheckbox ? "checkbox" : "standard"
    ];
  const caTable = CA_WITHHOLDING_BRACKETS[input.caFilingStatus];
  const caStandardDeduction = getCaStandardDeduction(
    input.caFilingStatus,
    input.caMarried2PlusAllowances
  );
  const stdAddback =
    input.federalFilingStatus === "mfj" ? STD_ADDBACK_MFJ : STD_ADDBACK_OTHER;

  const eventCount = periodsPerYear + (input.includeBonus ? 1 : 0);

  let cumFica = 0;
  let cum401k = 0;
  let cumRoth = 0;
  let cumFsa = 0;
  let regPaycheckCounter = 0;

  const rows: ScheduleRow[] = [];

  for (let eventNum = 1; eventNum <= eventCount; eventNum++) {
    const isBonus = input.includeBonus && eventNum === bonusAfterPaycheckNum + 1;
    const type: ScheduleRow["type"] = isBonus ? "BONUS" : "Regular";
    let regPaycheckNum: number | null = null;
    if (!isBonus) {
      regPaycheckCounter += 1;
      regPaycheckNum = regPaycheckCounter;
    }

    const grossPay = isBonus ? input.bonusAmount : input.annualBase / periodsPerYear;

    const fourZeroOneK = Math.min(
      grossPay * input.fourZeroOneKRate,
      Math.max(0, input.fourZeroOneKAnnualLimit - cum401k)
    );
    const rothCatchUp = Math.min(
      grossPay * input.rothCatchUpRate,
      Math.max(0, rothAnnualLimit - cumRoth)
    );
    const depCareFsa = isBonus
      ? 0
      : Math.min(
          grossPay * input.depCareFsaRate,
          Math.max(0, input.depCareFsaAnnualLimit - cumFsa)
        );
    const healthPremium = isBonus ? 0 : input.annualHealthPremium / periodsPerYear;

    const ficaWagesThisPeriod = grossPay - depCareFsa - healthPremium;
    const cumulativeFicaWagesBefore = cumFica;

    const socSecTaxable = clampToZero(
      Math.min(ficaWagesThisPeriod, SS_WAGE_BASE - cumulativeFicaWagesBefore)
    );
    const socSecWithheld = socSecTaxable * SS_RATE;
    const medicareWithheld = ficaWagesThisPeriod * MEDICARE_RATE;
    const addlMedicareWithheld =
      (clampToZero(cumulativeFicaWagesBefore + ficaWagesThisPeriod - ADDL_MEDICARE_THRESHOLD) -
        clampToZero(cumulativeFicaWagesBefore - ADDL_MEDICARE_THRESHOLD)) *
      ADDL_MEDICARE_RATE;

    const fedCaTaxableWages = ficaWagesThisPeriod - fourZeroOneK;

    const fedAdjustedAnnualWage = isBonus
      ? null
      : clampToZero(
          fedCaTaxableWages * periodsPerYear +
            input.step4aOtherIncome -
            (input.step4bDeductions + (input.multipleJobsCheckbox ? 0 : stdAddback))
        );
    const caTaxableIncomeAnnual = isBonus
      ? null
      : clampToZero(
          fedCaTaxableWages * periodsPerYear -
            input.caEstDedAllowances * CA_EST_DED_PER_ALLOWANCE -
            caStandardDeduction
        );

    let fedIncTaxWithheld: number;
    if (isBonus) {
      const portion22 = clampToZero(
        Math.min(fedCaTaxableWages, FEDERAL_BONUS_SUPPLEMENTAL_THRESHOLD - input.ytdSupplementalWages)
      );
      const portion37 = fedCaTaxableWages - portion22;
      fedIncTaxWithheld = portion22 * FEDERAL_BONUS_LOW_RATE + portion37 * FEDERAL_BONUS_HIGH_RATE;
    } else {
      const annualTax = applyBrackets(fedAdjustedAnnualWage as number, federalTable).tax;
      fedIncTaxWithheld =
        clampToZero(annualTax / periodsPerYear - input.step3Credits / periodsPerYear) +
        input.step4cExtraWithholding;
    }

    let caStateIncTaxWithheld = 0;
    if (input.applyCA) {
      if (isBonus) {
        caStateIncTaxWithheld = fedCaTaxableWages * CA_BONUS_FLAT_RATE;
      } else {
        const annualCaTax = applyBrackets(caTaxableIncomeAnnual as number, caTable).tax;
        caStateIncTaxWithheld =
          clampToZero(annualCaTax - input.caRegularAllowances * CA_EXEMPTION_CREDIT_PER_ALLOWANCE) /
            periodsPerYear +
          input.caAdditionalWithholding;
      }
    }

    const caSdiWithheld = input.applyCA ? ficaWagesThisPeriod * CA_SDI_RATE : 0;

    const totalWithholding =
      socSecWithheld + medicareWithheld + addlMedicareWithheld + fedIncTaxWithheld + caStateIncTaxWithheld + caSdiWithheld;

    const netPay =
      grossPay -
      fourZeroOneK -
      rothCatchUp -
      depCareFsa -
      healthPremium -
      fedIncTaxWithheld -
      socSecWithheld -
      medicareWithheld -
      addlMedicareWithheld -
      caStateIncTaxWithheld -
      caSdiWithheld;

    rows.push({
      eventNum,
      type,
      regPaycheckNum,
      grossPay,
      fourZeroOneK,
      rothCatchUp,
      depCareFsa,
      healthPremium,
      ficaWagesThisPeriod,
      cumulativeFicaWagesBefore,
      socSecTaxable,
      socSecWithheld,
      medicareWithheld,
      addlMedicareWithheld,
      fedIncTaxWithheld,
      caStateIncTaxWithheld,
      caSdiWithheld,
      totalWithholding,
      netPay,
      fedCaTaxableWages,
      fedAdjustedAnnualWage,
      caTaxableIncomeAnnual,
    });

    cumFica += ficaWagesThisPeriod;
    cum401k += fourZeroOneK;
    cumRoth += rothCatchUp;
    cumFsa += depCareFsa;
  }

  const totals: ScheduleTotals = rows.reduce(
    (acc, row) => ({
      grossPay: acc.grossPay + row.grossPay,
      fourZeroOneK: acc.fourZeroOneK + row.fourZeroOneK,
      rothCatchUp: acc.rothCatchUp + row.rothCatchUp,
      depCareFsa: acc.depCareFsa + row.depCareFsa,
      healthPremium: acc.healthPremium + row.healthPremium,
      ficaWagesThisPeriod: acc.ficaWagesThisPeriod + row.ficaWagesThisPeriod,
      socSecTaxable: acc.socSecTaxable + row.socSecTaxable,
      socSecWithheld: acc.socSecWithheld + row.socSecWithheld,
      medicareWithheld: acc.medicareWithheld + row.medicareWithheld,
      addlMedicareWithheld: acc.addlMedicareWithheld + row.addlMedicareWithheld,
      fedIncTaxWithheld: acc.fedIncTaxWithheld + row.fedIncTaxWithheld,
      caStateIncTaxWithheld: acc.caStateIncTaxWithheld + row.caStateIncTaxWithheld,
      caSdiWithheld: acc.caSdiWithheld + row.caSdiWithheld,
      totalWithholding: acc.totalWithholding + row.totalWithholding,
      netPay: acc.netPay + row.netPay,
      fedCaTaxableWages: acc.fedCaTaxableWages + row.fedCaTaxableWages,
    }),
    {
      grossPay: 0,
      fourZeroOneK: 0,
      rothCatchUp: 0,
      depCareFsa: 0,
      healthPremium: 0,
      ficaWagesThisPeriod: 0,
      socSecTaxable: 0,
      socSecWithheld: 0,
      medicareWithheld: 0,
      addlMedicareWithheld: 0,
      fedIncTaxWithheld: 0,
      caStateIncTaxWithheld: 0,
      caSdiWithheld: 0,
      totalWithholding: 0,
      netPay: 0,
      fedCaTaxableWages: 0,
    }
  );

  return { periodsPerYear, rows, totals };
}
