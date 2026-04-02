/** 하단 푸터 컴포넌트 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto flex items-center justify-center px-4 py-4">
        <p className="text-sm text-muted-foreground">
          © {currentYear} 견적서 공유 서비스. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
