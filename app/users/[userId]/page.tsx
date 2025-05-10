"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type User = {
  id: string;
  username: string;
  createdAt: string;
  about?: string;
};

type Post = {
  id: string;
  title: string;
  createdAt: string;
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  post: {
    id: string;
    title: string;
  };
};

export default function UserProfilePage() {
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<"submissions" | "comments">("submissions");

  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  const [postPage, setPostPage] = useState(1);
  const [commentPage, setCommentPage] = useState(1);

  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [hasMoreComments, setHasMoreComments] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const LIMIT = 5;
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/${userId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch user");
        const json = await res.json();
        setUser(json.data);
      } catch (err) {
        console.error(err);
        setError("Could not load user info.");
      }
    };

    fetchUser();
  }, [API_BASE,userId,commentPage,postPage,tab]);

  useEffect(() => {
    
    if (tab === "submissions") {
      setPosts([]);
      setPostPage(1);
      setHasMorePosts(true);
    } else {
      setComments([]);
      setCommentPage(1);
      setHasMoreComments(true);
    }
  }, [tab]);

  

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "submissions") {
        const res = await fetch(`${API_BASE}/posts/byUser/${userId}?page=${postPage}&limit=${LIMIT}`, {
          credentials: "include",
        });
        const json = await res.json();
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newPosts = (json.data || []).filter((p: Post) => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
        if (json.data.length < LIMIT) setHasMorePosts(false);
      } else if (tab === "comments") {
        const res = await fetch(`${API_BASE}/comments/byUser/${userId}?page=${commentPage}&limit=${LIMIT}`, {
          credentials: "include",
        });
        const json = await res.json();
        setComments((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const newComments = (json.data || []).filter((c: Comment) => !existingIds.has(c.id));
          return [...prev, ...newComments];
        });
        if (json.data.length < LIMIT) setHasMoreComments(false);
      }
    } catch (err) {
      console.error(err);
      setError("Could not load data.");
    } finally {
      setLoading(false);
    }
  },[API_BASE,commentPage,postPage,tab,userId]);

  useEffect(() => {
    if (!userId) return;
    loadData();
  }, [loadData,tab, postPage, commentPage,userId]);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} days ago`;
  };

  const loadMore = () => {
    if (tab === "submissions") setPostPage((p) => p + 1);
    else setCommentPage((p) => p + 1);
  };

  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!user) return <div className="p-4 text-gray-600">Loading user...</div>;

  return (
    <main className="p-4 max-w-md mx-auto mt-15">
      <div className="mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-white p-4 rounded-lg shadow-md">
        <div className="text-sm">User</div>
        <div className="text-xl font-semibold">{user.username}</div>
        <div className="text-sm mt-1">Joined: {formatDate(user.createdAt)}</div>
        {user.about && <div className="text-sm mt-2 italic text-white/90">{user.about}</div>}
      </div>

      <div className="flex justify-center gap-6 mb-4 text-sm">
        <button
          onClick={() => setTab("submissions")}
          className={`font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 ${
            tab === "submissions"
              ? "text-white bg-gradient-to-r from-cyan-500 to-blue-500"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Submissions
        </button>
        <button
          onClick={() => setTab("comments")}
          className={`font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 ${
            tab === "comments"
              ? "text-white bg-gradient-to-r from-cyan-500 to-blue-500"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Comments
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        {loading && (posts.length === 0 || comments.length === 0) ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <>
            {tab === "submissions" && (
              <>
                <h2 className="text-lg font-semibold mb-2 text-gray-800">Submissions</h2>
                {posts.length === 0 ? (
                  <p className="text-gray-500">No posts submitted yet.</p>
                ) : (
                  <ul className="space-y-4">
                    {posts.map((post) => (
                      <li key={`post-${post.id}`}>
                        <a
                          href={`/${post.id}`}
                          className="inline-block bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent"
                        >
                          {post.title}
                        </a>
                        <div className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</div>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 flex justify-center">
                {hasMorePosts && (
                  <button
                  onClick={loadMore}
                  disabled={loading}
                  className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 disabled:opacity-50"
                >
                  {loading ? "Loading..." : "More"}
                </button>
                
                )}
                </div>
              </>
            )}

            {tab === "comments" && (
              <>
                <h2 className="text-lg font-semibold mb-2 text-gray-800">Comments</h2>
                {comments.length === 0 ? (
                  <p className="text-gray-500">No comments yet.</p>
                ) : (
                  <ul className="space-y-4">
                    {comments.map((comment) => (
                      <li key={`comment-${comment.id}`}>
                        <div className="text-gray-700">{comment.content}</div>
                        <div className="text-sm text-gray-500">
                          on{" "}
                          <a
                            href={`/${comment.post.id}`}
                            className="inline-block bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent"
                          >
                            {comment.post.title}
                          </a>{" "}
                          - {new Date(comment.createdAt).toLocaleString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 flex justify-center">
                {hasMoreComments && (
                  <button
                  onClick={loadMore}
                  disabled={loading}
                  className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 disabled:opacity-50"
                >
                  {loading ? "Loading..." : "More"}
                </button>
                
                )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
