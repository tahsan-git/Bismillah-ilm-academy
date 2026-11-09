"use client";
import { useState } from "react";
import Link from "next/link";
import { Facebook, Instagram, Youtube, Mail, Phone, MessageCircle } from "lucide-react";

export function Footer() {
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
    // আপনার থিমের সাথে মিল রেখে bg-[#1a5f63] বা bg-ink ব্যবহার করতে পারেন
    <footer className="bg-[#1a5f63] text-white pt-16 pb-8 font-sans">
      <div className="max-w-[1240px] mx-auto px-5 grid md:grid-cols-12 gap-10">
        
        {/* Column 1: Logo & Description */}
        <div className="md:col-span-4 lg:col-span-4">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            {!logoError ? (
              <img 
                src="/images/logo.png" 
                alt="Bismillah Ilm Academy Logo" 
                className="h-12 w-auto object-contain" 
                onError={() => setLogoError(true)} 
              />
            ) : (
              <span className="text-2xl font-bold text-white">Bismillah Ilm Academy</span>
            )}
          </Link>
          
          <p className="text-sm leading-relaxed mb-8 text-justify text-slate-200">
            বাংলাদেশের মত মুসলিম সংখ্যাগরিষ্ঠ একটি দেশে শিশু থেকে শুরু করে সকল বয়সী পুরুষ এবং মহিলাদের ধর্মীয় শিক্ষা নিশ্চিত করা অত্যন্ত গুরুত্বপূর্ণ একটি দায়িত্ব। তবে সব জায়গায় দক্ষ এবং যোগ্য শিক্ষকদের অনুপস্থিতি এই মহৎ কাজকে কিছুটা চ্যালেঞ্জের সম্মুখীন করে দেয়। আর এই চ্যালেঞ্জকে সামনে রেখেই বিসমিল্লাহ ইলম একাডেমি অনলাইনের মাধ্যমে একটি সুপরিকল্পিত সিলেবাস ও অভ্যয় সকলের জন্য ধর্মীয় শিক্ষা নিশ্চিত করার লক্ষ্যে কাজ করে যাচ্ছে।
          </p>
          
          {/* Social Icons */}
          <div className="flex gap-3">
            <a href="https://www.facebook.com/profile.php?id=61589090401656" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full border border-white/50 flex items-center justify-center hover:bg-white hover:text-[#1a5f63] transition text-white">
              <Facebook size={16} />
            </a>
            <a href="https://wa.me/8801760840006" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full border border-white/50 flex items-center justify-center hover:bg-white hover:text-[#1a5f63] transition text-white">
              <MessageCircle size={16} />
            </a>
            {/*ekhane instagram er link apatoto facebook page diye rakhtechi*/}
            <a href="https://www.facebook.com/profile.php?id=61589090401656" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full border border-white/50 flex items-center justify-center hover:bg-white hover:text-[#1a5f63] transition text-white">
              <Instagram size={16} />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61589090401656" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full border border-white/50 flex items-center justify-center hover:bg-white hover:text-[#1a5f63] transition text-white">
              <Youtube size={16} />
            </a>
          </div>
        </div>
        
        {/* Column 2: একাডেমি */}
        <div className="md:col-span-2 lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-5">একাডেমি</h3>
          <ul className="space-y-3">
            <li><Link href="#about" onClick={(e) => handleScroll(e, "#about")} className="text-sm text-slate-200 hover:text-white transition">আমাদের সম্পর্কে</Link></li>
            <li><Link href="/" onClick={(e) => handleScroll(e, "/")} className="text-sm text-slate-200 hover:text-white transition">গ্যালারী</Link></li>
            <li><Link href="#teachers" onClick={(e) => handleScroll(e, "#teachers")} className="text-sm text-slate-200 hover:text-white transition">শিক্ষক-শিক্ষিকা</Link></li>
            <li><Link href="/trial-class" onClick={(e) => handleScroll(e, "/trial-class")} className="text-sm text-slate-200 hover:text-white transition">ট্রায়াল ক্লাস ফর্ম</Link></li>
            <li><Link href="/teacher/register" onClick={(e) => handleScroll(e, "/teacher/register")} className="text-sm text-slate-200 hover:text-white transition">শিক্ষক হিসাবে যোগ দিন</Link></li>
          </ul>
        </div>

        {/* Column 3: অন্যান্য */}
        <div className="md:col-span-2 lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-5">অন্যান্য</h3>
          <ul className="space-y-3">
            <li><Link href="/" onClick={(e) => handleScroll(e, "/")} className="text-sm text-slate-200 hover:text-white transition">প্রাইভেসি পলিসি</Link></li>
            <li><Link href="/" onClick={(e) => handleScroll(e, "/")} className="text-sm text-slate-200 hover:text-white transition">ব্যবহারকারীর শর্তাবলী</Link></li>
            <li><Link href="/teacher/register" onClick={(e) => handleScroll(e, "teacher/register")} className="text-sm text-slate-200 hover:text-white transition">কারিয়ার / নিয়োগ বিজ্ঞপ্তি</Link></li>
          </ul>
        </div>

        {/* Column 4: যোগাযোগ */}
        <div className="md:col-span-4 lg:col-span-4">
          <h3 className="text-lg font-bold text-white mb-5">যোগাযোগ</h3>
          <ul className="space-y-4 text-sm text-slate-200">
            <li>
              কল করুনঃ <a href="tel:+8801760840006" className="hover:text-white transition">+৮৮০ ১৭৬০ ৮৪০০০৬</a>
            </li>
            <li>
              ইমেইলঃ <a href="mailto:bismillahilmacademy@gmail.com" className="hover:text-white transition break-all">bismillahilmacademy@gmail.com</a>
            </li>
            <li>
              হোয়াটসঅ্যাপঃ <a href="https://wa.me/8801760840006" target="_blank" rel="noreferrer" className="hover:text-white transition">+৮৮০ ১৭৬০ ৮৪০০০৬</a>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Copyright & Developer Credit Section */}
      <div className="max-w-[1240px] mx-auto px-5 mt-12 pt-6 border-t border-white/20 flex flex-col items-center justify-center gap-2 text-sm text-slate-300 text-center">
        <p>স্বত্ব © ২০২৪ Bismillah Ilm Academy কর্তৃক সর্বস্বত্ব সংরক্ষিত</p>
        
        <p className="text-xs mt-1">
          Developed by{" "}
          <a 
            href="https://facebook.com/TahsanBillah" 
            target="_blank" 
            rel="noreferrer"
            className="text-white font-semibold hover:underline transition-colors"
          >
            Tahsan
          </a>
        </p>
      </div>
    </footer>
  );
}