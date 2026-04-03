import { Client, APIResponseError } from "@notionhq/client";
import type { Quote, QuoteItem, QuoteListItem, CreateQuoteInput, UpdateQuoteInput, QuoteStatus, TaxType } from "@/types";

/** Notion API 클라이언트 싱글턴 */
const notion = new Client({ auth: process.env.NOTION_API_KEY });

/**
 * Notion API 레이트 리밋(429) 대응 exponential backoff 재시도 래퍼
 * 최대 3회 재시도, 초기 대기 1초에서 2배씩 증가
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isRateLimit = err instanceof APIResponseError && err.status === 429;
      if (!isRateLimit || attempt === maxRetries) throw err;
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt))
      );
    }
  }
  throw lastError;
}

/** invoices DB ID */
const INVOICES_DB_ID = process.env.NOTION_DATABASE_ID!;

/** items DB ID */
const ITEMS_DB_ID = process.env.NOTION_ITEMS_DATABASE_ID!;

/**
 * Notion 실제 속성명 매핑
 * invoices DB: 견적서 번호, 발행일, 상태, 유효기간, 총 금액, 클라이언트명, 항목
 * items DB: 항목명, invoice, 금액, 단가, 수량
 */
const NOTION_PROPERTY_MAP = {
  // invoices DB
  quoteNumber: "견적서 번호",
  quoteDate: "발행일",
  status: "상태",
  validUntil: "유효기간",
  totalAmount: "총 금액",
  clientName: "클라이언트명",
  itemsRelation: "항목",
  // invoices DB - 부가세 구분 (Notion에 수동 추가 필요: Select 타입, 옵션: 포함/별도)
  taxType: "부가세구분",
  // invoices DB - 공유 링크용 (Notion에 수동 추가 필요)
  shareToken: "ShareToken",
  shareTokenExpiredAt: "ShareTokenExpiredAt",
  // items DB
  itemName: "항목명",
  invoiceRelation: "invoice",
  amount: "금액",
  unitPrice: "단가",
  quantity: "수량",
} as const;

/**
 * Notion 속성에서 문자열 추출
 */
function getPropText(prop: Record<string, unknown> | undefined): string {
  if (!prop) return "";
  if (prop.type === "title") {
    return (prop.title as Array<{ plain_text: string }>)?.[0]?.plain_text ?? "";
  }
  if (prop.type === "rich_text") {
    return (prop.rich_text as Array<{ plain_text: string }>)?.[0]?.plain_text ?? "";
  }
  if (prop.type === "select") {
    return (prop.select as { name: string } | null)?.name ?? "";
  }
  if (prop.type === "status") {
    return (prop.status as { name: string } | null)?.name ?? "";
  }
  if (prop.type === "formula") {
    const formula = prop.formula as { type: string; string?: string; number?: number };
    return formula.type === "string" ? (formula.string ?? "") : String(formula.number ?? "");
  }
  return "";
}

/**
 * Notion 속성에서 숫자 추출
 */
function getPropNumber(prop: Record<string, unknown> | undefined): number {
  if (!prop) return 0;
  if (prop.type === "number") return (prop.number as number) ?? 0;
  if (prop.type === "formula") {
    const formula = prop.formula as { type: string; number?: number };
    return formula.type === "number" ? (formula.number ?? 0) : 0;
  }
  return 0;
}

/**
 * Notion 속성에서 날짜 추출
 */
function getPropDate(prop: Record<string, unknown> | undefined): Date | null {
  if (!prop) return null;
  if (prop.type === "date") {
    const date = prop.date as { start: string } | null;
    return date?.start ? new Date(date.start) : null;
  }
  return null;
}

/**
 * Notion 페이지를 QuoteListItem으로 변환
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseNotionPageToQuote(page: any): QuoteListItem | null {
  try {
    const props = page.properties;
    const quoteNumber = getPropText(props[NOTION_PROPERTY_MAP.quoteNumber]);
    const clientName = getPropText(props[NOTION_PROPERTY_MAP.clientName]);
    const quoteDate = getPropDate(props[NOTION_PROPERTY_MAP.quoteDate]);
    const validUntil = getPropDate(props[NOTION_PROPERTY_MAP.validUntil]);

    if (!quoteNumber || !clientName || !quoteDate || !validUntil) return null;

    return {
      notionPageId: page.id as string,
      quoteNumber,
      clientName,
      quoteDate,
      validUntil,
      status: (getPropText(props[NOTION_PROPERTY_MAP.status]) || "대기") as QuoteListItem["status"],
      totalAmount: getPropNumber(props[NOTION_PROPERTY_MAP.totalAmount]),
      taxType: (getPropText(props[NOTION_PROPERTY_MAP.taxType]) || "포함") as TaxType,
      shareToken: getPropText(props[NOTION_PROPERTY_MAP.shareToken]) || null,
      shareTokenExpiredAt: getPropDate(props[NOTION_PROPERTY_MAP.shareTokenExpiredAt]),
    };
  } catch {
    return null;
  }
}

/**
 * items DB 페이지를 QuoteItem으로 변환
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseNotionItemPage(page: any): QuoteItem | null {
  try {
    const props = page.properties;
    const itemName = getPropText(props[NOTION_PROPERTY_MAP.itemName]);
    if (!itemName) return null;

    return {
      itemName,
      quantity: getPropNumber(props[NOTION_PROPERTY_MAP.quantity]),
      unitPrice: getPropNumber(props[NOTION_PROPERTY_MAP.unitPrice]),
      amount: getPropNumber(props[NOTION_PROPERTY_MAP.amount]),
    };
  } catch {
    return null;
  }
}

/**
 * invoices DB에서 견적서 목록 전체 조회
 * @notionhq/client v5: databases.query → dataSources.query + data_source_id
 */
export async function getQuotes(): Promise<QuoteListItem[]> {
  try {
    const response = await withRetry(() =>
      notion.databases.query({
        database_id: INVOICES_DB_ID,
        sorts: [{ property: NOTION_PROPERTY_MAP.quoteDate, direction: "descending" }],
      })
    );

    return response.results
      .map(parseNotionPageToQuote)
      .filter((q): q is QuoteListItem => q !== null);
  } catch {
    return [];
  }
}

/**
 * ShareToken으로 특정 견적서 조회
 */
export async function getQuoteByShareToken(token: string): Promise<QuoteListItem | null> {
  try {
    const response = await withRetry(() =>
      notion.databases.query({
        database_id: INVOICES_DB_ID,
        filter: {
          property: NOTION_PROPERTY_MAP.shareToken,
          rich_text: { equals: token },
        },
      })
    );

    if (response.results.length === 0) return null;
    return parseNotionPageToQuote(response.results[0]);
  } catch {
    return null;
  }
}

/**
 * 견적서 상세 조회
 * invoices 페이지의 "항목" relation에서 item 페이지 ID를 꺼내 개별 조회
 */
export async function getQuoteWithItems(notionPageId: string): Promise<Quote | null> {
  try {
    const page = await withRetry(() =>
      notion.pages.retrieve({ page_id: notionPageId })
    );
    const quote = parseNotionPageToQuote(page);
    if (!quote) return null;

    // "항목" relation 필드에서 item 페이지 ID 목록 추출
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props = (page as any).properties;
    const relationProp = props[NOTION_PROPERTY_MAP.itemsRelation];
    const itemPageIds: string[] =
      relationProp?.type === "relation"
        ? relationProp.relation.map((r: { id: string }) => r.id)
        : [];

    // 각 item 페이지를 병렬로 조회
    const itemPages = await Promise.all(
      itemPageIds.map((id) => notion.pages.retrieve({ page_id: id }))
    );

    const items = itemPages
      .map(parseNotionItemPage)
      .filter((item): item is QuoteItem => item !== null);

    return { ...quote, items };
  } catch {
    return null;
  }
}

/**
 * 다음 견적서 번호 자동 생성 — US-YYYY-MM-NNN 형식
 * 당월 기존 견적서 번호 중 최대 순번 + 1
 */
export async function getNextQuoteNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `US-${year}-${month}-`;

  const quotes = await getQuotes();
  const sequences = quotes
    .filter((q) => q.quoteNumber.startsWith(prefix))
    .map((q) => {
      const seq = parseInt(q.quoteNumber.slice(prefix.length), 10);
      return isNaN(seq) ? 0 : seq;
    });

  const next = sequences.length > 0 ? Math.max(...sequences) + 1 : 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

/**
 * 새 견적서 + 항목 생성
 * invoices DB에 invoice 페이지 생성 후 items DB에 각 항목 페이지 생성 및 relation 연결
 */
export async function createQuote(input: CreateQuoteInput): Promise<string> {
  if (!ITEMS_DB_ID) {
    throw new Error("NOTION_ITEMS_DATABASE_ID 환경변수가 설정되지 않았습니다.");
  }

  const page = await withRetry(() =>
    notion.pages.create({
      parent: { database_id: INVOICES_DB_ID },
      properties: {
        [NOTION_PROPERTY_MAP.quoteNumber]: {
          title: [{ type: "text", text: { content: input.quoteNumber } }],
        },
        [NOTION_PROPERTY_MAP.clientName]: {
          rich_text: [{ type: "text", text: { content: input.clientName } }],
        },
        [NOTION_PROPERTY_MAP.quoteDate]: {
          date: { start: input.quoteDate },
        },
        [NOTION_PROPERTY_MAP.validUntil]: {
          date: { start: input.validUntil },
        },
        [NOTION_PROPERTY_MAP.status]: {
          status: { name: input.status },
        },
        [NOTION_PROPERTY_MAP.taxType]: {
          select: { name: input.taxType ?? "포함" },
        },
      },
    })
  );
  const notionPageId = page.id;

  await Promise.all(
    input.items.map((item) =>
      withRetry(() =>
        notion.pages.create({
          parent: { database_id: ITEMS_DB_ID },
          properties: {
            [NOTION_PROPERTY_MAP.itemName]: {
              title: [{ type: "text", text: { content: item.itemName } }],
            },
            [NOTION_PROPERTY_MAP.quantity]: {
              number: item.quantity,
            },
            [NOTION_PROPERTY_MAP.unitPrice]: {
              number: item.unitPrice,
            },
            [NOTION_PROPERTY_MAP.amount]: {
              number: item.quantity * item.unitPrice,
            },
            [NOTION_PROPERTY_MAP.invoiceRelation]: {
              relation: [{ id: notionPageId }],
            },
          },
        })
      )
    )
  );

  return notionPageId;
}

/**
 * 견적서 수정 — invoices 속성 업데이트 + 기존 항목 아카이브 후 새 항목 생성
 */
export async function updateQuote(
  notionPageId: string,
  input: UpdateQuoteInput
): Promise<void> {
  // 1. invoices 페이지 속성 업데이트
  await withRetry(() =>
    notion.pages.update({
      page_id: notionPageId,
      properties: {
        [NOTION_PROPERTY_MAP.clientName]: {
          rich_text: [{ type: "text", text: { content: input.clientName } }],
        },
        [NOTION_PROPERTY_MAP.quoteDate]: {
          date: { start: input.quoteDate },
        },
        [NOTION_PROPERTY_MAP.validUntil]: {
          date: { start: input.validUntil },
        },
        [NOTION_PROPERTY_MAP.status]: {
          status: { name: input.status },
        },
        [NOTION_PROPERTY_MAP.taxType]: {
          select: { name: input.taxType ?? "포함" },
        },
      },
    })
  );

  // 2. 기존 항목 조회 후 아카이브
  const page = await withRetry(() =>
    notion.pages.retrieve({ page_id: notionPageId })
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props = (page as any).properties;
  const relationProp = props[NOTION_PROPERTY_MAP.itemsRelation];
  const oldItemIds: string[] =
    relationProp?.type === "relation"
      ? relationProp.relation.map((r: { id: string }) => r.id)
      : [];

  await Promise.all(
    oldItemIds.map((id) =>
      withRetry(() => notion.pages.update({ page_id: id, archived: true }))
    )
  );

  // 3. 새 항목 생성
  await Promise.all(
    input.items.map((item) =>
      withRetry(() =>
        notion.pages.create({
          parent: { database_id: ITEMS_DB_ID },
          properties: {
            [NOTION_PROPERTY_MAP.itemName]: {
              title: [{ type: "text", text: { content: item.itemName } }],
            },
            [NOTION_PROPERTY_MAP.quantity]: { number: item.quantity },
            [NOTION_PROPERTY_MAP.unitPrice]: { number: item.unitPrice },
            [NOTION_PROPERTY_MAP.amount]: {
              number: item.quantity * item.unitPrice,
            },
            [NOTION_PROPERTY_MAP.invoiceRelation]: {
              relation: [{ id: notionPageId }],
            },
          },
        })
      )
    )
  );
}

/**
 * 견적서 상태만 변경
 */
export async function updateQuoteStatus(
  notionPageId: string,
  status: QuoteStatus
): Promise<void> {
  await withRetry(() =>
    notion.pages.update({
      page_id: notionPageId,
      properties: {
        [NOTION_PROPERTY_MAP.status]: {
          status: { name: status },
        },
      },
    })
  );
}

/**
 * 견적서 아카이브 (soft delete)
 */
export async function archiveQuote(notionPageId: string): Promise<void> {
  await withRetry(() =>
    notion.pages.update({ page_id: notionPageId, archived: true })
  );
}

/**
 * Notion 페이지에 ShareToken 업데이트
 */
export async function updateShareToken(
  notionPageId: string,
  token: string,
  expiredAt: Date
): Promise<void> {
  await notion.pages.update({
    page_id: notionPageId,
    properties: {
      [NOTION_PROPERTY_MAP.shareToken]: {
        rich_text: [{ type: "text", text: { content: token } }],
      },
      [NOTION_PROPERTY_MAP.shareTokenExpiredAt]: {
        date: { start: expiredAt.toISOString() },
      },
    },
  });
}
