import type { Metadata } from "next";
import { Spline_Sans } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { AuthLayout } from "@/components/auth-layout";
import "./globals.css";

const splineSans = Spline_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Idea Bank",
  description:
    "매일 아침 5분, 키워드 조합 기반 비즈니스 아이디어 발산 + 평가 + 축적",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={splineSans.variable}>
      <body className="font-sans antialiased">
        <SessionProvider>
          <AuthLayout>{children}</AuthLayout>
        </SessionProvider>
      </body>
    </html>
  );
}
