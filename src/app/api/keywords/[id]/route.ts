import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/server/firebase";
import { errorResponse } from "@/lib/errors";

// DELETE /api/keywords/[id] — delete custom keyword only
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const doc = await collections.keywords.doc(id).get();

    if (!doc.exists) {
      return errorResponse("NOT_FOUND", "Keyword not found", 404);
    }

    const data = doc.data();
    if (data?.source === "fixed") {
      return errorResponse("BAD_REQUEST", "Cannot delete fixed keywords", 400);
    }

    await collections.keywords.doc(id).delete();
    return NextResponse.json({ deleted: true, id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}
