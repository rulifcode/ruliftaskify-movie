import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  increment,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Comment {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  content: string;
  rating: number;
  likes: number;
  dislikes: number;
  createdAt: any;
}

// Ambil semua komentar
export const getComments = async (movieId: number): Promise<Comment[]> => {
  const ref = collection(db, "movies", String(movieId), "comments");
  const q = query(ref, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Comment));
};

// Tambah komentar
export const addComment = async (
  movieId: number,
  data: Omit<Comment, "id" | "likes" | "dislikes" | "createdAt">
) => {
  const ref = collection(db, "movies", String(movieId), "comments");
  await addDoc(ref, {
    ...data,
    likes: 0,
    dislikes: 0,
    createdAt: serverTimestamp(),
  });
};

// Vote like/dislike
export const voteComment = async (
  movieId: number,
  commentId: string,
  userId: string,
  vote: "like" | "dislike"
) => {
  const voteRef = doc(db, "movies", String(movieId), "votes", `${userId}_${commentId}`);
  const commentRef = doc(db, "movies", String(movieId), "comments", commentId);

  const existing = await getDoc(voteRef);

  if (existing.exists()) {
    const prev = existing.data().vote;
    if (prev === vote) {
      // Klik lagi = cancel vote
      await deleteDoc(voteRef);
      await updateDoc(commentRef, { [vote === "like" ? "likes" : "dislikes"]: increment(-1) });
    } else {
      // Ganti vote
      await setDoc(voteRef, { vote });
      await updateDoc(commentRef, {
        likes: increment(vote === "like" ? 1 : -1),
        dislikes: increment(vote === "dislike" ? 1 : -1),
      });
    }
  } else {
    // Vote baru
    await setDoc(voteRef, { vote });
    await updateDoc(commentRef, { [vote === "like" ? "likes" : "dislikes"]: increment(1) });
  }
};