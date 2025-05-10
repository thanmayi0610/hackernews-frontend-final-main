'use client';

import { useEffect, useState,useCallback } from "react";
import { useParams } from "next/navigation";

type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
};

export default function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/user`, {
        credentials: "include",
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUserId(user.id);
      }
    } catch {
      console.error("Failed to fetch current user");
    }
  },[API_BASE]);

  const fetchPost = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/posts/getpost/${id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch post");
      const json = await res.json();
      setPost(json.data);
    } catch {
      setError("Could not load the post");
    }
  },[API_BASE,id]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/comments/on/${id}`, {
        credentials: "include",
      });
      const json = await res.json();
      setComments(json.data || []);
    } catch {
      console.error("Failed to fetch comments");
    }
  },[API_BASE,id]);

  const fetchLikes = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/likes/on/${id}`, {
        credentials: "include",
      });
      const json = await res.json();
      setLikesCount(json.total || 0);
      setLiked(json.alreadyLiked);
    } catch {
      console.error("Failed to fetch likes");
    }
  },[API_BASE,id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/comments/on/${id}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error("Error adding comment:", res.status, errorBody);
        throw new Error("Failed to add comment");
      }

      setNewComment("");
      fetchComments();
    } catch {
      console.error("Error adding comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await fetch(`${API_BASE}/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        fetchComments();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to delete comment");
      }
    } catch {
      alert("Error deleting comment");
    }
  };

  const handleUpdate = async (commentId: string) => {
    try {
      const res = await fetch(`${API_BASE}/comments/${commentId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editedContent }),
      });

      if (res.ok) {
        fetchComments();
        setEditingCommentId(null);
      } else {
        const err = await res.json();
        alert(err.message || "Failed to update comment");
      }
    } catch {
      alert("Error updating comment");
    }
  };

  const handleLike = async () => {
    try {
      const res = await fetch(`${API_BASE}/likes/on/${id}`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        setLiked(true);
        setLikesCount((prev) => prev + 1);
      } else {
        const err = await res.json();
        alert(err.message || "Failed to like post");
      }
    } catch {
      alert("Error liking post");
    }
  };

  useEffect(() => {
    if (id) {
      fetchCurrentUser();
      fetchPost();
      fetchComments();
      fetchLikes();
    }
  }, [id,fetchComments,fetchCurrentUser,fetchLikes,fetchPost]);

  if (error) return <p className="text-red-600 p-4">{error}</p>;
  if (!post) return <p className="p-4">Loading...</p>;

  return (
    <main className="bg-[#f6f6ef] min-h-screen p-4 text-[13px] text-black max-w-2xl mx-auto mt-15">
      <div className="flex items-start gap-2 mb-2">
        {!liked && (
          <button onClick={handleLike} className="text-orange-600 hover:text-orange-700 select-none">
            ▲
          </button>
        )}
        <h1 className="text-[15px] font-medium leading-tight">
          {post.title}
        </h1>
      </div>

      <div className="text-gray-600 text-xs mb-4">
        {likesCount} {likesCount === 1 ? "point" : "points"} | posted {new Date(post.createdAt).toLocaleDateString()} 
      </div>

      <p className="mb-8 text-[13px] text-gray-800">{post.content}</p>

      <form onSubmit={handleAddComment} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-400 text-[13px]"
          placeholder="Write a comment..."
        />
        <div className="mt-2">
          <button
            type="submit"
            disabled={loading}
            className="text-white bg-orange-500 hover:bg-orange-600 px-4 py-1 rounded text-[13px]"
          >
            {loading ? "Adding..." : "Add Comment"}
          </button>
        </div>
      </form>

      <section>
        <h2 className="text-[14px] font-semibold mb-3">Comments</h2>
        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet.</p>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li key={comment.id} className="ml-4 text-[13px]">
                {editingCommentId === comment.id ? (
                  <>
                    <textarea
                      className="w-full border p-1"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                    />
                    <div className="flex gap-2 text-xs mt-1">
                      <button
                        onClick={() => handleUpdate(comment.id)}
                        className="text-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCommentId(null)}
                        className="text-red-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>{comment.content}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>

                    {comment.userId === currentUserId && (
                      <div className="flex gap-3 text-blue-600 text-xs mt-1">
                        <button
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditedContent(comment.content);
                          }}
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDelete(comment.id)}>Delete</button>
                      </div>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

