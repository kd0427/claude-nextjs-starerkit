import { redirect } from "next/navigation";

/** 루트 경로는 어드민 로그인 페이지로 리디렉션 */
export default function RootPage() {
  redirect("/login");
}
