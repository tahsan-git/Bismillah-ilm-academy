"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Upload, Trash2 } from "lucide-react";

export default function AdminAbout() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    eyebrow_bn: "", eyebrow_en: "",
    heading_bn: "", heading_en: "",
    body_bn: "", body_en: "",
    cta_label_bn: "", cta_label_en: "",
    cta_href: "",
    image_url: "",
    bg_image_url: ""
  });

  const supabase = createClient();

  // ১. ডাটা লোড করা
  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const [aboutData, bgData] = await Promise.all([
          supabase.from("about").select("*").eq("id", 1).maybeSingle(),
          supabase.from("section_backgrounds").select("*").eq("section_key", "about").maybeSingle()
        ]);
        
        if (aboutData.data) {
          setFormData(prev => ({ 
            ...prev, 
            ...aboutData.data, 
            bg_image_url: bgData.data?.image_url || "" 
          }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, [supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "image_url" | "bg_image_url") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `about-${fieldName}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from("site-images").upload(fileName, file);

    if (uploadError) {
      alert("ইমেজ আপলোডে সমস্যা হয়েছে!");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("site-images").getPublicUrl(fileName);
    setFormData({ ...formData, [fieldName]: data.publicUrl });
    
    if (formData[fieldName]) {
      const oldPath = formData[fieldName].split("/").pop();
      if (oldPath) await supabase.storage.from("site-images").remove([oldPath]);
    }
    setUploading(false);
  };

  const handleImageDelete = async (fieldName: "image_url" | "bg_image_url") => {
    if (!formData[fieldName]) return;
    const filePath = formData[fieldName].split("/").pop();
    if (filePath) await supabase.storage.from("site-images").remove([filePath]);
    setFormData({ ...formData, [fieldName]: "" });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { bg_image_url, ...aboutData } = formData; 
      
      // about টেবিলে সেভ
      await supabase.from("about").upsert({
        id: 1,
        ...aboutData,
        updated_at: new Date().toISOString()
      });

      // ব্যাকগ্রাউন্ড টেবিলে সেভ
      await supabase.from("section_backgrounds").upsert({
        section_key: "about",
        image_url: bg_image_url
      });

      alert("সফলভাবে সেভ হয়েছে!");
    } catch (error) {
      alert("সেভ করতে সমস্যা হয়েছে!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#4CAF50]" size={40} /></div>;

  return (
    <div className="max-w-4xl pb-20">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-50 py-4 z-10">
        <h1 className="text-2xl font-bold text-ink">আমাদের সম্পর্কে (About) এডিটর</h1>
        <button onClick={handleSave} disabled={saving} className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-6 py-2.5 rounded-lg font-bold transition flex items-center gap-2 shadow-md">
          {saving ? <Loader2 className="animate-spin" size={18} /> : "সেভ করুন"}
        </button>
      </div>

      <div className="space-y-6 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
        
        {/* সেকশন ব্যাকগ্রাউন্ড */}
        <div>
          <label className="block text-sm font-bold text-ink mb-2">সেকশন ব্যাকগ্রাউন্ড ইমেজ</label>
          {formData.bg_image_url ? (
            <div className="relative w-full h-40 rounded-xl overflow-hidden bg-slate-100 group">
              <img src={formData.bg_image_url} alt="Background" className="w-full h-full object-cover" />
              <button onClick={() => handleImageDelete("bg_image_url")} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-lg">
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition">
              <Upload className="text-slate-400 mb-2" size={20} />
              <p className="text-sm text-slate-500">ব্যাকগ্রাউন্ড ইমেজ আপলোড করুন</p>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "bg_image_url")} />
            </label>
          )}
        </div>

        <hr className="border-slate-100" />

        {/* মেইন ইমেজ */}
        <div>
          <label className="block text-sm font-bold text-ink mb-2">প্রধান ইমেজ (বাম দিকের)</label>
          {formData.image_url ? (
            <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-100 group">
              <img src={formData.image_url} alt="Main" className="w-full h-full object-cover" />
              <button onClick={() => handleImageDelete("image_url")} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-lg">
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition">
              <Upload className="text-slate-400 mb-2" size={20} />
              <p className="text-sm text-slate-500">প্রধান ইমেজ আপলোড করুন</p>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "image_url")} />
            </label>
          )}
        </div>

        <hr className="border-slate-100" />

        {/* টেক্সট ফিল্ড */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold mb-1">ছোট শিরোনাম (বাংলা)</label>
            <input name="eyebrow_bn" value={formData.eyebrow_bn || ""} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-[#4CAF50]" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">ছোট শিরোনাম (English)</label>
            <input name="eyebrow_en" value={formData.eyebrow_en || ""} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-[#4CAF50]" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">প্রধান শিরোনাম (বাংলা)</label>
            <input name="heading_bn" value={formData.heading_bn || ""} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-[#4CAF50]" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">প্রধান শিরোনাম (English)</label>
            <input name="heading_en" value={formData.heading_en || ""} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-[#4CAF50]" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">বিস্তারিত লেখা (বাংলা)</label>
          <textarea name="body_bn" value={formData.body_bn || ""} onChange={handleChange} rows={4} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-[#4CAF50]" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">বিস্তারিত লেখা (English)</label>
          <textarea name="body_en" value={formData.body_en || ""} onChange={handleChange} rows={4} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-[#4CAF50]" />
        </div>

      </div>
    </div>
  );
}