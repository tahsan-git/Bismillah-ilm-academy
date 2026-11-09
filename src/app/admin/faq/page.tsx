"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Upload, Trash2, Plus } from "lucide-react";

export default function AdminFaq() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bgImage, setBgImage] = useState("");
  const [faqs, setFaqs] = useState<any[]>([]);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const [faqData, bgData] = await Promise.all([
        supabase.from("faqs").select("*").order("sort_order"),
        supabase.from("section_backgrounds").select("*").eq("section_key", "faq").maybeSingle(),
      ]);
      if (faqData.data) setFaqs(faqData.data);
      if (bgData.data) setBgImage(bgData.data.image_url || "");
      setLoading(false);
    };
    fetchData();
  }, [supabase]);

  // 🌟 ব্যাকগ্রাউন্ড আপলোড (সরাসরি ডাটাবেসে সেভ)
  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `faq-bg-${Date.now()}.${file.name.split('.').pop()}`;
    
    try {
      const { error } = await supabase.storage.from("site-images").upload(fileName, file);
      if (error) throw error;
      
      const { data } = supabase.storage.from("site-images").getPublicUrl(fileName);
      
      // পুরোনো ছবি থাকলে ডিলিট করা
      if (bgImage && bgImage.includes("site-images")) {
        const oldPath = bgImage.split("/").pop();
        if (oldPath) await supabase.storage.from("site-images").remove([oldPath]);
      }
      
      setBgImage(data.publicUrl);
      await supabase.from("section_backgrounds").upsert({ section_key: "faq", image_url: data.publicUrl });
    } catch (error: any) {
      alert("আপলোডে সমস্যা: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // 🌟 ব্যাকগ্রাউন্ড ডিলিট (Storage এবং Database দুই জায়গা থেকেই)
  const handleDeleteBg = async () => {
    if (!confirm("ব্যাকগ্রাউন্ড ডিলিট করতে চান?")) return;
    try {
      if (bgImage && bgImage.includes("site-images")) {
        const oldPath = bgImage.split("/").pop();
        if (oldPath) await supabase.storage.from("site-images").remove([oldPath]);
      }
      setBgImage("");
      await supabase.from("section_backgrounds").delete().eq("section_key", "faq");
    } catch (error: any) {
      alert("ডিলিটে সমস্যা: " + error.message);
    }
  };

  const addFaq = () => {
    setFaqs([
      ...faqs, 
      { 
        id: crypto.randomUUID(), 
        question_bn: "", 
        question_en: "", 
        answer_bn: "", 
        answer_en: "", 
        sort_order: faqs.length + 1 
      }
    ]);
  };

  // 🌟 প্রশ্ন ডিলিট করা (ডাটাবেস থেকেও মুছে যাবে)
  const handleDeleteFaq = async (index: number) => {
    if (!confirm("আপনি কি নিশ্চিত এই প্রশ্নটি ডিলিট করতে চান?")) return;
    const faq = faqs[index];

    if (faq.id && !faq.id.includes("-")) {
      await supabase.from("faqs").delete().eq("id", faq.id);
    }

    const newFaqs = [...faqs];
    newFaqs.splice(index, 1);
    setFaqs(newFaqs);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const f of faqs) {
        await supabase.from("faqs").upsert({
          id: f.id,
          question_bn: f.question_bn,
          question_en: f.question_en,
          answer_bn: f.answer_bn,
          answer_en: f.answer_en,
          sort_order: f.sort_order,
        });
      }
      alert("সফলভাবে সেভ হয়েছে!");
    } catch (error: any) {
      alert("সেভে সমস্যা: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#4CAF50]" size={40} /></div>;

  return (
    <div className="max-w-4xl pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">প্রশ্নোত্তর (FAQ) এডিটর</h1>
        <button onClick={handleSave} disabled={saving} className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-6 py-2.5 rounded-lg font-bold transition flex items-center gap-2">
          {saving ? <Loader2 className="animate-spin" size={18} /> : "সব সেভ করুন"}
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl mb-8 border border-slate-200 shadow-sm">
        <h2 className="font-bold mb-4">সেকশন ব্যাকগ্রাউন্ড</h2>
        {bgImage ? (
          <div className="relative w-full h-40 rounded-xl overflow-hidden group border border-slate-200">
            <img src={bgImage} className="w-full h-full object-cover" />
            <button onClick={handleDeleteBg} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition">
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-50 transition">
            {uploading ? <Loader2 className="animate-spin mb-2" /> : <Upload className="mb-2 text-slate-400" size={20} />}
            <p className="text-sm text-slate-500">ব্যাকগ্রাউন্ড আপলোড করুন</p>
            <input type="file" className="hidden" accept="image/*" onChange={handleBgUpload} />
          </label>
        )}
      </div>

      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div key={f.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative group">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">প্রশ্ন (বাংলা)</label>
                <input value={f.question_bn || ""} onChange={(e) => { const n = [...faqs]; n[i] = {...n[i], question_bn: e.target.value}; setFaqs(n); }} className="w-full border border-slate-200 p-2.5 rounded-lg font-bold text-sm focus:border-[#4CAF50] outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Question (EN)</label>
                <input value={f.question_en || ""} onChange={(e) => { const n = [...faqs]; n[i] = {...n[i], question_en: e.target.value}; setFaqs(n); }} className="w-full border border-slate-200 p-2.5 rounded-lg font-bold text-sm focus:border-[#4CAF50] outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">উত্তর (বাংলা)</label>
                <textarea value={f.answer_bn || ""} onChange={(e) => { const n = [...faqs]; n[i] = {...n[i], answer_bn: e.target.value}; setFaqs(n); }} rows={2} className="w-full border border-slate-200 p-2.5 rounded-lg text-sm focus:border-[#4CAF50] outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Answer (EN)</label>
                <textarea value={f.answer_en || ""} onChange={(e) => { const n = [...faqs]; n[i] = {...n[i], answer_en: e.target.value}; setFaqs(n); }} rows={2} className="w-full border border-slate-200 p-2.5 rounded-lg text-sm focus:border-[#4CAF50] outline-none" />
              </div>
            </div>
            
            {/* 🌟 ডিলিট বাটন */}
            <button onClick={() => handleDeleteFaq(i)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition bg-white rounded-full p-1.5 shadow-sm border border-slate-100">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        
        <button onClick={addFaq} className="flex items-center gap-2 text-[#4CAF50] font-bold mt-4 hover:underline bg-green-50 px-4 py-3 rounded-xl w-full justify-center border-2 border-dashed border-green-200">
          <Plus size={18} /> নতুন প্রশ্ন যোগ করুন
        </button>
      </div>
    </div>
  );
}