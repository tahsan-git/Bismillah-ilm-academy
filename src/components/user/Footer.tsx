"use client";
import { useState } from "react";
import Link from "next/link";
import type { Content, Locale } from "@/lib/types";
import { pick, lh, t } from "@/lib/i18n";
import { Facebook, Instagram, Youtube, Mail, Phone, MessageCircle } from "lucide-react";

export function Footer({ content, locale }: { content: Content; locale: Locale }) {
  const [logoError, setLogoError] = useState(false);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="bg-ink text-slate-300 py-16">
      <div className="max-w-[1240px] mx-auto px-5 grid md:grid-cols-4 gap-12">
        
        <div className="md:col-span-1">
          <Link href="/" className="inline-block mb-6">
            {!logoError ? (
              <img src="/images/logo.png" alt="Logo" className="h-14 w-auto object-contain" onError={() => setLogoError(true)} />
            ) : (
              <span className="text-2xl font-bold text-white">{pick(content.brand, "name", locale)}</span>
            )}
          </Link>
          <p className="text-sm leading-relaxed mb-6">{pick(content.brand, "tagline", locale)}</p>
          <div className="flex gap-4">
            {content.socials.map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#4CAF50] transition text-white">
                {s.icon === "facebook" && <Facebook size={18} />}
                {s.icon === "youtube" && <Youtube size={18} />}
                {s.icon === "instagram" && <Instagram size={18} />}
                {s.icon === "messenger" && <MessageCircle size={18} />}
              </a>
            ))}
          </div>
        </div>
        
        {content.footer.map((col) => (
          <div key={col.id}>
            <h3 className="text-lg font-bold text-white mb-5">{pick(col, "title", locale)}</h3>
            <ul className="space-y-3">
              {col.items.map((item, i) => (
                <li key={i}>
                  <Link 
                    href={item.href} 
                    onClick={(e) => handleScroll(e, item.href)}
                    className="text-sm hover:text-[#4CAF50] transition"
                  >
                    {locale === "bn" ? item.label_bn : item.label_en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="text-lg font-bold text-white mb-5">{t(locale, "যোগাযোগ", "Contact")}</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-[#4CAF50]" /> {content.contact.phone_display}
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-[#4CAF50]" /> {content.contact.email}
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-[1240px] mx-auto px-5 mt-16 pt-8 border-t border-white/10 text-center text-xs text-slate-400">
        {pick(content.footerCopy, "text", locale)}
      </div>
           {/* কপিরাইট এবং ডেভেলপার ক্রেডিট */}
      <div className="max-w-[1240px] mx-auto px-5 mt-16 pt-8 border-t border-white/10 flex flex-col items-center justify-center gap-2 text-xs text-slate-400 text-center">
        <p>{pick(content.footerCopy, "text", locale)}</p>
        
        {/* ডেভেলপার ক্রেডিট লিংক (সেন্টারে থাকবে) */}
        <p>
          Developed by{" "}
          <a 
            href="https://facebook.com/TahsanBillah" 
            target="_blank" 
            rel="noreferrer"
            className="text-[#4CAF50] font-bold hover:underline"
          >
            Tahsan
          </a>
        </p>
      </div>
    </footer>
  );
}