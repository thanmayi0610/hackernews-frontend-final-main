"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SubmitPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/posts/create-post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
        body: JSON.stringify({ title, content }),
      });

      if (res.ok) {
        router.push("/"); 
      } else {
        const data = await res.json();
        alert(data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Submit failed:", error);
      alert("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-15 text-sm">
      <div className="bg-orange-500 p-2 text-black font-bold">Submit</div>
      <form onSubmit={handleSubmit} className="bg-[#f6f6ef] p-4">
        <div className="mb-3">
          <label className="block mb-1">title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1"
            required
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1">url</label>
          <input
            type="text"
            disabled
            placeholder="(optional - currently disabled)"
            className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-100"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">text</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 h-28"
          />
        </div>

        <button
          type="submit"
          className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "submit"}
        </button>

        <p className="mt-4 text-xs text-gray-600">
          Leave url blank to submit a question for discussion. If there is no
          url, text will appear at the top of the thread.
        </p>
      </form>
    </div>
  );
}
