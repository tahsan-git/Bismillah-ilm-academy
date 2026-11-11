"use client";
import { useState } from "react";
import { Star, StarHalf, X } from "lucide-react"; // 👈 StarHalf ইমপোর্ট করা হয়েছে
import type { Content, Locale } from "@/lib/types";
import { pick, t } from "@/lib/i18n";

export function Teachers({ content, locale }: { content: Content; locale: Locale }) {
  // 👇 পপআপের জন্য স্টেট
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  // 🌟 শুধুমাত্র পুরুষ শিক্ষকদের ফিল্টার (gender 'female' না হলে)
  const maleTeachers = content.teachers.filter((m) => m.gender !== "female");

  if (maleTeachers.length === 0) return null;

  // 👇 রেটিং স্টার রেন্ডার করার ফাংশন (হাফ স্টার সহ)
  const renderStars = (rating: number) => {
    const currentRating = rating || 5; // ডাটাবেসে রেটিং না থাকলে ডিফল্ট ৫

    return (
      <div className="flex items-center justify-center gap-0.5 mt-2">
        {[1, 2, 3, 4, 5].map((star) => {
          // যদি রেটিং ওই স্টারের সমান বা বেশি হয় (ফুল স্টার)
          if (currentRating >= star) {
            return (
              <Star
                key={star}
                size={14}
                className="fill-[#F2A007] text-[#F2A007]"
              />
            );
          }
          // যদি রেটিং ওই স্টারের চেয়ে ০.৫ কম হয় (হাফ স্টার)
          else if (currentRating >= star - 0.5) {
            return (
              <StarHalf
                key={star}
                size={14}
                className="fill-[#F2A007] text-[#F2A007]"
              />
            );
          }
          // অন্যথায় খালি (ধূসর) স্টার
          else {
            return (
              <Star
                key={star}
                size={14}
                className="fill-slate-200 text-slate-200"
              />
            );
          }
        })}
      </div>
    );
  };

  return (
    <section
      id="teachers"
      className={`relative py-24 overflow-hidden bg-cover bg-center bg-no-repeat ${!content.backgrounds?.teachers_male ? 'bg-gradient-to-br from-[#FDF5E6] via-[#FFF8E7] to-[#F2A007]/20' : ''
        }`}
      style={{
        backgroundImage: content.backgrounds?.teachers_male
          ? `linear-gradient(rgba(253,245,230,0.4), rgba(253,245,230,0.4)), url('${content.backgrounds.teachers_male}')`
          : 'none'
      }}
    >
      <div className="max-w-[1240px] mx-auto px-5 relative z-10">
        <div className="text-center mb-12">
          <p className="text-sm font-bold text-[#4CAF50] mb-3">{t(locale, "টিচার্স টিম", "Teachers Team")}</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink mb-2">{t(locale, "আমাদের শিক্ষকগণ", "Our Male Teachers")}</h2>

          <p
            className="text-sm font-bold"
            style={{ color: '#002A41' }}
            dangerouslySetInnerHTML={{
              __html: `<span style="color: #002A41 !important; font-weight: bold;">${t(locale, "শিক্ষক পরিচিতি এবং তার রেটিং দেখতে তার প্রফাইলে ক্লিক করুন", "Click on his profile to see the teacher's introduction and rating")}</span>`
            }}
          />
        </div>

        <div className="w-full overflow-hidden relative">
          <div className="animate-marquee gap-6 py-4">
            {[...maleTeachers, ...maleTeachers].map((m, index) => (
              <div
                key={index}
                onClick={() => setSelectedTeacher(m)}
                className="shrink-0 w-[240px] bg-white rounded-3xl p-4 text-center transition-all duration-300 border-2 border-transparent hover:border-[#4CAF50] hover:shadow-[0_10px_40px_rgba(76,175,80,0.2)] hover:-translate-y-2 cursor-pointer"
              >
                <div className="rounded-2xl overflow-hidden aspect-[4/5] mb-4 bg-slate-100">
                  {m.image_url ? (
                    <img src={m.image_url} alt={m.name || "Teacher"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-sm">No Image</div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-ink">{m.name}</h3>
                <p className="text-sm text-[#4CAF50] font-medium mt-1">{pick(m, "role", locale)}</p>

                {/* 👇 কার্ডে রেটিং স্টার */}
                {renderStars(m.rating)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= POPUP / MODAL ================= */}
      {selectedTeacher && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedTeacher(null)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-md w-full relative shadow-2xl animate-bounce-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ক্লোজ (X) বাটন */}
            <button
              onClick={() => setSelectedTeacher(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition"
            >
              <X size={20} />
            </button>

            {/* গোল ছবি */}
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-[#4CAF50] mb-5 shadow-md">
              {selectedTeacher.image_url ? (
                <img src={selectedTeacher.image_url} alt={selectedTeacher.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">No Image</div>
              )}
            </div>

            {/* নাম ও পদবি */}
            <h3 className="text-2xl font-extrabold text-ink text-center mb-1">{selectedTeacher.name}</h3>
            <p className="text-center text-[#4CAF50] font-bold mb-3">{pick(selectedTeacher, "role", locale)}</p>

            {/* পপআপেও রেটিং দেখানো */}
            <div className="flex justify-center mb-5">
              {renderStars(selectedTeacher.rating)}
            </div>

            {/* 👇 ডেসক্রিপশন (whitespace-pre-line যুক্ত করা হয়েছে) */}
            <div className="bg-slate-50 p-5 rounded-2xl text-slate-600 text-sm leading-relaxed text-center italic border border-slate-100 max-h-[200px] overflow-y-auto whitespace-pre-line">
              {selectedTeacher.description_bn || selectedTeacher.description_en || selectedTeacher.description ||
                "এই শিক্ষকের সম্পর্কে বিস্তারিত তথ্য শীঘ্রই যুক্ত করা হবে।"}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}