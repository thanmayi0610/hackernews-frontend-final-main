"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  likes: number;
  commentsCount: number;
  likedByUser: boolean;
  userId: string;
  username: string;
};

type ApiResponse = {
  data: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export default function PostPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const limit = 5;
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
  

  const fetchPosts = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/posts/getAllposts?page=${pageNum}&limit=${limit}`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      const text = await res.text();

      if (!res.ok) {
        console.error("Fetch error:", text);
        setError("Failed to load posts.");
        setLoading(false);
        return;
      }

      const json: ApiResponse = JSON.parse(text);
      setTotalPages(json.pagination.totalPages);
      const hiddenPosts = JSON.parse(localStorage.getItem("hiddenPosts") || "[]") as string[];

      
      const visiblePosts = json.data.filter((p) => !hiddenPosts.includes(p.id));
setPosts(visiblePosts);

      if (pageNum >= json.pagination.totalPages) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  },[API_BASE]);

  useEffect(() => {
    fetchPosts(page);
  }, [page,fetchPosts]);

  const handleVoteToggle = async (postId: string, liked: boolean) => {
    try {
      if (!liked) {
        const res = await fetch(`${API_BASE}/likes/on/${postId}`, {
          method: "POST",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.like) {
            setPosts((prev) =>
              prev.map((post) =>
                post.id === postId ? { ...post, likes: post.likes + 1, likedByUser: true } : post
              )
            );
          }
        }
      } else {
        const res = await fetch(`${API_BASE}/likes/deletelike/${postId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.message === "Like on the given post deleted suceesfully") {
            setPosts((prev) =>
              prev.map((post) =>
                post.id === postId
                  ? { ...post, likes: Math.max(0, post.likes - 1), likedByUser: false }
                  : post
              )
            );
          }
        }
      }
    } catch (err) {
      console.error("Error toggling vote:", err);
    }
  };

  const handleHide = (postId: string) => {
    const hiddenPosts = JSON.parse(localStorage.getItem("hiddenPosts") || "[]");
    hiddenPosts.push(postId);
    localStorage.setItem("hiddenPosts", JSON.stringify(hiddenPosts));
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  const handleCommentClick = (postId: string) => {
    router.push(`/${postId}`);
  };

  const handleUserClick = (userId: string) => {
    router.push(`/users/${userId}`);
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 mt-15">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {posts.length === 0 && !loading && <p className="text-muted-foreground">No posts available.</p>}

      <ul className="space-y-4">
        {posts.map((post, index) => (
          <motion.li
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="shadow-md shadow-blue-500/50 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  {!post.likedByUser && (
                    <button
                      onClick={() => handleVoteToggle(post.id, false)}
                      className="text-gray-400 hover:text-orange-500 transition"
                    >
                      ▲
                    </button>
                  )}
                  <span className="font-semibold text-muted-foreground">{index + 1}.</span>
                  <a
                    href={`/${post.id}`}
                    className="font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800  inline-block text-transparent bg-clip-text text-xl"
                  >
                    {post.title}
                  </a>
                </div>

                <div className="text-sm text-gray-500 flex flex-wrap gap-4">
                  <span>
                    {post.likes} points by{" "}
                    <button
                      onClick={() => handleUserClick(post.userId)}
                      className="font-medium bg-gradient-to-r from-pink-500 to-orange-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800  inline-block text-transparent bg-clip-text"
                    >
                      {post.username}
                    </button>{" "}
                    {new Date(post.createdAt).toLocaleTimeString()}
                  </span>

                  {post.likedByUser && (
                    <Button
                      variant="link"
                      className="text-xs text-gray-500"
                      onClick={() => handleVoteToggle(post.id, true)}
                    >
                      unvote
                    </Button>
                  )}

                  <Button
                    variant="link"
                    className="text-xs text-gray-500"
                    onClick={() => handleHide(post.id)}
                  >
                    hide
                  </Button>

                  <Button
                    variant="link"
                    className="text-xs text-gray-500"
                    onClick={() => handleCommentClick(post.id)}
                  >
                    {post.commentsCount} comments
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.li>
        ))}
      </ul>

      {loading &&hasMore&& (
        <div className="mt-4 space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      )}
      {!loading && (
  <div className="flex justify-center items-center gap-2 mt-6">
    <button
      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
      disabled={page === 1}
      className="px-3 py-1 border rounded disabled:opacity-50"
    >
      Previous
    </button>

    {[...Array(totalPages)].map((_, i) => {
      const pageNum = i + 1;
      return (
        <button
          key={pageNum}
          onClick={() => setPage(pageNum)}
          className={`px-3 py-1 rounded border ${
            page === pageNum ? "bg-gray-200 font-bold" : ""
          }`}
        >
          {pageNum}
        </button>
      );
    })}

    <button
      onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
      disabled={page === totalPages}
      className="px-3 py-1 border rounded disabled:opacity-50"
    >
      Next
    </button>
  </div>
)}


    </main>
  );
}
