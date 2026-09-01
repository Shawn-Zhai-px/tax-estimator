"use client";

import {
  FILING_STATUS_LABELS,
  FilingStatus,
  STATES,
  StateCode,
  SUPPORTED_TAX_YEARS,
  TaxYear,
} from "@/config";
import { EducationCreditType, TaxEstimateInput } from "@/lib/calculateTax";
import { getNegativeInputWarning } from "@/lib/format";

export interface TaxFormValues {
  taxYear: TaxYear;
  grossIncome: string;
  filingStatus: FilingStatus;
  state: StateCode;
  selfEmploymentNetIncome: string;
  isSpecifiedServiceTradeOrBusiness: boolean;
  qualifiedBusinessW2Wages: string;
  qualifiedBusinessUbia: string;
  qualifyingChildren: string;
  otherDependents: string;
  studentLoanInterestPaid: string;
  mortgageInterest: string;
  propertyTax: string;
  stateIncomeTaxPaid: string;
  charitableDonations: string;
  medicalExpenses: string;
  dependentCareExpenses: string;
  dependentCareQualifyingPersons: string;
  qualifiedDividendsAndLTCG: string;
  shortTermCapitalGains: string;
  educationExpenses: string;
  educationCreditType: EducationCreditType;
  hsaContribution: string;
  hsaCoverageType: "self-only" | "family";
  traditional401kContribution: string;
  traditionalIraContribution: string;
  isoExerciseSpread: string;
  privateActivityBondInterest: string;
}

/**
 * Starting values for the form. Every optional field starts empty so that
 * `estimateTax` sees 0/false and behaves exactly as if the feature didn't
 * exist — the backward-compatibility convention every phase of this
 * estimator has followed.
 */
export const DEFAULT_TAX_FORM_VALUES: TaxFormValues = {
  taxYear: 2025,
  grossIncome: "75000",
  filingStatus: "single",
  state: "CA",
  selfEmploymentNetIncome: "",
  isSpecifiedServiceTradeOrBusiness: false,
  qualifiedBusinessW2Wages: "",
  qualifiedBusinessUbia: "",
  qualifyingChildren: "",
  otherDependents: "",
  studentLoanInterestPaid: "",
  mortgageInterest: "",
  propertyTax: "",
  stateIncomeTaxPaid: "",
  charitableDonations: "",
  medicalExpenses: "",
  dependentCareExpenses: "",
  dependentCareQualifyingPersons: "",
  qualifiedDividendsAndLTCG: "",
  shortTermCapitalGains: "",
  educationExpenses: "",
  educationCreditType: "aotc",
  hsaContribution: "",
  hsaCoverageType: "self-only",
  traditional401kContribution: "",
  traditionalIraContribution: "",
  isoExerciseSpread: "",
  privateActivityBondInterest: "",
};

/**
 * Convert the form's string-typed fields into the numeric shape
 * `estimateTax` expects. Lives here rather than in the page so that adding a
 * field to `TaxFormValues` can't leave it silently unwired.
 */
export function taxFormValuesToEstimateInput(values: TaxFormValues): TaxEstimateInput {
  const dollars = (v: string) => Number(v) || 0;
  return {
    grossIncome: dollars(values.grossIncome),
    filingStatus: values.filingStatus,
    state: values.state,
    taxYear: values.taxYear,
    selfEmploymentNetIncome: dollars(values.selfEmploymentNetIncome),
    isSpecifiedServiceTradeOrBusiness: values.isSpecifiedServiceTradeOrBusiness,
    qualifiedBusinessW2Wages: dollars(values.qualifiedBusinessW2Wages),
    qualifiedBusinessUbia: dollars(values.qualifiedBusinessUbia),
    qualifyingChildren: dollars(values.qualifyingChildren),
    otherDependents: dollars(values.otherDependents),
    studentLoanInterestPaid: dollars(values.studentLoanInterestPaid),
    mortgageInterest: dollars(values.mortgageInterest),
    propertyTax: dollars(values.propertyTax),
    stateIncomeTaxPaid: dollars(values.stateIncomeTaxPaid),
    charitableDonations: dollars(values.charitableDonations),
    medicalExpenses: dollars(values.medicalExpenses),
    dependentCareExpenses: dollars(values.dependentCareExpenses),
    dependentCareQualifyingPersons: dollars(values.dependentCareQualifyingPersons),
    qualifiedDividendsAndLTCG: dollars(values.qualifiedDividendsAndLTCG),
    shortTermCapitalGains: dollars(values.shortTermCapitalGains),
    educationExpenses: dollars(values.educationExpenses),
    educationCreditType: values.educationCreditType,
    hsaContribution: dollars(values.hsaContribution),
    hsaCoverageType: values.hsaCoverageType,
    traditional401kContribution: dollars(values.traditional401kContribution),
    traditionalIraContribution: dollars(values.traditionalIraContribution),
    isoExerciseSpread: dollars(values.isoExerciseSpread),
    privateActivityBondInterest: dollars(values.privateActivityBondInterest),
  };
}

interface TaxFormProps {
  values: TaxFormValues;
  onChange: (values: TaxFormValues) => void;
}

function DollarInput({
  id,
  label,
  value,
  onChange,
  step = 100,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  step?: number;
}) {
  const warning = getNegativeInputWarning(value);
  const warningId = `${id}-warning`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative mt-1">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
          $
        </span>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          aria-invalid={warning ? true : undefined}
          aria-describedby={warning ? warningId : undefined}
          className={`w-full rounded-md border py-2 pl-7 pr-3 text-sm focus:outline-none focus:ring-1 ${
            warning
              ? "border-red-400 focus:border-red-500 focus:ring-red-500"
              : "border-slate-300 focus:border-brand-500 focus:ring-brand-500"
          }`}
        />
      </div>
      {warning && (
        <p id={warningId} className="mt-1 text-xs text-red-600">
          {warning}
        </p>
      )}
    </div>
  );
}

function IntegerInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const warning = getNegativeInputWarning(value);
  const warningId = `${id}-warning`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        aria-invalid={warning ? true : undefined}
        aria-describedby={warning ? warningId : undefined}
        className={`mt-1 w-full rounded-md border py-2 px-3 text-sm focus:outline-none focus:ring-1 ${
          warning
            ? "border-red-400 focus:border-red-500 focus:ring-red-500"
            : "border-slate-300 focus:border-brand-500 focus:ring-brand-500"
        }`}
      />
      {warning && (
        <p id={warningId} className="mt-1 text-xs text-red-600">
          {warning}
        </p>
      )}
    </div>
  );
}

export default function TaxForm({ values, onChange }: TaxFormProps) {
  function update<K extends keyof TaxFormValues>(key: K, value: TaxFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label htmlFor="taxYear" className="block text-sm font-medium text-slate-700">
          Tax year
        </label>
        <select
          id="taxYear"
          value={values.taxYear}
          onChange={(e) => update("taxYear", Number(e.target.value) as TaxYear)}
          className="mt-1 w-full rounded-md border border-slate-300 py-2 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          {SUPPORTED_TAX_YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <DollarInput
        id="grossIncome"
        label="Wages / gross annual income (W-2, pre-tax, USD)"
        value={values.grossIncome}
        onChange={(v) => update("grossIncome", v)}
      />

      <div>
        <label htmlFor="filingStatus" className="block text-sm font-medium text-slate-700">
          Filing status
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
          State
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

      <div className="space-y-4 border-t border-slate-100 pt-4">
        <div>
          <p className="text-sm font-medium text-slate-700">Itemized deductions (optional)</p>
          <p className="mt-1 text-xs text-slate-500">
            Enter what you actually paid — we automatically compare the total
            against the standard deduction and use whichever is larger, for
            federal <strong>and separately for California</strong> (CA has no
            SALT cap and doesn&apos;t allow deducting state income tax on its
            own return).
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DollarInput
            id="mortgageInterest"
            label="Mortgage interest"
            value={values.mortgageInterest}
            onChange={(v) => update("mortgageInterest", v)}
          />
          <DollarInput
            id="propertyTax"
            label="Property tax"
            value={values.propertyTax}
            onChange={(v) => update("propertyTax", v)}
          />
          <DollarInput
            id="stateIncomeTaxPaid"
            label="State income tax paid"
            value={values.stateIncomeTaxPaid}
            onChange={(v) => update("stateIncomeTaxPaid", v)}
          />
          <DollarInput
            id="charitableDonations"
            label="Charitable donations"
            value={values.charitableDonations}
            onChange={(v) => update("charitableDonations", v)}
          />
        </div>
        <DollarInput
          id="medicalExpenses"
          label="Medical expenses (total, before the 7.5%-of-AGI threshold)"
          value={values.medicalExpenses}
          onChange={(v) => update("medicalExpenses", v)}
        />
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-4">
        <div>
          <p className="text-sm font-medium text-slate-700">Dependent care credit (optional)</p>
          <p className="mt-1 text-xs text-slate-500">
            Capped at $3,000 (one qualifying person) / $6,000 (two or more),
            at a rate up to 35% (2025) or up to 50% (2026 — an OBBBA
            increase; the 2026 rate schedule is an approximation pending
            final IRS guidance) depending on AGI. If you already use a
            Dependent Care FSA on the paycheck withholding calculator,
            subtract that amount here — the same expense can&apos;t get both
            FSA tax savings and this credit.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DollarInput
            id="dependentCareExpenses"
            label="Dependent care expenses paid"
            value={values.dependentCareExpenses}
            onChange={(v) => update("dependentCareExpenses", v)}
          />
          <IntegerInput
            id="dependentCareQualifyingPersons"
            label="Qualifying persons"
            value={values.dependentCareQualifyingPersons}
            onChange={(v) => update("dependentCareQualifyingPersons", v)}
          />
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-4">
        <p className="text-sm font-medium text-slate-700">
          Additional income &amp; deductions (optional)
        </p>

        <div>
          <DollarInput
            id="selfEmploymentNetIncome"
            label="Self-employment net income"
            value={values.selfEmploymentNetIncome}
            onChange={(v) => update("selfEmploymentNetIncome", v)}
          />
          <p className="mt-1 text-xs text-slate-500">
            Net profit from self-employment/1099/gig work (Schedule C), before
            self-employment tax. We&apos;ll compute self-employment tax and its
            deductible half automatically, and also use it as your Qualified
            Business Income for the QBI deduction below.
          </p>
        </div>

        <div className="space-y-2 rounded-md border border-slate-100 bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-600">
            QBI (Section 199A) deduction — only matters if self-employment
            net income is entered above
          </p>
          <label htmlFor="isSpecifiedServiceTradeOrBusiness" className="flex items-center gap-2 text-sm text-slate-700">
            <input
              id="isSpecifiedServiceTradeOrBusiness"
              type="checkbox"
              checked={values.isSpecifiedServiceTradeOrBusiness}
              onChange={(e) => update("isSpecifiedServiceTradeOrBusiness", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            This is a Specified Service Trade or Business (SSTB — e.g. law,
            medicine, consulting, financial/investment services)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <DollarInput
              id="qualifiedBusinessW2Wages"
              label="W-2 wages paid by the business"
              value={values.qualifiedBusinessW2Wages}
              onChange={(v) => update("qualifiedBusinessW2Wages", v)}
            />
            <DollarInput
              id="qualifiedBusinessUbia"
              label="Business property basis (UBIA)"
              value={values.qualifiedBusinessUbia}
              onChange={(v) => update("qualifiedBusinessUbia", v)}
            />
          </div>
          <p className="text-xs text-slate-500">
            These two only limit the deduction once taxable income is high
            enough to enter the QBI phase-in range — most solo freelancers
            with no employees and no business property leave both at $0.
            Simplified to a single business (no multi-business aggregation);
            SSTB phase-in is approximated as a straight-line reduction.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <IntegerInput
            id="qualifyingChildren"
            label="Qualifying children (under 17)"
            value={values.qualifyingChildren}
            onChange={(v) => update("qualifyingChildren", v)}
          />
          <IntegerInput
            id="otherDependents"
            label="Other dependents"
            value={values.otherDependents}
            onChange={(v) => update("otherDependents", v)}
          />
        </div>
        <p className="-mt-2 text-xs text-slate-500">
          Child Tax Credit ($2,200/child) and Credit for Other Dependents
          ($500 each), phased out above $200,000 MAGI ($400,000 if married
          filing jointly). Reduces federal tax only. The child count here is
          also used for the <strong>Earned Income Tax Credit</strong>, which
          we check automatically from your earned income — no extra input
          needed. (The IRS&apos;s qualifying-child test for the EITC differs
          slightly from the Child Tax Credit&apos;s; this tool treats them as
          the same count.)
        </p>

        <div>
          <DollarInput
            id="studentLoanInterestPaid"
            label="Student loan interest paid"
            value={values.studentLoanInterestPaid}
            onChange={(v) => update("studentLoanInterestPaid", v)}
            step={10}
          />
          <p className="mt-1 text-xs text-slate-500">
            Capped at $2,500 and phased out at higher incomes. Not available
            if your filing status is Married Filing Separately.
          </p>
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-4">
        <div>
          <p className="text-sm font-medium text-slate-700">Investment income (optional)</p>
          <p className="mt-1 text-xs text-slate-500">
            <strong>How long you held the asset changes the rate.</strong>{" "}
            Long-term gains (held more than one year) and qualified dividends
            get preferential 0%/15%/20% federal rates, stacked on top of your
            ordinary income. Short-term gains (held one year or less) get no
            break at all — they&apos;re taxed in your ordinary brackets. Both
            count as investment income for the 3.8% Net Investment Income
            Tax. California has no preferential rate — it taxes both the same
            as ordinary income.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DollarInput
            id="qualifiedDividendsAndLTCG"
            label="Long-term gains + qualified dividends (held > 1 year)"
            value={values.qualifiedDividendsAndLTCG}
            onChange={(v) => update("qualifiedDividendsAndLTCG", v)}
          />
          <DollarInput
            id="shortTermCapitalGains"
            label="Short-term capital gains (held ≤ 1 year)"
            value={values.shortTermCapitalGains}
            onChange={(v) => update("shortTermCapitalGains", v)}
          />
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-4">
        <div>
          <p className="text-sm font-medium text-slate-700">Education credit (optional)</p>
          <p className="mt-1 text-xs text-slate-500">
            Enter tuition and required fees you paid, then pick which credit
            you qualify for — you can&apos;t claim both for the same student
            in the same year. The{" "}
            <strong>American Opportunity Credit</strong> is worth more (up to
            $2,500, and 40% of it is refundable) but only covers the first
            four years of undergraduate study, half-time or more. The{" "}
            <strong>Lifetime Learning Credit</strong> is up to $2,000 (20% of
            expenses) with no year limit, and isn&apos;t refundable. Both
            phase out between $80,000 and $90,000 of income ($160,000 to
            $180,000 married filing jointly) and neither is available if you
            file separately.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DollarInput
            id="educationExpenses"
            label="Qualified education expenses"
            value={values.educationExpenses}
            onChange={(v) => update("educationExpenses", v)}
          />
          <div>
            <label htmlFor="educationCreditType" className="block text-sm font-medium text-slate-700">
              Which credit
            </label>
            <select
              id="educationCreditType"
              value={values.educationCreditType}
              onChange={(e) => update("educationCreditType", e.target.value as EducationCreditType)}
              className="mt-1 w-full rounded-md border border-slate-300 py-2 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="aotc">American Opportunity Credit</option>
              <option value="llc">Lifetime Learning Credit</option>
            </select>
          </div>
        </div>
        <p className="-mt-2 text-xs text-slate-500">
          Simplified: one student&apos;s expenses under one credit. We
          don&apos;t track the American Opportunity Credit&apos;s four-year
          per-student limit, and we assume the amount you enter is already
          net of any tax-free scholarships or grants.
        </p>
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-4">
        <div>
          <p className="text-sm font-medium text-slate-700">Retirement &amp; HSA contributions (optional)</p>
          <p className="mt-1 text-xs text-slate-500">
            Traditional (pre-tax) contributions reduce your taxable income,
            capped at the annual IRS limit (age 50+/55+ catch-up amounts
            aren&apos;t modeled). <strong>California doesn&apos;t recognize
            HSAs</strong> — the HSA deduction reduces federal tax only, not
            CA.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DollarInput
            id="traditional401kContribution"
            label="Traditional 401(k)/403(b)"
            value={values.traditional401kContribution}
            onChange={(v) => update("traditional401kContribution", v)}
          />
          <DollarInput
            id="traditionalIraContribution"
            label="Traditional IRA"
            value={values.traditionalIraContribution}
            onChange={(v) => update("traditionalIraContribution", v)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DollarInput
            id="hsaContribution"
            label="HSA contribution"
            value={values.hsaContribution}
            onChange={(v) => update("hsaContribution", v)}
          />
          <div>
            <label htmlFor="hsaCoverageType" className="block text-sm font-medium text-slate-700">
              HDHP coverage
            </label>
            <select
              id="hsaCoverageType"
              value={values.hsaCoverageType}
              onChange={(e) => update("hsaCoverageType", e.target.value as "self-only" | "family")}
              className="mt-1 w-full rounded-md border border-slate-300 py-2 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="self-only">Self-only</option>
              <option value="family">Family</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-4">
        <div>
          <p className="text-sm font-medium text-slate-700">
            Alternative Minimum Tax (AMT) preference items (optional)
          </p>
          <p className="mt-1 text-xs text-slate-500">
            We automatically check whether you owe AMT based on your other
            inputs (mainly your SALT deduction, if any). These two items are
            only relevant if they apply to you — most filers leave both at
            $0. Simplified: doesn&apos;t model disqualifying ISO
            dispositions, AMT NOL carryforward, or AMT foreign tax credit;
            California&apos;s separate 7% AMT isn&apos;t modeled.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <DollarInput
              id="isoExerciseSpread"
              label="ISO exercise spread"
              value={values.isoExerciseSpread}
              onChange={(v) => update("isoExerciseSpread", v)}
            />
            <p className="mt-1 text-xs text-slate-500">
              Fair market value minus exercise price, for incentive stock
              options exercised and still held (not sold) this year.
            </p>
          </div>
          <div>
            <DollarInput
              id="privateActivityBondInterest"
              label="Private activity bond interest"
              value={values.privateActivityBondInterest}
              onChange={(v) => update("privateActivityBondInterest", v)}
            />
            <p className="mt-1 text-xs text-slate-500">
              Interest from private activity municipal bonds — federally
              tax-exempt, but not for AMT purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
