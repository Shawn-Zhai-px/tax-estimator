"use client";

import { TaxEstimateResult } from "@/lib/calculateTax";
import { formatCurrency } from "@/lib/format";

/**
 * Simplified Federal Form 1040 line-number reference. Maps our computed
 * estimate onto the real 1040 lines (2025 revision; stable since the 2018
 * redesign) so users can see where each number would land on the actual
 * form. This is a numbers-only reference table, not a filled-in form —
 * no name/SSN/address or any other identifying info is shown or collected.
 */
export default function Form1040Summary({ result }: { result: TaxEstimateResult }) {
  const rows: { line: string; label: string; value: number }[] = [
    { line: "1a", label: "Wages (from Form W-2, box 1)", value: result.grossIncome },
  ];

  if (result.qualifiedDividendsAndLTCG > 0 || result.shortTermCapitalGains > 0) {
    rows.push({
      line: "7",
      label: "Capital gain (or loss) (Schedule D: short-term + long-term)",
      value: result.qualifiedDividendsAndLTCG + result.shortTermCapitalGains,
    });
  }

  if (result.selfEmploymentNetIncome > 0) {
    rows.push({
      line: "8",
      label: "Additional income (Schedule 1: self-employment profit)",
      value: result.selfEmploymentNetIncome,
    });
  }

  rows.push({ line: "9", label: "Total income", value: result.totalIncome });

  if (result.totalAdjustments > 0) {
    rows.push({
      line: "10",
      label: "Adjustments to income (½ SE tax, student loan interest, HSA/401(k)/IRA)",
      value: result.totalAdjustments,
    });
  }

  rows.push(
    { line: "11", label: "Adjusted gross income (AGI)", value: result.federalAGI },
    {
      line: "12",
      label: `${result.deductionType === "itemized" ? "Itemized" : "Standard"} deduction`,
      value: result.deductionUsed,
    }
  );

  if (result.qbiDeduction > 0) {
    rows.push({
      line: "13",
      label: "Qualified business income deduction",
      value: result.qbiDeduction,
    });
  }

  rows.push(
    { line: "15", label: "Taxable income", value: result.federalTaxableIncome },
    { line: "16", label: "Tax", value: result.federalTaxBeforeCredits }
  );

  if (result.amtAmount > 0) {
    rows.push({
      line: "17",
      label: "Schedule 2: Alternative Minimum Tax (simplified)",
      value: result.amtAmount,
    });
  }

  if (result.dependentCreditAmount > 0) {
    rows.push({
      line: "19",
      label: "Child tax credit / credit for other dependents",
      value: result.dependentCreditAmount,
    });
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
    rows.push({
      line: "20",
      label: `Schedule 3: ${schedule3Parts.join(" + ")}`,
      value: result.dependentCareCreditAmount + result.educationCreditNonrefundable,
    });
  }

  rows.push({
    line: "22",
    label: "Subtotal after credits",
    value: result.federalTax + result.amtAmount,
  });

  if (
    result.selfEmploymentTax > 0 ||
    result.netInvestmentIncomeTax > 0 ||
    result.additionalMedicareTax > 0
  ) {
    const parts = [
      result.selfEmploymentTax > 0 ? "self-employment tax" : null,
      result.netInvestmentIncomeTax > 0 ? "Net Investment Income Tax" : null,
      result.additionalMedicareTax > 0 ? "Additional Medicare Tax (Form 8959)" : null,
    ].filter(Boolean);
    rows.push({
      line: "23",
      label: `Other taxes (Schedule 2: ${parts.join(" + ")})`,
      value: result.selfEmploymentTax + result.netInvestmentIncomeTax + result.additionalMedicareTax,
    });
  }

  rows.push({
    line: "24",
    label: "Total tax",
    value: result.federalTotalTaxBeforeRefundableCredits,
  });

  // Refundable credits live in the 1040's Payments section rather than
  // reducing line 24, so they appear below "total tax", not inside it.
  if (result.earnedIncomeCredit > 0) {
    rows.push({ line: "27", label: "Earned income credit (EIC)", value: result.earnedIncomeCredit });
  }

  if (result.educationCreditRefundable > 0) {
    rows.push({
      line: "29",
      label: "American opportunity credit, refundable portion (Form 8863 line 8)",
      value: result.educationCreditRefundable,
    });
  }

  if (result.refundableCreditsTotal > 0) {
    rows.push(
      {
        line: "33",
        label: "Total payments (refundable credits only — no withholding modeled)",
        value: result.refundableCreditsTotal,
      },
      {
        line: "34/37",
        label: "Amount owed, or refunded if negative (line 24 − line 33)",
        value: result.federalTotalTax,
      }
    );
  }

  return (
    <div className="mt-3">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-4">Line</th>
              <th className="py-2 pr-4">1040 label</th>
              <th className="py-2 pr-4">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.line}>
                <td className="py-2 pr-4 font-mono text-slate-500">{row.line}</td>
                <td className="py-2 pr-4">{row.label}</td>
                <td className="py-2 pr-4 font-medium">{formatCurrency(row.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Reference only — assumes no other income, no credits beyond the ones
        you entered inputs for, and no withholding or estimated payments. QBI,
        AMT, the EITC, and the education credits above use simplified
        calculations (see the notes in the form and any notice above). See the
        disclaimer above.
      </p>
    </div>
  );
}
