// TODO: 어드민 영역 레이아웃
// - NextAuth.js getServerSession()으로 인증 확인
// - 미인증 시 /login 으로 리디렉션
// - 어드민 전용 사이드바 또는 내비게이션 포함 가능

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* TODO: 어드민 내비게이션 바 */}
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
