"use client";
import { useCallback, useEffect, useState } from "react";
import { formatISO, subDays } from "date-fns";

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

const PastPostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 5;
  const [beforeDate, setBeforeDate] = useState(formatISO(new Date()));
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  
  const fetchPosts = useCallback(
    async (pageNum: number, date: string) => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/posts/pastposts?before=${encodeURIComponent(date)}&page=${pageNum}&limit=${limit}`,
          { credentials: "include" }
        );
        if (!res.ok) {
          const errText = await res.text();
          console.error("❌ Server responded with:", res.status, errText);
          return;
        }
        const data = await res.json();
        setPosts(data.data);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        console.error("❌ Fetch failed completely:", err);
      } finally {
        setLoading(false);
      }
    },
    [API_BASE, limit]
  );

  useEffect(() => {
    fetchPosts(page, beforeDate);
  }, [fetchPosts, page, beforeDate]);

  
  const loadMorePosts = () => {
    if (page < totalPages) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleChangeDate = (days: number) => {
    const newDate = subDays(new Date(), days);
    setBeforeDate(formatISO(newDate));
    setPage(1);
  };

  return (
    <div className="bg-[#f6f6ef] min-h-screen pt-20 px-4 text-[13px] text-black max-w-2xl mx-auto">
      <h1 className="text-orange-600 text-[18px] font-bold mb-6 text-center">Past Posts</h1>
  
      <div className="flex gap-3 justify-center mb-8 text-sm">
        <button
          onClick={() => handleChangeDate(1)}
          className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
        >
          Go back a day
        </button>
        <button
          onClick={() => handleChangeDate(30)}
          className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
        >
          Go back a month
        </button>
        <button
          onClick={() => handleChangeDate(365)}
          className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
        >
          Go back a year
        </button>
      </div>
  
      {loading && <p className="text-center text-gray-500">Loading...</p>}
  
      <ol className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-center text-gray-500">No posts available for this time period.</p>
        ) : (
          posts.map((post, index) => (
            <li
              key={post.id}
              className="bg-white rounded-2xl px-4 py-3 shadow-md border-l-4 border-[#b3d4fc] flex justify-between items-start"
            >
              <div>
                <div className="text-[14px] font-semibold text-pink-600">
                  {index + 1}. {post.title}
                </div>
                <div className="text-[13px] mt-1 text-gray-800">{post.content}</div>
              </div>
              <div className="text-[12px] text-gray-500 whitespace-nowrap ml-4">
                {new Date(post.createdAt).toLocaleTimeString()}
              </div>
            </li>
          ))
        )}
      </ol>
  
      {page < totalPages && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMorePosts}
            disabled={loading}
            className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 disabled:opacity-50"
          >
            {loading ? "Loading..." : "More"}
          </button>
        </div>
      )}
    </div>
  );
  
};

export default PastPostsPage;
