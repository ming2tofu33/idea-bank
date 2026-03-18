export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    /*
     * 아래를 제외한 모든 경로를 보호:
     * - /login (로그인 페이지)
     * - /api/auth (NextAuth 엔드포인트)
     * - /api/health (헬스체크)
     * - _next, favicon, 정적 파일
     */
    "/((?!login|api/auth|api/health|_next|favicon.ico|.*\\.).*)",
  ],
};
