import Image from "next/image";
import type { Content, Locale } from "@/lib/types";
import { t } from "@/lib/i18n";

export function Teachers({ content, locale }: { content: Content; locale: Locale }) {
  // ডাটা না থাকলে বা null হলে সেফটি চেক
  const teacherList = content.teachers || [];

  return (
    <section id="teachers" className="bg-soft2 py-24 overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-5">
        <div className="text-center mb-12">
          <p className="text-sm font-bold text-brand mb-3">{t(locale, "টিচার্স টিম", "Teachers Team")}</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">{t(locale, "আমাদের অসাধারণ শিক্ষকগণ", "Our exceptional teachers")}</h2>
        </div>
        
        {teacherList.length === 0 ? (
          <p className="text-center text-slate-500 py-10">কোনো শিক্ষক পাওয়া যায়নি।</p>
        ) : (
          <div className="flex w-max gap-6 animate-slide pb-8">
            {/* ডাটা ডুপ্লিকেট করে অ্যানিমেশন কন্টিনিউ করা হচ্ছে */}
            {[...teacherList, ...teacherList].map((m: any, index: number) => (
              <div key={index} className="shrink-0 w-[240px] bg-white rounded-3xl p-4 text-center shadow-sm transition-all duration-300 border-2 border-transparent hover:border-brand hover:shadow-xl hover:-translate-y-2">
                <div className="rounded-2xl overflow-hidden aspect-square mb-4 bg-slate-100">
                  {m.image_url ? (
                    <Image src={m.image_url} alt="Teacher" width={400} height={400} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">No Image</div>
                  )}
                </div>
                <h3 className="text-base font-bold text-ink">{m.name_bn || m.name || "শিক্ষক"}</h3>
                <p className="text-xs text-brand mt-1">{m.role_bn || "শিক্ষক"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}