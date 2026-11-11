export type Locale = "bn" | "en";

export type NavLink = {
  id: string;
  label_bn: string;
  label_en: string;
  href: string;
  sort_order: number;
  is_visible: boolean;
  is_cta: boolean;
};

export type Hero = {
  id: number;
  eyebrow_bn: string; eyebrow_en: string;
  heading_bn: string; heading_en: string;
  body_bn: string;    body_en: string;
  cta_label_bn: string; cta_label_en: string;
  cta_href: string;
  image_url: string | null;
};

export type Stat = {
  id: string;
  label_bn: string; label_en: string;
  value: number;
  suffix: string; suffix_bn: string;
  icon_key: string;
  sort_order: number;
};

export type Feature = {
  id: string;
  icon_key: string;
  title_bn: string; title_en: string;
  body_bn: string;  body_en: string;
  sort_order: number;
};

export type TeamMember = {
  id: string;
  name_bn: string; name_en: string;
  role_bn: string; role_en: string;
  image_url: string | null;
  sort_order: number;
  // নতুন প্রপার্টি:
  name?: string; 
  status?: string;
  gender?: "male" | "female"; 
  rating?: number | null;
  description?: string | null;
  description_bn?: string | null;
  description_en?: string | null;
};

export type Testimonial = {
  id: string;
  quote_bn: string; quote_en: string;
  author_bn: string; author_en: string;
  role_bn: string; role_en: string;
  image_url: string | null;
  sort_order: number;
};

export type FAQ = {
  id: string;
  question_bn: string; question_en: string;
  answer_bn: string;   answer_en: string;
  sort_order: number;
};

export type PricingPlan = {
  id: string;
  name_bn: string; name_en: string;
  price: number;
  price_suffix_bn: string; price_suffix_en: string;
  features_bn: string[]; features_en: string[];
  cta_label_bn: string; cta_label_en: string;
  cta_href: string;
  is_featured: boolean;
  sort_order: number;
};

export type CtaBanner = {
  id: number;
  eyebrow_bn: string; eyebrow_en: string;
  heading_bn: string; heading_en: string;
  primary_label_bn: string; primary_label_en: string;
  primary_href: string;
  secondary_label_bn: string; secondary_label_en: string;
  secondary_href: string;
};

export type FooterColumn = {
  id: string;
  title_bn: string; title_en: string;
  items: { label_bn: string; label_en: string; href: string }[];
  sort_order: number;
};

export type BrandSettings = {
  name_bn: string; name_en: string;
  tagline_bn: string; tagline_en: string;
  logo_url: string | null;
};

export type ContactSettings = {
  phone: string; phone_display: string;
  email: string; whatsapp: string;
};

export type SocialLink = { icon: string; href: string };

export type FooterCopy = { text_bn: string; text_en: string };

export type Content = {
  nav: NavLink[];
  hero: Hero;
  stats: Stat[];
  features: Feature[];
  management: TeamMember[];
  teachers: TeamMember[];
  testimonials: Testimonial[];
  faqs: FAQ[];
  pricing: PricingPlan[];
  cta: CtaBanner;
  footer: FooterColumn[];
  brand: BrandSettings;
  contact: ContactSettings;
  socials: SocialLink[];
  footerCopy: FooterCopy;
  backgrounds: Record<string, string>;
};