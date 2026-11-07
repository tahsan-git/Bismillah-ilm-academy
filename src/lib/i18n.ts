import type { Locale } from "@/lib/types";

export function pick<T extends Record<string, any>>(
  row: T | null | undefined,
  base: string,
  locale: Locale
): string {
  if (!row) return ""; // null হলে ফাঁকা স্ট্রিং রিটার্ন করবে, ক্র্যাশ করবে না
  
  const key = `${base}_${locale}`;
  const fallbackKey = `${base}_bn`;
  return (row[key] as string) ?? (row[fallbackKey] as string) ?? "";
}

export function lh(locale: Locale, href: string | null | undefined): string {
  // যদি href null বা undefined হয়, তবে ডিফল্ট হোমপেজ (/) রিটার্ন করবে
  if (!href) return "/";
  
  if (href.startsWith("/")) return href;
  if (locale === "bn") return href;
  return `/en${href}`;
}

export function t(locale: Locale, bn: string, en: string): string {
  return locale === "bn" ? bn : en;
}