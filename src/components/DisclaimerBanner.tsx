export default function DisclaimerBanner() {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">Estimate only — not tax advice.</p>
      <p className="mt-1">
        This tool provides a rough, unofficial estimate of federal and state
        income tax based on standard deductions and published tax brackets.
        It does not account for credits, itemized deductions (beyond a
        simple override), payroll taxes, AMT, or your full financial
        situation, and it may contain errors or outdated figures. It is not
        prepared by a tax professional and does not file anything with the
        IRS or any state agency. For an actual return or any decision with
        real consequences, consult a licensed CPA / tax preparer or use IRS /
        state-authorized filing software.
      </p>
      <p className="mt-1 text-amber-700">
        本工具仅提供联邦及州个人所得税的粗略估算，仅供参考，不构成税务建议，也不代为报税。请以
        IRS / 各州税务机关的官方规则为准，或咨询持证税务顾问。
      </p>
    </div>
  );
}
