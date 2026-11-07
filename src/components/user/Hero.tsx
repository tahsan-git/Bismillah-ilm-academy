import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Content, Locale } from "@/lib/types";
import { pick, lh } from "@/lib/i18n";

export function Hero({ content, locale }: { content: Content; locale: Locale }) {
  const { hero } = content;
  const bgImage = hero.image_url || ""; 

  return (
    <section 
      className="relative overflow-hidden bg-[#FDF5E6] pt-24 pb-32 md:pt-32 md:pb-40 bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: `linear-gradient(to right, rgba(253, 245, 230, 1) 30%, rgba(253, 245, 230, 0.6) 60%, rgba(253, 245, 230, 0) 100%), url(${bgImage})`
      }}
    >
      <div className="max-w-[1240px] mx-auto px-5 relative z-10 flex flex-col items-start justify-center min-h-[400px]">
        <div className="max-w-xl text-left animate-fade-up">
          
          {/* 🌟 সোনালী রঙের লেখা (Eyebrow) */}
          <p className="text-sm font-bold text-[#F2A007] mb-3">
            {pick(hero, "eyebrow", locale)}
          </p>
          
          {/* 🌟 বড় কালো লেখা (Heading) */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-ink leading-tight mb-6">
            {pick(hero, "heading", locale)}
          </h1>
          
          {/* 🌟 বডি টেক্সট */}
          <p className="text-base md:text-lg text-body leading-relaxed mb-8">
            {pick(hero, "body", locale)}
          </p>
          
          {/* 🌟 সবুজ বাটন */}
          <Link href={lh(locale, hero.cta_href)} className="inline-flex items-center gap-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white px-7 py-3.5 rounded-lg font-bold transition shadow-lg">
            {pick(hero, "cta_label", locale)} <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}