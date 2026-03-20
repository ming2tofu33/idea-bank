import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/server/firebase";
import { errorResponse, serverErrorResponse } from "@/lib/errors";
import { getAuthUser } from "@/server/auth-guard";

// GET /api/blueprints/[id] — deep_report 단건 조회 (모달용)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser();
    if (user instanceof Response) return user;

    const { id } = await params;

    const reportDoc = await collections.deepReports.doc(id).get();
    if (!reportDoc.exists) {
      return errorResponse("NOT_FOUND", "Blueprint를 찾을 수 없습니다", 404);
    }

    const reportData = reportDoc.data()!;

    if (!reportData.idea_id) {
      return errorResponse("NOT_FOUND", "Blueprint를 찾을 수 없습니다", 404);
    }

    // 소유권 확인 — report의 idea_id로 idea를 조회해 user_id 검증 (IDOR 방지)
    const ideaDoc = await collections.ideas
      .doc(reportData.idea_id as string)
      .get();
    if (!ideaDoc.exists || ideaDoc.data()!.user_id !== user.userId) {
      return errorResponse("NOT_FOUND", "Blueprint를 찾을 수 없습니다", 404);
    }

    // created_at은 Timestamp이므로 직렬화에서 제외 (DeepReportView는 날짜 사용 안 함)
    const { created_at: _created_at, ...reportFields } = reportData;
    return NextResponse.json({ id: reportDoc.id, ...reportFields });
  } catch (error) {
    return serverErrorResponse(
      "INTERNAL_ERROR",
      error,
      "Blueprint를 불러오는 중 오류가 발생했습니다",
    );
  }
}
