import jsPDF from "jspdf";
import { TaxEstimateResult } from "./calculateTax";
import { formatCurrency, formatPercent } from "./format";
import { FILING_STATUS_LABELS } from "./taxData";

export function exportResultToPdf(result: TaxEstimateResult) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const marginX = 48;
  let y = 56;

  const line = (text: string, size = 11, bold = false, color = "#111827") => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(color);
    doc.text(text, marginX, y);
    y += size * 1.5;
  };

  const spacer = (h = 8) => {
    y += h;
  };

  line("Federal & State Income Tax Estimate", 18, true);
  line(`Reference only — not tax advice — Tax year ${result.taxYear}`, 10, false, "#B45309");
  spacer(10);

  line("Inputs", 13, true);
  line(`Gross income: ${formatCurrency(result.grossIncome)}`);
  line(`Filing status: ${FILING_STATUS_LABELS[result.filingStatus]}`);
  line(`State: ${result.state}`);
  line(`Federal deduction used (${result.deductionType}): ${formatCurrency(result.deductionUsed)}`);
  spacer(10);

  line("Results", 13, true);
  line(`Federal taxable income: ${formatCurrency(result.federalTaxableIncome)}`);
  line(`Federal tax: ${formatCurrency(result.federalTax)}  (marginal rate ${formatPercent(result.federalMarginalRate)})`);
  line(`State taxable income: ${formatCurrency(result.stateTaxableIncome)}`);
  line(`State tax: ${formatCurrency(result.stateTax)}  (marginal rate ${formatPercent(result.stateMarginalRate)})`);
  if (result.caMentalHealthTax > 0) {
    line(`  incl. CA Mental Health Services Tax: ${formatCurrency(result.caMentalHealthTax)}`);
  }
  line(`Total estimated tax: ${formatCurrency(result.totalTax)}`, 12, true);
  line(`Overall effective rate: ${formatPercent(result.totalEffectiveRate)}`);
  line(`Estimated take-home (before payroll taxes): ${formatCurrency(result.estimatedTakeHome)}`, 12, true);
  spacer(14);

  line("Federal bracket breakdown", 13, true);
  for (const row of result.federalBracketBreakdown) {
    const rangeLabel = `${formatCurrency(row.min)} - ${row.max === null ? "and up" : formatCurrency(row.max)}`;
    line(
      `${rangeLabel}  @ ${formatPercent(row.rate)}  ->  taxable ${formatCurrency(row.taxableAmountInBracket)}, tax ${formatCurrency(row.taxForBracket)}`,
      9.5
    );
  }

  if (result.state === "CA" && result.stateBracketBreakdown.length > 0) {
    spacer(10);
    line("California bracket breakdown", 13, true);
    for (const row of result.stateBracketBreakdown) {
      const rangeLabel = `${formatCurrency(row.min)} - ${row.max === null ? "and up" : formatCurrency(row.max)}`;
      line(
        `${rangeLabel}  @ ${formatPercent(row.rate)}  ->  taxable ${formatCurrency(row.taxableAmountInBracket)}, tax ${formatCurrency(row.taxForBracket)}`,
        9.5
      );
    }
  }

  spacer(16);
  doc.setDrawColor("#F59E0B");
  doc.setFillColor("#FFFBEB");
  const disclaimerY = y;
  const disclaimerText = doc.splitTextToSize(
    "Disclaimer: This is an unofficial, simplified estimate based on standard deductions and published federal/CA tax brackets. " +
      "It excludes credits, most itemized deductions, payroll taxes (Social Security/Medicare/CA SDI), AMT, and other factors that " +
      "affect an actual tax bill. It is not prepared by a tax professional and is not a substitute for filing software or a licensed " +
      "CPA / tax preparer. Verify all figures against current IRS and state guidance before relying on them.",
    500
  );
  doc.rect(marginX - 8, disclaimerY - 12, 512, disclaimerText.length * 12 + 16, "FD");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor("#92400E");
  doc.text(disclaimerText, marginX, disclaimerY);

  const filenameSafeStatus = result.filingStatus;
  doc.save(`tax-estimate-${result.state}-${filenameSafeStatus}-${result.taxYear}.pdf`);
}
