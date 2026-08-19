import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "联邦/州个税估算工具 (参考用途)",
  description:
    "估算联邦及州个人所得税（目前支持加州与德州），仅供参考，不构成税务建议。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
