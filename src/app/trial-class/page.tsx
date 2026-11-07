"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function TrialClassPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;

    const { error: dbError } = await supabase.from("trial_classes").insert({
      name,
      phone,
      email,
      message,
    });

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-soft2 px-5 text-center">
        <div className="w-20 h-20 bg-[#4CAF50]/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-[#4CAF50]" />
        </div>
        <h1 className="text-3xl font-bold text-ink mb-3">আপনার আবেদন সফলভাবে জমা হয়েছে!</h1>
        <p className="text-body max-w-md mb-8">আমাদের প্রতিনিধি খুব শীঘ্রই আপনার সাথে ফোনে যোগাযোগ করবেন ইনশাআল্লাহ। অনুগ্রহ করে কলের জন্য অপেক্ষা করুন।</p>
        <Link href="/" className="bg-[#4CAF50] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#388E3C] transition">
          হোম পেজে ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft2 py-16 px-5">
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
        <h1 className="text-2xl font-bold text-ink mb-6 text-center">ফ্রি ট্রায়াল ক্লাস ফরম</h1>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-ink mb-1">আপনার নাম *</label>
            <input required name="name" type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none" placeholder="আপনার নাম" />
          </div>
          <div>
            <label className="block text-sm font-bold text-ink mb-1">মোবাইল নম্বর *</label>
            <input required name="phone" type="tel" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none" placeholder="01XXXXXXXXX" />
          </div>
          <div>
            <label className="block text-sm font-bold text-ink mb-1">ইমেইল (ঐচ্ছিক)</label>
            <input name="email" type="email" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none" placeholder="example@email.com" />
          </div>
          <div>
            <label className="block text-sm font-bold text-ink mb-1">আপনার বার্তা</label>
            <textarea name="message" rows={3} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none" placeholder="কোন বিষয়ে জানতে চান..."></textarea>
          </div>
          <button disabled={loading} type="submit" className="w-full bg-[#4CAF50] hover:bg-[#388E3C] text-white py-3 rounded-lg font-bold transition flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={20} /> : "সাবমিট করুন"}
          </button>
        </form>
      </div>
    </div>
  );
}