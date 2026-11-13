"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { User, Phone, Loader2, CheckCircle2, BookOpen, MapPin, Users, Lock, Eye, EyeOff } from "lucide-react";

export default function StudentRegister() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const name = String(formData.get("student_name") || "");
    const phone = String(formData.get("student_phone") || "");
    const email = String(formData.get("student_email") || "").trim();
    const password = String(formData.get("password") || "");

    // বাকি সব ডাটা JSON হিসেবে যাবে
    const applicationData: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (!["student_name", "student_phone", "student_email", "password"].includes(key)) {
        applicationData[key] = String(value);
      }
    });

    // 👇 সরাসরি students টেবিলে ডাটা সেভ করা হচ্ছে (কোনো Auth তৈরি হবে না)
    const { error: dbError } = await supabase.from("students").insert({
      name: name,
      phone: phone,
      email: email, 
      password: password, // 👈 পাসওয়ার্ডটি ডাটাবেসে সেভ থাকবে, অ্যাডমিন পরে Auth-এ পুশ করবে
      status: "Pending",
      plan: "Basic",
      application_data: applicationData,
    });

    if (dbError) {
      console.error(dbError);
      setError("আবেদন জমা দিতে সমস্যা হয়েছে: " + dbError.message);
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
        <h1 className="text-3xl font-bold text-ink mb-3">আবেদন সফল হয়েছে!</h1>
        <p className="text-body max-w-md mb-8">
          আপনার সন্তানের ভর্তি আবেদনটি অ্যাডমিনের কাছে পাঠানো হয়েছে। অ্যাডমিন Approve করার পর আপনি আপনার <strong>ইমেইল বা ফোন নম্বর</strong> এবং <strong>পাসওয়ার্ড</strong> দিয়ে লগইন করতে পারবেন।
        </p>
        <Link href="/" className="bg-[#4CAF50] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#388E3C] transition">
          হোমে ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft2 py-16 px-5">
      {/* ... আপনার আগের ফর্মের ডিজাইন (ঠিক আগের মতোই থাকবে) ... */}
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 bg-[#4CAF50]/10 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen className="text-[#4CAF50]" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-ink">শিক্ষার্থী ভর্তি ফরম</h1>
          <p className="text-sm text-body mt-2">অনুগ্রহ করে সঠিক তথ্য প্রদান করুন</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-8">
          
          {/* ১. শিক্ষার্থীর তথ্য */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="text-[#4CAF50]" size={20} />
              <h2 className="font-bold text-ink">শিক্ষার্থীর তথ্য</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-ink mb-1">শিক্ষার্থীর নাম *</label>
                <input required name="student_name" type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-1">জন্ম তারিখ *</label>
                <input required name="dob" type="date" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-1">জেন্ডার *</label>
                <select name="gender" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none">
                  <option value="male">ছেলে</option>
                  <option value="female">মেয়ে</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-1">বর্তমান শিক্ষা প্রতিষ্ঠান</label>
                <input name="current_school" type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none" placeholder="স্কুল/মাদ্রাসার নাম" />
              </div>
            </div>
          </section>

          {/* ২. যোগাযোগের তথ্য */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Phone className="text-[#4CAF50]" size={20} />
              <h2 className="font-bold text-ink">যোগাযোগের তথ্য</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-ink mb-1">মোবাইল নম্বর *</label>
                <input required name="student_phone" type="tel" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-1">ইমেইল *</label>
                <input required name="student_email" type="email" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none" placeholder="ইমেইল@domain.com" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-ink mb-1">ঠিকানা *</label>
                <input required name="address" type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none" />
              </div>
            </div>
          </section>

          {/* ৩. অভিভাবকের তথ্য */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Users className="text-[#4CAF50]" size={20} />
              <h2 className="font-bold text-ink">অভিভাবকের তথ্য</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-ink mb-1">অভিভাবকের নাম *</label>
                <input required name="guardian_name" type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-1">সম্পর্ক *</label>
                <input required name="guardian_relation" type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none" placeholder="যেমন: পিতা, মাতা" />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-1">অভিভাবকের মোবাইল *</label>
                <input required name="guardian_phone" type="tel" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none" />
              </div>
            </div>
          </section>

          {/* ৪. ক্লাসের পছন্দ */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <MapPin className="text-[#4CAF50]" size={20} />
              <h2 className="font-bold text-ink">ক্লাসের পছন্দ</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-ink mb-1">কোন প্ল্যানে ভর্তি হতে চান? *</label>
                <select name="desired_plan" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none">
                  <option value="Basic">Basic Plan</option>
                  <option value="Standard">Standard Plan</option>
                  <option value="Premium">Premium Plan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-1">ক্লাসের সময়সূচী *</label>
                <input required name="preferred_time" type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none" placeholder="যেমন: সকাল ৮টা - ৯টা" />
              </div>
            </div>
          </section>

          {/* ৫. লগইন তথ্য */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Lock className="text-[#4CAF50]" size={20} />
              <h2 className="font-bold text-ink">অ্যাকাউন্ট তৈরি করুন</h2>
            </div>
            <p className="text-sm text-slate-500 mb-2">
              এই পাসওয়ার্ড এবং আপনার মোবাইল নম্বর (বা ইমেইল) দিয়ে ভবিষ্যতে লগইন করতে পারবেন।
            </p>
            
            <div>
              <label className="block text-sm font-bold text-ink mb-1">পাসওয়ার্ড *</label>
              
              <div className="relative">
                <input 
                  required 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  minLength={6} 
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none pr-12" 
                  placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </section>

          <button disabled={loading} type="submit" className="w-full bg-[#4CAF50] hover:bg-[#388E3C] text-white py-4 rounded-xl font-bold transition flex justify-center items-center gap-2 mt-4">
            {loading ? <Loader2 className="animate-spin" size={20} /> : "আবেদন জমা দিন"}
          </button>
        </form>
      </div>
    </div>
  );
}