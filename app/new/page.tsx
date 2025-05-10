"use client";

import React, { useCallback, useEffect, useState } from "react";

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function NewPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchPosts = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/posts/getAllposts?page=${pageNum}&limit=${limit}`,
        { credentials: "include" }
      );
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server error:", res.status, errorText);
        return;
      }
      const data = await res.json();
      setPosts((prev) => {
        const newPosts = data.data.filter((newPost: Post) => !prev.some((post: Post) => post.id === newPost.id));
        return [...prev, ...newPosts];
      });
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  },[limit,API_BASE]);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto bg-[#f6f6ef] mt-15">
      <h1 className="text-[18px] font-bold mb-4 text-orange-600 text-center">New Posts</h1>

      <div className="space-y-4">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="bg-white rounded-2xl shadow-md p-4 border-l-[4px] border-blue-200"
          >
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>
                <span className="font-bold text-gray-700">{index + 1}.</span>{" "}
                <span className="text-pink-600 font-medium hover:underline cursor-pointer">
                  {post.title}
                </span>
              </div>
              <span className="text-xs">
                {new Date(post.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-gray-700 text-[13px] mt-2">{post.content}</p>
          </div>
        ))}
      </div>

      {page < totalPages && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleLoadMore}
            className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Loading..." : "More"}
          </button>
        </div>
      )}
    </div>
  );
}
