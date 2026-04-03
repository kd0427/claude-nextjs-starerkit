import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

/** 어드민 레이아웃 — 사이드바 + 메인 영역 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 ml-56 p-8 pb-12 flex flex-col items-center">
        <div className="w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
