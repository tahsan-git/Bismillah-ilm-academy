import type { Metadata } from "next";
import { Hind_Siliguri, Amiri } from "next/font/google";
import "./globals.css";

const bengali = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bengali",
  display: "swap",
});

const arabic = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "বিসমিল্লাহ ইলম একাডেমি | শত অভিভাবকের আস্হার নাম",
  description:
    "অনলাইনে পবিত্র কুরআন শিক্ষার একটি নির্ভরযোগ্য প্রতিষ্ঠান। দেশ ও দেশের বাইরে অনলাইনে কুরআন শিক্ষা প্রদান করে আসছে বিসমিল্লাহ ইলম একাডেমি।",
  icons: { icon: "/icon.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" className={`${bengali.variable} ${arabic.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}