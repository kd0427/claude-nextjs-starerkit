import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminLayoutClient } from "@/components/layout/AdminLayoutClient";

/** 어드민 레이아웃 — 사이드바 + 메인 영역 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
