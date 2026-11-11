"use client";
import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react"; // পপআপ ক্লোজ করার আইকন
import type { Content, Locale } from "@/lib/types";
import { pick, t } from "@/lib/i18n";

export function Management({ content, locale }: { content: Content; locale: Locale }) {
  // 👇 পপআপের জন্য স্টেট
  const [selectedMember, setSelectedMember] = useState<any>(null);

  return (
    <section 
      id="management" 
      className="relative py-24 overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: content.backgrounds?.management 
          ? `linear-gradient(rgba(255,255,255,0.0), rgba(255,255,255,0.0)), url('${content.backgrounds.management}')` 
          : 'none'
      }}
    >
      <div className="max-w-[1240px] mx-auto px-5 relative z-10">
        <div className="text-center mb-12">
          <p className="text-sm font-bold text-[#4CAF50] mb-3">{t(locale, "ম্যানেজমেন্ট টিম", "Management Team")}</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">{t(locale, "আমাদের সাফল্যের পিছনে যারা", "The people behind our success")}</h2>
        </div>
        
        {/* Auto sliding container */}
        <div className="flex w-max gap-6 animate-slide pb-8">
          {[...content.management, ...content.management].map((m, index) => (
            <div 
              key={index} 
              onClick={() => setSelectedMember(m)} // 👈 ক্লিক করলে পপআপ ওপেন হবে
              className="shrink-0 w-[240px] bg-white rounded-3xl p-4 text-center transition-all duration-300 border-2 border-transparent hover:border-[#4CAF50] hover:shadow-[0_10px_40px_rgba(76,175,80,0.2)] hover:-translate-y-2 cursor-pointer"
            >
              <div className="rounded-2xl overflow-hidden aspect-[4/5] mb-4 bg-slate-100">
                {m.image_url ? (
                  <Image 
                    src={m.image_url} 
                    alt={m.name_en || "Member"} 
                    width={400} 
                    height={500} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">No Image</div>
                )}
              </div>
              <h3 className="text-lg font-bold text-ink">{pick(m, "name", locale)}</h3>
              <p className="text-sm text-[#4CAF50] font-medium mt-1">{pick(m, "role", locale)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ================= POPUP / MODAL ================= */}
      {selectedMember && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedMember(null)} // বাইরে ক্লিক করলে বন্ধ হবে
        >
          <div 
            className="bg-white rounded-3xl p-8 max-w-md w-full relative shadow-2xl animate-bounce-in"
            onClick={(e) => e.stopPropagation()} // ভেতরে ক্লিক করলে বন্ধ হবে না
          >
            {/* ক্লোজ (X) বাটন */}
            <button 
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition"
            >
              <X size={20} />
            </button>

            {/* গোল ছবি */}
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-[#4CAF50] mb-5 shadow-md">
              {selectedMember.image_url ? (
                <Image src={selectedMember.image_url} alt={selectedMember.name_en || "Member"} width={200} height={200} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">No Image</div>
              )}
            </div>

            {/* নাম ও পদবি */}
            <h3 className="text-2xl font-extrabold text-ink text-center mb-1">{pick(selectedMember, "name", locale)}</h3>
            <p className="text-center text-[#4CAF50] font-bold mb-5">{pick(selectedMember, "role", locale)}</p>

            {/* ডেসক্রিপশন (লাইন ব্রেক সহ) */}
            <div className="bg-slate-50 p-5 rounded-2xl text-slate-600 text-sm leading-relaxed text-center italic border border-slate-100 max-h-[250px] overflow-y-auto whitespace-pre-line">
              {selectedMember.description_bn || selectedMember.description_en || selectedMember.description || 
                "এই সদস্যের সম্পর্কে বিস্তারিত তথ্য শীঘ্রই যুক্ত করা হবে।"}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}