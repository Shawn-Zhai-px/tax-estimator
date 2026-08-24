import jsPDF from "jspdf";
import { TaxEstimateResult } from "./calculateTax";
import { formatCurrency, formatPercent } from "./format";
import { FILING_STATUS_LABELS } from "@/config";

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
  line(`Wages / gross income: ${formatCurrency(result.grossIncome)}`);
  if (result.selfEmploymentNetIncome > 0) {
    line(`Self-employment net income: ${formatCurrency(result.selfEmploymentNetIncome)}`);
  }
  if (result.qualifyingChildren > 0 || result.otherDependents > 0) {
    line(`Dependents: ${result.qualifyingChildren} qualifying child(ren), ${result.otherDependents} other`);
  }
  line(`Filing status: ${FILING_STATUS_LABELS[result.filingStatus]}`);
  line(`State: ${result.state}`);
  line(`Federal deduction used (${result.deductionType}): ${formatCurrency(result.deductionUsed)}`);
  spacer(10);

  line("Results", 13, true);
  if (result.selfEmploymentNetIncome > 0) {
    line(`Total income: ${formatCurrency(result.totalIncome)}`);
    line(`Federal AGI (after adjustments): ${formatCurrency(result.federalAGI)}`);
  }
  line(`Federal taxable income: ${formatCurrency(result.federalTaxableIncome)}`);
  if (result.dependentCreditAmount > 0) {
    line(`  less Child Tax Credit / Credit for Other Dependents: ${formatCurrency(result.dependentCreditAmount)}`);
  }
  line(`Federal income tax: ${formatCurrency(result.federalTax)}  (marginal rate ${formatPercent(result.federalMarginalRate)})`);
  if (result.selfEmploymentTax > 0) {
    line(`  plus self-employment tax: ${formatCurrency(result.selfEmploymentTax)}`);
    line(`Federal total tax: ${formatCurrency(result.federalTotalTax)}`, 11, true);
  }
  line(`State taxable income: ${formatCurrency(result.stateTaxableIncome)}`);
  line(`State tax: ${formatCurrency(result.stateTax)}  (marginal rate ${formatPercent(result.stateMarginalRate)})`);
  if (result.caMentalHealthTax > 0) {
    line(`  incl. CA Mental Health Services Tax: ${formatCurrency(result.caMentalHealthTax)}`);
  }
  line(`Total estimated tax: ${formatCurrency(result.totalTax)}`, 12, true);
  line(`Overall effective rate: ${formatPercent(result.totalEffectiveRate)}`);
  line(`Estimated take-home (excl. FICA on wages): ${formatCurrency(result.estimatedTakeHome)}`, 12, true);
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

  spacer(14);
  line("Federal Form 1040 line reference", 13, true);
  line(`1a  Wages (from Form W-2, box 1): ${formatCurrency(result.grossIncome)}`, 9.5);
  if (result.selfEmploymentNetIncome > 0) {
    line(`8   Additional income (Schedule 1: self-employment profit): ${formatCurrency(result.selfEmploymentNetIncome)}`, 9.5);
  }
  line(`9   Total income: ${formatCurrency(result.totalIncome)}`, 9.5);
  if (result.totalAdjustments > 0) {
    line(`10  Adjustments to income (½ SE tax + student loan interest): ${formatCurrency(result.totalAdjustments)}`, 9.5);
  }
  line(`11  Adjusted gross income (AGI): ${formatCurrency(result.federalAGI)}`, 9.5);
  line(
    `12  ${result.deductionType === "itemized" ? "Itemized" : "Standard"} deduction: ${formatCurrency(result.deductionUsed)}`,
    9.5
  );
  line(`15  Taxable income: ${formatCurrency(result.federalTaxableIncome)}`, 9.5);
  line(`16  Tax: ${formatCurrency(result.federalTaxBeforeCredits)}`, 9.5);
  if (result.dependentCreditAmount > 0) {
    line(`19  Child tax credit / credit for other dependents: ${formatCurrency(result.dependentCreditAmount)}`, 9.5);
  }
  line(`22  Subtotal after credits: ${formatCurrency(result.federalTax)}`, 9.5);
  if (result.selfEmploymentTax > 0) {
    line(`23  Other taxes (Schedule 2: self-employment tax): ${formatCurrency(result.selfEmploymentTax)}`, 9.5);
  }
  line(`24  Total tax: ${formatCurrency(result.federalTotalTax)}`, 9.5);

  if (result.state === "CA") {
    const taxBeforeCredits = result.stateTax - result.caMentalHealthTax;
    spacer(10);
    line(
      `California Form 540 line reference${result.caDataIsProvisional ? " (CA figures provisional — FTB hasn't published them yet)" : ""}`,
      13,
      true
    );
    line(`12  State wages (from Form W-2, box 16): ${formatCurrency(result.grossIncome)}`, 9.5);
    line(`13  Federal adjusted gross income (AGI): ${formatCurrency(result.federalAGI)}`, 9.5);
    line(`18  CA standard deduction: ${formatCurrency(result.caDeductionUsed)}`, 9.5);
    line(`19  CA taxable income: ${formatCurrency(result.stateTaxableIncome)}`, 9.5);
    line(`31  Tax (before credits): ${formatCurrency(taxBeforeCredits)}`, 9.5);
    line(`48  Tax after credits (no credits modeled): ${formatCurrency(taxBeforeCredits)}`, 9.5);
    line(`62  Behavioral Health Services Tax: ${formatCurrency(result.caMentalHealthTax)}`, 9.5);
    line(`64  Total tax: ${formatCurrency(result.stateTax)}`, 9.5);
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
