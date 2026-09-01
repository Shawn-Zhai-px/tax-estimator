import type { Metadata } from "next";
import "./globals.css";

const title = "Federal & State Tax Tools — Income Tax & Paycheck Withholding Estimator";
const description =
  "Free federal and California/Texas income tax and paycheck withholding estimator. No account, no sign-up, no personal information collected — every figure is computed in your browser. Reference only, not tax advice.";

export const metadata: Metadata = {
  title,
  description,
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
