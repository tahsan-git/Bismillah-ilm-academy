import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function CTA() {
  // এখানে আপনার ব্যাকগ্রাউন্ড ইমেজের লিংক দিতে পারবেন। 
  // আপাতত আমি একটি ইসলামিক জিওমেট্রিক প্যাটার্ন দিয়ে রেখেছি।
  const bgImage = "https://www.transparenttextures.com/patterns/arabesque.png"; 

  return (
    <section 
      className="relative py-16 md:py-24 overflow-hidden bg-[#38a3a5] bg-blend-overlay"
      style={{
        backgroundImage: `linear-gradient(rgba(56, 163, 165, 0.9), rgba(56, 163, 165, 0.9)), url('${bgImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* মূল কন্টেইনার */}
      <div className="max-w-[1240px] mx-auto px-5 relative z-10 grid lg:grid-cols-2 gap-10 items-center">
        
        {/* বাম দিকের লেখা (অ্যানিমেশন সহ) */}
        <div>
          <p className="text-white/90 text-sm font-bold mb-3 uppercase tracking-wider animate-float-up-small">
            আমাদের সাথে যুক্ত হোন
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-snug animate-drop-down">
            কুরআনের পথে যাত্রা শুরু হোক <br className="hidden md:block" /> বিসমিল্লাহ ইলম একাডেমির সাথে...
          </h2>
        </div>

        {/* ডান দিকের বাটন (অ্যানিমেশন সহ) */}
        <div className="flex flex-col sm:flex-row lg:justify-end gap-4 animate-slide-right-btns">
          {/* প্রথম বাটন (Outline) */}
          <Link 
            href="/trial-class" 
            className="flex items-center justify-center gap-2 border-2 border-white text-white px-6 py-3.5 rounded-lg font-bold hover:bg-white hover:text-[#38a3a5] transition duration-300"
          >
            ট্রায়াল ক্লাস করুন <ChevronRight size={18} />
          </Link>
          
          {/* দ্বিতীয় বাটন (Solid White) */}
          <Link 
            href="/teacher/register" 
            className="flex items-center justify-center gap-2 bg-white text-[#38a3a5] px-6 py-3.5 rounded-lg font-bold hover:bg-slate-100 transition duration-300 shadow-lg"
          >
            শিক্ষক হিসাবে যোগ দিন <ChevronRight size={18} />
          </Link>
        </div>

      </div>
    </section>
  );
}