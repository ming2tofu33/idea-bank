import { collections } from "@/server/firebase";
import { FieldValue } from "firebase-admin/firestore";

/**
 * 14일 이상 방치된 아이디어를 자동 아카이브.
 * status가 "archived"인 것은 제외.
 * @returns 아카이브된 아이디어 수
 */
export async function checkStaleIdeas(): Promise<number> {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const snapshot = await collections.ideas
    .where("last_reviewed", "<", fourteenDaysAgo)
    .get();

  const staleIds: string[] = [];
  snapshot.docs.forEach((doc) => {
    const status = doc.data().status as string;
    if (status !== "archived") {
      staleIds.push(doc.id);
    }
  });

  if (staleIds.length > 0) {
    const batch = collections.ideas.firestore.batch();
    for (const id of staleIds) {
      batch.update(collections.ideas.doc(id), {
        status: "archived",
        stale_flag: true,
        last_reviewed: FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();
  }

  return staleIds.length;
}
