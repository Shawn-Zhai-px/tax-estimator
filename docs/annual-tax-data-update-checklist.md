# Annual tax data update checklist

This project has two **independent** data surfaces that both need updating
every year, on different schedules, from different official sources. This
doc is a reusable checklist for doing that update — follow it top to bottom
whenever a new tax year needs to be added or an existing year's figures need
correcting.

## The two data surfaces

1. **`src/config/{year}/taxData.ts`** — the income tax estimator's
   per-year data, selected by the "Tax year" dropdown in `TaxForm.tsx`
   (`SUPPORTED_TAX_YEARS` in `src/config/types.ts`). Multiple years coexist
   side by side (currently 2025 and 2026); adding a year means adding a new
   folder, never overwriting an old one.
2. **`src/lib/paycheckData.ts`** — the paycheck withholding tool's data.
   Unlike the income tax side, this is **not** year-selectable — it's a
   single `PAYCHECK_TAX_YEAR` constant representing "the current year," and
   updating it means editing the file in place (old years aren't kept
   around, since paycheck withholding is inherently about the year you're
   currently being paid in).

Both are populated with in-code comments citing the specific official
source for each figure — keep that convention when you update them.

## When to run this

Federal figures for a given tax year are typically finalized by the IRS via
a Revenue Procedure published in **October or November of the prior year**
(e.g., the 2026 figures came from Rev. Proc. 2024-40 esque guidance issued
in late 2025). California's Franchise Tax Board and EDD typically publish
their own updated schedules on a similar fall/winter timeline. Practically:
check in **December** for the upcoming filing year, and re-check in
**January** in case anything was revised late.

## Part 1 — `src/config/{year}/taxData.ts`

For a **new** year: copy the most recent year's folder (e.g.
`src/config/2026/` → `src/config/2027/`), then update every field below
against that year's sources. For a **correction** to an existing year, only
touch the specific field(s) that were wrong.

| Field(s) | Official source to check |
|---|---|
| `federalStandardDeduction`, `federalBrackets` | IRS Revenue Procedure for the year (search "IRS Rev Proc \<year\> tax brackets"), cross-checked against [Tax Foundation's federal tax brackets page](https://taxfoundation.org/data/all/federal/) |
| `caStandardDeduction`, `caBrackets` (Schedule X/Y/Z) | CA FTB's Form 540 tax rate schedules PDF, published at `ftb.ca.gov/forms/<year>/<year>-540-tax-rate-schedules.pdf` |
| `caMentalHealthTaxThreshold`, `caMentalHealthTaxRate` | CA FTB — this is the flat $1M threshold / 1% rate from Prop 63 (now called the Behavioral Health Services Tax); rarely changes, but confirm it hasn't |
| `ssWageBase` | Social Security Administration's annual wage-base announcement (search "SSA \<year\> wage base") |
| `childTaxCredit`, `otherDependentCredit`, `ctcPhaseOutThreshold*` | IRS Pub. 972 / the year's Rev. Proc., cross-checked against any OBBBA (or successor legislation) amendments — these are legislated dollar amounts, not always inflation-indexed, so don't assume they moved |
| `studentLoanInterestMax`, `studentLoanPhaseOut` | IRC §221 / IRS Topic 456 — has been flat at $2,500 with the same phase-out range for years; confirm it's still unchanged rather than assuming |
| `saltCap`, `saltCapMfs`, `saltPhaseDownThreshold*`, `saltFloor*` | IRC §164(b)(7) as amended by OBBBA — indexed +1%/year through 2029, reverts to a flat $10,000 cap with no phase-down starting 2030. **Check which regime applies for the year you're adding.** |
| `dependentCareCredit` | Form 2441 / IRC §21. Confirm whether the year uses the pre-OBBBA "stepped" schedule (`schedule: "stepped"`, exact bracket math) or the post-OBBBA "smooth" one (`schedule: "smooth"`, currently modeled as an approximation — see the comment above `calculateDependentCareCreditRate` in `calculateTax.ts` for why, and re-verify the approximation still holds once the IRS publishes the actual 2026+ bracket table) |
| `capitalGainsBrackets` | IRS Rev. Proc. for the year — the 0%/15%/20% long-term capital gains thresholds. Note MFS's 15%/20% breakpoint is its own published figure, not simply half of MFJ's. |
| `eitc` | IRC §32 / the year's Rev. Proc., cross-checked against the IRS's "Earned income and EITC tables" page. `maxCredit`/`phaseOutThreshold*` are indexed by qualifying-child count `[0, 1, 2, 3-or-more]`; `investmentIncomeLimit` is a separate figure |
| `educationCredit` | IRC §25A / IRS Pub. 970 & Form 8863 instructions. The AOTC's $2,000/$2,000 tiers and 40% refundable fraction, and the LLC's $10,000 cap / 20% rate, have been frozen (not inflation-indexed) since the Taxpayer Certainty and Disaster Tax Relief Act of 2020 — confirm that's still true before assuming no change |
| `qbi` | IRC §199A / the year's Rev. Proc. — `thresholdLower`/`thresholdUpper` by filing status. Also re-check `minimumDeduction`: OBBBA's $400 minimum QBI deduction starts in 2026, so it's `0` for 2025 and needs to stay `0` for any pre-2026 year you might backfill |
| `amt` | Form 6251 instructions for the year. **Important**: OBBBA changed the AMT exemption phase-out rules starting 2026 (lower thresholds, phase-out rate doubled from 25% to 50%) — don't copy 2025's `phaseOutRate`/`phaseOutThreshold` forward without checking which regime the new year falls under |
| `hsaLimitSelfOnly`, `hsaLimitFamily` | IRS Rev. Proc. for HSA limits (usually published a full year ahead of the plan year — e.g. the 2026 HSA limits come out in mid-2025) |
| `traditional401kLimit`, `traditionalIraLimit` | IRS's annual retirement plan limits announcement (usually published in the fall for the following year) |

After editing the data file, also update:
- `SUPPORTED_TAX_YEARS` in `src/config/types.ts` (add the new year)
- `TAX_DATA_BY_YEAR` in `src/config/index.ts` (register the new import)

## Part 2 — `src/lib/paycheckData.ts`

| Field(s) | Official source to check |
|---|---|
| `PAYCHECK_TAX_YEAR` | Just the calendar year being updated to |
| `FEDERAL_WITHHOLDING_BRACKETS` | IRS Publication 15-T, "Percentage Method Tables for Automated Payroll Systems," Worksheet 1/annual brackets, for the year |
| `CA_WITHHOLDING_BRACKETS` | EDD's Method B (Exact Calculation) withholding schedule for the year, published as a PDF on edd.ca.gov |
| `SS_WAGE_BASE` | Same SSA announcement as Part 1's `ssWageBase` — should match exactly |
| `SS_RATE`, `MEDICARE_RATE`, `ADDL_MEDICARE_RATE`, `ADDL_MEDICARE_THRESHOLD` | These are statutory rates that essentially never change (6.2%/1.45%/0.9%, $200k threshold not inflation-indexed) — confirm rather than assume, but don't expect a diff |
| `STD_ADDBACK_MFJ`, `STD_ADDBACK_OTHER` | IRS Pub. 15-T's "standard deduction addback" figures used in the annualized-wage withholding formula for employees claiming Head of Household or not checking the multiple-jobs box |
| `FOUR_ZERO_ONE_K_ANNUAL_LIMIT` | IRS's annual retirement plan limits announcement — should match `traditional401kLimit` in Part 1 |
| `DEP_CARE_FSA_ANNUAL_LIMIT` | IRS/IRC §129 — has been $5,000 (Single/MFJ/HoH) for years; confirm rather than assume |
| `CA_SDI_RATE` | EDD's annual SDI rate announcement — this has moved before (e.g. dropped after the wage-base cap was removed in favor of a flat rate), don't assume it's stable |
| `CA_EXEMPTION_CREDIT_PER_ALLOWANCE`, `CA_EST_DED_PER_ALLOWANCE` | EDD's DE 44 (Employer's Guide) allowance-value tables for the year |
| `ROTH_CATCHUP_ANNUAL_LIMIT` | IRS's annual retirement plan limits announcement — SECURE 2.0's age-60-63 "super catch-up" tier |
| `FEDERAL_BONUS_LOW_RATE`, `FEDERAL_BONUS_HIGH_RATE`, `FEDERAL_BONUS_SUPPLEMENTAL_THRESHOLD` | IRS's optional flat-rate supplemental wage method (22%/37% split at $1M cumulative supplemental wages) — statutory, rarely changes |
| `CA_BONUS_FLAT_RATE` | EDD's supplemental wage flat withholding rate for the year |

## Part 3 — after updating either file

1. `npx tsc --noEmit` — a new year added to `SUPPORTED_TAX_YEARS` will fail
   to compile until every `Record<FilingStatus, ...>`-shaped field in the
   new data file is filled in for all four filing statuses, which is a
   useful forcing function against missing fields.
2. Add new hand-computed test assertions to `src/lib/__tests__/calculateTax.test.ts`
   (and `calculatePaycheck.test.ts` if `paycheckData.ts` changed) for the
   new year, following this project's existing convention: compute the
   expected value independently (by hand, from the bracket tables), not by
   calling the same production helper you're testing.
3. `npm test` — must stay at 100% passing, including every pre-existing
   year's assertions (a data update should never change a prior year's
   already-locked-in figures).
4. `npm run build` — confirms the new year renders correctly in the
   "Tax year" dropdown and doesn't break static generation.
5. Browser-check the new year manually: pick it in the dropdown, verify the
   bracket breakdown table and 1040/540 line references show the new
   figures, and confirm the disclaimer/export text doesn't need updating
   (e.g. if `dependentCareCreditIsApproximate` or `caDataIsProvisional`
   should flip for the new year once official data is confirmed final).
