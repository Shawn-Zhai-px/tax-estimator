"use client";

import { TaxEstimateResult } from "@/lib/calculateTax";
import { formatCurrency } from "@/lib/format";

/**
 * Simplified California Form 540 line-number reference (2025 revision).
 * Line 62, historically "Mental Health Services Tax", was renamed
 * "Behavioral Health Services Tax" starting with the 2025 tax year (same
 * calculation: +1% on taxable income over $1,000,000). Numbers-only — no
 * name/SSN/address or any other identifying info is shown or collected.
 */
export default function Form540Summary({ result }: { result: TaxEstimateResult }) {
  const taxBeforeCredits = result.stateTax - result.caMentalHealthTax;

  const rows: { line: string; label: string; value: number }[] = [
    { line: "12", label: "State wages (from Form W-2, box 16)", value: result.grossIncome },
    { line: "13", label: "Federal adjusted gross income (AGI)", value: result.federalAGI },
    { line: "18", label: "CA standard deduction", value: result.caDeductionUsed },
    { line: "19", label: "CA taxable income", value: result.stateTaxableIncome },
    { line: "31", label: "Tax (before credits)", value: taxBeforeCredits },
    { line: "48", label: "Tax after credits (no credits modeled)", value: taxBeforeCredits },
    { line: "62", label: "Behavioral Health Services Tax (formerly Mental Health Services Tax)", value: result.caMentalHealthTax },
    { line: "64", label: "Total tax", value: result.stateTax },
  ];

  return (
    <div className="mt-3">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-4">Line</th>
              <th className="py-2 pr-4">540 label</th>
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
        Reference only — assumes no other income, adjustments, exemption
        credits, or withholding. See the disclaimer above
        {result.caDataIsProvisional ? " and the provisional-CA-data note" : ""}.
      </p>
    </div>
  );
}
