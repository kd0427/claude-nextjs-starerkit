"use client";

import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Quote } from "@/types";

// ---------------------------------------------------------------------------
// 한글 폰트 등록 (Noto Sans KR TTF — public/fonts/ 로컬 파일)
// ---------------------------------------------------------------------------
Font.register({
  family: "NotoSansKR",
  fonts: [
    { src: "/fonts/NotoSansKR-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/NotoSansKR-Bold.ttf", fontWeight: "bold" },
  ],
});

// ---------------------------------------------------------------------------
// 스타일
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansKR",
    fontSize: 9,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 40,
    color: "#1a1a1a",
    backgroundColor: "#ffffff",
  },

  // 헤더 영역
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#1a1a1a",
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  documentLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#555555",
    letterSpacing: 2,
  },
  quoteNumber: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
  },

  // 정보 영역 (고객사, 날짜, 상태)
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  infoLeft: {
    flex: 1,
  },
  infoRight: {
    width: 180,
  },
  infoLabel: {
    fontSize: 8,
    color: "#888888",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  infoRowLabel: {
    fontSize: 8,
    color: "#888888",
  },
  infoRowValue: {
    fontSize: 9,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 4,
    fontSize: 8,
    color: "#555555",
  },

  // 테이블
  table: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tableRowLast: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  colName: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 8,
    color: "#555555",
  },
  colQty: {
    width: 50,
    textAlign: "right",
    fontWeight: "bold",
    fontSize: 8,
    color: "#555555",
  },
  colPrice: {
    width: 90,
    textAlign: "right",
    fontWeight: "bold",
    fontSize: 8,
    color: "#555555",
  },
  colAmount: {
    width: 90,
    textAlign: "right",
    fontWeight: "bold",
    fontSize: 8,
    color: "#555555",
  },
  cellName: {
    flex: 1,
    fontSize: 9,
  },
  cellQty: {
    width: 50,
    textAlign: "right",
    fontSize: 9,
  },
  cellPrice: {
    width: 90,
    textAlign: "right",
    fontSize: 9,
  },
  cellAmount: {
    width: 90,
    textAlign: "right",
    fontSize: 9,
  },

  // 합계 영역
  summary: {
    alignItems: "flex-end",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
    gap: 40,
  },
  summaryLabel: {
    fontSize: 9,
    color: "#888888",
    width: 80,
    textAlign: "right",
  },
  summaryValue: {
    fontSize: 9,
    width: 100,
    textAlign: "right",
  },
  summaryDivider: {
    width: 220,
    borderTopWidth: 1,
    borderTopColor: "#cccccc",
    marginVertical: 6,
  },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 40,
  },
  summaryTotalLabel: {
    fontSize: 11,
    fontWeight: "bold",
    width: 80,
    textAlign: "right",
  },
  summaryTotalValue: {
    fontSize: 11,
    fontWeight: "bold",
    width: 100,
    textAlign: "right",
  },
});

// ---------------------------------------------------------------------------
// 유틸
// ---------------------------------------------------------------------------
/** 원화 포맷 (₩ 없이 숫자만, PDF용) */
function formatAmount(amount: number): string {
  return amount.toLocaleString("ko-KR") + "원";
}

/** Date → 한국 날짜 문자열 */
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("ko-KR");
}

// ---------------------------------------------------------------------------
// 컴포넌트
// ---------------------------------------------------------------------------
interface QuotePdfDocumentProps {
  quote: Quote & { items: Quote["items"] };
}

/** 견적서 PDF 문서 — @react-pdf/renderer 기반 */
export function QuotePdfDocument({ quote }: QuotePdfDocumentProps) {
  const isTaxSeparate = quote.taxType === "별도";
  const supplyAmount = isTaxSeparate
    ? quote.totalAmount
    : Math.round(quote.totalAmount / 1.1);
  const taxAmount = isTaxSeparate
    ? Math.round(quote.totalAmount * 0.1)
    : quote.totalAmount - supplyAmount;
  const totalWithTax = isTaxSeparate
    ? Math.round(quote.totalAmount * 1.1)
    : quote.totalAmount;

  const sortedItems = [...quote.items].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );

  return (
    <Document title={`어스 견적서 - ${quote.quoteNumber}`}>
      <Page size="A4" style={styles.page}>

        {/* 헤더 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>어스</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.documentLabel}>견적서</Text>
            <Text style={styles.quoteNumber}>{quote.quoteNumber}</Text>
          </View>
        </View>

        {/* 정보 영역 */}
        <View style={styles.infoSection}>
          <View style={styles.infoLeft}>
            <Text style={styles.infoLabel}>고객사</Text>
            <Text style={styles.infoValue}>{quote.clientName}</Text>
          </View>
          <View style={styles.infoRight}>
            <View style={styles.infoRow}>
              <Text style={styles.infoRowLabel}>견적일</Text>
              <Text style={styles.infoRowValue}>{formatDate(quote.quoteDate)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoRowLabel}>유효기간</Text>
              <Text style={styles.infoRowValue}>{formatDate(quote.validUntil)}</Text>
            </View>
          </View>
        </View>

        {/* 항목 테이블 */}
        <View style={styles.table}>
          {/* 테이블 헤더 */}
          <View style={styles.tableHeader}>
            <Text style={styles.colName}>항목명</Text>
            <Text style={styles.colQty}>수량</Text>
            <Text style={styles.colPrice}>단가</Text>
            <Text style={styles.colAmount}>금액</Text>
          </View>

          {/* 테이블 행 */}
          {sortedItems.map((item, index) => {
            const isLast = index === sortedItems.length - 1;
            return (
              <View
                key={`${item.itemName}-${item.sortOrder ?? index}`}
                style={isLast ? styles.tableRowLast : styles.tableRow}
              >
                <Text style={styles.cellName}>{item.itemName}</Text>
                <Text style={styles.cellQty}>{item.quantity}</Text>
                <Text style={styles.cellPrice}>{formatAmount(item.unitPrice)}</Text>
                <Text style={styles.cellAmount}>{formatAmount(item.amount)}</Text>
              </View>
            );
          })}
        </View>

        {/* 합계 */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>공급가액</Text>
            <Text style={styles.summaryValue}>{formatAmount(supplyAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>부가세 (10%){isTaxSeparate ? " 별도" : ""}</Text>
            <Text style={styles.summaryValue}>{formatAmount(taxAmount)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryTotalRow}>
            <Text style={styles.summaryTotalLabel}>합계</Text>
            <Text style={styles.summaryTotalValue}>{formatAmount(totalWithTax)}</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
