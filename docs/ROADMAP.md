# Notion 견적서 공유 서비스 MVP - 개발 로드맵

## 프로젝트 개요

Notion 데이터베이스를 직접 데이터 저장소로 활용하는 견적서 공유 서비스 MVP.
별도의 로컬 DB 없이 Notion API로 모든 견적서 데이터를 읽고 씁니다.

**핵심 기능:**
- Notion 견적서 목록 실시간 조회
- 공유 링크 생성 (Notion 속성 업데이트)
- 견적서 웹 렌더링 및 PDF 다운로드
- 어드민 인증 (환경 변수 기반)

---

## 개발 워크플로우

1. **작업 계획**: ROADMAP 확인 → 다음 Task 선택
2. **작업 구현**: 명세서 준수 → Playwright MCP로 E2E 테스트
3. **로드맵 업데이트**: 완료된 Task를 ✅로 표시

---

## 상태 표시

| 상태 | 의미 |
|------|------|
| 🔲 대기 | 아직 시작하지 않은 작업 |
| 🔄 진행중 | 현재 개발 중인 작업 |
| ✅ 완료 | 구현 및 테스트 완료 |

---

## 난이도 기준

| 난이도 | 기준 | 예상 시간 |
|--------|------|----------|
| 하 | 단순 설정, 타입 정의, UI 마크업 | 반나절 이하 |
| 중 | 로직 구현, API 연동 포함 | 1~2일 |
| 상 | 외부 서비스 연동, 복잡한 비즈니스 로직 | 2~4일 |

---

## 개발 단계

### Phase 1: 프로젝트 환경 설정 및 골격 구축

---

#### TASK-001: 패키지 설치 및 환경 변수 설정 ✅ 완료

> **난이도**: 하 | **예상 시간**: 2~3시간

**설치 패키지**
```bash
# Notion API
pnpm add @notionhq/client

# 인증
pnpm add next-auth@beta

# 폼 & 검증
pnpm add react-hook-form @hookform/resolvers zod

# PDF 생성
pnpm add html2canvas jspdf
pnpm add -D @types/jspdf
```

**환경 변수 설정** (`.env.local` 생성, `.env.example` 작성)
```bash
NOTION_TOKEN=secret_xxxx
NOTION_DATABASE_ID=xxxx
NEXTAUTH_SECRET=xxxx
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=xxxx
```

**체크리스트**
- [ ] 모든 패키지 설치 완료 및 `pnpm install` 성공
- [ ] `.env.local` 생성 및 필수 변수 확인
- [ ] `.env.example` 작성 (실제 값 제외)
- [ ] `.gitignore`에 `.env.local` 포함 확인

---

#### TASK-002: 전체 라우트 골격 및 빈 페이지 생성 ✅ 완료

> **난이도**: 하 | **예상 시간**: 2~3시간 | **의존성**: TASK-001

**생성 파일 목록**
- `src/app/(admin)/layout.tsx` - 어드민 레이아웃 (인증 체크 플레이스홀더)
- `src/app/(admin)/quotes/page.tsx` - 견적서 목록 (임시 텍스트)
- `src/app/quote/[token]/page.tsx` - 견적서 상세 (임시 텍스트)
- `src/app/login/page.tsx` - 로그인 (임시 텍스트)
- `src/app/error/page.tsx` - 에러 (임시 텍스트)
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth 핸들러 (빈 설정)
- `src/app/api/quotes/[id]/share/route.ts` - 링크 생성 API (빈 핸들러)

**체크리스트**
- [ ] 각 페이지 URL 브라우저 접속 및 렌더링 확인
- [ ] `pnpm dev` 오류 없이 실행

---

#### TASK-003: 타입 정의 완성 및 공통 유틸리티 정리 ✅ 완료

> **난이도**: 하 | **예상 시간**: 2~3시간 | **의존성**: TASK-002

**`src/types/index.ts` 업데이트**
```typescript
interface Quote {
  notionPageId: string
  quoteNumber: string
  clientName: string
  quoteDate: Date
  validUntil: Date
  managerName: string
  managerEmail: string
  managerPhone: string
  note: string | null
  supplyAmount: number
  taxAmount: number
  totalAmount: number
  shareToken: string | null
  shareTokenExpiredAt: Date | null
  items: QuoteItem[]
}

interface QuoteItem {
  itemName: string
  quantity: number
  unitPrice: number
  amount: number
  sortOrder: number
}

interface QuoteListItem extends Omit<Quote, 'items'> {}

interface ApiResponse<T> {
  data?: T
  error?: string
}

interface ShareLinkResult {
  url: string
  token: string
  expiredAt: Date
}
```

**`src/lib/utils.ts` 유틸리티 추가**
- `formatKRW(amount: number): string` - 한국 원화 포맷 (예: 1,000,000원)

**체크리스트**
- [ ] TypeScript 컴파일 오류 없음
- [ ] formatKRW 함수 동작 확인

---

### Phase 2: UI/UX 완성 (더미 데이터 활용)

---

#### TASK-004: 공통 UI 컴포넌트 및 shadcn/ui 추가 설치 ✅ 완료

> **난이도**: 하 | **예상 시간**: 3~4시간 | **의존성**: TASK-003

**shadcn/ui 컴포넌트 추가 설치**
```bash
pnpm dlx shadcn@latest add table badge toast card input label form separator
```

**신규 컴포넌트 생성**
- `src/components/layout/AdminHeader.tsx` - 어드민 헤더 (로그아웃 버튼)
- `src/components/ui/LoadingSpinner.tsx` - 로딩 인디케이터
- `src/components/ui/StatusBadge.tsx` - 링크 상태 배지 (생성됨 / 미생성 / 만료)
- `src/components/ui/CopyButton.tsx` - 클립보드 복사 버튼 (`"use client"`)

**체크리스트**
- [ ] shadcn 컴포넌트 정상 렌더링
- [ ] StatusBadge 3가지 상태 표시 확인

---

#### TASK-005: 로그인 페이지 UI 완성 ✅ 완료

> **난이도**: 하 | **예상 시간**: 3~4시간 | **의존성**: TASK-004

**`src/app/login/page.tsx` UI 완성**
- 이메일/비밀번호 입력 필드 (shadcn/ui Input, Label)
- 로그인 버튼 (로딩 상태: 비활성화 + 스피너)
- 폼 유효성 에러 메시지 영역
- 반응형 레이아웃 (모바일 중앙 정렬)

**체크리스트**
- [ ] 이메일 형식 오류 시 에러 메시지 렌더링 확인
- [ ] 로딩 상태 버튼 비활성화 확인
- [ ] 모바일(375px) 레이아웃 확인

---

#### TASK-006: 견적서 목록 페이지 UI 완성 ✅ 완료

> **난이도**: 중 | **예상 시간**: 1일 | **의존성**: TASK-004

**`src/app/(admin)/quotes/page.tsx` UI 완성** (하드코딩 더미 데이터)

**`src/components/quote/QuoteTable.tsx` 생성**
- 컬럼: 견적서번호, 고객사명, 견적일, 합계금액, 링크 상태, 액션
- 링크 미생성 → "링크 생성" 버튼
- 링크 생성완료 → "링크 복사" 버튼 + StatusBadge (생성됨)
- 링크 만료 → StatusBadge (만료) + "링크 재생성" 버튼
- 빈 목록 상태 UI

**페이지 구성 요소**
- AdminHeader 연결
- "새로고침" 버튼 (로딩 상태 처리)

**체크리스트**
- [ ] 더미 데이터로 테이블 렌더링 확인
- [ ] 링크 상태별 버튼/배지 표시 확인
- [ ] 빈 목록 상태 UI 표시 확인

---

#### TASK-007: 견적서 상세 페이지 UI 완성 ✅ 완료

> **난이도**: 중 | **예상 시간**: 1일 | **의존성**: TASK-004

**컴포넌트 생성**

`src/components/quote/QuoteDocument.tsx` - 견적서 문서 (더미 데이터, 인쇄/PDF 최적화)
- 견적서 헤더: 번호, 고객사명, 견적일, 유효기간, 담당자 정보

`src/components/quote/QuoteItemTable.tsx` - 항목 테이블
- 컬럼: 항목명, 수량, 단가, 금액
- sortOrder 기준 정렬

`src/components/quote/QuoteSummary.tsx` - 금액 요약
- 공급가액, 부가세(10%), 합계금액
- formatKRW 적용

`src/components/pdf/PdfDownloadButton.tsx` - PDF 버튼 골격 (`"use client"`)

**페이지 업데이트**
- `src/app/quote/[token]/page.tsx` - 컴포넌트 조합 완성
- `src/app/error/page.tsx` - 에러 유형별 메시지 UI 완성 (링크 없음 / 만료)

**체크리스트**
- [ ] 더미 데이터로 견적서 전체 렌더링 확인
- [ ] 금액 요약 합계 계산 정확성 (공급가액 + 부가세 = 합계)
- [ ] 에러 페이지 2가지 유형 메시지 확인

---

### Phase 3: 인증 시스템 구현

---

#### TASK-008: NextAuth.js v5 인증 구현 🔲 대기

> **난이도**: 중 | **예상 시간**: 1일 | **의존성**: TASK-005

**`src/lib/auth.ts` 작성**
- NextAuth Credentials Provider 설정
- `authorize` 콜백: 환경 변수(`ADMIN_EMAIL`, `ADMIN_PASSWORD`)와 직접 비교
- session, jwt 콜백 설정

**`src/app/api/auth/[...nextauth]/route.ts`** - NextAuth 핸들러 완성

**`src/app/(admin)/layout.tsx`** - 인증 체크 로직
- `getServerSession`으로 세션 확인
- 미인증 시 `/login`으로 리디렉션

**`src/app/login/page.tsx`** - 폼 로직 완성
- React Hook Form + Zod 스키마
- `signIn()` 호출 및 에러 처리
- 성공 시 `/quotes`로 리디렉션

**`middleware.ts`** - `/quotes` 라우트 보호

**AdminHeader** - 로그아웃 버튼 (`signOut()` 호출)

**테스트 체크리스트 (Playwright MCP)**
- [ ] 유효한 자격증명으로 로그인 성공 → `/quotes` 리디렉션
- [ ] 잘못된 비밀번호 입력 → 에러 메시지 표시
- [ ] 미인증 상태에서 `/quotes` 직접 접근 → `/login` 리디렉션
- [ ] 로그아웃 버튼 클릭 → 세션 종료 및 `/login` 이동
- [ ] 이메일 형식 오류 → Zod 에러 메시지

---

### Phase 4: Notion API 연동 및 핵심 비즈니스 로직

---

#### TASK-009: Notion API 클라이언트 구현 🔲 대기

> **난이도**: 상 | **예상 시간**: 2~3일 | **의존성**: TASK-003

**`src/lib/notion.ts` 전체 구현**

```typescript
/** Notion API 클라이언트 초기화 */
const notion = new Client({ auth: process.env.NOTION_TOKEN })

/** 견적서 목록 전체 조회 */
async function getQuotes(): Promise<QuoteListItem[]>

/** shareToken으로 특정 견적서 조회 */
async function getQuoteByShareToken(token: string): Promise<QuoteListItem | null>

/** 견적서 상세 조회 (페이지 블록 포함 - 견적 항목) */
async function getQuoteWithItems(notionPageId: string): Promise<Quote | null>

/** Notion 페이지에 shareToken 업데이트 */
async function updateShareToken(
  notionPageId: string,
  token: string,
  expiredAt: Date
): Promise<void>

/** Notion 속성을 QuoteListItem 타입으로 파싱 */
function parseNotionPageToQuote(page: PageObjectResponse): QuoteListItem

/** Notion 테이블 블록을 QuoteItem 배열로 파싱 */
function parseNotionBlocksToItems(blocks: BlockObjectResponse[]): QuoteItem[]
```

**Notion 속성명 매핑 상수**
```typescript
const NOTION_PROPERTY_MAP = {
  quoteNumber: '견적서번호',
  clientName: '고객사명',
  quoteDate: '견적일',
  validUntil: '유효기간',
  managerName: '담당자명',
  managerEmail: '담당자이메일',
  managerPhone: '담당자연락처',
  note: '특이사항',
  supplyAmount: '공급가액',
  taxAmount: '부가세',
  totalAmount: '합계금액',
  shareToken: 'ShareToken',
  shareTokenExpiredAt: 'ShareTokenExpiredAt',
}
```

**체크리스트**
- [ ] 실제 Notion API 응답 구조 콘솔 출력 확인
- [ ] `getQuotes()` 호출 결과 목록 정상 반환
- [ ] `getQuoteByShareToken()` 필터 쿼리 동작 확인
- [ ] `updateShareToken()` 호출 후 Notion에서 속성 변경 확인
- [ ] 필수 필드 누락 견적서 → 에러 없이 건너뜀 처리 확인

---

#### TASK-010: 견적서 목록 페이지 Notion 데이터 연결 🔲 대기

> **난이도**: 중 | **예상 시간**: 1일 | **의존성**: TASK-009, TASK-006

**`src/app/(admin)/quotes/page.tsx` 업데이트**
- 서버 컴포넌트에서 `getQuotes()` 호출 (Next.js `cache` 옵션 활용)
- 더미 데이터 제거 및 실제 Notion 데이터 연결
- "새로고침" 버튼: `router.refresh()` 호출 (`"use client"` 래퍼)

**테스트 체크리스트 (Playwright MCP)**
- [ ] 로그인 후 견적서 목록 Notion 데이터 정상 표시
- [ ] "새로고침" 버튼 클릭 → 목록 갱신
- [ ] Notion에 데이터 없는 경우 빈 목록 UI 표시

---

#### TASK-011: 공유 링크 생성 API 구현 🔲 대기

> **난이도**: 중 | **예상 시간**: 1일 | **의존성**: TASK-009, TASK-010

**`src/app/api/quotes/[id]/share/route.ts`** 완성
- `POST /api/quotes/[id]/share`
- 세션 인증 확인 (미인증 시 401)
- `crypto.randomUUID()`로 shareToken 생성
- `shareTokenExpiredAt` 설정 (기본값: 30일 후)
- `updateShareToken()` 호출 → Notion 속성 업데이트
- 공유 URL 반환 `{ url: "https://domain/quote/{token}" }`

**목록 페이지 연결**
- "링크 생성" 버튼: API 호출 → Notion 업데이트 → `router.refresh()`
- CopyButton: 클립보드 복사 + 성공 toast

**테스트 체크리스트 (Playwright MCP)**
- [ ] "링크 생성" 버튼 → Notion 속성 업데이트 및 버튼 상태 변화
- [ ] "링크 복사" 버튼 → 클립보드 복사 및 toast 표시
- [ ] 미인증 상태에서 `/api/quotes/[id]/share` → 401 반환

---

#### TASK-012: 견적서 상세 페이지 Notion 데이터 연결 🔲 대기

> **난이도**: 중 | **예상 시간**: 4~5시간 | **의존성**: TASK-011, TASK-007, TASK-008

**`src/app/quote/[token]/page.tsx`** 완성
- `getQuoteByShareToken(token)` 호출
- `shareToken` 없음 → `/error?reason=not_found` 리디렉션
- `shareTokenExpiredAt` 만료 → `/error?reason=expired` 리디렉션
- 유효 시 `getQuoteWithItems(notionPageId)` 호출
- QuoteDocument에 실제 데이터 전달 및 더미 데이터 제거

**`src/app/error/page.tsx`** - `reason` 쿼리 파라미터 기반 에러 분기

**테스트 체크리스트 (Playwright MCP)**
- [ ] 유효한 토큰 → 실제 견적서 데이터 렌더링
- [ ] 견적 항목 sortOrder 기준 오름차순 정렬
- [ ] 합계금액 계산 정확성
- [ ] 존재하지 않는 토큰 → 에러 페이지 (not_found 메시지)
- [ ] 만료된 토큰 → 에러 페이지 (expired 메시지)

---

### Phase 5: PDF 다운로드 기능

---

#### TASK-013: PDF 다운로드 기능 구현 🔲 대기

> **난이도**: 상 | **예상 시간**: 2~3일 | **의존성**: TASK-012

**`src/components/pdf/PdfDownloadButton.tsx`** 완성
- html2canvas로 `#quote-document` 요소 캡처 (scale: 2)
- jsPDF로 A4 크기 PDF 생성
- 다운로드 파일명: `견적서_${quoteNumber}_${clientName}.pdf`
- PDF 생성 중 로딩 상태 (버튼 비활성화 + 스피너)
- 생성 실패 시 에러 toast

**`src/components/quote/QuoteDocument.tsx`** 업데이트
- `id="quote-document"` 속성 추가
- 인쇄/PDF 최적화 스타일 적용 (페이지 여백, 폰트 크기)

**테스트 체크리스트 (Playwright MCP)**
- [ ] "PDF 다운로드" 버튼 → 파일 다운로드 트리거
- [ ] 파일명 형식 확인 (`견적서_XXXX_고객사명.pdf`)
- [ ] PDF 내 모든 데이터 (헤더, 항목, 금액 요약) 포함 확인
- [ ] 한글 폰트 깨짐 여부 확인
- [ ] 생성 중 버튼 로딩 상태 표시

---

### Phase 6: 통합 테스트 및 마무리

---

#### TASK-014: 전체 사용자 플로우 E2E 통합 테스트 🔲 대기

> **난이도**: 중 | **예상 시간**: 1일 | **의존성**: TASK-013

**Playwright MCP - 어드민 여정 전체 플로우**
1. 로그인 → 견적서 목록 확인 → 링크 생성 → 링크 복사

**Playwright MCP - 클라이언트 여정 전체 플로우**
1. 공유 링크 접근 → 견적서 확인 → PDF 다운로드

**에러 시나리오 테스트**
- 만료된 링크 접근
- 존재하지 않는 링크 접근
- 로그인 실패

**테스트 체크리스트**
- [ ] 어드민 여정 전체 플로우 성공
- [ ] 클라이언트 여정 전체 플로우 성공
- [ ] 에러 페이지 유형별 메시지 정확성
- [ ] 모바일 뷰포트(375px) 주요 페이지 레이아웃

---

#### TASK-015: 에러 핸들링 보강 및 UX 개선 🔲 대기

> **난이도**: 중 | **예상 시간**: 4~5시간 | **의존성**: TASK-014

**구현 사항**
- Notion API 호출 실패 시 사용자 친화적 에러 메시지
- 네트워크 오류 시 재시도 안내 UI
- `src/app/error.tsx` - Next.js 내장 에러 바운더리
- `src/app/loading.tsx` - 페이지 로딩 상태
- 견적서 유효기간 만료 임박 (7일 이내) 배지 경고 표시
- Notion API 레이트 리밋 대응 (재시도 로직)

---

#### TASK-016: 배포 준비 🔲 대기

> **난이도**: 중 | **예상 시간**: 1일 | **의존성**: TASK-015

**구현 사항**
- `pnpm build` 오류 제로 확인
- `pnpm lint` TypeScript 에러 제로 확인
- Vercel 환경 변수 설정
  - `NOTION_TOKEN`, `NOTION_DATABASE_ID`
  - `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (프로덕션 도메인)
  - `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- Vercel 배포 연결 및 Preview 환경 동작 확인

**체크리스트**
- [ ] `pnpm build` 성공 (빌드 에러 제로)
- [ ] `pnpm lint` 경고/에러 제로
- [ ] Vercel Preview 환경 로그인 플로우 동작
- [ ] Vercel Preview 환경 공유 링크 플로우 동작

---

## 의존성 맵

```
TASK-001 (패키지/환경)
  └── TASK-002 (라우트 골격)
        └── TASK-003 (타입 정의)
              ├── TASK-004 (공통 UI)
              │     ├── TASK-005 (로그인 UI)
              │     │     └── TASK-008 (NextAuth 인증)
              │     ├── TASK-006 (목록 UI)
              │     └── TASK-007 (상세 UI)
              └── TASK-009 (Notion API 클라이언트)
                    ├── TASK-010 (목록 Notion 연결) ← TASK-006 완료 필요
                    │     └── TASK-011 (링크 생성 API)
                    │           └── TASK-012 (상세 Notion 연결) ← TASK-007, TASK-008 완료 필요
                    │                 └── TASK-013 (PDF 다운로드)
                    │                       └── TASK-014 (E2E 통합 테스트)
                    │                             ├── TASK-015 (에러 핸들링)
                    │                             └── TASK-016 (배포)
```

---

## 진행 현황 (기준: 2026-04-02)

| Phase | 작업 수 | 완료 | 진행중 | 대기 |
|-------|---------|------|--------|------|
| Phase 1: 환경 설정 | 3 | 3 | 0 | 0 |
| Phase 2: UI/UX | 4 | 4 | 0 | 0 |
| Phase 3: 인증 | 1 | 0 | 0 | 1 |
| Phase 4: Notion 연동 | 4 | 0 | 0 | 4 |
| Phase 5: PDF | 1 | 0 | 0 | 1 |
| Phase 6: 마무리 | 3 | 0 | 0 | 3 |
| **합계** | **16** | **7** | **0** | **9** |

---

## MVP 이후 백로그

| 우선순위 | 기능명 | 설명 |
|----------|--------|------|
| **높음** | 견적서 열람 알림 | 클라이언트 조회 시 어드민에게 이메일 알림 |
| **높음** | 견적서 승인/거절 | 클라이언트가 웹에서 직접 승인/거절 처리 |
| **중간** | 링크 유효기간 커스텀 | 생성 시 만료일 직접 지정 (기본값 30일) |
| **중간** | 견적서 목록 검색/필터 | 고객사명, 기간, 링크 상태 기반 필터링 |
| **중간** | Notion 응답 캐싱 최적화 | Next.js revalidate 전략 개선 |
| **낮음** | 다국어 지원 | 한국어/영어 전환 (i18n) |
| **낮음** | 견적서 템플릿 커스터마이징 | 로고, 회사 정보, 색상 테마 변경 |
| **낮음** | 조회 통계 대시보드 | 링크 조회 횟수, 최근 조회 시각 |
