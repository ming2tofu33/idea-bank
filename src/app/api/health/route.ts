import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function GET() {
  try {
    const testRef = db.collection("_health_check").doc("test");
    await testRef.set({ status: "ok", timestamp: new Date().toISOString() });
    const doc = await testRef.get();
    const data = doc.data();
    await testRef.delete();

    return NextResponse.json({ firebase: "connected", data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: true, code: "FIREBASE_CONNECTION_FAILED", message },
      { status: 500 },
    );
  }
}
