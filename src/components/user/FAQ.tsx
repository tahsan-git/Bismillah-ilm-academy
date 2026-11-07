"use client";
import { useState } from "react";
import type { Content, Locale } from "@/lib/types";
import { pick, t } from "@/lib/i18n";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ScrollReveal } from "../ui/ScrollReveal";

export function FAQ({ content, locale }: { content: Content; locale: Locale }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="faq" className="bg-soft2 py-24 overflow-hidden">
      <div className="max-w-[800px] mx-auto px-5">
        <ScrollReveal direction="up">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-brand mb-3">{t(locale, "আপনার প্রশ্ন, আমাদের উত্তর", "Your questions, our answers")}</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-ink">{t(locale, "গুরুত্বপূর্ণ প্রশ্নসমূহ", "Frequently Asked Questions")}</h2>
          </div>
        </ScrollReveal>
        
        <div className="space-y-4">
          {content.faqs.map((faq, i) => (
            <ScrollReveal key={faq.id} direction="up" delay={i * 0.1}>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <button 
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-ink hover:text-brand transition"
                >
                  {pick(faq, "question", locale)}
                  {openId === faq.id ? <ChevronUp className="text-brand" /> : <ChevronDown className="text-slate-400" />}
                </button>
                {openId === faq.id && (
                  <div className="px-6 pb-5 text-body leading-relaxed border-t border-slate-50 pt-4">
                    {pick(faq, "answer", locale)}
                  </div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}