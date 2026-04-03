"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  quoteNumber: z.string().min(1, "견적서 번호를 입력하세요"),
  clientName: z.string().min(1, "클라이언트명을 입력하세요"),
  quoteDate: z.string().min(1, "발행일을 입력하세요"),
  validUntil: z.string().min(1, "유효기간을 입력하세요"),
  status: z.enum(["대기", "승인", "거절", "만료"]),
  taxType: z.enum(["포함", "별도"]),
  items: z
    .array(
      z.object({
        itemName: z.string().min(1, "항목명을 입력하세요"),
        quantity: z.number().int().positive("수량은 1 이상이어야 합니다"),
        unitPrice: z.number().positive("단가는 0보다 커야 합니다"),
      })
    )
    .min(1, "항목을 1개 이상 입력하세요"),
});

type FormValues = z.infer<typeof formSchema>;

/** 원화 포맷 */
function formatKRW(amount: number): string {
  return amount.toLocaleString("ko-KR") + "원";
}

interface QuoteFormProps {
  mode?: "create" | "edit";
  defaultQuoteNumber?: string;
  notionPageId?: string;
  initialData?: FormValues;
}

export function QuoteForm({
  mode = "create",
  defaultQuoteNumber = "",
  notionPageId,
  initialData,
}: QuoteFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: initialData ?? {
      quoteNumber: defaultQuoteNumber,
      clientName: "",
      quoteDate: "",
      validUntil: "",
      status: "대기",
      taxType: "포함",
      items: [{ itemName: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = useWatch({ control: form.control, name: "items" });
  const watchedTaxType = useWatch({ control: form.control, name: "taxType" });

  const totalAmount = useMemo(
    () =>
      (watchedItems ?? []).reduce((sum, item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.unitPrice) || 0;
        return sum + qty * price;
      }, 0),
    [watchedItems]
  );

  async function onSubmit(values: FormValues) {
    try {
      const url = isEdit ? `/api/quotes/${notionPageId}` : "/api/quotes";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? (isEdit ? "견적서 수정에 실패했습니다" : "견적서 생성에 실패했습니다"));
        return;
      }
      toast.success(isEdit ? "견적서가 수정되었습니다" : "견적서가 생성되었습니다");
      router.push("/quotes");
    } catch {
      toast.error("네트워크 오류가 발생했습니다");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        {/* 견적서 기본 정보 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="quoteNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>견적서 번호</FormLabel>
                <FormControl>
                  <Input readOnly className="bg-muted text-muted-foreground cursor-default" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>클라이언트명 *</FormLabel>
                <FormControl>
                  <Input placeholder="예) 홍길동" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quoteDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>발행일 *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="validUntil"
            render={({ field }) => (
              <FormItem>
                <FormLabel>유효기간 *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>상태</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="대기">대기</SelectItem>
                    <SelectItem value="승인">승인</SelectItem>
                    <SelectItem value="거절">거절</SelectItem>
                    <SelectItem value="만료">만료</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="taxType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>부가세</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="부가세 구분" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="포함">포함 (VAT 포함가)</SelectItem>
                    <SelectItem value="별도">별도 (VAT 별도)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 항목 목록 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">항목 *</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ itemName: "", quantity: 1, unitPrice: 0 })}
            >
              <Plus className="h-4 w-4 mr-1" />
              항목 추가
            </Button>
          </div>

          <div className="space-y-3">
            {/* 헤더 */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_80px_120px_100px_36px] gap-2 text-sm text-muted-foreground px-1">
              <span>항목명</span>
              <span>수량</span>
              <span>단가</span>
              <span className="text-right">금액</span>
              <span />
            </div>

            {fields.map((field, index) => {
              const qty = Number(watchedItems[index]?.quantity) || 0;
              const price = Number(watchedItems[index]?.unitPrice) || 0;
              const amount = qty * price;

              return (
                <div
                  key={field.id}
                  className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_80px_120px_100px_36px] items-start"
                >
                  <FormField
                    control={form.control}
                    name={`items.${index}.itemName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="항목명" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="수량"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.unitPrice`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="단가"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center justify-end h-9 text-sm tabular-nums">
                    {formatKRW(amount)}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          {/* 합계 */}
          <div className="flex justify-end mt-4 pt-4 border-t">
            <div className="flex flex-col items-end gap-1 text-sm">
              {watchedTaxType === "별도" ? (
                <>
                  <div className="flex items-center gap-8">
                    <span className="text-muted-foreground">공급가액</span>
                    <span className="tabular-nums">{formatKRW(totalAmount)}</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className="text-muted-foreground">부가세 (10%)</span>
                    <span className="tabular-nums">{formatKRW(Math.round(totalAmount * 0.1))}</span>
                  </div>
                  <div className="flex items-center gap-8 font-bold text-base mt-1 pt-2 border-t">
                    <span>합계</span>
                    <span className="tabular-nums">{formatKRW(Math.round(totalAmount * 1.1))}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-8">
                  <span className="text-muted-foreground">합계 (VAT 포함)</span>
                  <span className="text-base font-bold tabular-nums">
                    {formatKRW(totalAmount)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/quotes")}
          >
            취소
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? (isEdit ? "수정 중..." : "생성 중...")
              : (isEdit ? "수정 완료" : "견적서 생성")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
