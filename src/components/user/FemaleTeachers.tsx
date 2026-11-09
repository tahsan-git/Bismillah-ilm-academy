import Link from "next/link";
import { ArrowRight } from "lucide-react"; // বাটনের আইকনের জন্য
import type { Content, Locale } from "@/lib/types";
import { pick, t } from "@/lib/i18n";

export function FemaleTeachers({ content, locale }: { content: Content; locale: Locale }) {
  // 🌟 শুধুমাত্র মহিলা শিক্ষকদের ফিল্টার (gender 'female' হলে)
  const femaleTeachers = content.teachers.filter((m) => m.gender === "female");

  if (femaleTeachers.length === 0) return null;

  return (
    <section 
      id="female-teachers" 
      className={`relative py-24 overflow-hidden bg-cover bg-center bg-no-repeat ${
        !content.backgrounds?.teachers_female ? 'bg-gradient-to-br from-[#FDF5E6] via-[#FFF8E7] to-[#F2A007]/20' : ''
      }`}
      style={{
        backgroundImage: content.backgrounds?.teachers_female 
          ? `linear-gradient(rgba(253,245,230,0.4), rgba(253,245,230,0.4)), url('${content.backgrounds.teachers_female}')` 
          : 'none'
      }}
    >
      <div className="max-w-[1240px] mx-auto px-5 relative z-10">
        <div className="text-center mb-12">
          <p className="text-sm font-bold text-[#4CAF50] mb-3">{t(locale, "মহিলা শিক্ষক", "Female Teachers")}</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">{t(locale, "আমাদের শিক্ষিকাগণ", "Our Female Teachers")}</h2>
        </div>

        <div className="w-full overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[#FDF5E6] to-transparent z-20 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[#FDF5E6] to-transparent z-20 pointer-events-none"></div>

          <div className="animate-marquee gap-6 py-4" style={{ animationDirection: 'reverse' }}>
            {[...femaleTeachers, ...femaleTeachers].map((m, index) => (
              <div key={index} className="shrink-0 w-[240px] bg-white rounded-3xl p-4 text-center transition-all duration-300 border-2 border-transparent hover:border-[#4CAF50] hover:shadow-[0_10px_40px_rgba(76,175,80,0.2)] hover:-translate-y-2">
                <div className="rounded-2xl overflow-hidden aspect-[4/5] mb-4 bg-slate-100">
                  {m.image_url ? (
                    <img src={m.image_url} alt={m.name || "Teacher"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-sm">No Image</div>
                  )}
                </div>
                {/* 🌟 name_bn/name_en এর বদলে সরাসরি name */}
                <h3 className="text-lg font-bold text-ink">{m.name}</h3>
                <p className="text-sm text-[#4CAF50] font-medium mt-1">{pick(m, "role", locale)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 👇 নতুন যোগ করা বাটন 👇 */}
        <div className="mt-12 flex justify-center">
          <Link 
            href="/teachers" 
            className="inline-flex items-center gap-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white px-8 py-4 rounded-xl font-bold transition shadow-lg hover:-translate-y-1"
          >
            আমাদের শিক্ষক-শিক্ষিকাদের দেখুন <ArrowRight size={20} />
          </Link>
        </div>
        {/* 👆 নতুন যোগ করা বাটন শেষ 👆 */}

      </div>
    </section>
  );
}