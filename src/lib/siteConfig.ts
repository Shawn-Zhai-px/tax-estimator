/**
 * Shared site identity used by layout.tsx's metadata, sitemap.ts, robots.ts,
 * and the JSON-LD structured data — one place to update once this app has a
 * real production domain (set NEXT_PUBLIC_SITE_URL in the deployment
 * environment; the placeholder below is only a local-dev fallback).
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const SITE_NAME = "Federal & State Tax Tools";

export const SITE_DESCRIPTION =
  "Free federal and California/Texas income tax and paycheck withholding estimator. No account, no sign-up, no personal information collected — every figure is computed in your browser. Reference only, not tax advice.";
