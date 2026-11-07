"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Save, Loader2 } from "lucide-react";

export default function AdminHero() {
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.from("hero").select("*").eq("id", 1).single().then(({ data }) => {
      if (data) setForm(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("hero").update({
      heading_bn: form.heading_bn,
      heading_en: form.heading_en,
      eyebrow_bn: form.eyebrow_bn,
      eyebrow_en: form.eyebrow_en,
      body_bn: form.body_bn,
      body_en: form.body_en,
      cta_label_bn: form.cta_label_bn,
      cta_label_en: form.cta_label_en,
      cta_href: form.cta_href,
      image_url: form.image_url,
    }).eq("id", 1);

    if (error) alert("সমস্যা হয়েছে: " + error.message);
    else alert("সফলভাবে সেভ হয়েছে!");
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">হিরো সেকশন এডিট</h1>
        <button onClick={handleSave} disabled={saving} className="bg-[#4CAF50] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#388E3C] transition">
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} সেভ করুন
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        {/* Eyebrow / সোনালী লেখা */}
        <div>
          <label className="block text-sm font-bold text-ink mb-1">সোনালী রঙের ছোট লেখা (Eyebrow - বাংলা)</label>
          <input type="text" value={form.eyebrow_bn || ""} onChange={(e) => setForm({ ...form, eyebrow_bn: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none" placeholder="যেমন: অনলাইনে পবিত্র কুরআন শিক্ষার একটি নির্ভরযোগ্য প্রতিষ্ঠান" />
        </div>

        {/* Heading / টাইটেল */}
        <div>
          <label className="block text-sm font-bold text-ink mb-1">টাইটেল (বাংলা)</label>
          <input type="text" value={form.heading_bn || ""} onChange={(e) => setForm({ ...form, heading_bn: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none" />
        </div>
        <div>
          <label className="block text-sm font-bold text-ink mb-1">টাইটেল (ইংরেজি)</label>
          <input type="text" value={form.heading_en || ""} onChange={(e) => setForm({ ...form, heading_en: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none" />
        </div>

        {/* Body / বডি টেক্সট */}
        <div>
          <label className="block text-sm font-bold text-ink mb-1">বডি টেক্সট (বাংলা)</label>
          <textarea value={form.body_bn || ""} onChange={(e) => setForm({ ...form, body_bn: e.target.value })} rows={4} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none"></textarea>
        </div>

        {/* CTA / বাটনের লেখা */}
        <div>
          <label className="block text-sm font-bold text-ink mb-1">বাটনের লেখা (CTA Label - বাংলা)</label>
          <input type="text" value={form.cta_label_bn || ""} onChange={(e) => setForm({ ...form, cta_label_bn: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none" placeholder="যেমন: ট্রায়াল ক্লাস ফরম" />
        </div>

        {/* CTA Link */}
        <div>
          <label className="block text-sm font-bold text-ink mb-1">বাটনে ক্লিক করলে কোথায় যাবে (CTA Link)</label>
          <input type="text" value={form.cta_href || ""} onChange={(e) => setForm({ ...form, cta_href: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none" placeholder="/trial-class" />
        </div>

        {/* Image */}
        <ImageUpload label="হিরো ব্যাকগ্রাউন্ড ইমেজ" value={form.image_url || ""} onChange={(url) => setForm({ ...form, image_url: url })} />
      </div>
    </div>
  );
}