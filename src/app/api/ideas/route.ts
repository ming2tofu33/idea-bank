import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/server/firebase";
import { errorResponse, withRetry } from "@/lib/errors";
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
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

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
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse("INTERNAL_ERROR", message, 500);
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
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse("SAVE_FAILED", message, 500);
  }
}
