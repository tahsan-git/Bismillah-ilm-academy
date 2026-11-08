import { createClient } from "@/lib/supabase/server";
import type {
  Content, NavLink, Hero, Stat, About, Feature, TeamMember,
  Testimonial, FAQ, PricingPlan, CtaBanner, FooterColumn,
  BrandSettings, ContactSettings, SocialLink, FooterCopy,
} from "@/lib/types";

export async function getContent(): Promise<Content> {
  const sb = await createClient();

  const [
    nav, hero, stats, about, features, management, teachers,
    testimonials, faqs, pricing, cta, footer, settings, backgrounds,
  ] = await Promise.all([
    sb.from("nav_links").select("*").eq("is_visible", true).order("sort_order"),
    sb.from("hero").select("*").eq("id", 1).maybeSingle(),
    sb.from("stats").select("*").order("sort_order"),
    sb.from("about").select("*").eq("id", 1).maybeSingle(), // 🌟 About যুক্ত করা হলো
    sb.from("features").select("*").order("sort_order"),
    sb.from("management").select("*").order("sort_order"),
    
    // শুধু Active শিক্ষক দেখাবে
    sb.from("teachers_profile")
      .select("*")
      .eq("status", "Active")
      .order("created_at", { ascending: true }),

    sb.from("testimonials").select("*").order("sort_order"),
    sb.from("faqs").select("*").order("sort_order"),
    sb.from("pricing_plans").select("*").order("sort_order"),
    sb.from("cta_banner").select("*").eq("id", 1).maybeSingle(),
    sb.from("footer_columns").select("*").order("sort_order"),
    sb.from("site_settings").select("*"),
    sb.from("section_backgrounds").select("*"), // 🌟 একবারই রাখা হলো
  ]);

  const settingsMap: Record<string, unknown> = {};
  for (const row of settings.data ?? []) {
    settingsMap[row.key] = row.value;
  }

  const bgMap: Record<string, string> = {};
  for (const row of backgrounds.data ?? []) {
    bgMap[row.section_key] = row.image_url || "";
  }

  return {
    nav: (nav.data ?? []) as NavLink[],

    hero: (hero.data ?? {
      heading_bn: "বিসমিল্লাহ ইলম একাডেমি",
      heading_en: "Bismillah Ilm Academy",
      eyebrow_bn: "হিরো টাইটেল",
      eyebrow_en: "Hero Title",
      body_bn: "বডি টেক্সট",
      body_en: "Body text",
      cta_label_bn: "ফরম",
      cta_label_en: "Form",
      cta_href: "/",
      image_url: null,
    }) as Hero,

    stats: (stats.data ?? []) as Stat[],

    about: (about.data ?? {
      heading_bn: "আমাদের সম্পর্কে",
      heading_en: "About Us",
      eyebrow_bn: "আমাদের সম্পর্কে",
      eyebrow_en: "About",
      body_bn: "বডি টেক্সট",
      body_en: "Body text",
      image_url: null,
      cta_label_bn: null,
      cta_label_en: null,
      cta_href: null,
    }) as About,

    features: (features.data ?? []) as Feature[],
    management: (management.data ?? []) as TeamMember[],
    teachers: (teachers.data ?? []) as TeamMember[],
    testimonials: (testimonials.data ?? []) as Testimonial[],
    faqs: (faqs.data ?? []) as FAQ[],
    pricing: (pricing.data ?? []) as PricingPlan[],

    cta: (cta.data ?? {
      eyebrow_bn: "যোগ দিন",
      eyebrow_en: "Join",
      heading_bn: "শিরোনাম",
      heading_en: "Heading",
      primary_label_bn: "বাটন",
      primary_label_en: "Button",
      primary_href: "/",
      secondary_label_bn: "বাটন ২",
      secondary_label_en: "Button 2",
      secondary_href: "/",
    }) as CtaBanner,

    footer: (footer.data ?? []) as FooterColumn[],

    brand: (settingsMap.brand ?? {
      name_bn: "বিসমিল্লাহ ইলম একাডেমি",
      name_en: "Bismillah Ilm Academy",
      tagline_bn: "কুরআনের সাথে জান্নাতের পথে",
      tagline_en: "On the path to Jannah with the Quran",
      logo_url: null,
    }) as BrandSettings,

    contact: (settingsMap.contact ?? {
      phone: "",
      phone_display: "",
      email: "",
      whatsapp: "",
    }) as ContactSettings,

    socials: (settingsMap.socials ?? []) as SocialLink[],

    footerCopy: (settingsMap.footer_copy ?? {
      text_bn: "স্বত্ব @ ২০২৪",
      text_en: "Copyright @ 2024",
    }) as FooterCopy,

    backgrounds: bgMap,
  };
}