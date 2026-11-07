import Image from "next/image";
import type { Content, Locale } from "@/lib/types";
import { pick, t } from "@/lib/i18n";

export function Management({ content, locale }: { content: Content; locale: Locale }) {
  return (
    <section className="bg-white py-24 overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-5">
        <div className="text-center mb-12">
          <p className="text-sm font-bold text-brand mb-3">{t(locale, "ম্যানেজমেন্ট টিম", "Management Team")}</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">{t(locale, "আমাদের সাফল্যের পিছনে যারা", "The people behind our success")}</h2>
        </div>
        
        {/* Auto sliding container */}
        <div className="flex w-max gap-6 animate-slide pb-8">
          {/* কার্ডগুলোকে ২ বার রেন্ডার করছি যাতে স্ক্রল কন্টিনিউয়াস দেখায় */}
          {[...content.management, ...content.management].map((m, index) => (
            <div key={index} className="shrink-0 w-[240px] bg-soft rounded-3xl p-4 text-center transition-all duration-300 border-2 border-transparent hover:border-brand hover:shadow-[0_10px_40px_rgba(4,107,210,0.15)] hover:-translate-y-2">
              <div className="rounded-2xl overflow-hidden aspect-[4/5] mb-4">
                {m.image_url ? (
                  <Image src={m.image_url} alt={m.name_en} width={400} height={500} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">No Image</div>
                )}
              </div>
              <h3 className="text-lg font-bold text-ink">{pick(m, "name", locale)}</h3>
              <p className="text-sm text-body mt-1">{pick(m, "role", locale)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}