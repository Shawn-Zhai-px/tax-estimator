"use client";

import {
  FILING_STATUS_LABELS,
  FilingStatus,
  STATES,
  StateCode,
  SUPPORTED_TAX_YEARS,
  TaxYear,
} from "@/config";

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
  hsaContribution: string;
  hsaCoverageType: "self-only" | "family";
  traditional401kContribution: string;
  traditionalIraContribution: string;
  isoExerciseSpread: string;
  privateActivityBondInterest: string;
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
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
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
          min={0}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-full rounded-md border border-slate-300 py-2 pl-7 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
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
          Tax year (税年)
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
        label="Wages / gross annual income (W-2, 税前年收入, USD)"
        value={values.grossIncome}
        onChange={(v) => update("grossIncome", v)}
      />

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
          <div>
            <label htmlFor="dependentCareQualifyingPersons" className="block text-sm font-medium text-slate-700">
              Qualifying persons
            </label>
            <input
              id="dependentCareQualifyingPersons"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={values.dependentCareQualifyingPersons}
              onChange={(e) => update("dependentCareQualifyingPersons", e.target.value)}
              placeholder="0"
              className="mt-1 w-full rounded-md border border-slate-300 py-2 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-4">
        <p className="text-sm font-medium text-slate-700">
          Additional income &amp; deductions (optional)
        </p>

        <div>
          <label htmlFor="selfEmploymentNetIncome" className="block text-sm font-medium text-slate-700">
            Self-employment net income
          </label>
          <div className="relative mt-1">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              $
            </span>
            <input
              id="selfEmploymentNetIncome"
              type="number"
              inputMode="decimal"
              min={0}
              step={100}
              value={values.selfEmploymentNetIncome}
              onChange={(e) => update("selfEmploymentNetIncome", e.target.value)}
              placeholder="0"
              className="w-full rounded-md border border-slate-300 py-2 pl-7 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
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
          <div>
            <label htmlFor="qualifyingChildren" className="block text-sm font-medium text-slate-700">
              Qualifying children (under 17)
            </label>
            <input
              id="qualifyingChildren"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={values.qualifyingChildren}
              onChange={(e) => update("qualifyingChildren", e.target.value)}
              placeholder="0"
              className="mt-1 w-full rounded-md border border-slate-300 py-2 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label htmlFor="otherDependents" className="block text-sm font-medium text-slate-700">
              Other dependents
            </label>
            <input
              id="otherDependents"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={values.otherDependents}
              onChange={(e) => update("otherDependents", e.target.value)}
              placeholder="0"
              className="mt-1 w-full rounded-md border border-slate-300 py-2 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
        <p className="-mt-2 text-xs text-slate-500">
          Child Tax Credit ($2,200/child) and Credit for Other Dependents
          ($500 each), phased out above $200,000 MAGI ($400,000 if married
          filing jointly). Reduces federal tax only.
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
            Long-term capital gains and qualified dividends are taxed at
            preferential 0%/15%/20% federal rates (stacked on top of your
            ordinary income) instead of ordinary brackets, and may trigger
            the 3.8% Net Investment Income Tax. California has no
            preferential rate — it taxes this the same as ordinary income.
          </p>
        </div>
        <DollarInput
          id="qualifiedDividendsAndLTCG"
          label="Long-term capital gains + qualified dividends"
          value={values.qualifiedDividendsAndLTCG}
          onChange={(v) => update("qualifiedDividendsAndLTCG", v)}
        />
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
