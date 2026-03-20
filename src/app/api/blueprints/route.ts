import { NextResponse } from "next/server";
import { db, collections } from "@/server/firebase";
import { serverErrorResponse } from "@/lib/errors";
import { getAuthUser } from "@/server/auth-guard";
import type { BlueprintListItem } from "@/types";

// GET /api/blueprints — user의 Blueprint 목록
export async function GET() {
  try {
    const user = await getAuthUser();
    if (user instanceof Response) return user;

    // 1. user의 모든 ideas 중 deep_report_id가 있는 것만 추출
    // (deep_reports에는 user_id가 없으므로 ideas를 기준으로 소유권 확인)
    const snapshot = await collections.ideas
      .where("user_id", "==", user.userId)
      .get();

    const ideasWithReports = snapshot.docs.filter(
      (doc) => doc.data().deep_report_id != null,
    );

    if (ideasWithReports.length === 0) {
      return NextResponse.json({ blueprints: [], count: 0 });
    }

    // 2. deep_reports를 batch-get해 정확한 created_at 확보
    const reportRefs = ideasWithReports.map((doc) =>
      collections.deepReports.doc(doc.data().deep_report_id as string),
    );
    const reportDocs = await db.getAll(...reportRefs);

    // 3. BlueprintListItem 조합 (ideas + deep_reports.created_at)
    const blueprints: BlueprintListItem[] = ideasWithReports.map(
      (ideaDoc, i) => {
        const idea = ideaDoc.data();
        const reportDoc = reportDocs[i];
        const reportCreatedAt = reportDoc.exists
          ? (reportDoc.data()?.created_at?.toDate?.()?.toISOString() ??
            undefined)
          : undefined;

        return {
          report_id: idea.deep_report_id as string,
          idea_id: ideaDoc.id,
          idea_title: idea.title as string,
          idea_problem: idea.problem as string,
          idea_keywords: (idea.keywords_used as string[]) ?? [],
          total_score: (idea.total_score as number | null) ?? null,
          has_evaluation: idea.evaluation_id != null,
          created_at:
            reportCreatedAt ??
            idea.last_reviewed?.toDate?.()?.toISOString() ??
            new Date().toISOString(),
        };
      },
    );

    // 4. 최신순 정렬 (기본값)
    blueprints.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return NextResponse.json({ blueprints, count: blueprints.length });
  } catch (error) {
    return serverErrorResponse(
      "INTERNAL_ERROR",
      error,
      "Blueprint 목록을 불러오는 중 오류가 발생했습니다",
    );
  }
}
