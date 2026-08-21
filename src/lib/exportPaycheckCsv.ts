import { AnnualScheduleResult } from "./calculatePaycheck";
import { PAYCHECK_TAX_YEAR, PayFrequency } from "./paycheckData";

function csvEscape(value: string | number): string {
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toRow(values: (string | number)[]): string {
  return values.map(csvEscape).join(",");
}

const HEADER = [
  "Event #",
  "Type",
  "Reg. Paycheck #",
  "Gross Pay",
  "401(k)",
  "Roth 401(k) Catch-Up",
  "Dep. Care FSA",
  "Health Premium",
  "FICA Wages this period",
  "Cumulative FICA Wages (before)",
  "Soc. Sec. Taxable",
  "Soc. Sec. Withheld",
  "Medicare Withheld",
  "Addl. Medicare Withheld",
  "Federal Inc. Tax Withheld",
  "CA State Inc. Tax Withheld",
  "CA SDI Withheld",
  "Total Withholding",
  "Net Pay",
  "Fed/CA Taxable Wages",
  "Fed Adjusted Annual Wage",
  "CA Taxable Income (annual)",
];

export function exportScheduleToCsv(result: AnnualScheduleResult, payFrequency: PayFrequency) {
  const rows: string[] = [];

  rows.push(toRow([`Paycheck Withholding Schedule (${PAYCHECK_TAX_YEAR}, reference only, not tax advice)`]));
  rows.push(toRow(["Pay periods per year", result.periodsPerYear]));
  rows.push("");
  rows.push(toRow(HEADER));

  for (const row of result.rows) {
    rows.push(
      toRow([
        row.eventNum,
        row.type,
        row.regPaycheckNum ?? "",
        row.grossPay.toFixed(2),
        row.fourZeroOneK.toFixed(2),
        row.rothCatchUp.toFixed(2),
        row.depCareFsa.toFixed(2),
        row.healthPremium.toFixed(2),
        row.ficaWagesThisPeriod.toFixed(2),
        row.cumulativeFicaWagesBefore.toFixed(2),
        row.socSecTaxable.toFixed(2),
        row.socSecWithheld.toFixed(2),
        row.medicareWithheld.toFixed(2),
        row.addlMedicareWithheld.toFixed(2),
        row.fedIncTaxWithheld.toFixed(2),
        row.caStateIncTaxWithheld.toFixed(2),
        row.caSdiWithheld.toFixed(2),
        row.totalWithholding.toFixed(2),
        row.netPay.toFixed(2),
        row.fedCaTaxableWages.toFixed(2),
        row.fedAdjustedAnnualWage === null ? "N/A" : row.fedAdjustedAnnualWage.toFixed(2),
        row.caTaxableIncomeAnnual === null ? "N/A" : row.caTaxableIncomeAnnual.toFixed(2),
      ])
    );
  }

  const t = result.totals;
  rows.push(
    toRow([
      "",
      "ANNUAL TOTAL",
      "",
      t.grossPay.toFixed(2),
      t.fourZeroOneK.toFixed(2),
      t.rothCatchUp.toFixed(2),
      t.depCareFsa.toFixed(2),
      t.healthPremium.toFixed(2),
      t.ficaWagesThisPeriod.toFixed(2),
      "",
      t.socSecTaxable.toFixed(2),
      t.socSecWithheld.toFixed(2),
      t.medicareWithheld.toFixed(2),
      t.addlMedicareWithheld.toFixed(2),
      t.fedIncTaxWithheld.toFixed(2),
      t.caStateIncTaxWithheld.toFixed(2),
      t.caSdiWithheld.toFixed(2),
      t.totalWithholding.toFixed(2),
      t.netPay.toFixed(2),
      t.fedCaTaxableWages.toFixed(2),
      "",
      "",
    ])
  );

  rows.push("");
  rows.push(
    toRow([
      "Disclaimer: Unofficial simplified paycheck withholding estimate. Assumes level pay all year and a single employer. Not tax or payroll advice. Verify against irs.gov, edd.ca.gov, or your payroll provider.",
    ])
  );

  const csvContent = rows.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `paycheck-withholding-schedule-${payFrequency}-${PAYCHECK_TAX_YEAR}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
