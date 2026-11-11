"use client";
import { useState, useRef } from "react";
import type { Content, Locale } from "@/lib/types";
import { pick, t } from "@/lib/i18n";
import { ScrollReveal } from "../ui/ScrollReveal";

export function Testimonials({ content, locale }: { content: Content; locale: Locale }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const items = content.testimonials;

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  if (!items || items.length === 0) return null;
  const activeItem = items[activeIndex];

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setActiveIndex((prev) => (prev + 1) % items.length);
    } else if (isRightSwipe) {
      setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    }
  };

  return (
    <section
      className="relative bg-soft2 py-24 overflow-hidden"
      style={{
        // 👇 এখানে আপনার ইমেজের লিংক বা পাথ দিন
        backgroundImage: `url('/images/testimonial-bg.jpeg')`, 
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* 👇 ওভারলে (Overlay) - যাতে ইমেজের ওপর লেখা পরিষ্কার বোঝা যায় */}
      <div className="absolute inset-0 bg-white/50 z-0" />

      <div className="relative z-10 max-w-[1240px] mx-auto px-5 grid md:grid-cols-2 gap-16 items-center">

        {/* ================= ডান দিকের টেক্সট (মোবাইলে উপরে, ডেস্কটপে ডানে) ================= */}
        <div className="order-1 md:order-2">
          <ScrollReveal direction="up" delay={0.2}>
            <p className="text-accent font-bold mb-4 uppercase tracking-wider text-sm">
              {t(locale, "সম্মানিত গার্ডিয়ানদের মন্তব্য", "Guardian Testimonials")}
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-ink mb-6 leading-tight">
              {t(locale, "আমাদের সম্পর্কে অভিভাবকরা যা ভাবছেন", "What guardians think about us")}
            </h2>
            <p className="text-body text-base leading-relaxed max-w-lg">
              {t(locale, "প্রতিষ্ঠার শুরু থেকেই আমরা সম্মানিত অভিভাবকদের মতামত, পরামর্শ এবং অভিযোগের ভিত্তিতে সামনে এগিয়ে চলেছি। তাদেরই কিছু গুরুত্বপূর্ণ মতামত তুলে দেওয়া হলো।", "From the very beginning, we have been moving forward based on the opinions and feedback of our respected guardians. Here are some of their valuable testimonials.")}
            </p>
          </ScrollReveal>
        </div>

        {/* ================= বাম দিকের কার্ড (মোবাইলে নিচে, ডেস্কটপে বামে) ================= */}
        <div className="order-2 md:order-1">
          <ScrollReveal direction="left">
            <div className="relative">
              <div
                className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] relative z-10 min-h-[350px] flex flex-col justify-between touch-pan-y select-none"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <div>
                  <svg className="w-10 h-10 text-slate-200 mb-6" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                  <p className="text-body text-base md:text-lg leading-relaxed italic mb-8 relative z-10">
                    "{pick(activeItem, "quote", locale)}"
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-brand mb-1">{pick(activeItem, "author", locale)}</h4>
                  <p className="text-sm font-medium text-body">{pick(activeItem, "role", locale)}</p>
                </div>
                <div className="absolute top-10 right-10 w-24 h-24 bg-slate-50 rounded-full -z-10"></div>
              </div>

              <div className="absolute -top-6 -right-2 md:-top-10 md:-right-10 w-28 h-28 md:w-32 md:h-32 bg-white rounded-2xl p-2 shadow-lg z-20">
                <div className="w-full h-full rounded-xl overflow-hidden bg-slate-200 flex items-center justify-center">
                  {activeItem.image_url ? (
                    <img src={activeItem.image_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-400 text-xs">Photo</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-8 ml-4">
                {items.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeIndex === idx ? "w-8 bg-accent" : "w-4 bg-slate-300 hover:bg-slate-400"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

      </div>
    </section>
  );
}