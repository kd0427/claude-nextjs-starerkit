"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { FileText, Plus, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { label: "대시보드", href: "/quotes", icon: LayoutDashboard },
  { label: "견적서 목록", href: "/quotes/list", icon: FileText },
  { label: "새 견적서", href: "/quotes/new", icon: Plus },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const handleNavClick = () => {
    onClose?.();
  };

  return (
    <>
      {/* 모바일 오버레이 배경 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* 데스크톱: 항상 표시 / 모바일: isOpen일 때만 표시 */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-56 flex-col border-r bg-card transition-transform duration-300",
          "hidden md:flex",
          isOpen && "flex translate-x-0",
          !isOpen && "-translate-x-full md:translate-x-0"
        )}
      >
      {/* 로고 */}
      <div className="flex h-14 items-center gap-2 px-5 border-b">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <FileText className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-base tracking-tight">견적서 관리</span>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          관리
        </p>
        {navItems.map((item) => {
          const isActive =
            item.href === "/quotes"
              ? pathname === "/quotes"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* 하단 */}
      <div className="border-t px-3 py-3 space-y-1">
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-xs text-muted-foreground">테마</span>
          <ThemeToggle />
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center justify-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </button>
      </div>
      </aside>
    </>
  );
}
