// 'use client';

// import Link from 'next/link';
// import { useState, useEffect } from 'react';

// type Post = {
//   id: string;
//   title: string;
//   content: string;
//   // Add other fields as needed
// };

// export default function SearchBar() {
//   const [query, setQuery] = useState('');
//   const [results, setResults] = useState<Post[]>([]);
//   const [page, setPage] = useState(1);
//   const [total, setTotal] = useState(0);
//   const pageSize = 5;

//   useEffect(() => {
//     if (query.length > 0) {
//       fetch(
//         `http://localhost:3000/posts/search?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`,
//         { credentials: 'include' }
//       )
//         .then((res) => res.json())
//         .then((data) => {
//           setResults(data.data ?? []); // ✅ access actual data array
//           setTotal(data.pagination?.total ?? 0); // ✅ read total count
//         })
//         .catch((err) => {
//           console.error('Search fetch error:', err);
//           setResults([]);
//           setTotal(0);
//         });
//     } else {
//       setResults([]);
//       setTotal(0);
//     }
//   }, [query, page]);
  

//   const totalPages = Math.ceil(total / pageSize);

//   return (
//     <div className="p-4 bg-gray-50">
//       <label className="text-gray-700 mr-2">Search:</label>
//       <input
//         type="text"
//         value={query}
//         onChange={(e) => {
//           setQuery(e.target.value);
//           setPage(1); // Reset to first page on new search
//         }}
//         className="border border-blue-500 rounded px-2 py-1 focus:outline-none"
//         placeholder="Type to search..."
//       />

// <div className="mt-4 space-y-4">
//   {(results || []).map((post) => (
//     // Inside your .map()
//     <Link href={`/${post.id}`} key={post.id} className="block">
//       <div className="p-4 border rounded bg-white shadow hover:bg-gray-100 transition">
//         <h2 className="font-bold text-lg">{post.title}</h2>
//         <p className="text-gray-700 mt-1">{post.content}</p>
//       </div>
//     </Link>
    
//   ))}
// </div>

//       {total > pageSize && (
//         <div className="mt-4 flex space-x-2">
//           <button
//             disabled={page === 1}
//             onClick={() => setPage((prev) => prev - 1)}
//             className="px-3 py-1 border rounded disabled:opacity-50"
//           >
//             Previous
//           </button>
//           <span className="px-2 text-gray-600">
//             Page {page} of {totalPages}
//           </span>
//           <button
//             disabled={page === totalPages}
//             onClick={() => setPage((prev) => prev + 1)}
//             className="px-3 py-1 border rounded disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

type Post = {
  id: string;
  title: string;
  content: string;
};

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 5;
  
  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (query.length > 0) {
      fetch(
        `${API_BASE}/posts/search?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`,
        { credentials: 'include' }
      )
        .then((res) => res.json())
        .then((data) => {
          setResults(data.data ?? []);
          setTotal(data.pagination?.total ?? 0);
        })
        .catch((err) => {
          console.error('Search fetch error:', err);
          setResults([]);
          setTotal(0);
        });
    } else {
      setResults([]);
      setTotal(0);
    }
  }, [query, page]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="relative">
      <div className="flex items-center space-x-2 bg-white rounded px-3 py-1 shadow-md border">
        <label htmlFor="search-input" className="text-sm font-medium text-gray-700">
          Search:
        </label>
        <input
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          className="w-64 px-3 py-1 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          placeholder="Type to search..."
        />
      </div>

      {results.length > 0 && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded shadow-lg max-h-96 overflow-y-auto">
          {results.map((post) => (
            <Link href={`/${post.id}`} key={post.id} className="block hover:bg-gray-100 transition px-4 py-3">
              <h2 className="font-semibold text-sm text-gray-800">{post.title}</h2>
              <p className="text-gray-600 text-sm mt-1 truncate">{post.content}</p>
            </Link>
          ))}
        </div>
      )}

      {total > pageSize && (
        <div className="flex justify-between items-center mt-3 text-sm text-gray-700">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
