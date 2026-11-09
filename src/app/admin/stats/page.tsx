"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Upload, Trash2, Plus } from "lucide-react";

const iconOptions = [
  { value: "students", label: "শিক্ষার্থী (Users)" },
  { value: "teachers", label: "শিক্ষক (Award)" },
  { value: "hours", label: "ঘণ্টা (Clock)" },
  { value: "experience", label: "অভিজ্ঞতা (Book)" },
];

export default function AdminStats() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [bgImage, setBgImage] = useState("");
  const [stats, setStats] = useState<any[]>([]);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const [statsData, bgData] = await Promise.all([
        supabase.from("stats").select("*").order("sort_order"),
        supabase.from("section_backgrounds").select("*").eq("section_key", "stats").maybeSingle(),
      ]);
      
      if (statsData.data) setStats(statsData.data);
      if (bgData.data) setBgImage(bgData.data.image_url || "");
      
      setLoading(false);
    };
    fetchData();
  }, [supabase]);

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `stats-bg-${Date.now()}.${file.name.split('.').pop()}`;
    
    try {
      const { error } = await supabase.storage.from("site-images").upload(fileName, file);
      if (error) throw error;

      const { data } = await supabase.storage.from("site-images").getPublicUrl(fileName);
      
      if (bgImage && bgImage.includes("site-images")) {
        const oldPath = bgImage.split("/").pop();
        if (oldPath) await supabase.storage.from("site-images").remove([oldPath]);
      }
      
      setBgImage(data.publicUrl);
      
      await supabase.from("section_backgrounds").upsert(
        { section_key: "stats", image_url: data.publicUrl }, 
        { onConflict: 'section_key' }
      );
      
    } catch (error: any) {
      alert("ব্যাকগ্রাউন্ড আপলোডে সমস্যা: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBg = async () => {
    if (!confirm("ব্যাকগ্রাউন্ড ডিলিট করতে চান?")) return;
    try {
      if (bgImage && bgImage.includes("site-images")) {
        const oldPath = bgImage.split("/").pop();
        if (oldPath) await supabase.storage.from("site-images").remove([oldPath]);
      }
      setBgImage("");
      await supabase.from("section_backgrounds").delete().eq("section_key", "stats");
    } catch (error: any) {
      alert("ডিলিটে সমস্যা: " + error.message);
    }
  };

  const handleAddStat = () => {
    setStats([
      ...stats,
      {
        id: crypto.randomUUID(),
        label_bn: "",
        label_en: "",
        value: 0,
        suffix: "+",
        suffix_bn: "+",
        icon_key: "students",
        sort_order: stats.length + 1,
      }
    ]);
  };

    const handleDeleteStat = async (index: number) => {
    if (!confirm("আপনি কি নিশ্চিত এই স্ট্যাটটি ডিলিট করতে চান?")) return;
    const stat = stats[index];
    
    // ডাটাবেস থেকে ডিলিট করা (যদি আইডি থাকে)
    if (stat.id) {
      const { error } = await supabase.from("stats").delete().eq("id", stat.id);
      if (error) {
        alert("ডাটাবেস থেকে ডিলিট করতে সমস্যা হয়েছে: " + error.message);
        return;
      }
    }

    // UI (State) থেকে ডিলিট করা
    const newStats = [...stats];
    newStats.splice(index, 1);
    setStats(newStats);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const s of stats) {
        await supabase.from("stats").upsert({
          id: s.id,
          label_bn: s.label_bn,
          label_en: s.label_en,
          value: Number(s.value) || 0,
          suffix: s.suffix,
          suffix_bn: s.suffix_bn,
          icon_key: s.icon_key,
          sort_order: s.sort_order,
        });
      }
      alert("সফলভাবে সেভ হয়েছে!");
    } catch (error: any) {
      alert("সেভ করতে সমস্যা: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#4CAF50]" size={40} /></div>;

  return (
    <div className="max-w-5xl pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-ink">স্ট্যাটস (কাউন্টার) এডিটর</h1>
        <button onClick={handleSave} disabled={saving} className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-8 py-2.5 rounded-lg font-bold transition flex items-center gap-2 shadow-md">
          {saving ? <Loader2 className="animate-spin" size={18} /> : "সব সেভ করুন"}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold mb-4">সেকশন ব্যাকগ্রাউন্ড</h2>
            {bgImage ? (
              <div className="relative w-full h-40 rounded-xl overflow-hidden group border border-slate-200">
                <img src={bgImage} alt="BG" className="w-full h-full object-cover" />
                <button onClick={handleDeleteBg} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition z-20">
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition overflow-hidden">
                {uploading ? <Loader2 className="animate-spin text-[#4CAF50] mb-2" /> : <Upload className="text-slate-400 mb-2" size={20} />}
                <p className="text-sm text-slate-500">ব্যাকগ্রাউন্ড আপলোড করুন</p>
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handleBgUpload} title="" />
              </label>
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">কাউন্টার লিস্ট</h2>
            <button onClick={handleAddStat} className="text-sm font-bold text-[#4CAF50] flex items-center gap-1 hover:underline">
              <Plus size={16} /> নতুন কাউন্টার
            </button>
          </div>
          
          {stats.map((s, i) => (
            <div key={i} className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-4 items-start shadow-sm relative">
              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">লেবেল (বাংলা)</label>
                  <input value={s.label_bn || ""} onChange={(e) => { const n = [...stats]; n[i] = {...n[i], label_bn: e.target.value}; setStats(n); }} placeholder="যেমন: শিক্ষার্থী" className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Label (EN)</label>
                  <input value={s.label_en || ""} onChange={(e) => { const n = [...stats]; n[i] = {...n[i], label_en: e.target.value}; setStats(n); }} placeholder="e.g. Students" className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">মান (সংখ্যা)</label>
                  <input type="number" value={s.value || 0} onChange={(e) => { const n = [...stats]; n[i] = {...n[i], value: e.target.value}; setStats(n); }} placeholder="যেমন: 1200" className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">সাফিক্স (বাংলা)</label>
                  <input value={s.suffix_bn || ""} onChange={(e) => { const n = [...stats]; n[i] = {...n[i], suffix_bn: e.target.value}; setStats(n); }} placeholder="যেমন: +, ঘণ্টা" className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Suffix (EN)</label>
                  <input value={s.suffix || ""} onChange={(e) => { const n = [...stats]; n[i] = {...n[i], suffix: e.target.value}; setStats(n); }} placeholder="e.g. +, Hours" className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">আইকন</label>
                  <select value={s.icon_key || "students"} onChange={(e) => { const n = [...stats]; n[i] = {...n[i], icon_key: e.target.value}; setStats(n); }} className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none">
                    {iconOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button onClick={() => handleDeleteStat(i)} className="mt-2 md:mt-6 text-slate-300 hover:text-red-500 transition bg-white rounded-full p-2 shadow-sm border border-slate-100">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          
          {stats.length === 0 && (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 border-dashed">
              <p className="text-slate-500">কোনো কাউন্টার নেই। উপরে থেকে নতুন যোগ করুন।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}