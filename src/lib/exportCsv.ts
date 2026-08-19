import { TaxEstimateResult } from "./calculateTax";
import { FILING_STATUS_LABELS } from "./taxData";

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
