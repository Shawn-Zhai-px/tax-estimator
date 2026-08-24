import { TaxEstimateResult } from "./calculateTax";
import { FILING_STATUS_LABELS } from "@/config";

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

export function exportResultToCsv(result: TaxEstimateResult) {
  const rows: string[] = [];

  rows.push(toRow(["Federal & State Income Tax Estimate (reference only, not tax advice)"]));
  rows.push(toRow(["Tax year", result.taxYear]));
  rows.push("");

  rows.push(toRow(["Section", "Field", "Value"]));
  rows.push(toRow(["Input", "Gross income", result.grossIncome]));
  rows.push(toRow(["Input", "Filing status", FILING_STATUS_LABELS[result.filingStatus]]));
  rows.push(toRow(["Input", "State", result.state]));
  rows.push(toRow(["Input", "Federal deduction type", result.deductionType]));
  rows.push(toRow(["Input", "Federal deduction used", result.deductionUsed]));
  rows.push("");

  rows.push(toRow(["Result", "Federal taxable income", result.federalTaxableIncome]));
  rows.push(toRow(["Result", "Federal tax", result.federalTax.toFixed(2)]));
  rows.push(toRow(["Result", "Federal marginal rate", result.federalMarginalRate]));
  rows.push(toRow(["Result", "Federal effective rate", result.federalEffectiveRate]));
  rows.push(toRow(["Result", "State taxable income", result.stateTaxableIncome]));
  rows.push(toRow(["Result", "State tax", result.stateTax.toFixed(2)]));
  rows.push(toRow(["Result", "State marginal rate", result.stateMarginalRate]));
  rows.push(toRow(["Result", "State effective rate", result.stateEffectiveRate]));
  if (result.caMentalHealthTax > 0) {
    rows.push(toRow(["Result", "incl. CA Mental Health Services Tax", result.caMentalHealthTax.toFixed(2)]));
  }
  rows.push(toRow(["Result", "Total estimated tax", result.totalTax.toFixed(2)]));
  rows.push(toRow(["Result", "Total effective rate", result.totalEffectiveRate]));
  rows.push(toRow(["Result", "Estimated take-home (pre-payroll-tax)", result.estimatedTakeHome.toFixed(2)]));
  rows.push("");

  rows.push(toRow(["Federal bracket breakdown"]));
  rows.push(toRow(["Bracket min", "Bracket max", "Rate", "Taxable amount in bracket", "Tax for bracket"]));
  for (const row of result.federalBracketBreakdown) {
    rows.push(
      toRow([
        row.min,
        row.max === null ? "and up" : row.max,
        row.rate,
        row.taxableAmountInBracket.toFixed(2),
        row.taxForBracket.toFixed(2),
      ])
    );
  }

  if (result.state === "CA" && result.stateBracketBreakdown.length > 0) {
    rows.push("");
    rows.push(toRow(["California bracket breakdown"]));
    rows.push(toRow(["Bracket min", "Bracket max", "Rate", "Taxable amount in bracket", "Tax for bracket"]));
    for (const row of result.stateBracketBreakdown) {
      rows.push(
        toRow([
          row.min,
          row.max === null ? "and up" : row.max,
          row.rate,
          row.taxableAmountInBracket.toFixed(2),
          row.taxForBracket.toFixed(2),
        ])
      );
    }
  }

  rows.push("");
  rows.push(toRow([`Federal Form 1040 line reference (${result.taxYear})`]));
  rows.push(toRow(["Line", "Label", "Amount"]));
  rows.push(toRow(["1a", "Wages (from Form W-2, box 1)", result.grossIncome]));
  rows.push(toRow(["9", "Total income", result.grossIncome]));
  rows.push(toRow(["11", "Adjusted gross income (AGI)", result.grossIncome]));
  rows.push(
    toRow([
      "12",
      `${result.deductionType === "itemized" ? "Itemized" : "Standard"} deduction`,
      result.deductionUsed,
    ])
  );
  rows.push(toRow(["15", "Taxable income", result.federalTaxableIncome.toFixed(2)]));
  rows.push(toRow(["16", "Tax", result.federalTax.toFixed(2)]));
  rows.push(toRow(["24", "Total tax", result.federalTax.toFixed(2)]));

  if (result.state === "CA") {
    const taxBeforeCredits = result.stateTax - result.caMentalHealthTax;
    rows.push("");
    rows.push(
      toRow([
        `California Form 540 line reference (${result.taxYear}${
          result.caDataIsProvisional ? " — CA figures provisional, FTB has not published them yet" : ""
        })`,
      ])
    );
    rows.push(toRow(["Line", "Label", "Amount"]));
    rows.push(toRow(["12", "State wages (from Form W-2, box 16)", result.grossIncome]));
    rows.push(toRow(["13", "Federal adjusted gross income (AGI)", result.grossIncome]));
    rows.push(toRow(["18", "CA standard deduction", result.caDeductionUsed]));
    rows.push(toRow(["19", "CA taxable income", result.stateTaxableIncome.toFixed(2)]));
    rows.push(toRow(["31", "Tax (before credits)", taxBeforeCredits.toFixed(2)]));
    rows.push(toRow(["48", "Tax after credits (no credits modeled)", taxBeforeCredits.toFixed(2)]));
    rows.push(
      toRow(["62", "Behavioral Health Services Tax (formerly Mental Health Services Tax)", result.caMentalHealthTax.toFixed(2)])
    );
    rows.push(toRow(["64", "Total tax", result.stateTax.toFixed(2)]));
  }

  rows.push("");
  rows.push(
    toRow([
      "Disclaimer: Unofficial simplified estimate. Excludes credits, most itemized deductions, payroll taxes, AMT. Not tax advice. Verify against IRS/state guidance or a licensed preparer.",
    ])
  );

  const csvContent = rows.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `tax-estimate-${result.state}-${result.filingStatus}-${result.taxYear}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
