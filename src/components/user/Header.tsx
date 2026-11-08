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
    <header className="relative z-50 border-b border-[#F2A007]/20 bg-[#FDF5E6] shadow-sm">
      <div className="mx-auto flex h-20 max-w-[1240px] items-center justify-between px-5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {!logoError ? (
            <img
              src="/images/logo.png"
              alt="Bismillah Ilm Academy"
              className="h-10 w-auto object-contain md:h-12"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="text-xl font-bold text-[#1E293B]">
              {pick(content.brand, "name", locale)}
            </span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 lg:flex">
          {rest.map((l) => (
            <Link
              key={l.id}
              href={l.href}
              onClick={(e) => handleScroll(e, l.href)}
              className="text-sm font-bold text-[#1E293B] transition hover:text-[#4CAF50]"
            >
              {pick(l, "label", locale)}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-5 lg:flex">
          {/* Login Button (Redirects to /login page) */}
          <Link
            href="/login"
            className="text-sm font-bold text-[#1E293B] transition hover:text-[#4CAF50]"
          >
            লগইন
          </Link>

          {/* Language Switcher */}
          <Link
            href={locale === "bn" ? "/en" : "/"}
            className="flex items-center gap-1 border-l border-slate-300 pl-5 text-sm font-bold text-[#1E293B] transition hover:text-[#4CAF50]"
          >
            <Globe size={16} />
            {locale === "bn" ? "English" : "বাংলা"}
          </Link>

          {/* CTA Button */}
          {cta && (
            <Link
              href="/trial-class" // আপনার ডাটা অনুযায়ী লিংক দিন
              className="whitespace-nowrap rounded-lg bg-[#4CAF50] px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#388E3C]"
            >
              {pick(cta, "label", locale)}
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
          className="text-[#1E293B] lg:hidden"
        >
          {open ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {open && (
        <div className="flex flex-col gap-4 border-t border-[#F2A007]/20 bg-[#FDF5E6] px-5 py-5 shadow-lg lg:hidden">
          {rest.map((l) => (
            <Link
              key={l.id}
              href={l.href}
              onClick={(e) => {
                handleScroll(e, l.href);
                setOpen(false);
              }}
              className="text-sm font-bold text-[#1E293B] transition hover:text-[#4CAF50]"
            >
              {pick(l, "label", locale)}
            </Link>
          ))}

          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="text-sm font-bold text-[#1E293B] transition hover:text-[#4CAF50] border-t border-[#F2A007]/20 pt-4"
          >
            লগইন
          </Link>

          <Link
            href={locale === "bn" ? "/en" : "/"}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 text-sm font-bold text-[#1E293B]"
          >
            <Globe size={16} />
            {locale === "bn" ? "English" : "বাংলা"}
          </Link>

          {cta && (
            <Link
              href="/trial-class"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-[#4CAF50] px-5 py-3 text-center text-sm font-bold text-white shadow-md transition hover:bg-[#388E3C]"
            >
              {pick(cta, "label", locale)}
            </Link>
          )}
        </div>
      )}
    </header>
  );
}