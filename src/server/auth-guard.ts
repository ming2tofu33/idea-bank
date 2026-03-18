import { auth } from "@/auth";
import { errorResponse } from "@/lib/errors";

/**
 * API 라우트에서 로그인한 유저의 ID를 가져온다.
 * 로그인 안 됐으면 401 에러 응답을 반환.
 */
export async function getAuthUser(): Promise<
  { userId: string; email: string } | Response
> {
  const session = await auth();

  if (!session?.user?.email) {
    return errorResponse("BAD_REQUEST", "Authentication required", 401);
  }

  // email을 user_id로 사용 (Google OAuth에서 안정적인 식별자)
  return {
    userId: session.user.email,
    email: session.user.email,
  };
}
