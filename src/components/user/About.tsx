"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ScrollReveal } from "../ui/ScrollReveal";

export function About() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const aboutImage = "/images/about_main_pic.jpeg"; // আপনার মূল ছবি
  const bgImage = "/images/about_bg_image.png"; // আপনার ব্যাকগ্রাউন্ড ছবি

  return (
    <section 
      id="about" 
      className="relative py-24 overflow-hidden bg-cover bg-center bg-no-repeat bg-white"
      style={{
        backgroundImage: bgImage 
          ? `linear-gradient(rgba(255,255,255,0.4), rgba(255,255,255,0.4)), url('${bgImage}')` 
          : 'none'
      }}
    >
      <div className="max-w-[1240px] mx-auto px-5 grid md:grid-cols-2 gap-16 items-start relative z-10">
        
        {/* বাম দিকের ছবি */}
        <ScrollReveal direction="left">
          <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white sticky top-28">
            <Image 
              src={aboutImage} 
              alt="About Us" 
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover" 
            />
          </div>
        </ScrollReveal>

        {/* ডান দিকের টেক্সট */}
        <ScrollReveal direction="right" delay={0.2}>
          <p className="text-sm font-bold text-[#4CAF50] mb-3">আমাদের সম্পর্কে জানুন</p>
          
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink mb-6">
            বিসমিল্লাহ ইলম একাডেমি
          </h2>
          
          <div className="space-y-4 text-body text-base leading-relaxed mb-8">
            <p>
              বিসমিল্লাহ ইলম একাডেমি ২০২৫ সালে বিশ্বব্যাপী দ্বীন ভোলা মানুষকে ইসলামের ছায়াতলে ফিরিয়ে আনার মহান লক্ষ্য নিয়ে যাত্রা শুরু করে।
            </p>
            <p>
              বাংলাদেশের রাষ্ট্রীয় ধর্ম ইসলাম হওয়া সত্ত্বেও, এদেশের অধিকাংশ মানুষ আজ দ্বীন থেকে বিমুখ। এই বেদনাদায়ক বাস্তবতাই আমাদের ভাবিয়ে তুলেছিল। আর সেই ভাবনা থেকেই জন্ম নেয় বিসমিল্লাহ ইলম একাডেমি নামক এক দ্বীনি প্রতিষ্ঠান গঠনের সিদ্ধান্ত।
            </p>
            <p>
              আমি সহ আমার বন্ধু মাওলানা রায়হান উদ্দিনের দ্বীনি খেদমতের ইচ্ছা ও আন্তরিক পরামর্শের আলোকে এই মহান প্রতিষ্ঠানের সূচনা হয়।<br></br>
<br></br>
মাওলানা মোহাম্মাদ রেজওয়ান
<br></br>
প্রতিষ্ঠাতা ও চেয়ারম্যান
<br></br>
            </p>
          </div>

          {/* আরও জানুন বাটন (হোভার ইফেক্টসহ) */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="group inline-flex items-center gap-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            {isExpanded ? "কম দেখুন" : "আরও জানুন"} 
            <span className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : "group-hover:translate-x-1"}`}>
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </span>
          </button>

          {/* অ্যাকর্ডিয়ন (বিস্তারিত লেখা) */}
          <div 
            className={`grid transition-all duration-500 ease-in-out ${
              isExpanded ? "grid-rows-[1fr] opacity-100 mt-6" : "grid-rows-[0fr] opacity-0 mt-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="bg-[#FDF5E6] p-6 rounded-2xl border border-[#F2A007]/20 shadow-inner">
                <h3 className="text-lg font-bold text-ink mb-3">আমাদের বিস্তারিত পরিচিতি</h3>
                <div className="space-y-3 text-sm text-body leading-relaxed">
                  <p>
                    বিসমিল্লাহ ইলম একাডেমি ২০২৫ সনে পথচলা শুরু করলেও নানান বাধা-বিপত্তি পেরিয়ে ২০২৬ সনের মার্চ মাসে পরিপূর্ণ রূপে আত্মপ্রকাশ করে।
                  </p>
                  <p>
                    লক্ষ্য একটাই, বিশ্বের প্রতিটি প্রান্তে ইসলামের শান্তির ছায়া পৌঁছে দেওয়া।
                  </p>
                  <p>
                    আমাদের প্রিয় বাংলাদেশ, যেখানে রাষ্ট্রীয় ধর্ম ইসলাম। অথচ দুঃখের বিষয়, এই দেশেরই অসংখ্য মানুষ আজ দ্বীন থেকে দূরে সরে গেছে। এই দূরত্ব, এই বিমুখতাই আমাদের হৃদয়কে নাড়া দেয়।
                  </p>
                  <p>
                    সেই নাড়া দেওয়া অনুভূতি থেকেই জন্ম নেয় একটি সিদ্ধান্ত। এমন একটি প্রতিষ্ঠান গড়ে তোলা, যেখানে মানুষ দ্বীনকে নতুন করে চিনবে, ভালোবাসবে, আঁকড়ে ধরবে। সেই স্বপ্নের নামই বিসমিল্লাহ ইলম একাডেমি।
                  </p>
                  <p>
                    কেন মানুষ দ্বীন থেকে দূরে চলে যাচ্ছে?<br></br>
আমরা ভেবে দেখলাম, এর জন্য মূলত দুটি জিনিস দায়ী।<br></br><br></br>
১. সঠিক শিক্ষা প্রতিষ্ঠানের অভাব<br></br>
২. কোয়ালিটি সম্পন্ন শিক্ষক ও শিক্ষিকার অভাব
                  </p>
                  <p>
                    আমরা পরামর্শ করে এর সমাধান করলাম। নানান নিয়মে এই শিক্ষা প্রতিষ্ঠানকে পরিপাটি করে সাজিয়ে জনসম্মুখে হেদায়েতের রাস্তা সহজ করার পথ উন্মুক্ত করলাম।
                  </p>
                  <p>
                    আর এই প্রতিষ্ঠানটি যাতে বেশি মানুষের উপকারে আসে, সেজন্যই আমরা অনলাইন ভিত্তিক পরিচালনার সিদ্ধান্ত নিলাম।
                  </p>
                  <p>
                    আমরা আমাদের লক্ষ্যে কতটুকু সফল হতে পেরেছি?
আমরা আমাদের লক্ষ্যে অবিরাম পরিশ্রম করে যাচ্ছি। আলহামদুলিল্লাহ, ইতিমধ্যেই আমরা ২০০+ শিক্ষার্থীকে দ্বীনের আলোয় আলোকিত করতে সক্ষম হয়েছি।

                  </p>
                  <p>
                    আমাদের প্রতিষ্ঠান কুরআন শিক্ষার পাশাপাশি বিভিন্ন শাখায় কার্যক্রম চালানোর সিদ্ধান্ত নিয়েছে। ইনশাআল্লাহ অতি শীঘ্রই আমরা আরও কিছু সেক্টর নিয়ে কাজ করব।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}