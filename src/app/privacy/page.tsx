import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Federal & State Tax Tools",
  description:
    "How this tax estimator handles data: no personal information collected, no accounts, no tracking, everything computed in your browser.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <div className="mt-2 space-y-3 text-sm text-slate-600">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <Link href="/" className="inline-block py-2 text-sm text-brand-600 hover:underline">
          ← Back to the tools
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">Privacy Policy</h1>
        <p className="mt-1 text-sm text-slate-500">
          Last reviewed alongside the 2025/2026 tax-year data — see the tools for the current figures.
        </p>
      </header>

      <div className="space-y-4">
        <Section title="What we collect">
          <p>
            Only the numeric financial figures you type in to run an estimate: things like your
            wages, filing status, dependent counts, deduction and credit amounts, capital gains,
            and 401(k)/HSA contributions. That is the whole list — every field on both tools is a
            dollar amount, a count, a rate, a filing status, or a state.
          </p>
        </Section>

        <Section title="What we deliberately don&apos;t collect">
          <p>
            We never ask for your name, Social Security number, home address, email, phone
            number, or bank account details. There is no login, no account, and no way to save a
            scenario on our servers — because we don&apos;t have servers that see your inputs at
            all (see below). Nothing here is designed to identify you.
          </p>
        </Section>

        <Section title="Where your numbers go: nowhere">
          <p>
            Every calculation on this site — the income tax estimate, the paycheck withholding
            schedule, both PDF and CSV exports — runs entirely in your browser, in JavaScript,
            using the numbers you typed. Nothing you enter is sent to a server, logged, stored in
            a database, or shared with any third party. Refresh the page and it&apos;s gone,
            exactly like a pocket calculator.
          </p>
          <p>
            We don&apos;t run Google Analytics, Meta Pixel, or any other tracking or advertising
            script. There are no cookies used to identify you and nothing here talks to an ad
            network.
          </p>
        </Section>

        <Section title="Why we designed it this way">
          <p>
            This isn&apos;t just a preference — it reflects real, documented consequences from
            products that handled tax data less carefully. From 2018 to 2022, TaxAct (along with
            H&amp;R Block and TaxSlayer) embedded Meta Pixel and Google Analytics on pages where
            users entered names, emails, phone numbers, addresses, filing status, approximate
            AGI, refund/owed amounts, and dependents&apos; names — transmitting that data to
            Meta and Google for ad targeting. It triggered a Congressional investigation (which
            characterized the practice as reckless), an FTC warning, lawsuits from multiple state
            attorneys general, a certified federal class action, and a separate $275,000
            Connecticut settlement announced in August 2026.
          </p>
          <p>
            Separately, the FTC found TurboTax&apos;s &quot;free&quot; advertising deceptive and
            reached a $141 million multistate settlement, and found H&amp;R Block deliberately
            made it hard for users to downgrade from a paid tier back to a free one, reaching a
            $7 million settlement in 2025.
          </p>
          <p>
            This tool structurally can&apos;t repeat any of that: it never files a return with the
            IRS or any state agency, so it never needs the identifying information those products
            legally must collect to file on your behalf, and with no server receiving your inputs,
            there is no pixel, no analytics call, and no data store that could ever be misused,
            breached, or subpoenaed.
          </p>
        </Section>

        <Section title="Exports">
          <p>
            The &quot;Export PDF&quot; and &quot;Export CSV&quot; buttons generate the file
            entirely in your browser and hand it to your browser&apos;s normal download
            mechanism. We never see, receive, or store a copy.
          </p>
        </Section>

        <Section title="This is an estimator, not a filer">
          <p>
            This site never prepares or submits an actual tax return. It has no connection to the
            IRS, the California FTB, or any other tax authority&apos;s filing systems. Use it to
            get a rough, informed number — then file with a licensed preparer or authorized
            software of your choice.
          </p>
        </Section>

        <Section title="Questions">
          <p>
            This is an independent, non-commercial estimator. If something here seems inconsistent
            with how the tools actually behave, please treat this page — and not marketing copy —
            as the source of truth, and feel free to verify any claim yourself by inspecting the
            page&apos;s network requests in your browser&apos;s developer tools. See also the{" "}
            <Link href="/terms" className="text-brand-600 hover:underline">
              Terms of Use
            </Link>
            .
          </p>
        </Section>
      </div>
    </main>
  );
}
