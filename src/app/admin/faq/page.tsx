"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Upload, Trash2, Plus } from "lucide-react";

export default function AdminFaq() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bgImage, setBgImage] = useState("");
  const [faqs, setFaqs] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const [faqData, bgData] = await Promise.all([
        supabase.from("faqs").select("*").order("sort_order"),
        supabase.from("section_backgrounds").select("*").eq("section_key", "faq").single()
      ]);
      if (faqData.data) setFaqs(faqData.data);
      if (bgData.data) setBgImage(bgData.data.image_url || "");
      setLoading(false);
    };
    fetchData();
  }, [supabase]);

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = `faq-bg-${Date.now()}.${file.name.split('.').pop()}`;
    await supabase.storage.from("site-images").upload(fileName, file);
    const { data } = supabase.storage.from("site-images").getPublicUrl(fileName);
    setBgImage(data.publicUrl);
  };

  const addFaq = () => {
    setFaqs([...faqs, { id: crypto.randomUUID(), question_bn: "", question_en: "", answer_bn: "", answer_en: "", sort_order: faqs.length + 1 }]);
  };

  const handleSave = async () => {
    setSaving(true);
    for (const f of faqs) await supabase.from("faqs").upsert(f);
    await supabase.from("section_backgrounds").upsert({ section_key: "faq", image_url: bgImage });
    setSaving(false);
    alert("সেভ হয়েছে!");
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#4CAF50]" size={40} /></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">প্রশ্নোত্তর (FAQ) এডিটর</h1>
        <button onClick={handleSave} disabled={saving} className="bg-[#4CAF50] text-white px-6 py-2.5 rounded-lg font-bold">সেভ করুন</button>
      </div>

      <div className="bg-white p-6 rounded-2xl mb-8 border">
        <h2 className="font-bold mb-4">সেকশন ব্যাকগ্রাউন্ড</h2>
        {bgImage ? (
          <div className="relative w-full h-40 rounded-xl overflow-hidden group">
            <img src={bgImage} className="w-full h-full object-cover" />
            <button onClick={() => setBgImage("")} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer">
            <Upload className="mb-2" size={20} />
            <p>ব্যাকগ্রাউন্ড আপলোড</p>
            <input type="file" className="hidden" onChange={handleBgUpload} />
          </label>
        )}
      </div>

      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border space-y-2">
            <input value={f.question_bn} onChange={(e) => { const n = [...faqs]; n[i].question_bn = e.target.value; setFaqs(n); }} placeholder="প্রশ্ন (বাংলা)" className="w-full border p-2 rounded-lg font-bold" />
            <input value={f.question_en} onChange={(e) => { const n = [...faqs]; n[i].question_en = e.target.value; setFaqs(n); }} placeholder="Question (EN)" className="w-full border p-2 rounded-lg font-bold" />
            <textarea value={f.answer_bn} onChange={(e) => { const n = [...faqs]; n[i].answer_bn = e.target.value; setFaqs(n); }} placeholder="উত্তর (বাংলা)" rows={2} className="w-full border p-2 rounded-lg" />
            <textarea value={f.answer_en} onChange={(e) => { const n = [...faqs]; n[i].answer_en = e.target.value; setFaqs(n); }} placeholder="Answer (EN)" rows={2} className="w-full border p-2 rounded-lg" />
          </div>
        ))}
        <button onClick={addFaq} className="flex items-center gap-2 text-[#4CAF50] font-bold mt-4 hover:underline"><Plus size={18} /> নতুন প্রশ্ন যোগ করুন</button>
      </div>
    </div>
  );
}