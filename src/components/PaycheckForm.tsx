"use client";

import {
  CATCH_UP_LABELS,
  CAFilingStatus,
  CA_FILING_STATUS_LABELS,
  CatchUpEligibility,
  FEDERAL_FILING_STATUS_LABELS,
  FederalFilingStatus,
  PAY_FREQUENCY_LABELS,
  PayFrequency,
} from "@/lib/paycheckData";

export interface PaycheckFormValues {
  annualBase: string;
  federalFilingStatus: FederalFilingStatus;
  payFrequency: PayFrequency;
  annualHealthPremium: string;

  multipleJobsCheckbox: boolean;
  step3Credits: string;
  step4aOtherIncome: string;
  step4bDeductions: string;
  step4cExtraWithholding: string;

  fourZeroOneKRate: string;
  depCareFsaRate: string;
  catchUpEligibility: CatchUpEligibility;
  rothCatchUpRate: string;

  applyCA: boolean;
  caFilingStatus: CAFilingStatus;
  caRegularAllowances: string;
  caEstDedAllowances: string;
  caMarried2PlusAllowances: boolean;
  caAdditionalWithholding: string;

  includeBonus: boolean;
  bonusAmount: string;
  bonusAfterPaycheckNum: string;
  ytdSupplementalWages: string;
}

interface PaycheckFormProps {
  values: PaycheckFormValues;
  onChange: (values: PaycheckFormValues) => void;
}

const inputClass =
  "w-full rounded-md border border-slate-300 py-2 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";
const labelClass = "block text-sm font-medium text-slate-700";
const helpClass = "mt-1 text-xs text-slate-500";
const checkboxLabelClass = "flex items-center gap-2 text-sm font-medium text-slate-700";
const checkboxClass = "h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500";
const fieldsetClass = "space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm";
const legendClass = "text-sm font-semibold text-slate-900";

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

export default function PaycheckForm({ values, onChange }: PaycheckFormProps) {
  function update<K extends keyof PaycheckFormValues>(key: K, value: PaycheckFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Employee &amp; Pay (雇员与薪资)</legend>
        <DollarField
          id="annualBase"
          label="Annual base salary"
          value={values.annualBase}
          onChange={(v) => update("annualBase", v)}
        />
        <div>
          <label htmlFor="federalFilingStatus" className={labelClass}>
            Filing status (Step 1(c) of Form W-4)
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
        <DollarField
          id="annualHealthPremium"
          label="Annual pre-tax health insurance premiums"
          help="Pre-tax for federal income tax AND FICA (Section 125 cafeteria plan)."
          value={values.annualHealthPremium}
          onChange={(v) => update("annualHealthPremium", v)}
        />
      </fieldset>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Form W-4 Steps 2–4</legend>
        <label className={checkboxLabelClass}>
          <input
            type="checkbox"
            checked={values.multipleJobsCheckbox}
            onChange={(e) => update("multipleJobsCheckbox", e.target.checked)}
            className={checkboxClass}
          />
          Step 2: Multiple jobs box checked?
        </label>
        <DollarField
          id="step3Credits"
          label="Step 3: annual dependent/other credits"
          value={values.step3Credits}
          onChange={(v) => update("step3Credits", v)}
        />
        <DollarField
          id="step4aOtherIncome"
          label="Step 4(a): other annual income"
          value={values.step4aOtherIncome}
          onChange={(v) => update("step4aOtherIncome", v)}
        />
        <DollarField
          id="step4bDeductions"
          label="Step 4(b): annual deductions"
          value={values.step4bDeductions}
          onChange={(v) => update("step4bDeductions", v)}
        />
        <DollarField
          id="step4cExtraWithholding"
          label="Step 4(c): extra withholding per paycheck"
          value={values.step4cExtraWithholding}
          onChange={(v) => update("step4cExtraWithholding", v)}
        />
      </fieldset>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>401(k) / FSA / Roth Catch-Up</legend>
        <RateField
          id="fourZeroOneKRate"
          label="401(k)/403(b) contribution rate"
          help="Decimal, e.g. 0.10 for 10%. Applies to regular pay and the bonus, capped at the annual IRS limit."
          value={values.fourZeroOneKRate}
          onChange={(v) => update("fourZeroOneKRate", v)}
        />
        <RateField
          id="depCareFsaRate"
          label="Dependent care FSA contribution rate"
          help="Regular paychecks only, capped at the annual IRS limit."
          value={values.depCareFsaRate}
          onChange={(v) => update("depCareFsaRate", v)}
        />
        <div>
          <label htmlFor="catchUpEligibility" className={labelClass}>
            Roth 401(k) catch-up eligibility (age 50+)
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
          label="Roth 401(k) catch-up contribution rate"
          help="Applies to regular pay and the bonus. After-tax: reduces net pay but not taxable wages."
          value={values.rothCatchUpRate}
          onChange={(v) => update("rothCatchUpRate", v)}
        />
      </fieldset>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>California Withholding (DE 4)</legend>
        <label className={checkboxLabelClass}>
          <input
            type="checkbox"
            checked={values.applyCA}
            onChange={(e) => update("applyCA", e.target.checked)}
            className={checkboxClass}
          />
          Apply California state withholding?
        </label>
        {values.applyCA && (
          <>
            <div>
              <label htmlFor="caFilingStatus" className={labelClass}>
                CA filing status (DE 4)
              </label>
              <select
                id="caFilingStatus"
                value={values.caFilingStatus}
                onChange={(e) => update("caFilingStatus", e.target.value as CAFilingStatus)}
                className={`${inputClass} mt-1`}
              >
                {Object.entries(CA_FILING_STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="caRegularAllowances" className={labelClass}>
                DE 4 line 1: regular withholding allowances
              </label>
              <input
                id="caRegularAllowances"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={values.caRegularAllowances}
                onChange={(e) => update("caRegularAllowances", e.target.value)}
                className={`${inputClass} mt-1`}
              />
            </div>
            <div>
              <label htmlFor="caEstDedAllowances" className={labelClass}>
                DE 4 line 2: additional allowances for estimated deductions
              </label>
              <input
                id="caEstDedAllowances"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={values.caEstDedAllowances}
                onChange={(e) => update("caEstDedAllowances", e.target.value)}
                className={`${inputClass} mt-1`}
              />
            </div>
            {values.caFilingStatus === "married" && (
              <label className={checkboxLabelClass}>
                <input
                  type="checkbox"
                  checked={values.caMarried2PlusAllowances}
                  onChange={(e) => update("caMarried2PlusAllowances", e.target.checked)}
                  className={checkboxClass}
                />
                Married filing withholding: 2+ allowances on DE 4?
              </label>
            )}
            <DollarField
              id="caAdditionalWithholding"
              label="CA additional withholding per paycheck"
              help="Extra flat amount from DE 4 line 3 (does not apply to the bonus)."
              value={values.caAdditionalWithholding}
              onChange={(v) => update("caAdditionalWithholding", v)}
            />
          </>
        )}
      </fieldset>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Bonus (optional)</legend>
        <label className={checkboxLabelClass}>
          <input
            type="checkbox"
            checked={values.includeBonus}
            onChange={(e) => update("includeBonus", e.target.checked)}
            className={checkboxClass}
          />
          Include this bonus in the Annual Schedule?
        </label>
        {values.includeBonus && (
          <>
            <DollarField
              id="bonusAmount"
              label="Bonus gross amount"
              value={values.bonusAmount}
              onChange={(v) => update("bonusAmount", v)}
            />
            <div>
              <label htmlFor="bonusAfterPaycheckNum" className={labelClass}>
                Bonus is paid after this many regular paychecks
              </label>
              <input
                id="bonusAfterPaycheckNum"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={values.bonusAfterPaycheckNum}
                onChange={(e) => update("bonusAfterPaycheckNum", e.target.value)}
                className={`${inputClass} mt-1`}
              />
            </div>
            <DollarField
              id="ytdSupplementalWages"
              label="Other supplemental wages already paid this year"
              help="For the federal $1M cumulative supplemental-wage tracking."
              value={values.ytdSupplementalWages}
              onChange={(v) => update("ytdSupplementalWages", v)}
            />
          </>
        )}
      </fieldset>
    </div>
  );
}
