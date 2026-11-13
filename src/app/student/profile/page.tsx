"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Loader2, Phone, Mail, GraduationCap } from "lucide-react";

export default function StudentProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const studentId = localStorage.getItem("student_id");
      if (!studentId) { window.location.href = "/student/login"; return; }

      const { data } = await supabase
        .from("students")
        .select("*")
        .eq("id", studentId)
        .single();

      if (data) setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#002A41]" size={32} /></div>;
  }

  if (!profile) {
    return <div className="p-10 text-center text-slate-500">প্রোফাইল পাওয়া যায়নি।</div>;
  }

  const info = [
    { icon: GraduationCap, label: "প্ল্যান", value: profile.plan },
    { icon: User, label: "স্ট্যাটাস", value: profile.status },
    { icon: Phone, label: "ফোন", value: profile.phone },
    { icon: Mail, label: "ইমেইল", value: profile.email },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#002A41]">প্রোফাইল</h1>
        <p className="text-slate-500 mt-1">আপনার ব্যক্তিগত তথ্য</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-[#002A41] p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-white mb-3 overflow-hidden">
            {profile.image_url ? (
              <img src={profile.image_url} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <User size={40} />
            )}
          </div>
          <h2 className="text-xl font-bold text-white">{profile.name}</h2>
          <p className="text-white/60 text-sm mt-1">{profile.plan} প্ল্যান</p>
        </div>
        <div className="divide-y divide-slate-100">
          {info.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-[#002A41]/5 text-[#002A41] flex items-center justify-center shrink-0">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="font-semibold text-slate-800">{value || "—"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}