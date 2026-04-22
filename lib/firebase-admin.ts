import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getPrivateKey(): string {
  const raw = process.env.FIREBASE_PRIVATE_KEY;

  if (!raw) throw new Error("FIREBASE_PRIVATE_KEY is not set");

  // Hapus surrounding quotes jika ada (Vercel kadang wrap dengan "...")
  const unquoted = raw.startsWith('"') && raw.endsWith('"')
    ? raw.slice(1, -1)
    : raw;

  // Replace semua variasi escaped newline
  const key = unquoted
    .replace(/\\\\n/g, "\n")  // double-escaped: \\n → \n
    .replace(/\\n/g, "\n");   // single-escaped: \n  → newline

  // Validasi format PEM
  if (!key.includes("-----BEGIN PRIVATE KEY-----")) {
    throw new Error("FIREBASE_PRIVATE_KEY format is invalid");
  }

  return key;
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: getPrivateKey(),
    }),
  });
}

export const adminAuth = getAuth();