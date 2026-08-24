"use client";

import { TaxEstimateResult } from "@/lib/calculateTax";
import { formatCurrency, formatPercent } from "@/lib/format";
import { FILING_STATUS_LABELS } from "@/config";
import Form1040Summary from "./Form1040Summary";
import Form540Summary from "./Form540Summary";

interface ResultsPanelProps {
  result: TaxEstimateResult;
  onExportPdf: () => void;
  onExportCsv: () => void;
}

function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export default function ResultsPanel({
  result,
  onExportPdf,
  onExportCsv,
}: ResultsPanelProps) {
  return (
    <div className="space-y-6">
      {result.state === "CA" && result.caDataIsProvisional && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          CA's official {result.taxYear} bracket/standard-deduction figures
          haven't been published by the FTB yet — the numbers below carry
          forward the last published (2025) CA figures as a placeholder and
          will change once the FTB releases the real {result.taxYear} schedule.
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Federal tax" value={formatCurrency(result.federalTax)} />
        <StatTile
          label={result.state === "CA" ? "CA state tax" : "State tax"}
          value={formatCurrency(result.stateTax)}
        />
        <StatTile
          label="Total estimated tax"
          value={formatCurrency(result.totalTax)}
          sub={`Effective rate ${formatPercent(result.totalEffectiveRate)}`}
        />
        <StatTile
          label="Estimated take-home"
          value={formatCurrency(result.estimatedTakeHome)}
          sub="Before payroll taxes"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Summary ({result.taxYear} tax year)</h3>
        <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div className="flex justify-between border-b border-slate-100 py-1.5">
            <dt className="text-slate-500">Filing status</dt>
            <dd className="font-medium">{FILING_STATUS_LABELS[result.filingStatus]}</dd>
          </div>
          <div className="flex justify-between border-b border-slate-100 py-1.5">
            <dt className="text-slate-500">State</dt>
            <dd className="font-medium">{result.state}</dd>
          </div>
          <div className="flex justify-between border-b border-slate-100 py-1.5">
            <dt className="text-slate-500">Gross income</dt>
            <dd className="font-medium">{formatCurrency(result.grossIncome)}</dd>
          </div>
          <div className="flex justify-between border-b border-slate-100 py-1.5">
            <dt className="text-slate-500">
              Federal deduction ({result.deductionType})
            </dt>
            <dd className="font-medium">{formatCurrency(result.deductionUsed)}</dd>
          </div>
          <div className="flex justify-between border-b border-slate-100 py-1.5">
            <dt className="text-slate-500">Federal taxable income</dt>
            <dd className="font-medium">{formatCurrency(result.federalTaxableIncome)}</dd>
          </div>
          <div className="flex justify-between border-b border-slate-100 py-1.5">
            <dt className="text-slate-500">Federal marginal rate</dt>
            <dd className="font-medium">{formatPercent(result.federalMarginalRate)}</dd>
          </div>
          <div className="flex justify-between border-b border-slate-100 py-1.5">
            <dt className="text-slate-500">State taxable income</dt>
            <dd className="font-medium">{formatCurrency(result.stateTaxableIncome)}</dd>
          </div>
          <div className="flex justify-between border-b border-slate-100 py-1.5">
            <dt className="text-slate-500">State marginal rate</dt>
            <dd className="font-medium">{formatPercent(result.stateMarginalRate)}</dd>
          </div>
          {result.caMentalHealthTax > 0 && (
            <div className="flex justify-between border-b border-slate-100 py-1.5 sm:col-span-2">
              <dt className="text-slate-500">
                incl. CA Mental Health Services Tax (1% over $1M)
              </dt>
              <dd className="font-medium">{formatCurrency(result.caMentalHealthTax)}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Federal bracket breakdown</h3>
        <BracketTable rows={result.federalBracketBreakdown} />
      </div>

      {result.state === "CA" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">California bracket breakdown</h3>
          <BracketTable rows={result.stateBracketBreakdown} />
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Federal Form 1040 line reference</h3>
        <Form1040Summary result={result} />
      </div>

      {result.state === "CA" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">California Form 540 line reference</h3>
          <Form540Summary result={result} />
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onExportPdf}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Export PDF summary
        </button>
        <button
          onClick={onExportCsv}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Export CSV table
        </button>
      </div>
    </div>
  );
}

function BracketTable({
  rows,
}: {
  rows: TaxEstimateResult["federalBracketBreakdown"];
}) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-4">Bracket</th>
            <th className="py-2 pr-4">Rate</th>
            <th className="py-2 pr-4">Taxable in bracket</th>
            <th className="py-2 pr-4">Tax</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={i} className={row.taxableAmountInBracket === 0 ? "text-slate-300" : ""}>
              <td className="py-2 pr-4">
                {formatCurrency(row.min)} – {row.max === null ? "and up" : formatCurrency(row.max)}
              </td>
              <td className="py-2 pr-4">{formatPercent(row.rate)}</td>
              <td className="py-2 pr-4">{formatCurrency(row.taxableAmountInBracket)}</td>
              <td className="py-2 pr-4">{formatCurrency(row.taxForBracket)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
