"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TaxForm, {
  DEFAULT_TAX_FORM_VALUES,
  TaxFormValues,
  taxFormValuesToEstimateInput,
} from "@/components/TaxForm";
import ResultsPanel from "@/components/ResultsPanel";
import { estimateTax } from "@/lib/calculateTax";
import { exportResultToPdf } from "@/lib/exportPdf";
import { exportResultToCsv } from "@/lib/exportCsv";
import { formatCurrency } from "@/lib/format";

type Step = "input" | "results";

export default function IncomeTaxEstimatorTab() {
  const [values, setValues] = useState<TaxFormValues>(DEFAULT_TAX_FORM_VALUES);
  const [step, setStep] = useState<Step>("input");

  const result = useMemo(() => estimateTax(taxFormValuesToEstimateInput(values)), [values]);

  // Move focus to a heading in the newly-shown view whenever the user
  // switches between the input form and the results screen — without this,
  // the "Calculate"/"Edit inputs" button that had focus unmounts and focus
  // silently resets to <body>, leaving keyboard/screen-reader users with no
  // cue that the view changed. Skipped on first mount so we don't steal
  // focus from the page on initial load.
  const isFirstRender = useRef(true);
  const formHeadingRef = useRef<HTMLHeadingElement>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    (step === "results" ? resultsHeadingRef : formHeadingRef).current?.focus();
  }, [step]);

  return (
    <div>
      {step === "input" ? (
        <div className="mx-auto max-w-xl">
          <h2 ref={formHeadingRef} tabIndex={-1} className="sr-only">
            Edit your income tax inputs
          </h2>
          <div
            className="sticky top-0 z-10 mb-4 flex items-center justify-between gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2.5 shadow-sm"
            aria-live="polite"
          >
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-brand-700">Live estimate</p>
              <p className="text-sm font-semibold text-brand-900">
                Total tax {formatCurrency(result.totalTax)} · Take-home {formatCurrency(result.estimatedTakeHome)}
              </p>
            </div>
            <span className="hidden text-xs text-brand-600 sm:inline">Updates as you type</span>
          </div>
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
          <h2 ref={resultsHeadingRef} tabIndex={-1} className="sr-only">
            Your tax estimate results
          </h2>
          <button
            onClick={() => setStep("input")}
            className="mb-4 inline-block py-2 text-sm text-brand-600 hover:underline"
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

      <footer className="mt-10 border-t border-slate-200 pt-4 text-xs text-slate-500">
        Tax year {result.taxYear} federal brackets/standard deduction and California
        FTB Schedule X/Y/Z brackets, retrieved August 2026. Figures may change;
        always confirm against irs.gov and ftb.ca.gov.
      </footer>
    </div>
  );
}
