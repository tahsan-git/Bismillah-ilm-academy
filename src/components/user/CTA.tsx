import Link from "next/link";
import type { Content, Locale } from "@/lib/types";
import { pick, lh } from "@/lib/i18n";

export function CTA({ content, locale }: { content: Content; locale: Locale }) {
  const { cta } = content;
  return (
    <section className="bg-gradient-to-r from-brand to-brand-dark py-20">
      <div className="max-w-[1240px] mx-auto px-5 text-center">
        <p className="text-white/80 text-sm font-bold mb-3 uppercase tracking-wider">{pick(cta, "eyebrow", locale)}</p>
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-10 max-w-3xl mx-auto leading-tight">{pick(cta, "heading", locale)}</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href={lh(locale, cta.primary_href)} className="bg-accent hover:bg-yellow-600 text-white px-8 py-4 rounded-xl font-bold transition shadow-lg">
            {pick(cta, "primary_label", locale)}
          </Link>
          <Link href={lh(locale, cta.secondary_href)} className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded-xl font-bold transition backdrop-blur">
            {pick(cta, "secondary_label", locale)}
          </Link>
        </div>
      </div>
    </section>
  );
}