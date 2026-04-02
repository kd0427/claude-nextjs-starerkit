import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** className 병합 유틸리티 (clsx + tailwind-merge) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 한국 원화 포맷 (예: 1,000,000원) */
export function formatKRW(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
}
