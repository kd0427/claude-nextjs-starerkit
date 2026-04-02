# Development Guidelines — Notion 견적서 공유 서비스

## 1. 프로젝트 개요

- **서비스 목적**: Notion DB에서 견적서를 조회해 고객에게 고유 링크(`/quote/[token]`)로 공유하고 PDF 다운로드 제공
- **사용자**: 어드민(프리랜서/소규모 에이전시) + 클라이언트(인증 없음)
- **패키지 매니저**: `pnpm` 전용 (npm, yarn 사용 금지)
- **PRD 위치**: `docs/PRD.md` — 기능 명세의 최종 기준
- **로드맵**: `docs/ROADMAP.md`

---

## 2. 핵심 기술 스택

| 역할 | 라이브러리 |
|------|-----------|
| 프레임워크 | Next.js 15 (App Router), React 19 |
| 스타일링 | TailwindCSS v4 (CSS-first), shadcn/ui (new-york / neutral) |
| 아이콘 | lucide-react |
| 인증 | NextAuth.js v5 (Auth.js) — Credentials Provider |
| Notion 연동 | `@notionhq/client` |
| ORM | Prisma + PostgreSQL |
| PDF | html2canvas + jsPDF (브라우저 기반) |
| 폼 검증 | React Hook Form + Zod |

---

## 3. 라우트 구조 및 인증 규칙

```
/                        → 공개 (홈)
/login                   → 공개 (어드민 로그인)
/quote/[token]           → 공개 (클라이언트 견적서 상세)
/error                   → 공개 (에러 안내)

/(admin)/quotes          → 🔒 인증 필수 (NextAuth getServerSession 확인)

/api/auth/[...nextauth]  → NextAuth 핸들러
/api/quotes/sync         → 🔒 인증 필수 (Notion → DB 동기화, POST)
/api/quotes/[id]/share   → 🔒 인증 필수 (shareToken 생성, POST)
```

**규칙:**
- `(admin)` 라우트 그룹의 `layout.tsx`에서 반드시 `getServerSession()`으로 인증 확인 후 미인증 시 `/login`으로 `redirect()`
- API Route에서도 세션 확인 없이 로직 실행 금지
- `/quote/[token]` 페이지는 인증 없이 접근 가능 — 세션 체크 추가 금지

---

## 4. 데이터 흐름

```
Notion DB
  ↓  POST /api/quotes/sync  (어드민이 수동 동기화)
PostgreSQL (Prisma)
  ↓  서버 컴포넌트에서 prisma.quote.findMany() 등
웹 UI 렌더링
```

- **Notion → DB 동기화**: `src/lib/notion.ts`의 `fetchQuotesFromNotion()` 호출 → Prisma `upsert`
- **shareToken 생성**: `POST /api/quotes/[id]/share` → Notion 페이지 속성 업데이트 + DB 저장
- **클라이언트 견적서 조회**: `prisma.quote.findUnique({ where: { shareToken: token } })`

---

## 5. 핵심 파일 및 역할

| 파일 | 역할 | 수정 시 주의 |
|------|------|-------------|
| `src/types/index.ts` | 모든 도메인 타입 단일 소스 | 타입 변경 시 Prisma 스키마와 동기화 필수 |
| `src/lib/notion.ts` | Notion API 클라이언트 + 데이터 변환 | `Quote` 인터페이스 매핑 로직 집중 |
| `src/lib/auth.ts` | NextAuth.js 설정 | `handlers`, `auth`, `signIn`, `signOut` export |
| `src/lib/prisma.ts` | Prisma 클라이언트 싱글턴 | 수정 금지 (패턴 유지) |
| `prisma/schema.prisma` | DB 스키마 | 변경 후 반드시 `pnpm dlx prisma db push` 실행 |
| `src/app/globals.css` | TailwindCSS v4 + shadcn CSS 변수 | 다크모드 변수 삭제 금지 |
| `src/app/layout.tsx` | 루트 레이아웃 (ThemeProvider 포함) | Header/Footer 제거 금지 |
| `src/app/(admin)/layout.tsx` | 어드민 레이아웃 | 인증 체크 로직 반드시 여기에 추가 |

---

## 6. 타입 시스템 규칙

- 모든 도메인 타입은 `src/types/index.ts`에만 정의 — 별도 타입 파일 생성 금지
- API 응답은 반드시 `ApiResponse<T>` 래퍼 사용:
  ```typescript
  // ✅ 올바른 방식
  return NextResponse.json<ApiResponse<Quote>>({ success: true, data: quote });
  // ❌ 금지
  return NextResponse.json({ quote });
  ```
- `Quote.status` 값: `"draft" | "sent" | "accepted" | "rejected"` (Prisma enum: `DRAFT | SENT | ACCEPTED | REJECTED`)
- Prisma 결과를 프론트로 전달 시 `Date` 객체 → `string` 직렬화 필요 (Server Actions / API Route에서 처리)

---

## 7. 컴포넌트 위치 규칙

```
src/components/
  layout/       ← 전역 레이아웃 컴포넌트 (Header, Footer, ThemeToggle)
  quote/        ← 견적서 렌더링 컴포넌트 (QuoteDocument, QuoteItemTable, QuoteSummary)
  pdf/          ← PDF 관련 컴포넌트 (PdfDownloadButton)
  ui/           ← shadcn/ui 컴포넌트만 위치 (직접 생성 금지)
```

- `QuoteDocument`, `QuoteItemTable`, `QuoteSummary` — 서버 컴포넌트 유지 (PDF 인쇄 스타일 포함)
- `PdfDownloadButton` — 반드시 `"use client"` (브라우저 API 사용)
- shadcn/ui 컴포넌트는 `pnpm dlx shadcn@latest add <component>` 명령으로만 추가

---

## 8. TailwindCSS v4 규칙

- **`tailwind.config.ts` 파일 생성 금지** — v4는 CSS-first 방식
- `postcss.config.mjs`에 `@tailwindcss/postcss` 플러그인 사용 (수정 금지)
- 다크 모드: `globals.css`의 `@custom-variant dark (&:is(.dark *))` 방식 (class 기반)
- 색상: OKLCH 색공간 사용 (`globals.css`의 CSS 변수 참조)
- 커스텀 유틸리티 추가 시 `globals.css`에 `@layer utilities` 블록 사용

---

## 9. shadcn/ui 규칙

- 컴포넌트 추가: `pnpm dlx shadcn@latest add <component-name>`
- `src/components/ui/`에 자동 생성됨 — 직접 파일 생성 금지
- `cn()` 유틸리티는 `@/lib/utils`에서 import
- `components.json` 설정 수정 금지

---

## 10. NextAuth.js v5 구현 규칙

- `src/lib/auth.ts`에서 `{ handlers, auth, signIn, signOut }` export
- `src/app/api/auth/[...nextauth]/route.ts`에서 `handlers` 재export
- Credentials Provider: 환경변수 `ADMIN_EMAIL`, `ADMIN_PASSWORD`와 비교
- 세션 전략: JWT (`session: { strategy: "jwt" }`)
- 서버 컴포넌트에서 세션 조회: `auth()` 함수 사용
- **Prisma Adapter 사용 여부**: PRD 기준으로는 불필요하나 스키마에 `User` 모델 존재 — 구현 시 어드민 계정을 환경변수로만 관리

---

## 11. Notion API 규칙

- `src/lib/notion.ts`에서 `notionClient` 싱글턴으로 관리
- 환경변수: `NOTION_TOKEN`, `NOTION_DATABASE_ID`
- Notion 속성명 (한글) → TypeScript 필드 매핑:
  | Notion 속성명 | TypeScript 필드 |
  |--------------|----------------|
  | 견적서번호 (Title) | `quoteNumber` |
  | 고객사명 | `clientName` |
  | 견적일 | `quoteDate` |
  | 유효기간 | `validUntil` |
  | ShareToken | `shareToken` |
  | ShareTokenExpiredAt | `shareTokenExpiredAt` |
- 견적 항목(QuoteItem)은 Notion 페이지 본문의 **테이블 블록**에서 파싱

---

## 12. Prisma 규칙

- `src/lib/prisma.ts`: 싱글턴 패턴 유지 (`globalThis.__prisma` 캐싱)
- 스키마 변경 후 반드시: `pnpm dlx prisma db push` 또는 `pnpm dlx prisma migrate dev`
- `Quote.notionPageId`는 `@unique` — upsert 키로 사용
- `Quote.shareToken`은 `@unique @default(cuid())` — 외부에 노출되는 공유 토큰
- `QuoteItem`은 `onDelete: Cascade` — Quote 삭제 시 자동 삭제

---

## 13. 환경 변수

```bash
# Notion
NOTION_TOKEN=secret_xxxx
NOTION_DATABASE_ID=xxxx

# NextAuth
AUTH_SECRET=xxxx               # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# 어드민 계정 (환경 변수 기반)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=xxxx

# DB
DATABASE_URL=postgresql://...
```

- 환경변수는 `.env.local`에서 관리 (git 커밋 금지)
- 서버 컴포넌트/API Route에서만 접근 (클라이언트 노출 금지)
- `NEXT_PUBLIC_` 접두사 추가 금지 (모든 변수는 서버 전용)

---

## 14. 하이드레이션 안전 패턴

클라이언트 컴포넌트에서 서버/클라이언트 렌더링 불일치 방지:
```typescript
// ✅ 필수 패턴 (ThemeToggle 등 클라이언트 전용 UI)
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

---

## 15. 파일 수정 동시 규칙

| 수정 대상 | 함께 수정해야 할 파일 |
|----------|-------------------|
| `prisma/schema.prisma` 모델 변경 | `src/types/index.ts` 인터페이스 동기화 |
| `src/types/index.ts` 타입 변경 | `src/lib/notion.ts` 매핑 함수 확인 |
| `src/lib/auth.ts` 설정 변경 | `src/app/api/auth/[...nextauth]/route.ts` 확인 |
| shadcn/ui 컴포넌트 추가 | `src/components/ui/` 자동 생성됨 (수동 편집 금지) |

---

## 16. 금지 사항

- ❌ `tailwind.config.ts` 파일 생성
- ❌ `npm` 또는 `yarn` 명령어 사용 (`pnpm` 전용)
- ❌ `src/components/ui/` 파일 직접 생성 (shadcn CLI 사용)
- ❌ API Route에서 인증 없이 어드민 기능 실행
- ❌ 환경변수 `NEXT_PUBLIC_` 접두사 추가 (서버 전용)
- ❌ `console.log` 사용 (서버: `console.error`/`console.warn`, 클라이언트: 에러 바운더리)
- ❌ `src/types/index.ts` 외부에 도메인 타입 정의
- ❌ 클라이언트 컴포넌트에서 Prisma 직접 호출
- ❌ `/quote/[token]` 페이지에 인증 체크 추가 (공개 페이지)
- ❌ `prisma/schema.prisma` 수정 후 `pnpm dlx prisma db push` 없이 진행

---

## 17. AI 판단 기준

**서버 컴포넌트 vs 클라이언트 컴포넌트 판단:**
- 기본값: 서버 컴포넌트
- `useState`, `useEffect`, `onClick`, 브라우저 API 사용 시 → `"use client"` 추가
- PDF 다운로드(html2canvas), 클립보드 복사 → 반드시 클라이언트

**새 API Route 추가 시:**
1. `src/app/api/` 하위에 생성
2. 어드민 기능이면 세션 확인 로직 먼저 작성
3. 응답은 `NextResponse.json<ApiResponse<T>>()`로 래핑

**새 페이지 추가 시:**
- 어드민 전용 → `src/app/(admin)/` 하위에 생성
- 공개 → `src/app/` 직접 하위에 생성
