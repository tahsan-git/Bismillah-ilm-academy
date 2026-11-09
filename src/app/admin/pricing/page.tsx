"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Upload, Trash2, Plus } from "lucide-react";

export default function AdminPricing() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bgImage, setBgImage] = useState("");
  const [plans, setPlans] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansData, bgData] = await Promise.all([
          supabase.from("pricing_plans").select("*").order("sort_order"),
          supabase.from("section_backgrounds").select("*").eq("section_key", "pricing").single()
        ]);

        if (plansData.data && plansData.data.length > 0) {
          // ডাটাবেস থেকে আসা ডাটায় যদি features_bn না থাকে, তবে ফাঁকা অ্যারে সেট করা
          const formatted = plansData.data.map(p => ({
            ...p,
            features_bn: p.features_bn || [],
            features_en: p.features_en || []
          }));
          setPlans(formatted);
        } else {
          // ডিফল্ট ডাটা
          setPlans([
            {
              id: crypto.randomUUID(),
              name_bn: "বেসিক প্লান", name_en: "Basic Plan", price: 1000,
              features_bn: ["সপ্তাহে ৩ দিন ক্লাস", "প্রতিটি ক্লাস ৩০ মিনিট", "ওয়ান টু ওয়ান"],
              features_en: ["3 days/week", "30 mins", "1-to-1"],
              sort_order: 1, is_featured: false, cta_label_bn: "ভর্তি হোন", cta_label_en: "Enroll", cta_href: "/"
            },
            {
              id: crypto.randomUUID(),
              name_bn: "পপুলার প্লান", name_en: "Popular Plan", price: 2000,
              features_bn: ["সপ্তাহে ৬ দিন ক্লাস", "প্রতিটি ক্লাস ৩০ মিনিট", "ওয়ান টু ওয়ান", "ফিমেল টিচার"],
              features_en: ["6 days/week", "30 mins", "1-to-1", "Female Teacher"],
              sort_order: 2, is_featured: true, cta_label_bn: "ভর্তি হোন", cta_label_en: "Enroll", cta_href: "/"
            },
            {
              id: crypto.randomUUID(),
              name_bn: "এডভান্স প্লান", name_en: "Advanced Plan", price: 4000,
              features_bn: ["সপ্তাহে ৬ দিন ক্লাস", "প্রতিটি ক্লাস ৬০ মিনিট", "হিফজ করানো হবে"],
              features_en: ["6 days/week", "60 mins", "Hifz"],
              sort_order: 3, is_featured: false, cta_label_bn: "ভর্তি হোন", cta_label_en: "Enroll", cta_href: "/"
            }
          ]);
        }

        if (bgData.data) setBgImage(bgData.data.image_url || "");
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [supabase]);

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = `price-bg-${Date.now()}.${file.name.split('.').pop()}`;
    await supabase.storage.from("site-images").upload(fileName, file);
    const { data } = await supabase.storage.from("site-images").getPublicUrl(fileName);
    setBgImage(data.publicUrl);
  };

  const handleChange = (index: number, field: string, value: string | number) => {
    const newPlans = [...plans];
    newPlans[index][field] = value;
    setPlans(newPlans);
  };

  const handleFeatureChange = (planIndex: number, featureIndex: number, lang: "bn" | "en", value: string) => {
    const newPlans = [...plans];
    const field = lang === "bn" ? "features_bn" : "features_en";
    const newFeatures = [...(newPlans[planIndex][field] || [])];
    newFeatures[featureIndex] = value;
    newPlans[planIndex][field] = newFeatures;
    setPlans(newPlans);
  };

  // নতুন ফিচার অ্যাড করা
  const addFeature = (planIndex: number, lang: "bn" | "en") => {
    const newPlans = [...plans];
    const field = lang === "bn" ? "features_bn" : "features_en";
    const currentFeatures = newPlans[planIndex][field] || [];
    newPlans[planIndex][field] = [...currentFeatures, ""]; // নতুন ফাঁকা স্ট্রিং
    setPlans(newPlans);
  };

  // ফিচার রিমুভ করা
  const removeFeature = (planIndex: number, featureIndex: number, lang: "bn" | "en") => {
    const newPlans = [...plans];
    const field = lang === "bn" ? "features_bn" : "features_en";
    const currentFeatures = newPlans[planIndex][field] || [];
    newPlans[planIndex][field] = currentFeatures.filter((_:any, i:number) => i !== featureIndex);
    setPlans(newPlans);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const p of plans) {
        await supabase.from("pricing_plans").upsert({
          id: p.id,
          name_bn: p.name_bn, name_en: p.name_en, price: p.price,
          features_bn: p.features_bn, features_en: p.features_en,
          sort_order: p.sort_order, is_featured: p.is_featured,
          cta_label_bn: p.cta_label_bn, cta_label_en: p.cta_label_en, cta_href: p.cta_href
        });
      }
      await supabase.from("section_backgrounds").upsert({ section_key: "pricing", image_url: bgImage });
      alert("সফলভাবে সেভ হয়েছে!");
    } catch (err) {
      alert("সেভ করতে সমস্যা হয়েছে!");
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#4CAF50]" size={40} /></div>;

  return (
    <div className="max-w-[1240px] pb-20">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-50 py-4 z-10">
        <h1 className="text-2xl font-bold text-ink">প্রাইসিং প্লান এডিটর</h1>
        <button onClick={handleSave} disabled={saving} className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-6 py-2.5 rounded-lg font-bold transition flex items-center gap-2 shadow-md">
          {saving ? <Loader2 className="animate-spin" size={18} /> : "সব সেভ করুন"}
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl mb-8 border border-slate-100 shadow-sm">
        <h2 className="font-bold mb-4">সেকশন ব্যাকগ্রাউন্ড ইমেজ</h2>
        {bgImage ? (
          <div className="relative w-full h-40 rounded-xl overflow-hidden group">
            <img src={bgImage} className="w-full h-full object-cover" />
            <button onClick={() => setBgImage("")} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition"><Trash2 size={16} /></button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-50 transition">
            <Upload className="text-slate-400 mb-2" size={20} />
            <p className="text-sm text-slate-500">ব্যাকগ্রাউন্ড আপলোড করুন</p>
            <input type="file" className="hidden" accept="image/*" onChange={handleBgUpload} />
          </label>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((p, i) => (
          <div key={p.id || i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">প্ল্যানের নাম (বাংলা)</label>
              <input value={p.name_bn || ""} onChange={(e) => handleChange(i, "name_bn", e.target.value)} className="w-full border p-2 rounded-lg font-bold text-ink outline-none focus:border-[#4CAF50]" />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">প্ল্যানের নাম (English)</label>
              <input value={p.name_en || ""} onChange={(e) => handleChange(i, "name_en", e.target.value)} className="w-full border p-2 rounded-lg font-bold text-ink outline-none focus:border-[#4CAF50]" />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">মূল্য (৳)</label>
              <input type="number" value={p.price || 0} onChange={(e) => handleChange(i, "price", parseInt(e.target.value) || 0)} className="w-full border p-2 rounded-lg outline-none focus:border-[#4CAF50]" />
            </div>

            <hr className="border-slate-100" />

            {/* বাংলা ফিচার */}
            <div>
              <label className="text-xs font-bold text-[#4CAF50] mb-2 block">ফিচারসমূহ (বাংলা)</label>
              <div className="space-y-2">
                {(p.features_bn || []).map((feat: string, fi: number) => (
                  <div key={fi} className="flex gap-2 items-center">
                    <input 
                      value={feat} 
                      onChange={(e) => handleFeatureChange(i, fi, "bn", e.target.value)} 
                      className="w-full border p-2 rounded-lg text-sm outline-none focus:border-[#4CAF50]" 
                    />
                    <button onClick={() => removeFeature(i, fi, "bn")} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button onClick={() => addFeature(i, "bn")} className="text-sm text-[#4CAF50] font-bold flex items-center gap-1 mt-2 hover:underline">
                  <Plus size={16} /> নতুন ফিচার যোগ করুন
                </button>
              </div>
            </div>

            {/* ইংরেজি ফিচার */}
            <div>
              <label className="text-xs font-bold text-[#4CAF50] mb-2 block">ফিচারসমূহ (English)</label>
              <div className="space-y-2">
                {(p.features_en || []).map((feat: string, fi: number) => (
                  <div key={fi} className="flex gap-2 items-center">
                    <input 
                      value={feat} 
                      onChange={(e) => handleFeatureChange(i, fi, "en", e.target.value)} 
                      className="w-full border p-2 rounded-lg text-sm outline-none focus:border-[#4CAF50]" 
                    />
                    <button onClick={() => removeFeature(i, fi, "en")} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button onClick={() => addFeature(i, "en")} className="text-sm text-[#4CAF50] font-bold flex items-center gap-1 mt-2 hover:underline">
                  <Plus size={16} /> Add new feature
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}