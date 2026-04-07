"use client";

import { useEffect, useState } from "react";
import { auth, provider } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getComments, addComment, voteComment, Comment } from "@/services/commentService";
import StarRating from "./StarRating";
import { ThumbsUp, ThumbsDown, LogOut } from "lucide-react";

interface Props {
  movieId: number;
}

export default function CommentSection({ movieId }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Load komentar
  useEffect(() => {
    if (!movieId) return;
    getComments(movieId).then(setComments);
  }, [movieId]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleSubmit = async () => {
    if (!user || !content.trim() || rating === 0) return;
    setLoading(true);
    try {
      await addComment(movieId, {
        userId: user.uid,
        username: user.displayName || "Anonymous",
        avatarUrl: user.photoURL || "",
        content: content.trim(),
        rating,
      });
      setContent("");
      setRating(0);
      const updated = await getComments(movieId);
      setComments(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (commentId: string, vote: "like" | "dislike") => {
    if (!user) return;
    await voteComment(movieId, commentId, user.uid, vote);
    const updated = await getComments(movieId);
    setComments(updated);
  };

  return (
    <div className="mt-8 border-t border-white/10 pt-6">
      <h3 className="text-lg font-semibold mb-4">Comments</h3>

      {/* Auth */}
      {!user ? (
        <button
          onClick={handleLogin}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition mb-6"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" />
          Sign in with Google to comment
        </button>
      ) : (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <img src={user.photoURL || ""} className="w-8 h-8 rounded-full" />
            <span className="text-sm text-gray-300">{user.displayName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      )}

      {/* Form */}
      {user && (
        <div className="bg-white/5 rounded-xl p-4 mb-6 flex flex-col gap-3">
          <StarRating value={rating} onChange={setRating} />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your review..."
            rows={3}
            className="bg-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-1 focus:ring-white/20"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !content.trim() || rating === 0}
            className="self-end bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm px-4 py-2 rounded-full transition"
          >
            {loading ? "Posting..." : "Post Review"}
          </button>
        </div>
      )}

      {/* List komentar */}
      {comments.length === 0 ? (
        <p className="text-gray-500 text-sm">No reviews yet. Be the first!</p>
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map((c) => (
            <div key={c.id} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <img src={c.avatarUrl} className="w-7 h-7 rounded-full" />
                <span className="text-sm font-medium">{c.username}</span>
                <StarRating value={c.rating} readonly />
              </div>
              <p className="text-sm text-gray-300 mb-3">{c.content}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleVote(c.id, "like")}
                  disabled={!user}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-400 disabled:opacity-40 transition"
                >
                  <ThumbsUp size={14} /> {c.likes}
                </button>
                <button
                  onClick={() => handleVote(c.id, "dislike")}
                  disabled={!user}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 disabled:opacity-40 transition"
                >
                  <ThumbsDown size={14} /> {c.dislikes}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}