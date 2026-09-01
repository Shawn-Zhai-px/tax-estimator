export default function DisclaimerBanner() {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">Estimate only — not tax advice.</p>
      <p className="mt-1">
        This tool provides a rough, unofficial estimate of federal and state
        income tax based on published tax brackets, the deductions/credits
        you enter, and your inputs elsewhere on this site. It does not
        account for payroll taxes withheld on W-2 wages (see the separate
        paycheck withholding tool for that) or your full financial situation,
        and it may contain errors or outdated figures. Its QBI, AMT, EITC,
        and education-credit calculations are simplified (a single business
        only, no multi-business aggregation for QBI; no disqualifying ISO
        dispositions, AMT NOL carryforward, AMT foreign tax credit, or
        California's separate AMT; the EITC approximates disqualified
        investment income and reuses the Child Tax Credit's qualifying-child
        count; education credits assume a single student under one credit).
        It is not prepared by a tax professional
        and does not file anything with the IRS or any state agency. For an
        actual return or any decision with real consequences, consult a
        licensed CPA / tax preparer or use IRS / state-authorized filing
        software.
      </p>
    </div>
  );
}
