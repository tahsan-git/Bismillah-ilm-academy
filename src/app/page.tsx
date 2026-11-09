import { getContent } from "@/lib/content";
import { Header } from "@/components/user/Header";
import { Hero } from "@/components/user/Hero";
import { Stats } from "@/components/user/Stats";
import { About } from "@/components/user/About";
import { Features } from "@/components/user/Features";
import { Management } from "@/components/user/Management";
import { Teachers } from "@/components/user/Teachers";
import { FemaleTeachers } from "@/components/user/FemaleTeachers"; 
import { Testimonials } from "@/components/user/Testimonials";
import { CTA } from "@/components/user/CTA";
import { FAQ } from "@/components/user/FAQ";
import { Pricing } from "@/components/user/Pricing";
import { Footer } from "@/components/user/Footer";

export const revalidate = 0; 

export default async function Home() {
  let dbContent = null;
  const locale = "bn"; 

  try {
    dbContent = await getContent();
  } catch (error) {
    console.error("Database fetch failed:", error);
  }

  // 🌟 ফ্যালব্যাক ডাটা
  const fallback: any = {
    nav: [
      { id: "1", label_bn: "হোম", label_en: "Home", href: "/", is_cta: false },
      { id: "2", label_bn: "আমাদের সম্পর্কে", label_en: "About", href: "#about", is_cta: false },
      { id: "3", label_bn: "শিক্ষক-শিক্ষিকা", label_en: "Teachers", href: "#teachers", is_cta: false },
      { id: "4", label_bn: "প্রাইসিং", label_en: "Pricing", href: "#pricing", is_cta: false },
      { id: "5", label_bn: "যোগাযোগ", label_en: "Contact", href: "#faq", is_cta: false },
      { id: "6", label_bn: "ট্রায়াল ক্লাস ফরম", label_en: "Trial Class Form", href: "/trial-class", is_cta: true },
    ],
    hero: { 
      heading_bn: "বিসমিল্লাহ ইলম একাডেমি", heading_en: "Bismillah", 
      eyebrow_bn: "স্বাগতম", eyebrow_en: "Welcome", 
      body_bn: "কুরআন শিক্ষার নির্ভরযোগ্য প্রতিষ্ঠান।", body_en: "Trusted Quran Academy", 
      cta_label_bn: "ভর্তি হোন", cta_label_en: "Enroll", cta_href: "/trial-class", 
      image_url: "https://images.unsplash.com/photo-1584285404123-2f3030ba1e9a?w=1600" 
    },
    stats: [
      { id: "1", label_bn: "শিক্ষার্থী", label_en: "Students", value: 1200, suffix: "+", suffix_bn: "+", icon_key: "students" },
      { id: "2", label_bn: "শিক্ষক", label_en: "Teachers", value: 100, suffix: "+", suffix_bn: "+", icon_key: "teachers" },
      { id: "3", label_bn: "ক্লাস আওয়ার", label_en: "Hours", value: 300, suffix: "ঘণ্টা", suffix_bn: "ঘণ্টা", icon_key: "hours" },
      { id: "4", label_bn: "অভিজ্ঞতা", label_en: "Experience", value: 6, suffix: "বছর", suffix_bn: "বছর", icon_key: "experience" },
    ],
    features: [
      { id: "1", icon_key: "one-to-one", title_bn: "ওয়ান টু ওয়ান সিস্টেম", title_en: "One-to-One", body_bn: "ক্লাসে শুধুমাত্র একজন শিক্ষার্থী এবং একজন শিক্ষক থাকবেন।", body_en: "One student and one teacher." },
      { id: "2", icon_key: "trial", title_bn: "ফ্রি ট্রায়াল ক্লাস", title_en: "Free Trial", body_bn: "ভর্তির পূর্বেই ৩০মিনিট এর ফ্রি ট্রায়াল ক্লাস এর সুযোগ।", body_en: "Free 30 min trial class." },
      { id: "3", icon_key: "time", title_bn: "ফ্লেক্সিবল টাইম", title_en: "Flexible Time", body_bn: "দিনে রাতে ২৪ ঘন্টার যেকোনো টাইমে ক্লাস করতে পারবেন।", body_en: "24/7 flexible timing." },
      { id: "4", icon_key: "female", title_bn: "ফিমেল টিচার", title_en: "Female Teacher", body_bn: "মেয়েদের জন্য রয়েছে কোয়ালিফাইড হাফেজা টিচার।", body_en: "Qualified female teachers for girls." },
    ],
    management: [],
    teachers: [],
    testimonials: [],
    faqs: [],
    pricing: [
      { id: "1", name_bn: "বেসিক প্লান", name_en: "Basic Plan", price: 1000, features_bn: ["সপ্তাহে ৩ দিন ক্লাস", "ওয়ান টু ওয়ান"], features_en: ["3 days/week", "1-to-1"], is_featured: false, cta_label_bn: "ভর্তি হোন", cta_label_en: "Enroll", cta_href: "/student/register" },
      { id: "2", name_bn: "পপুলার প্লান", name_en: "Popular Plan", price: 2000, features_bn: ["সপ্তাহে ৬ দিন ক্লাস", "ফিমেল টিচার"], features_en: ["6 days/week", "Female Teacher"], is_featured: true, cta_label_bn: "ভর্তি হোন", cta_label_en: "Enroll", cta_href: "/student/register" },
      { id: "3", name_bn: "এডভান্স প্লান", name_en: "Advanced Plan", price: 4000, features_bn: ["হিফজ করানো হবে", "ফিমেল টিচার"], features_en: ["Hifz", "Female Teacher"], is_featured: false, cta_label_bn: "ভর্তি হোন", cta_label_en: "Enroll", cta_href: "/student/register" },
    ],
    footer: [],
    brand: { name_bn: "বিসমিল্লাহ ইলম একাডেমি", name_en: "Bismillah Ilm Academy", tagline_bn: "কুরআনের সাথে জান্নাতের পথে", tagline_en: "Path to Jannah", logo_url: null },
    contact: { phone: "+8801700000000", phone_display: "+৮৮০ ১৭০০ ০০০ ০০০", email: "info@bismillah.com", whatsapp: "" },
    socials: [{ icon: "facebook", href: "#" }, { icon: "youtube", href: "#" }],
    footerCopy: { text_bn: "স্বত্ব @ ২০২৪ বিসমিল্লাহ", text_en: "Copyright @ 2024" },
    
    backgrounds: {
      hero: "https://images.unsplash.com/photo-1584285404123-2f3030ba1e9a?auto=format&fit=crop&q=80&w=1600",
      features: "https://images.unsplash.com/photo-1597933534024-deb3d5b4b998?auto=format&fit=crop&q=80&w=1600",
      management: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=1600",
      faq: "https://images.unsplash.com/photo-1584285404123-2f3030ba1e9a?auto=format&fit=crop&q=80&w=1600",
      pricing: "https://images.unsplash.com/photo-1597933534024-deb3d5b4b998?auto=format&fit=crop&q=80&w=1600"
    }
  };

  // 🌟 ডাটাবেসের ডাটা এবং ফলব্যাক ডাটা মিলিয়ে নেওয়া
  const content: any = {
    ...fallback,
    nav: dbContent?.nav?.length ? dbContent.nav : fallback.nav,
    stats: dbContent?.stats?.length ? dbContent.stats : fallback.stats,
    features: dbContent?.features?.length ? dbContent.features : fallback.features,
    teachers: dbContent?.teachers?.length ? dbContent.teachers : fallback.teachers,
    management: dbContent?.management?.length ? dbContent.management : fallback.management,
    testimonials: dbContent?.testimonials?.length ? dbContent.testimonials : fallback.testimonials,
    faqs: dbContent?.faqs?.length ? dbContent.faqs : fallback.faqs,
    pricing: dbContent?.pricing?.length ? dbContent.pricing : fallback.pricing,
    footer: dbContent?.footer?.length ? dbContent.footer : fallback.footer,
    
    hero: dbContent?.hero?.heading_bn ? { ...fallback.hero, ...dbContent.hero } : fallback.hero,
    brand: dbContent?.brand?.name_bn ? { ...fallback.brand, ...dbContent.brand } : fallback.brand,
    contact: dbContent?.contact?.phone ? { ...fallback.contact, ...dbContent.contact } : fallback.contact,
    footerCopy: dbContent?.footerCopy?.text_bn ? { ...fallback.footerCopy, ...dbContent.footerCopy } : fallback.footerCopy,
    
    backgrounds: {
      ...fallback.backgrounds,
      ...(dbContent?.backgrounds || {})
    }
  };

  return (
    <>
      <Header content={content} locale={locale} />
      <main>
        <Hero content={content} locale={locale} />
        <Stats content={content} locale={locale} />
        
        {/* 🌟 About এখন স্ট্যাটিক, তাই কোনো props নেই */}
        <About />
        
        <Features content={content} locale={locale} />
        <Management content={content} locale={locale} />
        <Teachers content={content} locale={locale} />
        
        <FemaleTeachers content={content} locale={locale} />
        
        <Testimonials content={content} locale={locale} />
        
        <CTA /> 
        
        <FAQ content={content} locale={locale} />
        <Pricing content={content} locale={locale} />
      </main>
      <Footer/>
    </>
  );
}