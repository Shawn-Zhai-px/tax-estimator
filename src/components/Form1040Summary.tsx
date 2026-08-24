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
    { line: "9", label: "Total income", value: result.grossIncome },
    { line: "11", label: "Adjusted gross income (AGI)", value: result.grossIncome },
    {
      line: "12",
      label: `${result.deductionType === "itemized" ? "Itemized" : "Standard"} deduction`,
      value: result.deductionUsed,
    },
    { line: "15", label: "Taxable income", value: result.federalTaxableIncome },
    { line: "16", label: "Tax", value: result.federalTax },
    { line: "24", label: "Total tax", value: result.federalTax },
  ];

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
        Reference only — assumes no other income, adjustments, credits, or
        withholding (Schedule 1/2/3 and lines 10, 13, 17–23, 25–37 aren't
        modeled). See the disclaimer above.
      </p>
    </div>
  );
}
