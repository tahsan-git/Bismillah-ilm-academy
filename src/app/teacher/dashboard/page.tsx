"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Save, Loader2, BookOpen } from "lucide-react";

export default function TeacherDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("teachers_profile").select("*").eq("user_id", user.id).single();
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from("teachers_profile").update({
      name: profile.name,
      phone: profile.phone,
      bio: profile.bio,
      image_url: profile.image_url
    }).eq("id", profile.id);
    
    alert("প্রোফাইল সফলভাবে সেভ হয়েছে!");
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">শিক্ষক ড্যাশবোর্ড</h1>
        <button onClick={handleSave} disabled={saving} className="bg-[#4CAF50] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#388E3C]">
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} সেভ করুন
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* প্রোফাইল এডিট সেকশন */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-lg font-bold text-ink mb-4">প্রোফাইল আপডেট</h2>
          
          <ImageUpload label="প্রোফাইল ছবি" value={profile.image_url || ""} onChange={(url) => setProfile({ ...profile, image_url: url })} />
          
          <div>
            <label className="block text-sm font-bold text-ink mb-1">নাম</label>
            <input type="text" value={profile.name || ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-ink mb-1">মোবাইল নম্বর</label>
            <input type="text" value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-ink mb-1">বায়ো (Bio)</label>
            <textarea value={profile.bio || ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none" placeholder="আপনার সম্পর্কে কিছু লিখুন..."></textarea>
          </div>
        </div>

        {/* ক্লাস লিস্ট সেকশন (Routine) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-[#4CAF50]" /> আজকের ক্লাস রুটিন
          </h2>
          <div className="bg-slate-50 p-4 rounded-xl text-center text-slate-500 text-sm">
            এখনো কোনো ক্লাস রুটিন তৈরি হয়নি। অ্যাডমিন শীঘ্রই এটি তৈরি করবেন ইনশাআল্লাহ।
          </div>
        </div>
      </div>
    </div>
  );
}