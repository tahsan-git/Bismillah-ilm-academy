import Link from "next/link";
import type { Content, Locale } from "@/lib/types";
import { pick, t, lh } from "@/lib/i18n";
import { Check } from "lucide-react";
import { ScrollReveal } from "../ui/ScrollReveal";

export function Pricing({ content, locale }: { content: Content; locale: Locale }) {
  return (
    <section id="pricing" className="bg-white py-24 overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0C50 27.614 72.386 50 100 50C72.386 50 50 72.386 50 100C50 72.386 27.614 50 0 50C27.614 50 50 27.614 50 0Z' fill='%234CAF50'/%3E%3C/svg%3E")`, backgroundSize: '150px' }}>
      </div>

      <div className="max-w-[1100px] mx-auto px-5 relative z-10">
        <ScrollReveal direction="up">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-[#F2A007] mb-3">{t(locale, "প্রাইসিং মডেল", "Pricing Model")}</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-ink">{t(locale, "আপনার পছন্দের প্লান বাছাই করুন", "Choose your preferred plan")}</h2>
          </div>
        </ScrollReveal>
        
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {content.pricing.map((plan, i) => (
            <ScrollReveal key={plan.id} direction="up" delay={i * 0.15}>
              <div className="group rounded-3xl p-6 md:p-8 border-2 border-transparent bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 hover:bg-[#4CAF50] hover:shadow-[0_20px_50px_rgba(76,175,80,0.3)] hover:-translate-y-3 h-full flex flex-col cursor-pointer">
                <h3 className="text-lg font-bold text-ink text-center mb-2 transition-colors duration-300 group-hover:text-white">
                  {pick(plan, "name", locale)}
                </h3>
                <div className="text-center mb-6 border-b border-slate-100 pb-4 transition-colors duration-300 group-hover:border-white/20">
                  <span className="text-3xl font-extrabold text-[#4CAF50] transition-colors duration-300 group-hover:text-white">
                    ৳ {plan.price}
                  </span>
                  <span className="text-sm text-slate-500 transition-colors duration-300 group-hover:text-white/80"> /month</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {(locale === "bn" ? plan.features_bn : plan.features_en).map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check size={18} className="text-[#4CAF50] shrink-0 mt-0.5 transition-colors duration-300 group-hover:text-white" />
                      <span className="text-sm text-body font-medium transition-colors duration-300 group-hover:text-white">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href={lh(locale, plan.cta_href)} className="block w-full py-3 rounded-xl text-center text-sm font-bold transition-colors duration-300 border-2 border-[#4CAF50] text-[#4CAF50] bg-transparent group-hover:bg-white group-hover:text-[#4CAF50] group-hover:border-white mt-auto">
                  {pick(plan, "cta_label", locale)}
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}