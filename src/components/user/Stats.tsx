"use client";
import { useEffect, useState } from "react";
import type { Content, Locale } from "@/lib/types";
import { pick } from "@/lib/i18n";
import { Users, BookOpen, Clock, Award } from "lucide-react";

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now(); const dur = 2000;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.floor(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span className="text-2xl md:text-3xl font-extrabold text-ink transition-colors duration-300 group-hover:text-emerald-600">{n.toLocaleString()}{suffix}</span>;
}

const getIcon = (key: string) => {
  if (key === "students" || key === "শিক্ষার্থী") return <Users size={20} />;
  if (key === "teachers" || key === "শিক্ষক") return <Award size={20} />;
  if (key === "hours" || key === "ক্লাস আওয়ার") return <Clock size={20} />;
  return <BookOpen size={20} />;
};

export function Stats({ content, locale }: { content: Content; locale: Locale }) {
  const hasBg = !!content.backgrounds?.stats; // চেক করা ইমেজ আছে কি না

  return (
    <section 
      className={`relative z-20 -mt-12 pb-16 bg-cover bg-center bg-no-repeat ${!hasBg ? 'bg-[#FDF5E6]' : ''}`}
      style={{
        backgroundImage: hasBg 
          ? `linear-gradient(rgba(253,245,230,0.6), rgba(253,245,230,0.)), url('${content.backgrounds.stats}')` 
          : 'none'
      }}
    >
      <div className="max-w-[1240px] mx-auto px-5">
        {/* লেখার সাথে অ্যালাইন করার জন্য max-w-3xl ব্যবহার করা হলো */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
          {content.stats.map((s) => (
            <div key={s.id} className="group cursor-pointer flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.05)] transition-all duration-300 hover:border-emerald-500 hover:shadow-[inset_0_4px_10px_rgba(0,0,0,0.05),0_0_20px_rgba(16,185,129,0.2)] hover:translate-y-1">
              <div className="w-10 h-10 rounded-full bg-[#FDF5E6] text-[#F2A007] flex items-center justify-center mb-2 transition-transform group-hover:scale-110">
                {getIcon(s.icon_key || s.label_bn)}
              </div>
              <Counter to={s.value} suffix={locale === "bn" ? s.suffix_bn : s.suffix} />
              <p className="mt-1 text-xs font-bold text-body transition-colors duration-300 group-hover:text-emerald-700">{pick(s, "label", locale)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}