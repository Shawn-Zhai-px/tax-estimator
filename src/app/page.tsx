"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import IncomeTaxEstimatorTab from "@/components/tabs/IncomeTaxEstimatorTab";
import PaycheckWithholdingTab from "@/components/tabs/PaycheckWithholdingTab";

type TabKey = "income" | "paycheck";

const TABS: { key: TabKey; label: string }[] = [
  { key: "income", label: "Income Tax Estimate" },
  { key: "paycheck", label: "Paycheck Withholding" },
];

function TabbedHome() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab: TabKey = searchParams.get("tab") === "paycheck" ? "paycheck" : "income";

  function selectTab(tab: TabKey) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "income") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    router.push(query ? `/?${query}` : "/", { scroll: false });
  }

  function handleTabKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const nextIndex = e.key === "ArrowRight" ? (index + 1) % TABS.length : (index - 1 + TABS.length) % TABS.length;
    const nextTab = TABS[nextIndex];
    selectTab(nextTab.key);
    document.getElementById(`tab-${nextTab.key}`)?.focus();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Federal &amp; State Tax Tools
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Federal and state income tax and paycheck withholding estimator (currently supporting California
          CA / Texas TX) — reference only, not tax advice.
        </p>
      </header>

      <div className="mb-6">
        <DisclaimerBanner />
      </div>

      <div role="tablist" aria-label="Tax tools" className="mb-6 flex gap-1 border-b border-slate-200">
        {TABS.map((tab, index) => (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`tabpanel-${tab.key}`}
            tabIndex={activeTab === tab.key ? 0 : -1}
            onClick={() => selectTab(tab.key)}
            onKeyDown={(e) => handleTabKeyDown(e, index)}
            className={
              activeTab === tab.key
                ? "border-b-2 border-brand-600 px-4 py-2 text-sm font-medium text-brand-700"
                : "border-b-2 border-transparent px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Both tabs stay mounted so switching tabs never loses in-progress input. */}
      <div id="tabpanel-income" role="tabpanel" aria-labelledby="tab-income" tabIndex={0} hidden={activeTab !== "income"}>
        <IncomeTaxEstimatorTab />
      </div>
      <div id="tabpanel-paycheck" role="tabpanel" aria-labelledby="tab-paycheck" tabIndex={0} hidden={activeTab !== "paycheck"}>
        <PaycheckWithholdingTab />
      </div>

      <footer className="mt-10 border-t border-slate-200 pt-4 text-xs text-slate-500">
        <Link href="/privacy" className="inline-block py-2 hover:text-slate-600 hover:underline">
          Privacy policy
        </Link>
        <span className="mx-2">·</span>
        <Link href="/terms" className="inline-block py-2 hover:text-slate-600 hover:underline">
          Terms of use
        </Link>
        <span className="mx-2">·</span>
        Nothing you enter is sent to a server — everything above is computed in your browser.
      </footer>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense>
      <TabbedHome />
    </Suspense>
  );
}
