"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Lock, Mail, AlertTriangle, Eye, EyeOff } from "lucide-react";

export default function TeacherLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // ১. Database theke teacher khujo
    const { data, error: dbError } = await supabase
      .from("teachers_profile")
      .select("id, name, password, status")
      .eq("email", email)
      .single();

    if (dbError || !data) {
      setError("এই ইমেইলে কোনো একাউন্ট নেই!");
      setLoading(false);
      return;
    }

    // ২. Admin Approval Check
    if (data.status !== "Active") {
      setError("আপনার একাউন্টটি এখনো অ্যাডমিন দ্বারা অনুমোদিত হয়নি। অনুগ্রহ করে অপেক্ষা করুন।");
      setLoading(false);
      return;
    }

    // ৩. Password Check
    if (data.password !== password) {
      setError("পাসওয়ার্ড ভুল হয়েছে!");
      setLoading(false);
      return;
    }

    // 🌟 ৪. Success: Cookie set koro (Middleware check korar jonno)
    document.cookie = `teacher_id=${data.id}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `teacher_name=${encodeURIComponent(data.name)}; path=/; max-age=86400; SameSite=Lax`;

    // 🌟 ৫. LocalStorage e save koro (Frontend use korar jonno)
    localStorage.setItem("teacher_id", data.id);
    localStorage.setItem("teacher_name", data.name);
    
    router.push("/teacher/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#002A41]">শিক্ষক লগইন</h1>
          <p className="text-slate-500 mt-2 text-sm">আপনার একাউন্টে প্রবেশ করুন</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-sm font-bold mb-4 flex items-start gap-2">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">ইমেইল</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#002A41] transition"
                placeholder="example@gmail.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">পাসওয়ার্ড</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#002A41] transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#002A41] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#003D5C] transition disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
            {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
          </button>
        </form>
      </div>
    </div>
  );
}