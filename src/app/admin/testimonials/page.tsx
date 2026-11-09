"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Edit, Save, X, Loader2, Upload, Image as ImageIcon } from "lucide-react";

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    quote_bn: "", quote_en: "",
    author_bn: "", author_en: "",
    role_bn: "গার্ডিয়ান", role_en: "Guardian",
    image_url: "",
    sort_order: 0
  });

  const supabase = createClient();

  // ডাটা ফেচ
  const fetchTestimonials = async () => {
    setLoading(true);
    const { data } = await supabase.from("testimonials").select("*").order("sort_order", { ascending: true });
    if (data) setTestimonials(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // ছবি আপলোড ফাংশন
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Supabase Storage-এ আপলোড
    const { error: uploadError } = await supabase.storage
      .from('site-images')
      .upload(filePath, file);

    if (uploadError) {
      alert("ছবি আপলোডে সমস্যা হয়েছে!");
      setUploading(false);
      return;
    }

    // পাবলিক URL নেওয়া
    const { data } = supabase.storage.from('site-images').getPublicUrl(filePath);
    setFormData({ ...formData, image_url: data.publicUrl });
    setUploading(false);
  };

  // সেভ (Add বা Edit)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (editingId) {
      await supabase.from("testimonials").update(formData).eq("id", editingId);
    } else {
      await supabase.from("testimonials").insert([formData]);
    }

    setEditingId(null);
    resetForm();
    fetchTestimonials();
  };

  // ডিলিট
  const handleDelete = async (id: string) => {
    if (confirm("আপনি কি এই মন্তব্যটি ডিলিট করতে চান?")) {
      await supabase.from("testimonials").delete().eq("id", id);
      fetchTestimonials();
    }
  };

  // এডিট বাটনে ক্লিক করলে ফর্মে ডাটা লোড হবে
  const handleEdit = (t: any) => {
    setEditingId(t.id);
    setFormData({
      quote_bn: t.quote_bn || "",
      quote_en: t.quote_en || "",
      author_bn: t.author_bn || "",
      author_en: t.author_en || "",
      role_bn: t.role_bn || "গার্ডিয়ান",
      role_en: t.role_en || "Guardian",
      image_url: t.image_url || "",
      sort_order: t.sort_order || 0
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setFormData({
      quote_bn: "", quote_en: "",
      author_bn: "", author_en: "",
      role_bn: "গার্ডিয়ান", role_en: "Guardian",
      image_url: "",
      sort_order: 0
    });
  };

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-ink">অভিভাবকদের মন্তব্য (Testimonials)</h1>
      </div>

      {/* ফর্ম */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">{editingId ? "মন্তব্য এডিট করুন" : "নতুন মন্তব্য যোগ করুন"}</h2>
        <form onSubmit={handleSave} className="space-y-4">
          
          {/* ছবি আপলোড সেকশন */}
          <div className="flex items-center gap-4 p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            <div className="w-20 h-20 bg-white rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
              {formData.image_url ? (
                <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="text-slate-300" size={32} />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-ink mb-1">অভিভাবকের ছবি</p>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {uploading ? "আপলোড হচ্ছে..." : "ছবি আপলোড করুন"}
              </button>
              <p className="text-xs text-slate-400 mt-2">সর্বোচ্চ ২ মেগাবাইট (JPG, PNG)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">মন্তব্য (বাংলা)</label>
              <textarea required value={formData.quote_bn} onChange={(e) => setFormData({...formData, quote_bn: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg focus:border-[#4CAF50] outline-none h-24" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">মন্তব্য (ইংরেজি)</label>
              <textarea required value={formData.quote_en} onChange={(e) => setFormData({...formData, quote_en: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg focus:border-[#4CAF50] outline-none h-24" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">অভিভাবকের নাম (বাংলা)</label>
              <input required type="text" value={formData.author_bn} onChange={(e) => setFormData({...formData, author_bn: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg focus:border-[#4CAF50] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">অভিভাবকের নাম (ইংরেজি)</label>
              <input required type="text" value={formData.author_en} onChange={(e) => setFormData({...formData, author_en: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg focus:border-[#4CAF50] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">ক্রম (Serial)</label>
              <input type="number" value={formData.sort_order} onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})} className="w-full p-3 border border-slate-200 rounded-lg focus:border-[#4CAF50] outline-none" />
            </div>
          </div>
          
          <div className="flex gap-2 pt-2 border-t border-slate-100 mt-4 pt-4">
            <button type="submit" disabled={loading || uploading} className="bg-[#4CAF50] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#388E3C] transition">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} সেভ করুন
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); resetForm(); }} className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-300 transition">
                <X size={18} /> বাতিল
              </button>
            )}
          </div>
        </form>
      </div>

      {/* মন্তব্যের লিস্ট */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4">অভিভাবক</th>
              <th className="px-6 py-4">মন্তব্য</th>
              <th className="px-6 py-4 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {testimonials.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                      {t.image_url && <img src={t.image_url} alt="avatar" className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <div className="font-bold text-ink">{t.author_bn}</div>
                      <div className="text-xs text-slate-500">{t.role_bn}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{t.quote_bn}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => handleEdit(t)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {testimonials.length === 0 && !loading && (
              <tr><td colSpan={3} className="text-center py-8 text-slate-400">কোনো মন্তব্য পাওয়া যায়নি।</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}