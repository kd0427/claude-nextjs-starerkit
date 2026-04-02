# Notion 견적서 공유 서비스 MVP PRD

## 핵심 정보

**목적**: Notion에서 관리하는 견적서를 고객이 고유 링크로 웹에서 확인하고 PDF로 다운로드할 수 있게 한다
**사용자**: 프리랜서 또는 소규모 에이전시 운영자(어드민)와 그들의 고객(클라이언트)
**데이터 저장소**: Notion 데이터베이스 (별도 로컬 DB 없음)

---

## 사용자 여정

### 어드민 여정

```
1. 어드민 로그인 페이지
   ↓ 이메일/비밀번호 입력 후 로그인 버튼 클릭

2. 견적서 목록 페이지 (대시보드)
   → Notion API로 견적서 목록 자동 조회 (실시간)
   ↓ 특정 견적서의 "링크 생성" 버튼 클릭

3. 공유 링크 생성 완료 → Notion 페이지 속성 업데이트 → 클립보드 복사
   ↓ 고객에게 링크 전달 (이메일, 메신저 등)

4. 완료
```

### 클라이언트 여정

```
1. 고유 견적서 링크 접속 (예: /quote/abc123)
   ↓ 링크 유효성 자동 검증 (Notion에서 shareToken 조회)

   유효하지 않은 링크 → 에러 페이지 (링크 만료/없음 안내)
   유효한 링크 → 견적서 상세 페이지

2. 견적서 상세 페이지
   ↓ 견적서 내용 확인 후 "PDF 다운로드" 버튼 클릭

3. PDF 생성 → 브라우저 다운로드

4. 완료
```

---

## 기능 명세

### 1. MVP 핵심 기능

| ID | 기능명 | 설명 | MVP 필수 이유 | 관련 페이지 |
|----|--------|------|--------------|------------|
| **F001** | 견적서 목록 조회 | Notion API를 직접 호출하여 견적서 목록 실시간 조회 | 어드민 업무 흐름의 시작점 | 견적서 목록 페이지 |
| **F002** | 공유 링크 생성 | 견적서별 고유 UUID를 생성하여 Notion 페이지 속성에 저장, 공개 링크 복사 | 클라이언트에게 견적서를 전달하는 유일한 수단 | 견적서 목록 페이지 |
| **F003** | 견적서 웹 조회 | 고유 링크로 Notion에서 견적서 상세 내용을 조회하여 웹에서 렌더링 | 서비스의 핵심 가치 제공 | 견적서 상세 페이지 |
| **F004** | PDF 다운로드 | 웹에서 보이는 견적서를 PDF 파일로 저장 | 고객이 견적서를 보관/공유하는 수단 | 견적서 상세 페이지 |

### 2. MVP 필수 지원 기능

| ID | 기능명 | 설명 | MVP 필수 이유 | 관련 페이지 |
|----|--------|------|--------------|------------|
| **F010** | 어드민 인증 | 이메일/비밀번호 로그인 및 로그아웃 (환경 변수 기반 자격증명) | 견적서 관리 기능 보호 | 로그인 페이지 |
| **F011** | 링크 유효성 검증 | Notion에서 shareToken 존재 여부 및 만료 여부 확인 | 잘못된 링크 접근 시 안내 제공 | 견적서 상세 페이지, 에러 페이지 |

### 3. MVP 이후 기능 (제외)

- 견적서 승인/거절 상태 관리 (고객 피드백)
- 견적서 열람 알림 (조회 시 어드민 이메일 발송)
- 견적서 직접 수정 UI (Notion에서 관리)
- 다국어 지원
- 견적서 템플릿 커스터마이징

---

## 메뉴 구조

```
어드민 메뉴 (로그인 전)
└── 로그인 - F010

어드민 메뉴 (로그인 후)
├── 견적서 목록 - F001, F002
└── 로그아웃 - F010

클라이언트 접근 (인증 없음)
├── 견적서 상세 - F003, F004, F011
└── 에러 페이지 - F011
```

---

## 페이지별 상세 기능

### 로그인 페이지

> **구현 기능:** `F010` | **접근:** 비인증 사용자 전용 (로그인 시 자동 리디렉션)

| 항목 | 내용 |
|------|------|
| **역할** | 어드민 전용 인증 진입점 |
| **진입 경로** | 직접 URL 접근 또는 보호된 페이지 접근 시 자동 리디렉션 |
| **사용자 행동** | 이메일과 비밀번호를 입력하여 로그인 |
| **주요 기능** | - 이메일/비밀번호 입력 폼<br>- 입력값 유효성 검사 (이메일 형식, 비밀번호 필수)<br>- 로그인 실패 시 에러 메시지 표시<br>- **로그인** 버튼 |
| **다음 이동** | 성공 → 견적서 목록 페이지, 실패 → 에러 메시지 인라인 표시 |

---

### 견적서 목록 페이지

> **구현 기능:** `F001`, `F002` | **인증:** 로그인 필수 (미인증 시 로그인 페이지로 리디렉션)

| 항목 | 내용 |
|------|------|
| **역할** | 어드민 대시보드 - 모든 견적서 현황 파악 및 공유 링크 관리 |
| **진입 경로** | 로그인 성공 후 자동 이동 또는 헤더 메뉴 클릭 |
| **사용자 행동** | Notion 견적서 목록 확인, 공유 링크 생성 및 복사 |
| **주요 기능** | - 견적서 테이블 목록 표시 (F001): Notion API 실시간 조회, 견적서번호/고객사명/견적일/합계금액/링크 상태<br>- **새로고침** 버튼 (F001): Notion API 재조회 및 목록 갱신<br>- **링크 생성** 버튼 (F002): 미생성 견적서에 UUID shareToken 생성 → Notion 속성 업데이트<br>- **링크 복사** 버튼 (F002): 생성된 링크를 클립보드에 복사<br>- 로그아웃 버튼 |
| **다음 이동** | 링크 복사 완료 → 토스트 알림 표시 (현재 페이지 유지) |

---

### 견적서 상세 페이지

> **구현 기능:** `F003`, `F004`, `F011` | **인증:** 불필요 (공개 링크)

| 항목 | 내용 |
|------|------|
| **역할** | 고객이 견적서를 확인하고 PDF로 저장하는 핵심 페이지 |
| **진입 경로** | 어드민이 공유한 고유 링크 접속 (예: /quote/[uuid]) |
| **사용자 행동** | 견적서 내용 확인 후 PDF 다운로드 |
| **주요 기능** | - 링크 유효성 검증 (F011): Notion에서 shareToken 검색 → 존재/만료 여부 확인<br>- 견적서 헤더 표시 (F003): 견적서번호, 고객사명, 견적일, 유효기간, 담당자 정보<br>- 견적 항목 테이블 표시 (F003): 항목명, 수량, 단가, 금액 (행 단위)<br>- 금액 요약 표시 (F003): 공급가액, 부가세(10%), 합계금액<br>- 특이사항 표시 (F003)<br>- **PDF 다운로드** 버튼 (F004): 현재 페이지를 PDF로 변환하여 저장 |
| **다음 이동** | 유효하지 않은 링크 → 에러 페이지, PDF 다운로드 → 파일 저장 (현재 페이지 유지) |

---

### 에러 페이지

> **구현 기능:** `F011` | **인증:** 불필요

| 항목 | 내용 |
|------|------|
| **역할** | 유효하지 않은 견적서 링크 접근 시 사용자 안내 |
| **진입 경로** | 존재하지 않거나 만료된 견적서 링크 접속 시 자동 리디렉션 |
| **사용자 행동** | 에러 내용 확인 후 담당자 문의 |
| **주요 기능** | - 에러 유형별 메시지 표시 (링크 없음 / 링크 만료)<br>- 담당자 연락처 안내 문구 표시 |
| **다음 이동** | 없음 (종단 페이지) |

---

## 데이터 모델

> Notion 데이터베이스가 데이터 저장소 역할을 하며, 아래는 Notion 응답을 파싱하기 위한 TypeScript 인터페이스입니다.

### Notion 데이터베이스 속성 요구사항

서비스 사용 전 Notion 데이터베이스에 아래 속성이 반드시 존재해야 합니다.

| Notion 속성명 | Notion 속성 타입 | 대응 필드 | 비고 |
|--------------|----------------|----------|------|
| 견적서번호 | Title | quoteNumber | 페이지 제목 |
| 고객사명 | Rich Text | clientName | |
| 견적일 | Date | quoteDate | |
| 유효기간 | Date | validUntil | |
| 담당자명 | Rich Text | managerName | |
| 담당자이메일 | Email | managerEmail | |
| 담당자연락처 | Phone Number | managerPhone | |
| 특이사항 | Rich Text | note | nullable |
| 공급가액 | Number | supplyAmount | |
| 부가세 | Number | taxAmount | |
| 합계금액 | Number | totalAmount | |
| **ShareToken** | Rich Text | shareToken | 링크 생성 시 서비스가 기록 |
| **ShareTokenExpiredAt** | Date | shareTokenExpiredAt | 링크 생성 시 서비스가 기록 |

> **견적 항목(QuoteItem)**: 각 Notion 페이지 본문의 **테이블 블록**으로 관리 (항목명, 수량, 단가, 금액 열)

### Quote (견적서) 인터페이스

| 필드 | 설명 | 타입 |
|------|------|------|
| notionPageId | Notion 페이지 ID | string |
| quoteNumber | 견적서 번호 | string |
| clientName | 고객사명 | string |
| quoteDate | 견적일 | Date |
| validUntil | 견적 유효기간 | Date |
| managerName | 담당자명 | string |
| managerEmail | 담당자 이메일 | string |
| managerPhone | 담당자 연락처 | string |
| note | 특이사항 | string \| null |
| supplyAmount | 공급가액 | number |
| taxAmount | 부가세 | number |
| totalAmount | 합계금액 | number |
| shareToken | 공유 링크 UUID | string \| null |
| shareTokenExpiredAt | 링크 만료일 | Date \| null |

### QuoteItem (견적 항목) 인터페이스

| 필드 | 설명 | 타입 |
|------|------|------|
| itemName | 항목명 | string |
| quantity | 수량 | number |
| unitPrice | 단가 | number |
| amount | 금액 (수량 × 단가) | number |
| sortOrder | 항목 정렬 순서 | number |

---

## 기술 스택

### 프론트엔드 프레임워크

- **Next.js 15** (App Router) - 풀스택 프레임워크, 서버 컴포넌트 기반
- **TypeScript 5.6+** - 타입 안전성
- **React 19** - UI 라이브러리

### 스타일링 & UI

- **TailwindCSS v4** (설정 파일 없는 CSS-first 방식) - 유틸리티 CSS
- **shadcn/ui** - 고품질 React 컴포넌트 (new-york 스타일, neutral 베이스)
- **Lucide React** - 아이콘 라이브러리

### 폼 & 검증

- **React Hook Form 7.x** - 로그인 폼 상태 관리
- **Zod** - 입력값 스키마 검증

### 데이터 소스 (Notion)

- **@notionhq/client** - Notion API 공식 클라이언트
  - 견적서 목록 조회 (데이터베이스 쿼리)
  - 견적서 상세 조회 (페이지 + 블록)
  - shareToken 업데이트 (페이지 속성 수정)
- **Notion 데이터베이스** - 견적서 데이터 저장소 (별도 DB 불필요)

### PDF 생성

- **html2canvas + jsPDF** - 브라우저 기반 PDF 변환 및 다운로드

### 인증

- **NextAuth.js v5** (Auth.js) - Credentials Provider 기반 이메일/비밀번호 인증
- 자격증명은 환경 변수(`ADMIN_EMAIL`, `ADMIN_PASSWORD`)와 비교

### 배포 & 호스팅

- **Vercel** - Next.js 15 최적화 배포

### 패키지 관리

- **pnpm** - 의존성 관리

---

## 파일시스템 구조 (예상)

```
src/
  app/
    (admin)/                        # 어드민 라우트 그룹 (인증 필요)
      layout.tsx                    # 어드민 레이아웃 (인증 체크)
      quotes/
        page.tsx                    # 견적서 목록 페이지 (F001, F002)
    quote/
      [token]/
        page.tsx                    # 견적서 상세 페이지 (F003, F004, F011)
    login/
      page.tsx                      # 어드민 로그인 페이지 (F010)
    error/
      page.tsx                      # 에러 페이지 (F011)
    api/
      auth/[...nextauth]/
        route.ts                    # NextAuth 인증 엔드포인트
      quotes/
        [id]/share/route.ts         # POST /api/quotes/[id]/share (링크 생성, F002)
  components/
    quote/
      QuoteDocument.tsx             # 견적서 렌더링 컴포넌트 (F003, 인쇄/PDF 스타일 포함)
      QuoteItemTable.tsx            # 견적 항목 테이블 컴포넌트
      QuoteSummary.tsx              # 금액 요약 컴포넌트
    pdf/
      PdfDownloadButton.tsx         # PDF 다운로드 버튼 컴포넌트 (F004, "use client")
  lib/
    notion.ts                       # Notion API 클라이언트 (조회 + shareToken 업데이트)
    auth.ts                         # NextAuth 설정 (환경 변수 기반 자격증명)
    utils.ts                        # cn(), formatKRW() 유틸리티
  types/
    index.ts                        # 공통 타입 (Quote, QuoteItem 인터페이스)
```

---

## 환경 변수

```bash
# Notion 연동
NOTION_TOKEN=secret_xxxx              # Notion Integration Token
NOTION_DATABASE_ID=xxxx               # 견적서 Notion 데이터베이스 ID

# 인증
NEXTAUTH_SECRET=xxxx                  # NextAuth 세션 암호화 키
NEXTAUTH_URL=http://localhost:3000    # 서비스 도메인

# 어드민 계정 (환경 변수로 관리)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=xxxx
```
