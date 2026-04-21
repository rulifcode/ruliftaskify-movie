/**
 * watchLimit.ts
 * Core logic untuk validasi batas menonton (max 5x) menggunakan Firebase Firestore.
 *
 * Identifikasi user:
 *  - Sudah login  → pakai Firebase UID
 *  - Belum login  → pakai fingerprint dari IP + User-Agent (disimpan di cookie "gid")
 */

import { db } from "@/lib/firebase"; // sesuaikan path firebase config kamu
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";

export const WATCH_LIMIT = 5;
export const COLLECTION = "watchSessions";

export type WatchStatus = {
  allowed: boolean;       // boleh nonton atau tidak
  watchCount: number;     // sudah berapa kali nonton
  remaining: number;      // sisa kuota
  isLocked: boolean;      // apakah sudah di-lock
  requiresLogin: boolean; // harus login untuk lanjut
};

/**
 * Buat document ID unik berdasarkan identitas user + movieId
 * Format: "uid__{userId}__movie__{movieId}" atau "guest__{guestId}__movie__{movieId}"
 */
export function buildDocId(userId: string, movieId: number, isGuest: boolean): string {
  const prefix = isGuest ? "guest" : "uid";
  return `${prefix}__${userId}__movie__${movieId}`;
}

/**
 * Cek status nonton tanpa menambah counter.
 * Berguna untuk menampilkan UI sebelum user klik play.
 */
export async function getWatchStatus(
  userId: string,
  movieId: number,
  isGuest: boolean
): Promise<WatchStatus> {
  const docId = buildDocId(userId, movieId, isGuest);
  const ref = doc(db, COLLECTION, docId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return {
      allowed: true,
      watchCount: 0,
      remaining: WATCH_LIMIT,
      isLocked: false,
      requiresLogin: false,
    };
  }

  const data = snap.data();
  const watchCount: number = data.watchCount ?? 0;
  const isLocked = watchCount >= WATCH_LIMIT;

  return {
    allowed: !isLocked,
    watchCount,
    remaining: Math.max(0, WATCH_LIMIT - watchCount),
    isLocked,
    requiresLogin: isLocked && isGuest, // guest yang locked → wajib login
  };
}

/**
 * Increment watch count dan kembalikan status terbaru.
 * Dipanggil saat user benar-benar mulai menonton (klik play / buka trailer).
 */
export async function incrementWatchCount(
  userId: string,
  movieId: number,
  isGuest: boolean,
  movieTitle?: string
): Promise<WatchStatus> {
  const docId = buildDocId(userId, movieId, isGuest);
  const ref = doc(db, COLLECTION, docId);
  const snap = await getDoc(ref);

  // Kalau belum ada dokumen, buat baru
  if (!snap.exists()) {
    await setDoc(ref, {
      userId,
      movieId,
      movieTitle: movieTitle ?? null,
      isGuest,
      watchCount: 1,
      firstWatchedAt: serverTimestamp(),
      lastWatchedAt: serverTimestamp(),
      lockedAt: null,
    });

    return {
      allowed: true,
      watchCount: 1,
      remaining: WATCH_LIMIT - 1,
      isLocked: false,
      requiresLogin: false,
    };
  }

  const data = snap.data();
  const currentCount: number = data.watchCount ?? 0;

  // Sudah locked → tolak, jangan increment lagi
  if (currentCount >= WATCH_LIMIT) {
    return {
      allowed: false,
      watchCount: currentCount,
      remaining: 0,
      isLocked: true,
      requiresLogin: isGuest,
    };
  }

  // Masih boleh → increment
  const newCount = currentCount + 1;
  const willLock = newCount >= WATCH_LIMIT;

  await updateDoc(ref, {
    watchCount: increment(1),
    lastWatchedAt: serverTimestamp(),
    ...(willLock ? { lockedAt: serverTimestamp() } : {}),
  });

  return {
    allowed: true,
    watchCount: newCount,
    remaining: Math.max(0, WATCH_LIMIT - newCount),
    isLocked: willLock,
    requiresLogin: willLock && isGuest,
  };
}

/**
 * Reset watch count (misal: user baru login, atau admin reset).
 */
export async function resetWatchCount(
  userId: string,
  movieId: number,
  isGuest: boolean
): Promise<void> {
  const docId = buildDocId(userId, movieId, isGuest);
  const ref = doc(db, COLLECTION, docId);
  await updateDoc(ref, {
    watchCount: 0,
    lockedAt: null,
    lastWatchedAt: serverTimestamp(),
  });
}