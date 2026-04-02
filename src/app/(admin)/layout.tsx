import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminHeader } from "@/components/layout/AdminHeader";

/** 어드민 레이아웃 — 미인증 시 /login 리디렉션 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
