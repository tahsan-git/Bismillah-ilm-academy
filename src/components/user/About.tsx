import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Content, Locale } from "@/lib/types";
import { pick, lh } from "@/lib/i18n";
import { ScrollReveal } from "../ui/ScrollReveal";

export function About({ content, locale }: { content: Content; locale: Locale }) {
  const { about } = content;
  const paragraphs = pick(about, "body", locale).split(/\n\n+/);
  
  return (
    <section id="about" className="bg-white py-24 overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-5 grid md:grid-cols-2 gap-16 items-center">
        
        <ScrollReveal direction="left">
          {about.image_url && (
            <Image src={about.image_url} alt="About" width={700} height={900} className="w-full rounded-3xl object-cover shadow-2xl" />
          )}
        </ScrollReveal>

        <ScrollReveal direction="right" delay={0.2}>
          <p className="text-sm font-bold text-brand mb-3">{pick(about, "eyebrow", locale)}</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink mb-6">{pick(about, "heading", locale)}</h2>
          <div className="space-y-4 text-body text-base leading-relaxed">
            {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          {about.cta_label_bn && about.cta_href && (
            <Link href={lh(locale, about.cta_href)} className="inline-flex items-center gap-2 mt-8 bg-brand hover:bg-brand-dark text-white px-6 py-3 rounded-lg font-bold transition">
              {pick(about, "cta_label", locale)} <ChevronRight size={18} />
            </Link>
          )}
        </ScrollReveal>

      </div>
    </section>
  );
}