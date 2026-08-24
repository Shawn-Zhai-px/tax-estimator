"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import TaxForm, { TaxFormValues } from "@/components/TaxForm";
import ResultsPanel from "@/components/ResultsPanel";
import { estimateTax } from "@/lib/calculateTax";
import { exportResultToPdf } from "@/lib/exportPdf";
import { exportResultToCsv } from "@/lib/exportCsv";

const DEFAULT_VALUES: TaxFormValues = {
  taxYear: 2025,
  grossIncome: "75000",
  filingStatus: "single",
  state: "CA",
  useItemized: false,
  itemizedDeduction: "",
};

type Step = "input" | "results";

export default function Home() {
  const [values, setValues] = useState<TaxFormValues>(DEFAULT_VALUES);
  const [step, setStep] = useState<Step>("input");

  const result = useMemo(() => {
    const grossIncome = Number(values.grossIncome) || 0;
    const itemizedDeduction =
      values.useItemized && values.itemizedDeduction
        ? Number(values.itemizedDeduction) || 0
        : undefined;

    return estimateTax({
      grossIncome,
      filingStatus: values.filingStatus,
      state: values.state,
      taxYear: values.taxYear,
      itemizedDeduction,
    });
  }, [values]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Federal &amp; State Income Tax Estimator
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            联邦及州个人所得税估算工具（目前支持加州 CA / 德州 TX）— 仅供参考，非税务建议。
          </p>
        </div>
        <Link href="/paycheck-withholding" className="text-sm text-brand-600 hover:underline">
          Paycheck withholding calculator →
        </Link>
      </header>

      <div className="mb-6">
        <DisclaimerBanner />
      </div>

      {step === "input" ? (
        <div className="mx-auto max-w-xl">
          <TaxForm values={values} onChange={setValues} />
          <button
            onClick={() => setStep("results")}
            className="mt-4 w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Calculate →
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setStep("input")}
            className="mb-4 text-sm text-brand-600 hover:underline"
          >
            ← Edit inputs
          </button>
          <ResultsPanel
            result={result}
            onExportPdf={() => exportResultToPdf(result)}
            onExportCsv={() => exportResultToCsv(result)}
          />
        </div>
      )}

      <footer className="mt-10 border-t border-slate-200 pt-4 text-xs text-slate-400">
        Tax year {result.taxYear} federal brackets/standard deduction and California
        FTB Schedule X/Y/Z brackets, retrieved August 2026. Figures may change;
        always confirm against irs.gov and ftb.ca.gov.
      </footer>
    </main>
  );
}
