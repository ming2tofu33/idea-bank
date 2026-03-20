"use client";

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  LayoutDashboard,
  Sparkles,
  Layers,
  Tags,
  Lightbulb,
  LogOut,
  FileText,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";

const NAV_ITEMS = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/generate", label: "발산 세션", icon: Sparkles },
  { href: "/ideas", label: "아이디어", icon: Layers },
  { href: "/blueprints", label: "Blueprints", icon: FileText },
  { href: "/keywords", label: "키워드 관리", icon: Tags },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-card bg-primary text-primary-foreground shadow-marshmallow">
            <Lightbulb className="size-5" />
          </div>
          <span className="text-lg font-bold text-foreground">Idea Bank</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                    >
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-3">
        <ThemeSwitcher />

        {/* User info + Logout */}
        {session?.user && (
          <div className="flex items-center gap-3 px-1">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt=""
                className="size-7 rounded-full"
              />
            ) : (
              <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {session.user.name?.[0] ?? "?"}
              </div>
            )}
            <span className="text-xs text-muted-foreground truncate flex-1">
              {session.user.name ?? session.user.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              aria-label="로그아웃"
              className="min-w-8 min-h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
