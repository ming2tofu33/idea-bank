import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/server/firebase";
import { errorResponse, serverErrorResponse } from "@/lib/errors";
import { getAuthUser } from "@/server/auth-guard";
import { FieldValue } from "firebase-admin/firestore";
import type { IdeaPatchInput } from "@/types";

// GET /api/ideas/[id] — detail view
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser();
    if (user instanceof Response) return user;

    const { id } = await params;
    const doc = await collections.ideas.doc(id).get();

    if (!doc.exists || doc.data()?.user_id !== user.userId) {
      return errorResponse("NOT_FOUND", "Idea not found", 404);
    }

    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    return serverErrorResponse("INTERNAL_ERROR", error, "아이디어를 불러오는 중 오류가 발생했습니다");
  }
}

// PATCH /api/ideas/[id] — update status, bookmark toggle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser();
    if (user instanceof Response) return user;

    const { id } = await params;
    const body: IdeaPatchInput = await request.json();

    const doc = await collections.ideas.doc(id).get();
    if (!doc.exists || doc.data()?.user_id !== user.userId) {
      return errorResponse("NOT_FOUND", "Idea not found", 404);
    }

    if (body.status) {
      const validStatuses = [
        "new",
        "interested",
        "reviewing",
        "executing",
        "on_hold",
        "archived",
      ];
      if (!validStatuses.includes(body.status)) {
        return errorResponse(
          "BAD_REQUEST",
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
          400,
        );
      }
    }

    // 허용된 필드만 업데이트 (Mass Assignment 방지 — user_id 등 민감 필드 제외)
    const updateData: Record<string, unknown> = {
      last_reviewed: FieldValue.serverTimestamp(),
    };
    if (body.status !== undefined) updateData.status = body.status;
    if (body.bookmarked !== undefined) updateData.bookmarked = body.bookmarked;

    await collections.ideas.doc(id).update(updateData);

    const updated = await collections.ideas.doc(id).get();
    return NextResponse.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    return serverErrorResponse("SAVE_FAILED", error, "아이디어 수정 중 오류가 발생했습니다");
  }
}
