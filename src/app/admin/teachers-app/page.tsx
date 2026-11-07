"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";

export default function AdminTeacherApps() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: "", email: "", phone: "", image_url: "" });
  const supabase = createClient();

  const fetchTeachers = async () => {
    setLoading(true);
    const { data } = await supabase.from("teachers_profile").select("*").order("created_at", { ascending: false });
    if (data) setTeachers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from("teachers_profile").update({ status: newStatus }).eq("id", id);
    fetchTeachers();
  };

  const handleDelete = async (id: string) => {
    if (confirm("আপনি কি নিশ্চিতভাবে এই শিক্ষককে ডিলিট করতে চান?")) {
      await supabase.from("teachers_profile").delete().eq("id", id);
      fetchTeachers();
    }
  };

  const handleAddTeacher = async () => {
    if (!newTeacher.name || !newTeacher.email) {
      alert("নাম এবং ইমেইল দিতে হবে!");
      return;
    }
    
    // teachers_profile টেবিলে ডাটা পাঠানো
    await supabase.from("teachers_profile").insert({
      name: newTeacher.name,
      email: newTeacher.email,
      phone: newTeacher.phone,
      image_url: newTeacher.image_url,
      status: "Active" // ম্যানুয়ালি অ্যাড করলে সরাসরি Active হবে
    });
    
    // হোম পেজের teachers টেবিলেও ডাটা পাঠানো
    await supabase.from("teachers").insert({
        name_bn: newTeacher.name,
        name_en: newTeacher.name,
        role_bn: "শিক্ষক",
        role_en: "Teacher",
        image_url: newTeacher.image_url,
    });

    setIsAdding(false);
    setNewTeacher({ name: "", email: "", phone: "", image_url: "" });
    fetchTeachers();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">শিক্ষক ম্যানেজমেন্ট</h1>
        <button onClick={() => setIsAdding(true)} className="bg-[#4CAF50] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#388E3C]">
          <Plus size={18} /> নতুন শিক্ষক
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 space-y-4">
          <h2 className="text-lg font-bold text-ink">নতুন শিক্ষক যোগ করুন</h2>
          <ImageUpload label="শিক্ষকের ছবি" value={newTeacher.image_url} onChange={(url) => setNewTeacher({ ...newTeacher, image_url: url })} />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="নাম" value={newTeacher.name} onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none" />
            <input type="email" placeholder="ইমেইল" value={newTeacher.email} onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none" />
          </div>
          <input type="text" placeholder="মোবাইল নম্বর" value={newTeacher.phone} onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none" />
          <div className="flex gap-2">
            <button onClick={handleAddTeacher} className="bg-[#4CAF50] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#388E3C]">সেভ করুন</button>
            <button onClick={() => setIsAdding(false)} className="bg-slate-100 text-slate-600 px-6 py-2 rounded-lg font-bold hover:bg-slate-200">বাতিল</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-body">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">ছবি</th>
                <th className="px-6 py-4">নাম</th>
                <th className="px-6 py-4">ইমেইল</th>
                <th className="px-6 py-4">স্ট্যাটাস</th>
                <th className="px-6 py-4">একশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" /></td></tr>}
              {!loading && teachers.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400">কোনো শিক্ষক পাওয়া যায়নি।</td></tr>}
              {teachers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    {t.image_url ? <img src={t.image_url} alt="" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-slate-200" />}
                  </td>
                  <td className="px-6 py-4 font-medium text-ink">{t.name}</td>
                  <td className="px-6 py-4">{t.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${t.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {t.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    {t.status !== 'Active' && (
                      <button onClick={() => updateStatus(t.id, 'Active')} className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition">
                        <Check size={14} /> অ্যাপ্রুভ
                      </button>
                    )}
                    <button onClick={() => handleDelete(t.id)} className="flex items-center gap-1 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition">
                      <Trash2 size={14} /> ডিলিট
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}