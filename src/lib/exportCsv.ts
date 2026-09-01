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
  rows.push(toRow(["Input", "Wages / gross income", result.grossIncome]));
  rows.push(toRow(["Input", "Self-employment net income", result.selfEmploymentNetIncome]));
  rows.push(toRow(["Input", "Specified Service Trade or Business (SSTB)", result.isSpecifiedServiceTradeOrBusiness ? "Yes" : "No"]));
  rows.push(toRow(["Input", "Business W-2 wages (for QBI)", result.qualifiedBusinessW2Wages]));
  rows.push(toRow(["Input", "Business property basis / UBIA (for QBI)", result.qualifiedBusinessUbia]));
  rows.push(toRow(["Input", "Qualifying children", result.qualifyingChildren]));
  rows.push(toRow(["Input", "Other dependents", result.otherDependents]));
  rows.push(toRow(["Input", "Mortgage interest", result.mortgageInterest]));
  rows.push(toRow(["Input", "Property tax", result.propertyTax]));
  rows.push(toRow(["Input", "State income tax paid", result.stateIncomeTaxPaid]));
  rows.push(toRow(["Input", "Charitable donations", result.charitableDonations]));
  rows.push(toRow(["Input", "Medical expenses", result.medicalExpenses]));
  rows.push(toRow(["Input", "Dependent care expenses", result.dependentCareExpenses]));
  rows.push(toRow(["Input", "Dependent care qualifying persons", result.dependentCareQualifyingPersons]));
  rows.push(toRow(["Input", "Long-term capital gains / qualified dividends", result.qualifiedDividendsAndLTCG]));
  rows.push(toRow(["Input", "Short-term capital gains (taxed as ordinary income)", result.shortTermCapitalGains]));
  rows.push(toRow(["Input", "Qualified education expenses", result.educationExpenses]));
  rows.push(
    toRow([
      "Input",
      "Education credit claimed",
      result.educationCreditType === "aotc" ? "American Opportunity Credit" : "Lifetime Learning Credit",
    ])
  );
  rows.push(toRow(["Input", "HSA contribution", result.hsaContribution]));
  rows.push(toRow(["Input", "HSA coverage type", result.hsaCoverageType]));
  rows.push(toRow(["Input", "Traditional 401(k)/403(b) contribution", result.traditional401kContribution]));
  rows.push(toRow(["Input", "Traditional IRA contribution", result.traditionalIraContribution]));
  rows.push(toRow(["Input", "ISO exercise spread (AMT preference item)", result.isoExerciseSpread]));
  rows.push(toRow(["Input", "Private activity bond interest (AMT preference item)", result.privateActivityBondInterest]));
  rows.push(toRow(["Input", "Filing status", FILING_STATUS_LABELS[result.filingStatus]]));
  rows.push(toRow(["Input", "State", result.state]));
  rows.push(toRow(["Input", "Federal deduction type", result.deductionType]));
  rows.push(toRow(["Input", "Federal deduction used", result.deductionUsed]));
  rows.push("");

  rows.push(toRow(["Result", "Total income", result.totalIncome.toFixed(2)]));
  if (result.totalAdjustments > 0) {
    rows.push(toRow(["Result", "Adjustments to income", result.totalAdjustments.toFixed(2)]));
  }
  if (result.federalItemizedTotal > 0) {
    rows.push(toRow(["Result", "Federal itemized total", result.federalItemizedTotal.toFixed(2)]));
  }
  rows.push(toRow(["Result", "Federal AGI", result.federalAGI.toFixed(2)]));
  if (result.hsaDeduction > 0) {
    rows.push(toRow(["Result", "CA AGI (HSA not deductible for CA)", result.caAGI.toFixed(2)]));
  }
  if (result.qbiDeduction > 0) {
    rows.push(toRow(["Result", "QBI (Section 199A) deduction", result.qbiDeduction.toFixed(2)]));
  }
  rows.push(toRow(["Result", "Federal taxable income", result.federalTaxableIncome]));
  if (result.capitalGainsTax > 0) {
    rows.push(toRow(["Result", "Capital gains tax (0%/15%/20%)", result.capitalGainsTax.toFixed(2)]));
  }
  rows.push(toRow(["Result", "Federal tax (before credits)", result.federalTaxBeforeCredits.toFixed(2)]));
  if (result.dependentCreditAmount > 0) {
    rows.push(toRow(["Result", "Child Tax Credit / Credit for Other Dependents", result.dependentCreditAmount.toFixed(2)]));
  }
  if (result.dependentCareCreditAmount > 0) {
    rows.push(
      toRow([
        "Result",
        `Dependent care credit${result.dependentCareCreditIsApproximate ? " (approximate rate schedule)" : ""}`,
        result.dependentCareCreditAmount.toFixed(2),
      ])
    );
  }
  if (result.educationCreditNonrefundable > 0) {
    rows.push(
      toRow([
        "Result",
        result.educationCreditType === "aotc"
          ? "American Opportunity Credit (nonrefundable 60%)"
          : "Lifetime Learning Credit (nonrefundable)",
        result.educationCreditNonrefundable.toFixed(2),
      ])
    );
  }
  rows.push(toRow(["Result", "Federal income tax (after credits)", result.federalTax.toFixed(2)]));
  if (result.selfEmploymentTax > 0) {
    rows.push(toRow(["Result", "Self-employment tax", result.selfEmploymentTax.toFixed(2)]));
  }
  if (result.netInvestmentIncomeTax > 0) {
    rows.push(toRow(["Result", "Net Investment Income Tax (3.8%)", result.netInvestmentIncomeTax.toFixed(2)]));
  }
  if (result.additionalMedicareTax > 0) {
    rows.push(toRow(["Result", "Additional Medicare Tax (0.9%)", result.additionalMedicareTax.toFixed(2)]));
  }
  if (result.amtAmount > 0) {
    rows.push(toRow(["Result", "Alternative Minimum Tax (simplified)", result.amtAmount.toFixed(2)]));
  }
  if (result.refundableCreditsTotal > 0) {
    rows.push(
      toRow(["Result", "Federal total tax (before refundable credits)", result.federalTotalTaxBeforeRefundableCredits.toFixed(2)])
    );
  }
  if (result.earnedIncomeCredit > 0) {
    rows.push(toRow(["Result", "Earned Income Tax Credit (refundable)", result.earnedIncomeCredit.toFixed(2)]));
  }
  if (result.educationCreditRefundable > 0) {
    rows.push(
      toRow(["Result", "American Opportunity Credit (refundable 40%)", result.educationCreditRefundable.toFixed(2)])
    );
  }
  rows.push(toRow(["Result", "Federal total tax (negative = refund)", result.federalTotalTax.toFixed(2)]));
  rows.push(toRow(["Result", "Federal marginal rate", result.federalMarginalRate]));
  rows.push(toRow(["Result", "Federal effective rate", result.federalEffectiveRate]));
  if (result.state === "CA" && result.caItemizedTotal > 0) {
    rows.push(toRow(["Result", "CA itemized total", result.caItemizedTotal.toFixed(2)]));
  }
  if (result.state === "CA") {
    rows.push(toRow(["Result", "CA deduction type", result.caDeductionType]));
  }
  rows.push(toRow(["Result", "State taxable income", result.stateTaxableIncome]));
  rows.push(toRow(["Result", "State tax", result.stateTax.toFixed(2)]));
  rows.push(toRow(["Result", "State marginal rate", result.stateMarginalRate]));
  rows.push(toRow(["Result", "State effective rate", result.stateEffectiveRate]));
  if (result.caMentalHealthTax > 0) {
    rows.push(toRow(["Result", "incl. CA Mental Health Services Tax", result.caMentalHealthTax.toFixed(2)]));
  }
  rows.push(toRow(["Result", "Total estimated tax", result.totalTax.toFixed(2)]));
  rows.push(toRow(["Result", "Total effective rate", result.totalEffectiveRate]));
  rows.push(toRow(["Result", "Estimated take-home (excl. FICA on wages)", result.estimatedTakeHome.toFixed(2)]));
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
  if (result.qualifiedDividendsAndLTCG > 0) {
    rows.push(toRow(["7", "Capital gain (or loss)", result.qualifiedDividendsAndLTCG]));
  }
  if (result.selfEmploymentNetIncome > 0) {
    rows.push(toRow(["8", "Additional income (Schedule 1: self-employment profit)", result.selfEmploymentNetIncome]));
  }
  rows.push(toRow(["9", "Total income", result.totalIncome.toFixed(2)]));
  if (result.totalAdjustments > 0) {
    rows.push(
      toRow([
        "10",
        "Adjustments to income (½ SE tax, student loan interest, HSA/401(k)/IRA)",
        result.totalAdjustments.toFixed(2),
      ])
    );
  }
  rows.push(toRow(["11", "Adjusted gross income (AGI)", result.federalAGI.toFixed(2)]));
  rows.push(
    toRow([
      "12",
      `${result.deductionType === "itemized" ? "Itemized" : "Standard"} deduction`,
      result.deductionUsed,
    ])
  );
  if (result.qbiDeduction > 0) {
    rows.push(toRow(["13", "Qualified business income deduction", result.qbiDeduction.toFixed(2)]));
  }
  rows.push(toRow(["15", "Taxable income", result.federalTaxableIncome.toFixed(2)]));
  rows.push(toRow(["16", "Tax", result.federalTaxBeforeCredits.toFixed(2)]));
  if (result.amtAmount > 0) {
    rows.push(toRow(["17", "Schedule 2: Alternative Minimum Tax (simplified)", result.amtAmount.toFixed(2)]));
  }
  if (result.dependentCreditAmount > 0) {
    rows.push(toRow(["19", "Child tax credit / credit for other dependents", result.dependentCreditAmount.toFixed(2)]));
  }
  if (result.dependentCareCreditAmount > 0) {
    rows.push(
      toRow([
        "20",
        `Schedule 3: dependent care credit${result.dependentCareCreditIsApproximate ? " (approximate)" : ""}`,
        result.dependentCareCreditAmount.toFixed(2),
      ])
    );
  }
  rows.push(toRow(["22", "Subtotal after credits", (result.federalTax + result.amtAmount).toFixed(2)]));
  if (result.selfEmploymentTax > 0 || result.netInvestmentIncomeTax > 0) {
    const otherTaxParts = [
      result.selfEmploymentTax > 0 ? "self-employment tax" : null,
      result.netInvestmentIncomeTax > 0 ? "Net Investment Income Tax" : null,
    ].filter(Boolean);
    rows.push(
      toRow([
        "23",
        `Other taxes (Schedule 2: ${otherTaxParts.join(" + ")})`,
        (result.selfEmploymentTax + result.netInvestmentIncomeTax).toFixed(2),
      ])
    );
  }
  rows.push(toRow(["24", "Total tax", result.federalTotalTax.toFixed(2)]));

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
    rows.push(toRow(["13", "Federal adjusted gross income (AGI)", result.federalAGI.toFixed(2)]));
    if (result.hsaDeduction > 0) {
      rows.push(
        toRow(["16", "California adjustments: addition (HSA deduction not allowed by CA)", result.hsaDeduction.toFixed(2)])
      );
      rows.push(toRow(["17", "California adjusted gross income", result.caAGI.toFixed(2)]));
    }
    rows.push(
      toRow([
        "18",
        `CA ${result.caDeductionType === "itemized" ? "itemized" : "standard"} deduction`,
        result.caDeductionUsed,
      ])
    );
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
      "Disclaimer: Unofficial simplified estimate. Excludes payroll taxes withheld on W-2 wages (see the separate paycheck withholding tool for that). QBI, AMT, the EITC, and the education credits (when they apply) use simplified calculations — QBI assumes a single business (no multi-business aggregation); AMT doesn't model disqualifying ISO dispositions, AMT NOL carryforward, AMT foreign tax credit, or California's separate 7% AMT; the EITC reuses the Child Tax Credit's qualifying-child count and approximates disqualified investment income from capital gains/dividends only; education credits assume a single student under one credit. Deduction/credit amounts (mortgage interest, SALT, medical, dependent care, education, retirement/HSA contributions, capital gains, NIIT, Additional Medicare Tax, etc.) are computed from what you entered, not verified against any documents. Not tax advice. Verify against IRS/state guidance or a licensed preparer.",
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
