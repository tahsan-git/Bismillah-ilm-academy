"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Upload, Trash2, Plus } from "lucide-react";

// 🌟 এখানে নতুন নতুন আইকন যোগ করা হয়েছে
const iconOptions = [
  { value: "one-to-one", label: "ওয়ান টু ওয়ান (Users)" },
  { value: "trial", label: "ফ্রি ট্রায়াল (Gift)" },
  { value: "time", label: "ফ্লেক্সিবল টাইম (Clock)" },
  { value: "female", label: "ফিমেল টিচার (GraduationCap)" },
  { value: "book", label: "বই / কুরআন (Book)" },
  { value: "star", label: "স্টার / রেটিং (Star)" },
  { value: "heart", label: "ভালোবাসা (Heart)" },
  { value: "award", label: "অ্যাওয়ার্ড (Award)" },
  { value: "shield", label: "নিরাপত্তা (Shield)" },
  { value: "zap", label: "দ্রুতগতি (Zap)" },
  { value: "monitor", label: "কম্পিউটার / অনলাইন (Monitor)" },
  { value: "smartphone", label: "মোবাইল অ্যাপ (Smartphone)" },
  { value: "globe", label: "বিশ্বব্যাপী (Globe)" },
  { value: "video", label: "ভিডিও ক্লাস (Video)" },
  { value: "mic", label: "অডিও / মাইক (Mic)" },
  { value: "users", label: "শিক্ষার্থী / গ্রুপ (Users)" },
  { value: "user-check", label: "ভেরিফাইড টিচার (UserCheck)" },
  { value: "calendar", label: "সিডিউল / ক্যালেন্ডার (Calendar)" },
  { value: "check-circle", label: "সফলতা (CheckCircle)" },
  { value: "message", label: "সাপোর্ট / চ্যাট (MessageSquare)" },
  { value: "headphones", label: "হেল্পলাইন (Headphones)" },
  { value: "target", label: "লক্ষ্য (Target)" },
  { value: "sparkles", label: "স্পেশাল / নতুন (Sparkles)" },
];

export default function AdminFeatures() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [bgImage, setBgImage] = useState("");
  const [features, setFeatures] = useState<any[]>([]);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const [featuresData, bgData] = await Promise.all([
        supabase.from("features").select("*").order("sort_order"),
        supabase.from("section_backgrounds").select("*").eq("section_key", "features").maybeSingle(),
      ]);
      
      if (featuresData.data) setFeatures(featuresData.data);
      if (bgData.data) setBgImage(bgData.data.image_url || "");
      
      setLoading(false);
    };
    fetchData();
  }, [supabase]);

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `features-bg-${Date.now()}.${file.name.split('.').pop()}`;
    
    try {
      const { error } = await supabase.storage.from("site-images").upload(fileName, file);
      if (error) throw error;

      const { data } = supabase.storage.from("site-images").getPublicUrl(fileName);
      
      if (bgImage && bgImage.includes("site-images")) {
        const oldPath = bgImage.split("/").pop();
        if (oldPath) await supabase.storage.from("site-images").remove([oldPath]);
      }
      
      setBgImage(data.publicUrl);
      
      await supabase.from("section_backgrounds").upsert(
        { section_key: "features", image_url: data.publicUrl }, 
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
      await supabase.from("section_backgrounds").delete().eq("section_key", "features");
    } catch (error: any) {
      alert("ডিলিটে সমস্যা: " + error.message);
    }
  };

  const handleAddFeature = () => {
    setFeatures([
      ...features,
      {
        id: crypto.randomUUID(),
        icon_key: "one-to-one",
        title_bn: "",
        title_en: "",
        body_bn: "",
        body_en: "",
        sort_order: features.length + 1,
      }
    ]);
  };

    const handleDeleteFeature = async (index: number) => {
    if (!confirm("আপনি কি নিশ্চিত এই ফিচারটি ডিলিট করতে চান?")) return;
    const feature = features[index];
    
    // ১. যদি আইডি ডাটাবেসের হয় (UUID), তবে ডিলিট করবো
    if (feature.id && !feature.id.includes("-")) {
      const { error } = await supabase.from("features").delete().eq("id", feature.id);
      if (error) {
        alert("ডাটাবেস থেকে ডিলিট করতে সমস্যা: " + error.message);
        return; // এরর হলে UI থেকে সরবে না
      }
    }

    // ২. UI (State) থেকে ডিলিট করা
    const newFeatures = [...features];
    newFeatures.splice(index, 1);
    setFeatures(newFeatures);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const f of features) {
        await supabase.from("features").upsert({
          id: f.id,
          icon_key: f.icon_key,
          title_bn: f.title_bn,
          title_en: f.title_en,
          body_bn: f.body_bn,
          body_en: f.body_en,
          sort_order: f.sort_order,
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
        <h1 className="text-2xl font-bold text-ink">ফিচার (বৈশিষ্ট্য) এডিটর</h1>
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
            <h2 className="text-lg font-bold">ফিচার লিস্ট</h2>
            <button onClick={handleAddFeature} className="text-sm font-bold text-[#4CAF50] flex items-center gap-1 hover:underline">
              <Plus size={16} /> নতুন ফিচার
            </button>
          </div>
          
          {features.map((f, i) => (
            <div key={i} className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-4 items-start shadow-sm relative">
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">আইকন</label>
                  <select value={f.icon_key || "one-to-one"} onChange={(e) => { const n = [...features]; n[i] = {...n[i], icon_key: e.target.value}; setFeatures(n); }} className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none">
                    {iconOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">টাইটেল (বাংলা)</label>
                  <input value={f.title_bn || ""} onChange={(e) => { const n = [...features]; n[i] = {...n[i], title_bn: e.target.value}; setFeatures(n); }} placeholder="যেমন: ওয়ান টু ওয়ান সিস্টেম" className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">টাইটেল (EN)</label>
                  <input value={f.title_en || ""} onChange={(e) => { const n = [...features]; n[i] = {...n[i], title_en: e.target.value}; setFeatures(n); }} placeholder="e.g. One-to-One System" className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 mb-1 block">বর্ণনা (বাংলা)</label>
                  <textarea rows={2} value={f.body_bn || ""} onChange={(e) => { const n = [...features]; n[i] = {...n[i], body_bn: e.target.value}; setFeatures(n); }} placeholder="যেমন: ক্লাসে শুধুমাত্র একজন শিক্ষার্থী এবং একজন শিক্ষক থাকবেন।" className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none resize-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 mb-1 block">বর্ণনা (EN)</label>
                  <textarea rows={2} value={f.body_en || ""} onChange={(e) => { const n = [...features]; n[i] = {...n[i], body_en: e.target.value}; setFeatures(n); }} placeholder="e.g. Each class has only one student and one teacher." className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none resize-none" />
                </div>
              </div>

              <button onClick={() => handleDeleteFeature(i)} className="mt-2 md:mt-8 text-slate-300 hover:text-red-500 transition bg-white rounded-full p-2 shadow-sm border border-slate-100 shrink-0">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          
          {features.length === 0 && (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 border-dashed">
              <p className="text-slate-500">কোনো ফিচার নেই। উপরে থেকে নতুন যোগ করুন।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}