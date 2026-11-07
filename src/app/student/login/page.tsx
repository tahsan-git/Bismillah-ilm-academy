"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lock, Mail, Loader2, Info } from "lucide-react";
import Link from "next/link";

export default function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPending(false);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("ইমেইল অথবা পাসওয়ার্ড ভুল হয়েছে।");
      setLoading(false);
      return;
    }

    if (authData.user) {
      // স্ট্যাটাস চেক
      const { data: student } = await supabase
        .from("students")
        .select("status")
        .eq("user_id", authData.user.id)
        .single();
      
      if (student?.status === "Pending") {
        await supabase.auth.signOut();
        setPending(true);
        setLoading(false);
        return;
      }

      router.push("/student/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-soft2 px-5">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-ink">স্টুডেন্ট প্যানেল</h1>
          <p className="text-sm text-body mt-2">আপনার অ্যাকাউন্টে লগইন করুন</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

        {pending && (
          <div className="bg-orange-50 border border-orange-200 text-orange-700 p-4 rounded-lg text-sm mb-4 flex gap-3 items-start">
            <Info className="shrink-0 mt-0.5" size={18} />
            <p>আপনার অ্যাকাউন্টটি এখনো <b>অ্যাডমিন কর্তৃক অনুমোদিত হয়নি</b>। অনুগ্রহ করে অ্যাডমিনের অ্যাপ্রুভালের জন্য অপেক্ষা করুন।</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-ink mb-1">ইমেইল</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none" placeholder="student@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-ink mb-1">পাসওয়ার্ড</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none" placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#4CAF50] hover:bg-[#388E3C] text-white py-3 rounded-lg font-bold transition flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={20} /> : "লগইন করুন"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          অ্যাকাউন্ট নেই? <Link href="/student/register" className="text-[#4CAF50] font-bold">রেজিস্ট্রেশন করুন</Link>
        </p>
      </div>
    </div>
  );
}