import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/server/firebase";
import { errorResponse } from "@/lib/errors";
import { FieldValue } from "firebase-admin/firestore";
import type { KeywordCreateInput } from "@/types";

// GET /api/keywords — keyword list (optional category filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get("category");

    let query: FirebaseFirestore.Query = collections.keywords;
    if (category) {
      query = query.where("category", "==", category);
    }

    const snapshot = await query.get();
    const keywords = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
        String(a.category).localeCompare(String(b.category)) ||
        String(a.keyword).localeCompare(String(b.keyword)),
      );

    return NextResponse.json({ keywords });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}

// POST /api/keywords — add custom keyword
export async function POST(request: NextRequest) {
  try {
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
