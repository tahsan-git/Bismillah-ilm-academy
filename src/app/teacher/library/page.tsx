"use client";
import { useState } from "react";
import { 
  Library, 
  Search, 
  FileText, 
  Download, 
  ExternalLink,
  BookOpen,
  Filter
} from "lucide-react";

export default function DigitalLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // 🌟 ডেমো ডাটা (পরে আসল ডাটাবেস থেকে আসবে)
  const books = [
    { id: 1, title: "নূরানী কায়দা", category: "কায়দা", author: "মাওলানা আব্দুল মজিদ", file_url: "#", size: "২.৫ MB" },
    { id: 2, title: "তাহফিজুল কুরআন", category: "হিফজ", author: "মুফতি নাজমুল হাসান", file_url: "#", size: "৫.১ MB" },
    { id: 3, title: "মাখরাজ ও তাজবিদ", category: "তাজবিদ", author: "ক্বারী মুস্তাফিজুর রহমান", file_url: "#", size: "৩.২ MB" },
    { id: 4, title: "নাজেরা বেসিক", category: "নাজেরা", author: "মাওলানা ইলিয়াস", file_url: "#", size: "৪.০ MB" },
    { id: 5, title: "শিশুদের দুআ শিক্ষা", category: "দুআ", author: "মুফতি গোলাম মোস্তফা", file_url: "#", size: "১.৮ MB" },
    { id: 6, title: "কায়দা ২য় খণ্ড", category: "কায়দা", author: "মাওলানা আব্দুল মজিদ", file_url: "#", size: "২.৭ MB" },
  ];

  const categories = ["all", ...new Set(books.map(b => b.category))];

  // 🌟 সার্চ ও ফিল্টার লজিক
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* হেডার */}
      <div>
        <h1 className="text-2xl font-bold text-[#002A41]">ডিজিটাল লাইব্রেরি</h1>
        <p className="text-slate-500 mt-1">প্রয়োজনীয় বই ও নোট ডাউনলোড করুন</p>
      </div>

      {/* 🌟 সার্চ ও ফিল্টার */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="বইয়ের নাম বা লেখক দিয়ে খুঁজুন..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#002A41] outline-none text-sm"
          />
        </div>
        
        <div className="relative md:w-64">
          <Filter className="absolute left-3 top-3 text-slate-400" size={18} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#002A41] outline-none text-sm appearance-none bg-white"
          >
            <option value="all">সব ক্যাটাগরি</option>
            {categories.filter(c => c !== 'all').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 🌟 বইয়ের লিস্ট */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBooks.map((book) => (
          <div key={book.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#002A41]/10 text-[#002A41] flex items-center justify-center shrink-0">
                <BookOpen size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 leading-tight">{book.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{book.author}</p>
                <span className="inline-block mt-2 bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">
                  {book.category}
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">PDF • {book.size}</span>
              
              <div className="flex gap-2">
                <a href={book.file_url} target="_blank" rel="noreferrer" className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition" title="View">
                  <ExternalLink size={16} />
                </a>
                <a href={book.file_url} download className="p-2 bg-[#002A41] text-white rounded-lg hover:bg-[#003D5C] transition" title="Download">
                  <Download size={16} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="bg-white p-10 rounded-2xl text-center border border-slate-100 text-slate-500">
          কোনো বই পাওয়া যায়নি।
        </div>
      )}

    </div>
  );
}