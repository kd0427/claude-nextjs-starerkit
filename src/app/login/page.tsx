"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const loginSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

type LoginFormData = z.infer<typeof loginSchema>;

/** 어드민 로그인 페이지 */
export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  /** 로그인 폼 제출 처리 */
  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setServerError("이메일 또는 비밀번호가 올바르지 않습니다.");
        return;
      }

      router.push("/quotes");
    } catch {
      setServerError("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-4xl rounded-2xl border bg-card shadow-lg px-24 py-14 space-y-10">
        <div className="space-y-3 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <span className="text-xl font-bold text-primary-foreground">US</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">관리자 로그인</h1>
          <p className="text-lg text-muted-foreground">견적서 관리 시스템에 로그인하세요</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-8">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-base font-medium">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              autoComplete="email"
              disabled={isSubmitting}
              className="w-full h-14 text-lg px-4"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="password" className="text-base font-medium">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호 입력"
              autoComplete="current-password"
              disabled={isSubmitting}
              className="w-full h-14 text-lg px-4"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <div className="rounded-lg bg-destructive/10 p-4">
              <p className="text-base text-destructive">{serverError}</p>
            </div>
          )}

          <Button type="submit" className="w-full h-14 text-lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                로그인 중...
              </>
            ) : (
              "로그인"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
