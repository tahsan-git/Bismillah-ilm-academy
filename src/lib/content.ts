import { createClient } from "@/lib/supabase/server";
import type {
  Content, NavLink, Hero, Stat, Feature, TeamMember,
  Testimonial, FAQ, PricingPlan, CtaBanner,
} from "@/lib/types";

export async function getContent(): Promise<Content> {
  const sb = await createClient();

  const [
    nav, hero, stats, features, management, teachers,
    testimonials, faqs, pricing, cta, backgrounds,
  ] = await Promise.all([
    sb.from("nav_links").select("*").eq("is_visible", true).order("sort_order"),
    sb.from("hero").select("*").eq("id", 1).maybeSingle(),
    sb.from("stats").select("*").order("sort_order"),
    sb.from("features").select("*").order("sort_order"),
    sb.from("management").select("*").order("sort_order"),
    
    // শুধু Active শিক্ষক দেখাবে
    sb.from("teachers_profile")
      .select("*")
      .ilike("status", "active")
      .order("created_at", { ascending: true }),

    sb.from("testimonials").select("*").order("sort_order"),
    sb.from("faqs").select("*").order("sort_order"),
    sb.from("pricing_plans").select("*").order("sort_order"),
    sb.from("cta_banner").select("*").eq("id", 1).maybeSingle(),
    sb.from("section_backgrounds").select("*"),
  ]);

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

    backgrounds: bgMap,
  } as Content;
}