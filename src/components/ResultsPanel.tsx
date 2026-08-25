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
      {result.dependentCareCreditIsApproximate && result.dependentCareCreditAmount > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          The {result.taxYear} Dependent Care Credit rate below is an
          approximation of OBBBA's new (higher) schedule — sources disagree
          on the exact intermediate brackets, so this is smoothed between
          the confirmed anchor points pending final IRS Form 2441 guidance.
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Federal tax"
          value={formatCurrency(result.federalTotalTax)}
          sub={(() => {
            const parts = [
              result.selfEmploymentTax > 0 ? `${formatCurrency(result.selfEmploymentTax)} SE tax` : null,
              result.netInvestmentIncomeTax > 0 ? `${formatCurrency(result.netInvestmentIncomeTax)} NIIT` : null,
            ].filter(Boolean);
            return parts.length > 0 ? `incl. ${parts.join(" + ")}` : undefined;
          })()}
        />
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
          sub="Excludes FICA/payroll tax on wages"
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
            <dt className="text-slate-500">Wages / gross income</dt>
            <dd className="font-medium">{formatCurrency(result.grossIncome)}</dd>
          </div>
          {result.selfEmploymentNetIncome > 0 && (
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <dt className="text-slate-500">Self-employment net income</dt>
              <dd className="font-medium">{formatCurrency(result.selfEmploymentNetIncome)}</dd>
            </div>
          )}
          {result.selfEmploymentTax > 0 && (
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <dt className="text-slate-500">Self-employment tax</dt>
              <dd className="font-medium">{formatCurrency(result.selfEmploymentTax)}</dd>
            </div>
          )}
          {result.selfEmploymentNetIncome > 0 && (
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <dt className="text-slate-500">Total income</dt>
              <dd className="font-medium">{formatCurrency(result.totalIncome)}</dd>
            </div>
          )}
          {result.qualifiedDividendsAndLTCG > 0 && (
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <dt className="text-slate-500">Capital gains / qualified dividends</dt>
              <dd className="font-medium">{formatCurrency(result.qualifiedDividendsAndLTCG)}</dd>
            </div>
          )}
          {result.totalAdjustments > 0 && (
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <dt className="text-slate-500">
                Adjustments (½ SE tax, student loan interest, HSA/401(k)/IRA)
              </dt>
              <dd className="font-medium">{formatCurrency(result.totalAdjustments)}</dd>
            </div>
          )}
          {result.totalAdjustments > 0 && (
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <dt className="text-slate-500">Federal AGI</dt>
              <dd className="font-medium">{formatCurrency(result.federalAGI)}</dd>
            </div>
          )}
          {result.hsaDeduction > 0 && (
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <dt className="text-slate-500">CA AGI (HSA not deductible for CA)</dt>
              <dd className="font-medium">{formatCurrency(result.caAGI)}</dd>
            </div>
          )}
          {result.federalItemizedTotal > 0 && (
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <dt className="text-slate-500">Federal itemized total</dt>
              <dd className="font-medium">{formatCurrency(result.federalItemizedTotal)}</dd>
            </div>
          )}
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
          {result.capitalGainsTax > 0 && (
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <dt className="text-slate-500">Capital gains tax (0%/15%/20%)</dt>
              <dd className="font-medium">{formatCurrency(result.capitalGainsTax)}</dd>
            </div>
          )}
          {result.netInvestmentIncomeTax > 0 && (
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <dt className="text-slate-500">Net Investment Income Tax (3.8%)</dt>
              <dd className="font-medium">{formatCurrency(result.netInvestmentIncomeTax)}</dd>
            </div>
          )}
          {result.dependentCreditAmount > 0 && (
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <dt className="text-slate-500">
                Child Tax Credit / Credit for Other Dependents
              </dt>
              <dd className="font-medium">−{formatCurrency(result.dependentCreditAmount)}</dd>
            </div>
          )}
          {result.dependentCareCreditAmount > 0 && (
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <dt className="text-slate-500">
                Dependent care credit{result.dependentCareCreditIsApproximate ? " (approx.)" : ""}
              </dt>
              <dd className="font-medium">−{formatCurrency(result.dependentCareCreditAmount)}</dd>
            </div>
          )}
          <div className="flex justify-between border-b border-slate-100 py-1.5">
            <dt className="text-slate-500">Federal marginal rate</dt>
            <dd className="font-medium">{formatPercent(result.federalMarginalRate)}</dd>
          </div>
          {result.state === "CA" && result.caItemizedTotal > 0 && (
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <dt className="text-slate-500">CA itemized total</dt>
              <dd className="font-medium">{formatCurrency(result.caItemizedTotal)}</dd>
            </div>
          )}
          {result.state === "CA" && (
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <dt className="text-slate-500">CA deduction ({result.caDeductionType})</dt>
              <dd className="font-medium">{formatCurrency(result.caDeductionUsed)}</dd>
            </div>
          )}
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
