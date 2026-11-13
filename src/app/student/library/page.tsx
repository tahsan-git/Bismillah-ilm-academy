"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Library, Loader2, Download, Search } from "lucide-react";

export default function StudentLibrary() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const fetchBooks = async () => {
      const { data } = await supabase
        .from("library_resources")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setBooks(data);
      setLoading(false);
    };
    fetchBooks();
  }, []);

  const filtered = books.filter(
    (b) =>
      b.title_bn?.toLowerCase().includes(query.toLowerCase()) ||
      b.title_en?.toLowerCase().includes(query.toLowerCase()) ||
      b.description?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#002A41]">লাইব্রেরি</h1>
        <p className="text-slate-500 mt-1">বই ও স্টাডি মেটেরিয়াল ডাউনলোড করুন</p>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="বই খুঁজুন..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#002A41]/20"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#002A41]" size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-500">
          কোনো রিসোর্স পাওয়া যায়নি।
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((book) => (
            <div key={book.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3 flex flex-col">
              <div className="w-full h-32 rounded-xl bg-[#002A41]/5 flex items-center justify-center text-[#002A41]">
                <Library size={40} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800">{book.title_bn}</p>
                {book.title_en && <p className="text-xs text-slate-400">{book.title_en}</p>}
                {book.description && (
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{book.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#4CAF50]/10 text-[#4CAF50] uppercase">
                    {book.file_type}
                  </span>
                  {book.class_level && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#002A41]/5 text-[#002A41]">
                      {book.class_level}
                    </span>
                  )}
                </div>
              </div>
              <a
                href={book.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#002A41] text-white text-sm font-bold hover:opacity-90"
              >
                <Download size={16} /> ডাউনলোড
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}