import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/server/firebase";
import { errorResponse, serverErrorResponse } from "@/lib/errors";
import { getAuthUser } from "@/server/auth-guard";

// DELETE /api/keywords/[id] — delete custom keyword only (user-scoped)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser();
    if (user instanceof Response) return user;

    const { id } = await params;
    const doc = await collections.keywords.doc(id).get();

    if (!doc.exists) {
      return errorResponse("NOT_FOUND", "Keyword not found", 404);
    }

    const data = doc.data();
    if (data?.source === "fixed") {
      return errorResponse("BAD_REQUEST", "Cannot delete fixed keywords", 400);
    }

    if (data?.user_id !== user.userId) {
      return errorResponse("NOT_FOUND", "Keyword not found", 404);
    }

    await collections.keywords.doc(id).delete();
    return NextResponse.json({ deleted: true, id });
  } catch (error) {
    return serverErrorResponse("INTERNAL_ERROR", error, "키워드 삭제 중 오류가 발생했습니다");
  }
}
