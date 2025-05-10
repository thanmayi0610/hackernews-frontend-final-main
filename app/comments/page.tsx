"use client";

import React, { useEffect, useState,useCallback } from "react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
  post: {
    id: string;
    title: string;
  };
}

export default function AllCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchComments =useCallback( async (currentPage: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/comments/all?page=${currentPage}&limit=5`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();

      if (res.ok) {
        const cleanedComments: Comment[] = (data.data ?? []).filter((c: unknown): c is Comment => {
          if (
            typeof c === "object" &&
            c !== null &&
            "id" in c &&
            "content" in c &&
            "createdAt" in c &&
            "user" in c &&
            "post" in c
          ) {
            return true;
          }
          return false;
        })

        setComments((prev) => {
          const newComments = cleanedComments.filter((newComment) => {
            return !prev.some((existing) => existing.id === newComment.id);
          });
          return [...prev, ...newComments];
        });

        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  },[API_BASE]);

  useEffect(() => {
    fetchComments(page);
  }, [fetchComments,page]);

  return (
    <div className="bg-[#f6f6ef] min-h-screen pt-20 px-4 text-[13px] text-black max-w-2xl mx-auto">
      <h1 className="text-orange-600 text-[18px] font-bold mb-6 text-center">All Comments</h1>
  
      {loading && comments.length === 0 ? (
        <div className="text-center text-gray-500">Loading comments...</div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-center">No comments available.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment, index) => {
            if (!comment.id) return null;
  
            return (
              <li
                key={comment.id}
                className="bg-white rounded-2xl px-4 py-3 shadow-md border-l-4 border-[#b3d4fc] flex justify-between"
              >
                <div className="flex-1">
                  <div className="text-[14px] font-semibold text-pink-600 mb-1">
                    {index + 1}. {comment.user?.name ?? "Anonymous"}
                  </div>
                  <p className="text-gray-800 mb-1">{comment.content}</p>
                  <div className="text-[12px] text-gray-600">
                    on post:{" "}
                    <span className="text-blue-600 italic hover:underline cursor-pointer">
                      {comment.post?.title ?? "Unknown Post"}
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-gray-500 whitespace-nowrap ml-4">
                  {new Date(comment.createdAt).toLocaleTimeString()}
                </div>
              </li>
            );
          })}
        </ul>
      )}
  
      {page < totalPages && !loading && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setPage((prev) => prev + 1)}
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


