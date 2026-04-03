"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { Button } from "@/components/ui/button";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex">
      {/* 모바일 전용 상단 바 */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="메뉴 열기"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-semibold">견적서 관리</span>
        <div className="w-9" />
      </header>

      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 ml-0 md:ml-56 px-2 py-4 sm:px-4 md:px-6 md:py-6 lg:px-8 lg:py-8 pb-12 flex flex-col items-center mt-14 md:mt-0">
        <div className="w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
