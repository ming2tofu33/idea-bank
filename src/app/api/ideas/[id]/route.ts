import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/server/firebase";
import { errorResponse } from "@/lib/errors";
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
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse("INTERNAL_ERROR", message, 500);
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

    const updateData: Record<string, unknown> = {
      ...body,
      last_reviewed: FieldValue.serverTimestamp(),
    };
    await collections.ideas.doc(id).update(updateData);

    const updated = await collections.ideas.doc(id).get();
    return NextResponse.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse("SAVE_FAILED", message, 500);
  }
}
