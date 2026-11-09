import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getContent } from "@/lib/content";
import { Header } from "@/components/user/Header";
import { Footer } from "@/components/user/Footer";
import { pick, t } from "@/lib/i18n";

export const revalidate = 0;

export default async function AllTeachersPage() {
  let content = null;
  const locale = "bn"; 

  try {
    content = await getContent();
  } catch (error) {
    console.error("Failed to fetch content", error);
  }

  if (!content) {
    return <div className="min-h-screen flex items-center justify-center text-xl">লোড হচ্ছে...</div>;
  }

  // সব শিক্ষক (পুরুষ ও মহিলা)
  const allTeachers = content.teachers || [];

  return (
    <>
      <Header content={content} locale={locale} />
      
      <main className="min-h-screen bg-soft2 pt-10 pb-24">
        <div className="max-w-[1240px] mx-auto px-5">
          
          {/* Back to Home */}
          <Link href="/" className="inline-flex items-center gap-2 text-[#4CAF50] font-bold hover:text-[#388E3C] mb-8 transition">
            <ChevronLeft size={20} /> হোমে ফিরে যান
          </Link>
          
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-5xl font-extrabold text-ink mb-4">আমাদের শিক্ষক-শিক্ষিকা</h1>
            <p className="text-body max-w-2xl mx-auto text-lg">
              আমাদের একাডেমির অভিজ্ঞ এবং যোগ্য শিক্ষক-শিক্ষিকাদের তালিকা। যারা আপনার সন্তানকে পবিত্র কুরআন শিক্ষায় দক্ষ করে তুলতে আন্তরিকভাবে কাজ করছেন।
            </p>
          </div>

          {/* Teachers Grid (No Animation) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {allTeachers.map((m) => (
              <div 
                key={m.id} 
                className="bg-white rounded-3xl p-4 text-center border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#4CAF50] transition-all duration-300"
              >
                <div className="rounded-2xl overflow-hidden aspect-[4/5] mb-4 bg-slate-100">
                  {m.image_url ? (
                    <img src={m.image_url} alt={m.name_bn || "Teacher"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                       <span className="text-4xl mb-2">👤</span>
                       <span className="text-sm">No Image</span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-ink mb-1">{m.name_bn || m.name}</h3>
                <p className="text-sm text-[#4CAF50] font-medium">{m.role_bn || m.role}</p>
              </div>
            ))}

            {allTeachers.length === 0 && (
              <div className="col-span-full text-center py-20 text-slate-400 text-lg">
                কোনো শিক্ষকের তথ্য পাওয়া যায়নি।
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer content={content} locale={locale} />
    </>
  );
}