"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <TooltipProvider>{children}</TooltipProvider>;
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* 모바일 전용 상단 헤더 — md 이상에서는 사이드바가 항상 보임 */}
          <header className="flex md:hidden items-center gap-3 px-4 py-3 border-b border-border bg-background sticky top-0 z-40">
            <SidebarTrigger />
            <span className="text-sm font-bold text-foreground">Idea Bank</span>
          </header>
          <main className="flex-1 px-4 py-6 sm:px-6 md:px-10 md:py-8 bg-background min-h-screen max-w-7xl mx-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
