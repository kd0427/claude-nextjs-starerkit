# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개발 명령어

```bash
pnpm dev        # 개발 서버 (Turbopack)
pnpm build      # 프로덕션 빌드
pnpm start      # 프로덕션 서버 실행
pnpm lint       # ESLint 검사
```

shadcn/ui 컴포넌트 추가:
```bash
pnpm dlx shadcn@latest add <component-name>
```

## 아키텍처 개요

**Next.js 15 App Router** 기반 스타터킷으로, 서버 컴포넌트를 기본으로 하고 상호작용이 필요한 컴포넌트에만 `"use client"` 사용.

### 레이아웃 흐름
```
RootLayout (ThemeProvider 래핑)
├── Header (sticky, z-50)
├── main (flex-1)
│   └── 페이지 콘텐츠
└── Footer
```

### 폴더 구조
- `src/app/` — 파일 기반 라우팅 (App Router)
- `src/components/layout/` — Header, Footer, Sidebar, ThemeToggle
- `src/components/ui/` — shadcn/ui 컴포넌트 (button 등)
- `src/lib/utils.ts` — `cn()` 유틸리티 (clsx + tailwind-merge)
- `src/types/index.ts` — 공통 타입 (NavItem, SidebarSection, Theme)

## 주요 기술 사항

### TailwindCSS v4
- `tailwind.config.ts` 없음 — CSS-first 방식
- `postcss.config.mjs`에서 `@tailwindcss/postcss` 플러그인 사용
- 다크 모드: `@custom-variant dark (&:is(.dark *))` 방식 (`globals.css`)
- 색공간: OKLCH

### shadcn/ui
- 스타일: `new-york`, 베이스 컬러: `neutral`
- 컴포넌트는 `src/components/ui/`에 복사-붙여넣기 방식으로 추가됨
- `components.json`에 경로 별칭 설정됨

### 하이드레이션 안전 패턴
클라이언트 전용 컴포넌트(ThemeToggle 등)에서 하이드레이션 불일치 방지:
```typescript
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

### 경로 별칭
`tsconfig.json`에서 `@/*` → `./src/*` 매핑됨.
