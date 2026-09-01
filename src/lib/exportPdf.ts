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
  if (result.isoExerciseSpread > 0 || result.privateActivityBondInterest > 0) {
    line(
      `AMT preference items: ISO exercise spread ${formatCurrency(result.isoExerciseSpread)}, private activity bond interest ${formatCurrency(result.privateActivityBondInterest)}`
    );
  }
  if (result.qualifyingChildren > 0 || result.otherDependents > 0) {
    line(`Dependents: ${result.qualifyingChildren} qualifying child(ren), ${result.otherDependents} other`);
  }
  if (result.federalItemizedTotal > 0) {
    line(`Itemized deduction items: mortgage interest ${formatCurrency(result.mortgageInterest)}, SALT (capped) ${formatCurrency(result.saltDeductible)}, charitable ${formatCurrency(result.charitableDonations)}, medical (over threshold) ${formatCurrency(result.medicalDeductible)}`);
  }
  if (result.dependentCareExpenses > 0) {
    line(`Dependent care: ${formatCurrency(result.dependentCareExpenses)} for ${result.dependentCareQualifyingPersons} qualifying person(s)`);
  }
  if (result.qualifiedDividendsAndLTCG > 0) {
    line(`Long-term capital gains / qualified dividends: ${formatCurrency(result.qualifiedDividendsAndLTCG)}`);
  }
  if (result.shortTermCapitalGains > 0) {
    line(`Short-term capital gains (taxed as ordinary income): ${formatCurrency(result.shortTermCapitalGains)}`);
  }
  if (result.educationExpenses > 0) {
    line(
      `Education expenses: ${formatCurrency(result.educationExpenses)} (${result.educationCreditType === "aotc" ? "American Opportunity Credit" : "Lifetime Learning Credit"})`
    );
  }
  if (result.hsaContribution > 0 || result.traditional401kContribution > 0 || result.traditionalIraContribution > 0) {
    line(
      `Retirement/HSA contributions: 401(k) ${formatCurrency(result.traditional401kContribution)}, IRA ${formatCurrency(result.traditionalIraContribution)}, HSA ${formatCurrency(result.hsaContribution)} (${result.hsaCoverageType})`
    );
  }
  line(`Filing status: ${FILING_STATUS_LABELS[result.filingStatus]}`);
  line(`State: ${result.state}`);
  line(`Federal deduction used (${result.deductionType}): ${formatCurrency(result.deductionUsed)}`);
  spacer(10);

  line("Results", 13, true);
  if (result.selfEmploymentNetIncome > 0 || result.qualifiedDividendsAndLTCG > 0) {
    line(`Total income: ${formatCurrency(result.totalIncome)}`);
    line(`Federal AGI (after adjustments): ${formatCurrency(result.federalAGI)}`);
  }
  if (result.qbiDeduction > 0) {
    line(`  less QBI (Section 199A) deduction: ${formatCurrency(result.qbiDeduction)}`);
  }
  line(`Federal taxable income: ${formatCurrency(result.federalTaxableIncome)}`);
  if (result.capitalGainsTax > 0) {
    line(`  incl. capital gains tax (0%/15%/20%): ${formatCurrency(result.capitalGainsTax)}`);
  }
  if (result.dependentCreditAmount > 0) {
    line(`  less Child Tax Credit / Credit for Other Dependents: ${formatCurrency(result.dependentCreditAmount)}`);
  }
  if (result.dependentCareCreditAmount > 0) {
    line(
      `  less dependent care credit${result.dependentCareCreditIsApproximate ? " (approx. rate)" : ""}: ${formatCurrency(result.dependentCareCreditAmount)}`
    );
  }
  if (result.educationCreditNonrefundable > 0) {
    line(
      `  less ${result.educationCreditType === "aotc" ? "American Opportunity Credit (nonrefundable 60%)" : "Lifetime Learning Credit"}: ${formatCurrency(result.educationCreditNonrefundable)}`
    );
  }
  line(`Federal income tax: ${formatCurrency(result.federalTax)}  (marginal rate ${formatPercent(result.federalMarginalRate)})`);
  if (
    result.selfEmploymentTax > 0 ||
    result.netInvestmentIncomeTax > 0 ||
    result.additionalMedicareTax > 0 ||
    result.amtAmount > 0
  ) {
    if (result.selfEmploymentTax > 0) {
      line(`  plus self-employment tax: ${formatCurrency(result.selfEmploymentTax)}`);
    }
    if (result.netInvestmentIncomeTax > 0) {
      line(`  plus Net Investment Income Tax (3.8%): ${formatCurrency(result.netInvestmentIncomeTax)}`);
    }
    if (result.additionalMedicareTax > 0) {
      line(`  plus Additional Medicare Tax (0.9%): ${formatCurrency(result.additionalMedicareTax)}`);
    }
    if (result.amtAmount > 0) {
      line(`  plus Alternative Minimum Tax (simplified): ${formatCurrency(result.amtAmount)}`);
    }
    line(
      `Federal total tax${result.refundableCreditsTotal > 0 ? " (before refundable credits)" : ""}: ${formatCurrency(result.federalTotalTaxBeforeRefundableCredits)}`,
      11,
      true
    );
  }
  if (result.earnedIncomeCredit > 0) {
    line(`  less Earned Income Tax Credit (refundable): ${formatCurrency(result.earnedIncomeCredit)}`);
  }
  if (result.educationCreditRefundable > 0) {
    line(`  less American Opportunity Credit (refundable 40%): ${formatCurrency(result.educationCreditRefundable)}`);
  }
  if (result.refundableCreditsTotal > 0) {
    line(`Federal total tax (negative = refund): ${formatCurrency(result.federalTotalTax)}`, 11, true);
  }
  if (result.state === "CA") {
    if (result.hsaDeduction > 0) {
      line(`CA AGI (HSA not deductible for CA): ${formatCurrency(result.caAGI)}`);
    }
    line(`CA deduction used (${result.caDeductionType}): ${formatCurrency(result.caDeductionUsed)}`);
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
  if (result.qualifiedDividendsAndLTCG > 0 || result.shortTermCapitalGains > 0) {
    line(
      `7   Capital gain (or loss) (Schedule D: short-term + long-term): ${formatCurrency(result.qualifiedDividendsAndLTCG + result.shortTermCapitalGains)}`,
      9.5
    );
  }
  if (result.selfEmploymentNetIncome > 0) {
    line(`8   Additional income (Schedule 1: self-employment profit): ${formatCurrency(result.selfEmploymentNetIncome)}`, 9.5);
  }
  line(`9   Total income: ${formatCurrency(result.totalIncome)}`, 9.5);
  if (result.totalAdjustments > 0) {
    line(
      `10  Adjustments to income (½ SE tax, student loan interest, HSA/401(k)/IRA): ${formatCurrency(result.totalAdjustments)}`,
      9.5
    );
  }
  line(`11  Adjusted gross income (AGI): ${formatCurrency(result.federalAGI)}`, 9.5);
  line(
    `12  ${result.deductionType === "itemized" ? "Itemized" : "Standard"} deduction: ${formatCurrency(result.deductionUsed)}`,
    9.5
  );
  if (result.qbiDeduction > 0) {
    line(`13  Qualified business income deduction: ${formatCurrency(result.qbiDeduction)}`, 9.5);
  }
  line(`15  Taxable income: ${formatCurrency(result.federalTaxableIncome)}`, 9.5);
  line(`16  Tax: ${formatCurrency(result.federalTaxBeforeCredits)}`, 9.5);
  if (result.amtAmount > 0) {
    line(`17  Schedule 2: Alternative Minimum Tax (simplified): ${formatCurrency(result.amtAmount)}`, 9.5);
  }
  if (result.dependentCreditAmount > 0) {
    line(`19  Child tax credit / credit for other dependents: ${formatCurrency(result.dependentCreditAmount)}`, 9.5);
  }
  if (result.dependentCareCreditAmount > 0 || result.educationCreditNonrefundable > 0) {
    const schedule3Parts = [
      result.dependentCareCreditAmount > 0
        ? `dependent care credit${result.dependentCareCreditIsApproximate ? " (approx.)" : ""}`
        : null,
      result.educationCreditNonrefundable > 0
        ? `nonrefundable education credit (${result.educationCreditType === "aotc" ? "American Opportunity" : "Lifetime Learning"})`
        : null,
    ].filter(Boolean);
    line(
      `20  Schedule 3: ${schedule3Parts.join(" + ")}: ${formatCurrency(result.dependentCareCreditAmount + result.educationCreditNonrefundable)}`,
      9.5
    );
  }
  line(`22  Subtotal after credits: ${formatCurrency(result.federalTax + result.amtAmount)}`, 9.5);
  if (result.selfEmploymentTax > 0 || result.netInvestmentIncomeTax > 0 || result.additionalMedicareTax > 0) {
    const otherTaxParts = [
      result.selfEmploymentTax > 0 ? "self-employment tax" : null,
      result.netInvestmentIncomeTax > 0 ? "Net Investment Income Tax" : null,
      result.additionalMedicareTax > 0 ? "Additional Medicare Tax (Form 8959)" : null,
    ].filter(Boolean);
    line(
      `23  Other taxes (Schedule 2: ${otherTaxParts.join(" + ")}): ${formatCurrency(result.selfEmploymentTax + result.netInvestmentIncomeTax + result.additionalMedicareTax)}`,
      9.5
    );
  }
  line(`24  Total tax: ${formatCurrency(result.federalTotalTaxBeforeRefundableCredits)}`, 9.5);
  if (result.earnedIncomeCredit > 0) {
    line(`27  Earned income credit (EIC): ${formatCurrency(result.earnedIncomeCredit)}`, 9.5);
  }
  if (result.educationCreditRefundable > 0) {
    line(
      `29  American opportunity credit, refundable portion (Form 8863 line 8): ${formatCurrency(result.educationCreditRefundable)}`,
      9.5
    );
  }
  if (result.refundableCreditsTotal > 0) {
    line(
      `33  Total payments (refundable credits only — no withholding modeled): ${formatCurrency(result.refundableCreditsTotal)}`,
      9.5
    );
    line(`34/37 Amount owed, or refunded if negative: ${formatCurrency(result.federalTotalTax)}`, 9.5, true);
  }

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
    if (result.hsaDeduction > 0) {
      line(`16  CA adjustments: addition (HSA deduction not allowed by CA): ${formatCurrency(result.hsaDeduction)}`, 9.5);
      line(`17  California adjusted gross income: ${formatCurrency(result.caAGI)}`, 9.5);
    }
    line(
      `18  CA ${result.caDeductionType === "itemized" ? "itemized" : "standard"} deduction: ${formatCurrency(result.caDeductionUsed)}`,
      9.5
    );
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
    "Disclaimer: This is an unofficial, simplified estimate. Deduction/credit amounts (mortgage interest, SALT, medical, dependent " +
      "care, education, retirement/HSA contributions, capital gains, NIIT, Additional Medicare Tax, EITC, etc.) are computed from what " +
      "you entered, not verified against any documents. QBI, AMT, the EITC, and the education credits use simplified calculations — " +
      "QBI assumes a single business with no multi-business aggregation; AMT doesn't model disqualifying ISO dispositions, AMT NOL " +
      "carryforward, AMT foreign tax credit, or California's separate 7% AMT; the EITC reuses the Child Tax Credit's qualifying-child " +
      "count and approximates disqualified investment income from capital gains/dividends only; education credits assume a single " +
      "student under one credit, already net of scholarships. Excludes payroll taxes withheld on W-2 wages (see the separate paycheck " +
      "withholding tool for that). It is not prepared by a tax professional and is not a substitute for filing software or a licensed " +
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
