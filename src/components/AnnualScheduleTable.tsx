"use client";

import { AnnualScheduleResult, ScheduleRow } from "@/lib/calculatePaycheck";
import { formatCurrency } from "@/lib/format";

interface AnnualScheduleTableProps {
  result: AnnualScheduleResult;
  /** Whether CA withholding was applied — hides the CA-specific columns entirely (rather than showing an all-$0 "CA State Tax" column) when it wasn't. */
  applyCA: boolean;
}

const CA_ONLY_COLUMN_KEYS = new Set<Column["key"]>([
  "caStateIncTaxWithheld",
  "caSdiWithheld",
  "caTaxableIncomeAnnual",
]);

interface Column {
  key: keyof ScheduleRow | "totals";
  header: string;
  title: string;
  render: (row: ScheduleRow) => React.ReactNode;
  totalRender?: (result: AnnualScheduleResult) => React.ReactNode;
}

function money(v: number | null): React.ReactNode {
  return v === null ? "–" : formatCurrency(v);
}

const columns: Column[] = [
  { key: "eventNum", header: "#", title: "Event #", render: (r) => r.eventNum },
  { key: "type", header: "Type", title: "Type", render: (r) => r.type },
  {
    key: "regPaycheckNum",
    header: "Reg #",
    title: "Reg. Paycheck #",
    render: (r) => r.regPaycheckNum ?? "–",
  },
  {
    key: "grossPay",
    header: "Gross Pay",
    title: "Gross Pay",
    render: (r) => money(r.grossPay),
    totalRender: (res) => money(res.totals.grossPay),
  },
  {
    key: "fourZeroOneK",
    header: "401(k)",
    title: "401(k)",
    render: (r) => money(r.fourZeroOneK),
    totalRender: (res) => money(res.totals.fourZeroOneK),
  },
  {
    key: "rothCatchUp",
    header: "Roth Catch-Up",
    title: "Roth 401(k) Catch-Up",
    render: (r) => money(r.rothCatchUp),
    totalRender: (res) => money(res.totals.rothCatchUp),
  },
  {
    key: "depCareFsa",
    header: "Dep. Care FSA",
    title: "Dep. Care FSA",
    render: (r) => money(r.depCareFsa),
    totalRender: (res) => money(res.totals.depCareFsa),
  },
  {
    key: "healthPremium",
    header: "Health Premium",
    title: "Health Premium",
    render: (r) => money(r.healthPremium),
    totalRender: (res) => money(res.totals.healthPremium),
  },
  {
    key: "ficaWagesThisPeriod",
    header: "FICA Wages",
    title: "FICA Wages this period",
    render: (r) => money(r.ficaWagesThisPeriod),
    totalRender: (res) => money(res.totals.ficaWagesThisPeriod),
  },
  {
    key: "cumulativeFicaWagesBefore",
    header: "Cum. FICA (before)",
    title: "Cumulative FICA Wages (before)",
    render: (r) => money(r.cumulativeFicaWagesBefore),
  },
  {
    key: "socSecTaxable",
    header: "SS Taxable",
    title: "Soc. Sec. Taxable",
    render: (r) => money(r.socSecTaxable),
    totalRender: (res) => money(res.totals.socSecTaxable),
  },
  {
    key: "socSecWithheld",
    header: "SS Withheld",
    title: "Soc. Sec. Withheld",
    render: (r) => money(r.socSecWithheld),
    totalRender: (res) => money(res.totals.socSecWithheld),
  },
  {
    key: "medicareWithheld",
    header: "Medicare",
    title: "Medicare Withheld",
    render: (r) => money(r.medicareWithheld),
    totalRender: (res) => money(res.totals.medicareWithheld),
  },
  {
    key: "addlMedicareWithheld",
    header: "Addl. Medicare",
    title: "Additional Medicare Withheld",
    render: (r) => money(r.addlMedicareWithheld),
    totalRender: (res) => money(res.totals.addlMedicareWithheld),
  },
  {
    key: "fedIncTaxWithheld",
    header: "Fed Inc. Tax",
    title: "Federal Inc. Tax Withheld",
    render: (r) => money(r.fedIncTaxWithheld),
    totalRender: (res) => money(res.totals.fedIncTaxWithheld),
  },
  {
    key: "caStateIncTaxWithheld",
    header: "CA State Tax",
    title: "CA State Inc. Tax Withheld",
    render: (r) => money(r.caStateIncTaxWithheld),
    totalRender: (res) => money(res.totals.caStateIncTaxWithheld),
  },
  {
    key: "caSdiWithheld",
    header: "CA SDI",
    title: "CA SDI Withheld",
    render: (r) => money(r.caSdiWithheld),
    totalRender: (res) => money(res.totals.caSdiWithheld),
  },
  {
    key: "totalWithholding",
    header: "Total Withholding",
    title: "Total Withholding",
    render: (r) => money(r.totalWithholding),
    totalRender: (res) => money(res.totals.totalWithholding),
  },
  {
    key: "netPay",
    header: "Net Pay",
    title: "Net Pay",
    render: (r) => money(r.netPay),
    totalRender: (res) => money(res.totals.netPay),
  },
  {
    key: "fedCaTaxableWages",
    header: "Fed/CA Taxable Wages",
    title: "Fed/CA Taxable Wages",
    render: (r) => money(r.fedCaTaxableWages),
    totalRender: (res) => money(res.totals.fedCaTaxableWages),
  },
  {
    key: "fedAdjustedAnnualWage",
    header: "Fed Adj. Annual Wage",
    title: "Fed Adjusted Annual Wage",
    render: (r) => money(r.fedAdjustedAnnualWage),
  },
  {
    key: "caTaxableIncomeAnnual",
    header: "CA Taxable Income (annual)",
    title: "CA Taxable Income (annual)",
    render: (r) => money(r.caTaxableIncomeAnnual),
  },
];

export default function AnnualScheduleTable({ result, applyCA }: AnnualScheduleTableProps) {
  const visibleColumns = applyCA ? columns : columns.filter((col) => !CA_ONLY_COLUMN_KEYS.has(col.key));
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-xs">
        <thead>
          <tr className="text-left uppercase tracking-wide text-slate-500">
            {visibleColumns.map((col, i) => (
              <th
                key={col.key}
                title={col.title}
                className={`whitespace-nowrap py-2 px-3 ${
                  i === 0 ? "sticky left-0 z-10 bg-slate-50" : ""
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {result.rows.map((row) => {
            const rowBg = row.type === "BONUS" ? "bg-amber-50" : "bg-white";
            return (
              <tr key={row.eventNum} className={row.type === "BONUS" ? "font-medium bg-amber-50" : ""}>
                {visibleColumns.map((col, i) => (
                  <td
                    key={col.key}
                    className={`whitespace-nowrap py-2 px-3 ${
                      i === 0 ? `sticky left-0 z-10 ${rowBg}` : ""
                    }`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold">
            {visibleColumns.map((col, i) => (
              <td
                key={col.key}
                className={`whitespace-nowrap py-2 px-3 ${
                  i === 0 ? "sticky left-0 z-10 bg-slate-50" : ""
                }`}
              >
                {i === 0 ? "TOTAL" : i === 1 ? "" : col.totalRender ? col.totalRender(result) : "–"}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
