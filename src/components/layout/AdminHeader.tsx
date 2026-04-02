"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

/** 어드민 레이아웃 헤더 - 로그아웃 버튼 포함 */
export function AdminHeader() {
  /** 로그아웃 처리 (TASK-008에서 signOut() 연결 예정) */
  const handleSignOut = () => {
    // TODO: signOut() - TASK-008에서 구현
    console.log("로그아웃");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between px-4">
        <span className="font-semibold">견적서 관리</span>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </Button>
      </div>
    </header>
  );
}
