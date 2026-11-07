import type { Content, Locale } from "@/lib/types";
import { pick, t } from "@/lib/i18n";
import { Users, Gift, Clock, GraduationCap } from "lucide-react";
import { ScrollReveal } from "../ui/ScrollReveal";

const icons: Record<string, any> = {
  "one-to-one": Users, "trial": Gift, "time": Clock, "female": GraduationCap,
};

export function Features({ content, locale }: { content: Content; locale: Locale }) {
  return (
    <section id="features" className="bg-soft2 py-24">
      <div className="max-w-[1240px] mx-auto px-5">
        <ScrollReveal direction="up">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-brand mb-3">{t(locale, "আমাদের বৈশিষ্ট সমূহ", "Our Features")}</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-ink">{t(locale, "কেনো আমাদের বাছাই করবেন", "Why Choose Us")}</h2>
          </div>
        </ScrollReveal>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {content.features.map((f, i) => {
            const Icon = icons[f.icon_key] ?? Users;
            return (
              <ScrollReveal key={f.id} direction="up" delay={i * 0.1}>
                <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 transition duration-300 h-full border border-slate-100">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-ink mb-3">{pick(f, "title", locale)}</h3>
                  <p className="text-sm text-body leading-relaxed">{pick(f, "body", locale)}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}