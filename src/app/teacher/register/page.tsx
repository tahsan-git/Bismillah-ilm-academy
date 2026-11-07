"use client";
import { useState } from "react";
import Link from "next/link";
import { registerTeacher } from "@/actions/registerTeacher"; // 🌟 নতুন অ্যাকশন
import { User, Mail, Lock, Phone, Loader2, CheckCircle2 } from "lucide-react";

export default function TeacherRegister() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;

    const result = await registerTeacher({ name, email, phone, password });

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || "রেজিস্ট্রেশনে সমস্যা হয়েছে।");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-soft2 px-5 text-center">
        <div className="w-20 h-20 bg-[#4CAF50]/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-[#4CAF50]" />
        </div>
        <h1 className="text-3xl font-bold text-ink mb-3">রেজিস্ট্রেশন সফল হয়েছে!</h1>
        <p className="text-body max-w-md mb-8">
          আপনার শিক্ষক প্রোফাইলটি অ্যাডমিনের কাছে অনুমোদনের জন্য পাঠানো হয়েছে। 
          <strong> অনুগ্রহ করে অ্যাডমিনের অ্যাপ্রুভালের জন্য অপেক্ষা করুন।</strong> 
          অ্যাপ্রুভাল পেলে আপনি লগইন করতে পারবেন।
        </p>
        <Link href="/teacher/login" className="bg-[#4CAF50] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#388E3C] transition">
          লগইন পেজে ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-soft2 py-10 px-5">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-ink">শিক্ষক রেজিস্ট্রেশন</h1>
          <p className="text-sm text-body mt-2">নতুন অ্যাকাউন্ট তৈরি করুন</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-ink mb-1">পুরো নাম *</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={18} />
              <input required name="name" type="text" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none" placeholder="আপনার নাম" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-ink mb-1">মোবাইল নম্বর *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
              <input required name="phone" type="tel" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none" placeholder="01XXXXXXXXX" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-ink mb-1">ইমেইল *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
              <input required name="email" type="email" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none" placeholder="teacher@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-ink mb-1">পাসওয়ার্ড *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input required name="password" type="password" minLength={6} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none" placeholder="কমপক্ষে ৬ অক্ষর" />
            </div>
          </div>
          <button disabled={loading} type="submit" className="w-full bg-[#4CAF50] hover:bg-[#388E3C] text-white py-3 rounded-lg font-bold transition flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={20} /> : "রেজিস্ট্রেশন করুন"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          আগে থেকেই অ্যাকাউন্ট আছে? <Link href="/teacher/login" className="text-[#4CAF50] font-bold">লগইন করুন</Link>
        </p>
      </div>
    </div>
  );
}