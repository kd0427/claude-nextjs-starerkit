/** 내비게이션 항목 타입 */
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

/** 테마 타입 */
export type Theme = "light" | "dark" | "system";

// ---------------------------------------------------------------------------
// 도메인 타입 (실제 Notion DB 구조 기준)
// ---------------------------------------------------------------------------

/**
 * 견적서 상태
 * Notion invoices DB '상태' 속성값과 일치
 */
export type QuoteStatus = "대기" | "승인" | "거절" | "만료";

/**
 * 견적서 단일 항목
 * Notion items DB 컬럼: 항목명, 수량, 단가, 금액
 */
export interface QuoteItem {
  /** 항목명 */
  itemName: string;
  /** 수량 */
  quantity: number;
  /** 단가 */
  unitPrice: number;
  /** 금액 (quantity * unitPrice) */
  amount: number;
  /** 정렬 순서 */
  sortOrder?: number;
}

/**
 * 견적서 전체 (항목 포함)
 * Notion invoices DB 컬럼: 견적서 번호, 발행일, 상태, 유효기간, 총 금액, 클라이언트명
 * items는 별도 items DB에서 invoice relation으로 조회
 */
export interface Quote {
  /** Notion 페이지 ID */
  notionPageId: string;
  /** 견적서 번호 */
  quoteNumber: string;
  /** 클라이언트명 */
  clientName: string;
  /** 발행일 */
  quoteDate: Date;
  /** 유효기간 */
  validUntil: Date;
  /** 상태 */
  status: QuoteStatus;
  /** 총 금액 */
  totalAmount: number;
  /** 공유 토큰 (Notion에 별도 추가 필요: ShareToken 속성) */
  shareToken: string | null;
  /** 공유 토큰 만료일 (Notion에 별도 추가 필요: ShareTokenExpiredAt 속성) */
  shareTokenExpiredAt: Date | null;
  /** 견적 항목 목록 (items DB에서 조회) */
  items: QuoteItem[];
}

/** 견적서 목록용 (항목 제외) */
export type QuoteListItem = Omit<Quote, "items">;

/** API 응답 공통 래퍼 */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}

/** 공유 링크 생성 결과 */
export interface ShareLinkResult {
  url: string;
  token: string;
  expiredAt: Date;
}
