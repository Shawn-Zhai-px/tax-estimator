"use client";

import { FILING_STATUS_LABELS, FilingStatus, STATES, StateCode } from "@/lib/taxData";

export interface TaxFormValues {
  grossIncome: string;
  filingStatus: FilingStatus;
  state: StateCode;
  useItemized: boolean;
  itemizedDeduction: string;
}

interface TaxFormProps {
  values: TaxFormValues;
  onChange: (values: TaxFormValues) => void;
}

export default function TaxForm({ values, onChange }: TaxFormProps) {
  function update<K extends keyof TaxFormValues>(key: K, value: TaxFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label htmlFor="grossIncome" className="block text-sm font-medium text-slate-700">
          Gross annual income (税前年收入, USD)
        </label>
        <div className="relative mt-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            $
          </span>
          <input
            id="grossIncome"
            type="number"
            inputMode="decimal"
            min={0}
            step={100}
            value={values.grossIncome}
            onChange={(e) => update("grossIncome", e.target.value)}
            placeholder="0"
            className="w-full rounded-md border border-slate-300 py-2 pl-7 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="filingStatus" className="block text-sm font-medium text-slate-700">
          Filing status (报税身份)
        </label>
        <select
          id="filingStatus"
          value={values.filingStatus}
          onChange={(e) => update("filingStatus", e.target.value as FilingStatus)}
          className="mt-1 w-full rounded-md border border-slate-300 py-2 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          {Object.entries(FILING_STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="state" className="block text-sm font-medium text-slate-700">
          State (所在州)
        </label>
        <select
          id="state"
          value={values.state}
          onChange={(e) => update("state", e.target.value as StateCode)}
          className="mt-1 w-full rounded-md border border-slate-300 py-2 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          {STATES.map((s) => (
            <option key={s.code} value={s.code}>
              {s.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-500">
          Only CA and TX are supported in this MVP. More states can be added later.
        </p>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={values.useItemized}
            onChange={(e) => update("useItemized", e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Use itemized federal deduction instead of standard deduction
        </label>
        {values.useItemized && (
          <div className="relative mt-2">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              $
            </span>
            <input
              type="number"
              min={0}
              step={100}
              value={values.itemizedDeduction}
              onChange={(e) => update("itemizedDeduction", e.target.value)}
              placeholder="Total itemized deductions"
              className="w-full rounded-md border border-slate-300 py-2 pl-7 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        )}
        <p className="mt-1 text-xs text-slate-500">
          If left unchecked, the calculator automatically uses the larger of
          your entry and the standard deduction. California always uses its
          own standard deduction in this MVP.
        </p>
      </div>
    </div>
  );
}
