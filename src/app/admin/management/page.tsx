"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Upload, Trash2, Plus } from "lucide-react";

export default function AdminManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bgImage, setBgImage] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const [membersData, bgData] = await Promise.all([
        supabase.from("management").select("*").order("sort_order"),
        supabase.from("section_backgrounds").select("*").eq("section_key", "management").single()
      ]);
      if (membersData.data) setMembers(membersData.data);
      if (bgData.data) setBgImage(bgData.data.image_url || "");
      setLoading(false);
    };
    fetchData();
  }, [supabase]);

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `mgmt-bg-${Date.now()}.${file.name.split('.').pop()}`;
    await supabase.storage.from("site-images").upload(fileName, file);
    const { data } = supabase.storage.from("site-images").getPublicUrl(fileName);
    setBgImage(data.publicUrl);
    if (bgImage) await supabase.storage.from("site-images").remove([bgImage.split("/").pop()!]);
    setUploading(false);
  };

  const handleMemberImage = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `member-${Date.now()}.${file.name.split('.').pop()}`;
    await supabase.storage.from("site-images").upload(fileName, file);
    const { data } = supabase.storage.from("site-images").getPublicUrl(fileName);
    const newMembers = [...members];
    newMembers[index].image_url = data.publicUrl;
    setMembers(newMembers);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // সেভ মেম্বারস
    for (const m of members) {
      await supabase.from("management").upsert(m);
    }
    // সেভ ব্যাকগ্রাউন্ড
    await supabase.from("section_backgrounds").upsert({ section_key: "management", image_url: bgImage });
    setSaving(false);
    alert("সেভ হয়েছে!");
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#4CAF50]" size={40} /></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-ink">ম্যানেজমেন্ট টিম এডিটর</h1>
        <button onClick={handleSave} disabled={saving} className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-6 py-2.5 rounded-lg font-bold transition flex items-center gap-2">
          {saving ? <Loader2 className="animate-spin" size={18} /> : "সব সেভ করুন"}
        </button>
      </div>

      <div className="space-y-6 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <h2 className="text-lg font-bold">সেকশন ব্যাকগ্রাউন্ড</h2>
        {bgImage ? (
          <div className="relative w-full h-40 rounded-xl overflow-hidden group">
            <img src={bgImage} alt="BG" className="w-full h-full object-cover" />
            <button onClick={() => setBgImage("")} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-50">
            <Upload className="text-slate-400 mb-2" size={20} />
            <p className="text-sm text-slate-500">ব্যাকগ্রাউন্ড আপলোড করুন</p>
            <input type="file" className="hidden" accept="image/*" onChange={handleBgUpload} />
          </label>
        )}
      </div>

      <div className="space-y-4">
        {members.map((m, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 flex gap-4 items-center">
             <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 relative group">
                {m.image_url && <img src={m.image_url} className="w-full h-full object-cover" />}
                <label className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer text-xs">Change</label>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleMemberImage(e, i)} />
             </div>
             <div className="flex-1 grid grid-cols-2 gap-4">
                <input value={m.name_bn} onChange={(e) => { const n = [...members]; n[i].name_bn = e.target.value; setMembers(n); }} placeholder="নাম (বাংলা)" className="border p-2 rounded-lg" />
                <input value={m.name_en} onChange={(e) => { const n = [...members]; n[i].name_en = e.target.value; setMembers(n); }} placeholder="Name (EN)" className="border p-2 rounded-lg" />
                <input value={m.role_bn} onChange={(e) => { const n = [...members]; n[i].role_bn = e.target.value; setMembers(n); }} placeholder="পদবি (বাংলা)" className="border p-2 rounded-lg" />
                <input value={m.role_en} onChange={(e) => { const n = [...members]; n[i].role_en = e.target.value; setMembers(n); }} placeholder="Role (EN)" className="border p-2 rounded-lg" />
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}