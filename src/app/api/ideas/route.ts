import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/server/firebase";
import { errorResponse, serverErrorResponse, withRetry } from "@/lib/errors";
import { getAuthUser } from "@/server/auth-guard";
import { FieldValue } from "firebase-admin/firestore";
import type { IdeaCreateInput } from "@/types";

// GET /api/ideas — list with filters, sorting, pagination
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (user instanceof Response) return user;

    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");
    const bookmarked = searchParams.get("bookmarked");
    const rawLimit = parseInt(searchParams.get("limit") || "50", 10);
    const limit = Math.min(Math.max(1, rawLimit), 100); // 1~100 사이로 제한
    const rawOffset = parseInt(searchParams.get("offset") || "0", 10);
    const offset = Math.max(0, rawOffset);

    let query: FirebaseFirestore.Query = collections.ideas.where(
      "user_id",
      "==",
      user.userId,
    );

    if (status) query = query.where("status", "==", status);
    if (bookmarked === "true") query = query.where("bookmarked", "==", true);

    query = query.orderBy("created_at", "desc").limit(limit).offset(offset);

    const snapshot = await query.get();
    const ideas = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ ideas, count: ideas.length });
  } catch (error) {
    return serverErrorResponse("INTERNAL_ERROR", error, "아이디어 목록을 불러오는 중 오류가 발생했습니다");
  }
}

// POST /api/ideas — save idea
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (user instanceof Response) return user;

    const body: IdeaCreateInput = await request.json();

    if (!body.title?.trim()) {
      return errorResponse("BAD_REQUEST", "title is required", 400);
    }

    const docRef = await withRetry(() =>
      collections.ideas.add({
        ...body,
        user_id: user.userId,
        title: body.title.trim(),
        summary: body.summary?.trim() || "",
        status: body.status || "new",
        bookmarked: body.bookmarked || false,
        created_at: FieldValue.serverTimestamp(),
        last_reviewed: FieldValue.serverTimestamp(),
        stale_flag: false,
        duplicate_warning: false,
        deep_report_id: null,
        evaluation_id: null,
        total_score: null,
      }),
    );

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (error) {
    return serverErrorResponse("SAVE_FAILED", error, "아이디어 저장 중 오류가 발생했습니다");
  }
}
