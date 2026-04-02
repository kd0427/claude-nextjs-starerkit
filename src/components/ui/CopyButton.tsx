"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  label?: string;
}

/** 클립보드 복사 버튼 - 복사 성공 시 아이콘 전환 + toast */
export function CopyButton({ text, label = "복사" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  /** 클립보드에 텍스트 복사 */
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("링크가 클립보드에 복사되었습니다");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} disabled={copied}>
      {copied ? (
        <Check className="mr-2 h-4 w-4 text-green-500" />
      ) : (
        <Copy className="mr-2 h-4 w-4" />
      )}
      {copied ? "복사됨!" : label}
    </Button>
  );
}
