import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

if (!getApps().length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.includes("\\n")
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")  // format \n literal
    : process.env.FIREBASE_PRIVATE_KEY;                        // sudah multiline asli

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}

export const adminAuth = getAuth();