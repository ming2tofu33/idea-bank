import {
  initializeApp,
  getApps,
  cert,
  type ServiceAccount,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

// Prevent re-initialization during Next.js HMR
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

export const db = getFirestore();

/** Firestore collection refs (vault_ib/02-Architecture/Database-Schema.md) */
export const collections = {
  ideas: db.collection("ideas"),
  evaluations: db.collection("evaluations"),
  sessions: db.collection("sessions"),
  keywords: db.collection("keywords"),
  aiRuns: db.collection("ai_runs"),
  deepReports: db.collection("deep_reports"),
} as const;
