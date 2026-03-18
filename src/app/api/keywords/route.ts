import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/server/firebase";
import { errorResponse } from "@/lib/errors";
import { getAuthUser } from "@/server/auth-guard";
import { FieldValue } from "firebase-admin/firestore";
import type { KeywordCreateInput } from "@/types";

// GET /api/keywords — fixed(전체공유) + custom(유저별) 합쳐서 반환
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (user instanceof Response) return user;

    const { searchParams } = request.nextUrl;
    const category = searchParams.get("category");

    // Fixed keywords (shared)
    let fixedQuery: FirebaseFirestore.Query = collections.keywords.where(
      "source",
      "==",
      "fixed",
    );
    if (category) fixedQuery = fixedQuery.where("category", "==", category);
    const fixedSnap = await fixedQuery.get();

    // Custom keywords (user-scoped)
    let customQuery: FirebaseFirestore.Query = collections.keywords
      .where("source", "==", "custom")
      .where("user_id", "==", user.userId);
    if (category) customQuery = customQuery.where("category", "==", category);
    const customSnap = await customQuery.get();

    const keywords = [
      ...fixedSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ...customSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    ].sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
      String(a.category).localeCompare(String(b.category)) ||
      String(a.keyword).localeCompare(String(b.keyword)),
    );

    return NextResponse.json({ keywords });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}

// POST /api/keywords — add custom keyword (user-scoped)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (user instanceof Response) return user;

    const body: KeywordCreateInput = await request.json();

    if (!body.keyword?.trim() || !body.category) {
      return errorResponse(
        "BAD_REQUEST",
        "keyword and category are required",
        400,
      );
    }

    const validCategories = ["who", "domain", "tech", "value", "money"];
    if (!validCategories.includes(body.category)) {
      return errorResponse(
        "BAD_REQUEST",
        `Invalid category. Must be one of: ${validCategories.join(", ")}`,
        400,
      );
    }

    const docRef = await collections.keywords.add({
      user_id: user.userId,
      keyword: body.keyword.trim(),
      category: body.category,
      source: "custom",
      added_at: FieldValue.serverTimestamp(),
      used_count: 0,
      last_used: null,
    });

    return NextResponse.json(
      { id: docRef.id, keyword: body.keyword.trim(), category: body.category },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse("SAVE_FAILED", message, 500);
  }
}
