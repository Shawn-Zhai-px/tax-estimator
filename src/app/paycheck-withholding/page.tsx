"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import PaycheckForm, { PaycheckFormValues } from "@/components/PaycheckForm";
import AnnualScheduleTable from "@/components/AnnualScheduleTable";
import { computeAnnualSchedule, PaycheckInput } from "@/lib/calculatePaycheck";
import { exportScheduleToCsv } from "@/lib/exportPaycheckCsv";
import { formatCurrency } from "@/lib/format";
import {
  ADDL_MEDICARE_RATE,
  ADDL_MEDICARE_THRESHOLD,
  DEP_CARE_FSA_ANNUAL_LIMIT,
  FOUR_ZERO_ONE_K_ANNUAL_LIMIT,
  PAYCHECK_TAX_YEAR,
  SS_RATE,
  SS_WAGE_BASE,
} from "@/lib/paycheckData";

const DEFAULT_VALUES: PaycheckFormValues = {
  annualBase: "350000",
  federalFilingStatus: "single",
  payFrequency: "semimonthly",
  annualHealthPremium: "8500",

  multipleJobsCheckbox: false,
  step3Credits: "0",
  step4aOtherIncome: "0",
  step4bDeductions: "0",
  step4cExtraWithholding: "0",

  fourZeroOneKRate: "0.10",
  depCareFsaRate: "0.02",
  catchUpEligibility: "standard",
  rothCatchUpRate: "0.03",

  applyCA: true,
  caFilingStatus: "single",
  caRegularAllowances: "0",
  caEstDedAllowances: "0",
  caMarried2PlusAllowances: false,
  caAdditionalWithholding: "0",

  includeBonus: true,
  bonusAmount: "50000",
  bonusAfterPaycheckNum: "4",
  ytdSupplementalWages: "0",
};

function num(v: string): number {
  return Number(v) || 0;
}

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export default function PaycheckWithholdingPage() {
  const [values, setValues] = useState<PaycheckFormValues>(DEFAULT_VALUES);

  const input: PaycheckInput = useMemo(
    () => ({
      annualBase: num(values.annualBase),
      federalFilingStatus: values.federalFilingStatus,
      payFrequency: values.payFrequency,
      multipleJobsCheckbox: values.multipleJobsCheckbox,
      step3Credits: num(values.step3Credits),
      step4aOtherIncome: num(values.step4aOtherIncome),
      step4bDeductions: num(values.step4bDeductions),
      step4cExtraWithholding: num(values.step4cExtraWithholding),
      annualHealthPremium: num(values.annualHealthPremium),

      fourZeroOneKRate: num(values.fourZeroOneKRate),
      fourZeroOneKAnnualLimit: FOUR_ZERO_ONE_K_ANNUAL_LIMIT,
      depCareFsaRate: num(values.depCareFsaRate),
      depCareFsaAnnualLimit: DEP_CARE_FSA_ANNUAL_LIMIT,
      catchUpEligibility: values.catchUpEligibility,
      rothCatchUpRate: num(values.rothCatchUpRate),

      applyCA: values.applyCA,
      caFilingStatus: values.caFilingStatus,
      caRegularAllowances: num(values.caRegularAllowances),
      caEstDedAllowances: num(values.caEstDedAllowances),
      caMarried2PlusAllowances: values.caMarried2PlusAllowances,
      caAdditionalWithholding: num(values.caAdditionalWithholding),

      includeBonus: values.includeBonus,
      bonusAmount: num(values.bonusAmount),
      bonusAfterPaycheckNum: num(values.bonusAfterPaycheckNum),
      ytdSupplementalWages: num(values.ytdSupplementalWages),
    }),
    [values]
  );

  const result = useMemo(() => computeAnnualSchedule(input), [input]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Paycheck Withholding Calculator
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            按发薪日排程估算联邦/州代扣税、FICA 与净工资（{PAYCHECK_TAX_YEAR} 年度）— 仅供参考，非税务建议。
          </p>
        </div>
        <Link href="/" className="text-sm text-brand-600 hover:underline">
          ← Back to tax estimator
        </Link>
      </header>

      <div className="mb-6">
        <DisclaimerBanner />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total withholding" value={formatCurrency(result.totals.totalWithholding)} />
        <StatTile label="Federal tax" value={formatCurrency(result.totals.fedIncTaxWithheld)} />
        <StatTile label="CA state tax" value={formatCurrency(result.totals.caStateIncTaxWithheld)} />
        <StatTile label="Net pay" value={formatCurrency(result.totals.netPay)} sub={`${result.rows.length} pay events`} />
      </div>

      <div className="mb-6">
        <PaycheckForm values={values} onChange={setValues} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Annual Schedule ({result.periodsPerYear} pay periods/year)
          </h3>
          <button
            onClick={() => exportScheduleToCsv(result, values.payFrequency)}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Export CSV
          </button>
        </div>
        <AnnualScheduleTable result={result} />
      </div>

      <footer className="mt-10 border-t border-slate-200 pt-4 text-xs text-slate-400">
        {PAYCHECK_TAX_YEAR} IRS Pub. 15-T Percentage Method withholding brackets and EDD California
        Method B withholding schedules. SS wage base {formatCurrency(SS_WAGE_BASE)} at {(SS_RATE * 100).toFixed(1)}%,
        Additional Medicare {(ADDL_MEDICARE_RATE * 100).toFixed(1)}% over {formatCurrency(ADDL_MEDICARE_THRESHOLD)}.
        Figures may change; always confirm against irs.gov and edd.ca.gov.
      </footer>
    </main>
  );
}
