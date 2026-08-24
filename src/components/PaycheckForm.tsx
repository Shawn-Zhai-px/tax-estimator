"use client";

import {
  CATCH_UP_LABELS,
  CatchUpEligibility,
  FEDERAL_FILING_STATUS_LABELS,
  FederalFilingStatus,
  PAY_FREQUENCY_LABELS,
  PayFrequency,
} from "@/lib/paycheckData";

export interface PaycheckFormValues {
  // Step 1 — Essential information
  annualBase: string;
  federalFilingStatus: FederalFilingStatus;
  payFrequency: PayFrequency;

  // Step 2 — Additional information
  multipleJobsCheckbox: boolean;
  step3Credits: string;
  step4aOtherIncome: string;
  step4bDeductions: string;

  // Step 3 — Additional deduction
  fourZeroOneKRate: string;
  catchUpEligibility: CatchUpEligibility;
  rothCatchUpRate: string;
  depCareFsaRate: string;
  annualHealthPremium: string;

  // Step 4 — Bonus
  bonusAmount: string;
  firstPaycheckDate: string;
  bonusDate: string;

  // Step 5 — Withholding
  step4cExtraWithholding: string;
  caAdditionalWithholding: string;
}

export const TOTAL_STEPS = 5;

export const STEP_TITLES = [
  "Essential information",
  "Additional information",
  "Additional deduction",
  "Bonus",
  "Withholding",
];

interface PaycheckFormProps {
  values: PaycheckFormValues;
  onChange: (values: PaycheckFormValues) => void;
  step: number;
  onBack: () => void;
  onAdvance: () => void;
}

const inputClass =
  "w-full rounded-md border border-slate-300 py-2 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-slate-50 disabled:text-slate-400";
const labelClass = "block text-sm font-medium text-slate-700";
const helpClass = "mt-1 text-xs text-slate-500";
const checkboxLabelClass = "flex items-center gap-2 text-sm font-medium text-slate-700";
const checkboxClass = "h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500";

function DollarField({
  id,
  label,
  help,
  value,
  onChange,
}: {
  id: string;
  label: string;
  help?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative mt-1">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
          $
        </span>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={100}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} pl-7`}
        />
      </div>
      {help && <p className={helpClass}>{help}</p>}
    </div>
  );
}

function RateField({
  id,
  label,
  help,
  value,
  onChange,
}: {
  id: string;
  label: string;
  help?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} mt-1`}
      />
      {help && <p className={helpClass}>{help}</p>}
    </div>
  );
}

export default function PaycheckForm({ values, onChange, step, onBack, onAdvance }: PaycheckFormProps) {
  function update<K extends keyof PaycheckFormValues>(key: K, value: PaycheckFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  const hasBonus = (Number(values.bonusAmount) || 0) > 0;
  const isLastStep = step === TOTAL_STEPS;
  const isSkippable = step > 1;

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Step {step} of {TOTAL_STEPS}
        </p>
        <h2 className="text-sm font-semibold text-slate-900">{STEP_TITLES[step - 1]}</h2>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <DollarField
            id="annualBase"
            label="Annual base salary"
            value={values.annualBase}
            onChange={(v) => update("annualBase", v)}
          />
          <div>
            <label htmlFor="federalFilingStatus" className={labelClass}>
              Filing status
            </label>
            <select
              id="federalFilingStatus"
              value={values.federalFilingStatus}
              onChange={(e) => update("federalFilingStatus", e.target.value as FederalFilingStatus)}
              className={`${inputClass} mt-1`}
            >
              {Object.entries(FEDERAL_FILING_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <p className={helpClass}>
              Form W-4 Step 1(c). Also used as your CA (DE 4) filing status.
            </p>
          </div>
          <div>
            <label htmlFor="payFrequency" className={labelClass}>
              Pay frequency
            </label>
            <select
              id="payFrequency"
              value={values.payFrequency}
              onChange={(e) => update("payFrequency", e.target.value as PayFrequency)}
              className={`${inputClass} mt-1`}
            >
              {Object.entries(PAY_FREQUENCY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className={checkboxLabelClass}>
              <input
                type="checkbox"
                checked={values.multipleJobsCheckbox}
                onChange={(e) => update("multipleJobsCheckbox", e.target.checked)}
                className={checkboxClass}
              />
              Multiple jobs box checked?
            </label>
            <p className={helpClass}>Form W-4 Step 2. Default: No.</p>
          </div>
          <DollarField
            id="step3Credits"
            label="Annual dependent/other credits"
            help="Form W-4 Step 3. Default: 0"
            value={values.step3Credits}
            onChange={(v) => update("step3Credits", v)}
          />
          <DollarField
            id="step4aOtherIncome"
            label="Other annual income"
            help="Form W-4 Step 4(a). Default: 0"
            value={values.step4aOtherIncome}
            onChange={(v) => update("step4aOtherIncome", v)}
          />
          <DollarField
            id="step4bDeductions"
            label="Annual deductions"
            help="Form W-4 Step 4(b). Default: 0"
            value={values.step4bDeductions}
            onChange={(v) => update("step4bDeductions", v)}
          />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <RateField
            id="fourZeroOneKRate"
            label="401(k)/403(b) contribution rate (% of gross pay)"
            help="Decimal, e.g. 0.10 for 10%. Applies to regular pay and the bonus, capped at the annual IRS limit."
            value={values.fourZeroOneKRate}
            onChange={(v) => update("fourZeroOneKRate", v)}
          />
          <div>
            <label htmlFor="catchUpEligibility" className={labelClass}>
              401(k) catch-up eligibility (age 50+)
            </label>
            <select
              id="catchUpEligibility"
              value={values.catchUpEligibility}
              onChange={(e) => update("catchUpEligibility", e.target.value as CatchUpEligibility)}
              className={`${inputClass} mt-1`}
            >
              {Object.entries(CATCH_UP_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <RateField
            id="rothCatchUpRate"
            label="401(k) catch-up contribution rate (% of gross pay)"
            help="Applies to regular pay and the bonus. After-tax (Roth): reduces net pay but not taxable wages."
            value={values.rothCatchUpRate}
            onChange={(v) => update("rothCatchUpRate", v)}
          />
          <RateField
            id="depCareFsaRate"
            label="Dependent care FSA contribution rate (% of gross pay)"
            help="Regular paychecks only, capped at the annual IRS limit."
            value={values.depCareFsaRate}
            onChange={(v) => update("depCareFsaRate", v)}
          />
          <DollarField
            id="annualHealthPremium"
            label="Annual pre-tax health insurance premiums"
            help="Pre-tax for federal income tax AND FICA (Section 125 cafeteria plan)."
            value={values.annualHealthPremium}
            onChange={(v) => update("annualHealthPremium", v)}
          />
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <DollarField
            id="bonusAmount"
            label="Bonus gross amount"
            help="Default: 0 (no bonus). Enter an amount to include a bonus in the Annual Schedule."
            value={values.bonusAmount}
            onChange={(v) => update("bonusAmount", v)}
          />
          <div>
            <label htmlFor="firstPaycheckDate" className={labelClass}>
              Date of your first paycheck this year
            </label>
            <input
              id="firstPaycheckDate"
              type="date"
              disabled={!hasBonus}
              value={values.firstPaycheckDate}
              onChange={(e) => update("firstPaycheckDate", e.target.value)}
              className={`${inputClass} mt-1`}
            />
          </div>
          <div>
            <label htmlFor="bonusDate" className={labelClass}>
              Date the bonus was (or will be) paid
            </label>
            <input
              id="bonusDate"
              type="date"
              disabled={!hasBonus}
              value={values.bonusDate}
              onChange={(e) => update("bonusDate", e.target.value)}
              className={`${inputClass} mt-1`}
            />
            <p className={helpClass}>
              We use these two dates to figure out which regular paycheck the
              bonus falls after, so you don&apos;t need to remember the exact
              paycheck number.
            </p>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <DollarField
            id="step4cExtraWithholding"
            label="Federal extra withholding per paycheck"
            help="Form W-4 Step 4(c). Default: 0"
            value={values.step4cExtraWithholding}
            onChange={(v) => update("step4cExtraWithholding", v)}
          />
          <DollarField
            id="caAdditionalWithholding"
            label="CA additional withholding per paycheck"
            help="Default: 0. Extra flat amount from DE 4 line 3 (does not apply to the bonus)."
            value={values.caAdditionalWithholding}
            onChange={(v) => update("caAdditionalWithholding", v)}
          />
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        {step > 1 ? (
          <button
            onClick={onBack}
            className="text-sm text-slate-500 hover:text-slate-700 hover:underline"
          >
            ← Back
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-3">
          {isSkippable && (
            <button
              onClick={onAdvance}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {isLastStep ? "Skip & Calculate" : "Skip"}
            </button>
          )}
          <button
            onClick={onAdvance}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {isLastStep ? "Calculate →" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
