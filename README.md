# Tax Estimator (联邦/州个税估算工具)

A simple web app that estimates U.S. federal and state (currently California
and Texas) income tax based on published tax brackets and standard
deductions. It lets you export the estimate as a **PDF summary** or a **CSV
table**.

> **This is a reference/estimation tool only. It is not tax advice, does not
> file anything, and should not be relied on for actual tax decisions.** See
> the in-app disclaimer and the "Scope & assumptions" section below.

## Tech stack

- [Next.js](https://nextjs.org/) 14 (App Router) + React 18 + TypeScript
- Tailwind CSS for styling
- [jsPDF](https://github.com/parallax/jsPDF) for client-side PDF export
- Plain CSV export (no extra dependency — opens directly in Excel/Sheets)

## Getting started

This project was scaffolded in an environment without npm registry access,
so dependencies have **not** been installed or the app run/built yet. On
your own machine, with normal internet access:

```bash
cd tax-estimator
npm install
npm run dev
```

Then open http://localhost:3000.

To run the calculation logic's self-contained test suite (no dependencies
required beyond `tsx`, which is already listed in devDependencies):

```bash
npm test
```

To build for production:

```bash
npm run build
npm start
```

## Project structure

```
src/
  app/
    layout.tsx        # Root layout, page metadata
    page.tsx           # Main page: form + results + export buttons
    globals.css         # Tailwind entry point
  components/
    TaxForm.tsx         # Income / filing status / state inputs
    ResultsPanel.tsx     # Summary stats + bracket breakdown tables
    DisclaimerBanner.tsx # Prominent "not tax advice" banner
  lib/
    taxData.ts           # Federal + CA bracket/deduction constants (with sources)
    calculateTax.ts       # Progressive-bracket calculation engine
    exportPdf.ts           # jsPDF-based PDF export
    exportCsv.ts            # CSV export
    format.ts                 # Currency/percent formatting helpers
    __tests__/calculateTax.test.ts  # Self-contained checks (run via `npm test`)
```

## Scope & assumptions (read before trusting any number)

- **Tax year:** 2025 (the return filed in 2026). Figures were retrieved in
  August 2026 from the IRS, the Tax Foundation, and the California Franchise
  Tax Board; see comments at the top of `src/lib/taxData.ts` for exact
  sources. Tax rules change — always confirm against irs.gov / ftb.ca.gov.
- **States supported:** California (CA) and Texas (TX, which has no state
  income tax) only. Extending to more states means adding a new bracket
  table + standard deduction to `taxData.ts` and (if the state has one) any
  state-specific surtax to `calculateTax.ts`, following the same pattern
  used for CA's Mental Health Services Tax.
- **Filing statuses:** Single, Married Filing Jointly, Head of Household,
  Married Filing Separately.
- **Deductions:** Federal uses the standard deduction by default, or a
  user-entered itemized amount if it's larger. California always uses its
  own standard deduction in this MVP (CA itemization rules differ from
  federal and are not modeled).
- **Not included (by design, to keep the MVP honest and simple):**
  - Payroll taxes (Social Security, Medicare, Additional Medicare Tax, CA
    SDI/PFL).
  - Tax credits (Child Tax Credit, EITC, education credits, etc.).
  - AMT (Alternative Minimum Tax) and Net Investment Income Tax.
  - Self-employment tax.
  - California's small personal/dependent exemption *credits* (roughly
    $150–$300 depending on filing status) — omitting these makes the CA
    estimate slightly conservative (a small overestimate of CA tax owed).
  - Any state other than CA/TX.

Because of the omissions above, treat every number as a rough planning
estimate, not a prediction of your actual tax bill or refund.

## Suggested next steps

- Add more states (NY, WA, FL, etc.) by extending `taxData.ts`.
- Add payroll tax (FICA) as a separate, clearly-labeled line item.
- Persist recent estimates (e.g., in-memory or local state) so a user can
  compare scenarios side by side.
- Add automated UI tests (e.g., Playwright) once dependencies are installed.
