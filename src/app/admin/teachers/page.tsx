"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Save, Loader2, Plus, Trash2, Check } from "lucide-react";

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const fetchTeachers = async () => {
    setLoading(true);
    const { data } = await supabase.from("teachers").select("*").order("created_at", { ascending: false });
    if (data) setTeachers(data);
    setLoading(false);
  };

  useEffect(() => { fetchTeachers(); }, []);

  const handleSave = async (t: any, index: number) => {
    setSaving(true);
    const safeName = t.name_bn || "নতুন শিক্ষক";
    const safeRole = t.role_bn || "শিক্ষক";

    if (t.id) {
      // আপডেট
      await supabase.from("teachers").update({
        name_bn: safeName, name_en: safeName,
        role_bn: safeRole, role_en: "Teacher",
        image_url: t.image_url,
        status: t.status || "Active"
      }).eq("id", t.id);
    } else {
      // নতুন ইনসার্ট
      await supabase.from("teachers").insert({
        name_bn: safeName, name_en: safeName,
        role_bn: safeRole, role_en: "Teacher",
        image_url: t.image_url,
        status: "Active",
      });
    }
    
    alert("সফলভাবে সেভ হয়েছে!");
    setSaving(false);
    fetchTeachers();
  };

  const handleDelete = async (id: string) => {
    if (confirm("শিক্ষককে ডিলিট করতে চান?")) {
      await supabase.from("teachers").delete().eq("id", id);
      fetchTeachers();
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from("teachers").update({ status: newStatus }).eq("id", id);
    fetchTeachers();
  };

  const addNew = () => {
    setTeachers([{ name_bn: "", role_bn: "শিক্ষক", image_url: "", status: "Active" }, ...teachers]);
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">শিক্ষক ম্যানেজমেন্ট</h1>
        <button onClick={addNew} className="bg-[#4CAF50] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#388E3C]">
          <Plus size={18} /> নতুন শিক্ষক
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {teachers.map((t, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative group">
            
            <button onClick={() => handleDelete(t.id)} className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition hover:bg-red-500 hover:text-white">
              <Trash2 size={18} />
            </button>

            <div className="space-y-4">
              <ImageUpload label="শিক্ষকের ছবি" value={t.image_url || ""} onChange={(url) => {
                const newT = [...teachers]; newT[i].image_url = url; setTeachers(newT);
              }} />
              <div>
                <label className="block text-sm font-bold text-ink mb-1">নাম</label>
                <input type="text" value={t.name_bn || ""} onChange={(e) => {
                  const newT = [...teachers]; newT[i].name_bn = e.target.value; setTeachers(newT);
                }} className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-1">পদবি</label>
                <input type="text" value={t.role_bn || ""} onChange={(e) => {
                  const newT = [...teachers]; newT[i].role_bn = e.target.value; setTeachers(newT);
                }} className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-1">স্ট্যাটাস</label>
                <select value={t.status || "Active"} onChange={(e) => {
                  const newT = [...teachers]; newT[i].status = e.target.value; setTeachers(newT);
                }} className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none">
                  <option value="Active">Active (হোম পেজে দেখাবে)</option>
                  <option value="Pending">Pending (লুকানো থাকবে)</option>
                </select>
              </div>

              <button onClick={() => handleSave(t, i)} disabled={saving} className="w-full bg-[#4CAF50] text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#388E3C]">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} সেভ করুন
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}