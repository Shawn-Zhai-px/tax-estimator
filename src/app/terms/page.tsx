import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use — Federal & State Tax Tools",
  description:
    "The terms for using this free tax estimator: reference only, not tax advice, no professional relationship formed, provided as-is.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <div className="mt-2 space-y-3 text-sm text-slate-600">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <Link href="/" className="inline-block py-2 text-sm text-brand-600 hover:underline">
          ← Back to the tools
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">Terms of Use</h1>
        <p className="mt-1 text-sm text-slate-500">
          Last reviewed alongside the 2025/2026 tax-year data — see the tools for the current figures.
        </p>
      </header>

      <div className="space-y-4">
        <Section title="What this is">
          <p>
            This site provides free, unofficial estimates of U.S. federal and state (California and
            Texas) income tax and paycheck withholding, based on published IRS/FTB/EDD figures and the
            numbers you choose to enter. By using it, you agree to the terms below.
          </p>
        </Section>

        <Section title="Reference only — not tax, legal, or financial advice">
          <p>
            Nothing on this site is tax, legal, accounting, or financial advice, and using it does not
            create a client relationship, an advisory relationship, or any other professional
            relationship between you and anyone involved in building it. The figures are simplified
            estimates — see the disclaimer banner on each tool and the simplifications noted next to
            individual results (QBI, AMT, EITC, education credits, and others) for what is and isn&apos;t
            modeled. For any actual return or decision with real consequences, consult a licensed CPA,
            enrolled agent, or tax attorney, or use IRS/state-authorized filing software.
          </p>
        </Section>

        <Section title="Not a filing service">
          <p>
            This site never prepares, transmits, or submits a tax return to the IRS, the California
            FTB, the Texas Comptroller, or any other tax authority. It is an estimator, not a filer,
            and has no connection to any government filing system.
          </p>
        </Section>

        <Section title="Provided as-is, no warranty">
          <p>
            This site is provided &quot;as is&quot; and &quot;as available,&quot; without warranty of
            any kind, express or implied — including, without limitation, any warranty that the
            calculations are accurate, complete, current, or fit for a particular purpose. Tax law
            changes, and published figures can be revised after this site was last updated; always
            verify against irs.gov, ftb.ca.gov, or edd.ca.gov before relying on a number.
          </p>
        </Section>

        <Section title="Limitation of liability">
          <p>
            To the fullest extent permitted by law, the people who built and maintain this site are
            not liable for any loss or damage arising from your use of it or reliance on any estimate
            it produces — including underpayment penalties, missed credits, or any other financial
            consequence. You use this site, and any number it shows you, at your own risk.
          </p>
        </Section>

        <Section title="Acceptable use">
          <p>
            Use this site for its intended purpose — getting a rough personal tax estimate. Don&apos;t
            attempt to disrupt, overload, or reverse-engineer it for a purpose other than checking your
            own numbers, and don&apos;t use it to generate figures you intend to present as an official
            or certified calculation.
          </p>
        </Section>

        <Section title="Changes to these terms">
          <p>
            These terms may be updated as the site&apos;s features change (for example, alongside a new
            tax year&apos;s data or a new calculated feature). The &quot;last reviewed&quot; note at the
            top of this page reflects the most recent update. Continued use of the site after a change
            means you accept the updated terms.
          </p>
        </Section>

        <Section title="Privacy">
          <p>
            See the separate{" "}
            <Link href="/privacy" className="text-brand-600 hover:underline">
              Privacy Policy
            </Link>{" "}
            for what this site does and doesn&apos;t collect.
          </p>
        </Section>
      </div>
    </main>
  );
}
