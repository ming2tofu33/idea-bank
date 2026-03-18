import type { Metadata } from "next";
import { Spline_Sans } from "next/font/google";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
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
        <TooltipProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <main className="flex-1 px-4 py-6 sm:px-6 md:px-10 md:py-8 bg-background min-h-screen max-w-7xl mx-auto">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
