"use client";
import { useState } from "react";
import Link from "next/link";
import { Globe, Menu, X } from "lucide-react";
import type { Content, Locale } from "@/lib/types";
import { pick, lh } from "@/lib/i18n";

export function Header({ content, locale }: { content: Content; locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  
  const links = content.nav;
  const cta = links.find((l) => l.is_cta);
  const rest = links.filter((l) => !l.is_cta);

  // স্ক্রল করার ফাংশন
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
    /* sticky, top-0, z-50 এবং backdrop-blur সরিয়ে শুধু relative রাখা হলো */
    <header className="relative bg-[#FDF5E6] border-b border-[#F2A007]/20 shadow-sm z-50">
      <div className="max-w-[1240px] mx-auto px-5 h-20 flex items-center justify-between">
        
        {/* লোগো */}
        <Link href="/" className="flex items-center gap-2">
          {!logoError ? (
            <img src="/images/logo.png" alt="Logo" className="h-10 md:h-12 w-auto object-contain" onError={() => setLogoError(true)} />
          ) : (
            <span className="font-bold text-xl text-[#1E293B]">{pick(content.brand, "name", locale)}</span>
          )}
        </Link>
        
        {/* ডেস্কটপ মেনু */}
        <nav className="hidden lg:flex items-center gap-6">
          {rest.map((l) => (
            <Link 
              key={l.id} 
              href={l.href} 
              onClick={(e) => handleScroll(e, l.href)}
              className="text-sm font-bold text-[#1E293B] hover:text-[#4CAF50] transition"
            >
              {pick(l, "label", locale)}
            </Link>
          ))}
        </nav>

        {/* ডান দিকের বাটন */}
        <div className="hidden lg:flex items-center gap-6">
          <Link href="/admin/login" className="text-sm font-bold text-slate-500 hover:text-[#4CAF50] transition">
            লগইন
          </Link>
          
          <Link 
            href={locale === "bn" ? "/en" : "/"} 
            className="flex items-center gap-1 text-sm font-bold text-body hover:text-[#4CAF50] transition border-l border-slate-300 pl-6"
          >
            <Globe size={16} />
            {locale === "bn" ? "English" : "বাংলা"}
          </Link>

          {cta && (
            <Link 
              href={lh(locale, cta.href)} 
              className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-6 py-2.5 rounded-lg text-sm font-bold transition shadow-md whitespace-nowrap"
            >
              {pick(cta, "label", locale)}
            </Link>
          )}
        </div>

        {/* মোবাইল মেনু বাটন */}
        <button className="lg:hidden text-ink" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* মোবাইল মেনু */}
      {open && (
        <div className="lg:hidden border-t border-slate-200 bg-[#FDF5E6] px-5 py-4 flex flex-col gap-4 shadow-lg">
          {links.map((l) => (
            <Link 
              key={l.id} 
              href={l.href} 
              onClick={(e) => {
                handleScroll(e, l.href);
                setOpen(false);
              }} 
              className="text-sm font-bold text-[#1E293B] hover:text-[#4CAF50]"
            >
              {pick(l, "label", locale)}
            </Link>
          ))}
          <Link href="/admin/login" className="text-sm font-bold text-[#4CAF50]">
            অ্যাডমিন লগইন
          </Link>
        </div>
      )}
    </header>
  );
}