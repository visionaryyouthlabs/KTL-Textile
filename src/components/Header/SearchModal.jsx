"use client";
import Link from "next/link";
import { useEffect } from "react";

import { useState } from "react";
import { X, Search } from "lucide-react";

export default function SearchModal({ open, setOpen }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");

  const [results, setResults] = useState({
    products: [],
    blogs: [],
  });

  const [loading, setLoading] = useState(false);

  // Search logic
  useEffect(() => {

    const fetchResults = async () => {

      if (!query.trim()) {
        setResults({
          products: [],
          blogs: [],
        });

        return;
      }

      try {

        setLoading(true);

        const res = await fetch(
          `/api/search?q=${query}`
        );

        const data = await res.json();

        setResults(data);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchResults();
    }, 400);

    return () => clearTimeout(debounce);

  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4">

      {/* Modal */}
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center border-b border-purple-300 px-4 py-3">
          <Search className="text-gray-400 mr-2" size={20} />

          <input
            type="text"
            placeholder="Type anything to search..."
            className="flex-1 outline-none text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <button onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 px-4 py-3 border-b border-purple-300">
          {["all", "products", "blogs"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1 rounded-full border border-purple-600 ${tab === t
                ? "bg-purple-600 text-white"
                : "text-gray-600"
                }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-4 space-y-6">
          {loading && (
            <p className="text-sm text-gray-500">
              Searching...
            </p>
          )}
          {/* Products */}
          {(tab === "all" || tab === "products") && (
            <div>
              <h3 className="font-semibold mb-2">Products ( {results.products && results.products.length} )</h3>

              {!loading &&
                results.products.length === 0 && (
                  <p className="text-gray-400 text-sm">
                    No products found
                  </p>
                )}

              {/* Filtering products */}
              {results.products.map((item) => (

                <Link
                  key={item._id}
                  href={`/products/${item.slug.current}`}
                  onClick={() => setOpen(false)}
                  className="flex justify-between items-center py-3 border-b border-purple-300 hover:bg-purple-300 px-2 transition"
                >

                  <div>

                    <h4 className="font-medium text-gray-900">
                      {item.title}
                    </h4>

                    <p className="text-sm text-gray-500">

                      {item.category?.name}

                    </p>

                  </div>

                </Link>
              ))}
            </div>
          )}

          {/* Blogs */}
          {(tab === "all" || tab === "blogs") && (
            <div>
              <h3 className="font-semibold mb-2">Blogs ( {results.products && results.products.length} )</h3>

              {!loading &&
                results.blogs.length === 0 && (
                  <p className="text-gray-400 text-sm">
                    No blogs found
                  </p>
                )}

              {results.blogs.map((item) => (

                <Link
                  key={item._id}
                  href={`/news/${item.slug.current}`}
                  onClick={() => setOpen(false)}
                  className="block py-3 border-b border-purple-300 hover:bg-purple-300 px-2 transition"
                >

                  <h4 className="font-medium text-gray-900">
                    {item.title}
                  </h4>

                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}