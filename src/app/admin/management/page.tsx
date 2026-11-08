"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Upload, Trash2, Plus, UserPlus } from "lucide-react";

export default function AdminManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [bgImage, setBgImage] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const [membersData, bgData, teachersData] = await Promise.all([
        supabase.from("management").select("*").order("sort_order"),
        supabase.from("section_backgrounds").select("*").eq("section_key", "management").single(),
        supabase.from("teachers_profile").select("*").eq("status", "Active")
      ]);
      
      if (membersData.data) setMembers(membersData.data);
      if (bgData.data) setBgImage(bgData.data.image_url || "");
      if (teachersData.data) setTeachers(teachersData.data);
      
      setLoading(false);
    };
    fetchData();
  }, [supabase]);

  // ব্যাকগ্রাউন্ড আপলোড
  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading("bg");
    const fileName = `mgmt-bg-${Date.now()}.${file.name.split('.').pop()}`;
    
    try {
      const { error } = await supabase.storage.from("site-images").upload(fileName, file);
      if (error) throw error;

      const { data } = supabase.storage.from("site-images").getPublicUrl(fileName);
      
      if (bgImage && bgImage.includes("site-images")) {
        const oldPath = bgImage.split("/").pop();
        if (oldPath) await supabase.storage.from("site-images").remove([oldPath]);
      }
      
      setBgImage(data.publicUrl);
    } catch (error: any) {
      alert("ব্যাকগ্রাউন্ড আপলোডে সমস্যা: " + error.message);
    } finally {
      setUploading(null);
    }
  };

    // ব্যাকগ্রাউন্ড ডিলিট (ডাটাবেস এবং স্টোরেজ দুই জায়গা থেকেই মুছে ফেলবে)
  const handleDeleteBg = async () => {
    if (!confirm("আপনি কি নিশ্চিত ব্যাকগ্রাউন্ডটি ডিলিট করতে চান?")) return;
    
    try {
      // ১. স্টোরেজ (Bucket) থেকে ছবি ডিলিট করা
      if (bgImage && bgImage.includes("site-images")) {
        const oldPath = bgImage.split("/").pop();
        if (oldPath) {
          const { error: storageError } = await supabase.storage.from("site-images").remove([oldPath]);
          if (storageError) console.error("Storage delete error:", storageError);
        }
      }
      
      // ২. স্টেট থেকে মুছে ফেলা (UI আপডেট)
      setBgImage("");

      // ৩. ডাটাবেসের section_backgrounds টেবিল থেকে লিংকটি মুছে ফেলা
      const { error: dbError } = await supabase
        .from("section_backgrounds")
        .delete()
        .eq("section_key", "management");

      if (dbError) throw dbError;
      
      alert("সফলভাবে ব্যাকগ্রাউন্ড ডিলিট হয়েছে!");
      
    } catch (error: any) {
      alert("ডিলিট করতে সমস্যা হয়েছে: " + error.message);
    }
  };

  // মেম্বারের ছবি আপলোড
  const handleMemberImage = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(`member-${index}`);
    const fileName = `member-${Date.now()}.${file.name.split('.').pop()}`;
    
    try {
      const { error } = await supabase.storage.from("site-images").upload(fileName, file);
      if (error) throw error;

      const { data } = supabase.storage.from("site-images").getPublicUrl(fileName);
      
      const oldImg = members[index].image_url;
      if (oldImg && oldImg.includes("site-images")) {
        const oldPath = oldImg.split("/").pop();
        if (oldPath) await supabase.storage.from("site-images").remove([oldPath]);
      }

      const newMembers = [...members];
      newMembers[index].image_url = data.publicUrl;
      setMembers(newMembers);
    } catch (error: any) {
      alert("ছবি আপলোডে সমস্যা: " + error.message);
    } finally {
      setUploading(null);
    }
  };

  // নতুন মেম্বার কার্ড যোগ করা
  const handleAddMember = () => {
    setMembers([
      ...members,
      {
        id: crypto.randomUUID(),
        name_bn: "",
        name_en: "",
        role_bn: "",
        role_en: "",
        image_url: "",
        sort_order: members.length + 1,
      }
    ]);
  };

  // শিক্ষক থেকে মেম্বার যোগ করা
  const handleAddFromTeacher = () => {
    const teacher = teachers.find((t) => t.id === selectedTeacher);
    if (!teacher) return;
    
    setMembers([
      ...members,
      {
        id: crypto.randomUUID(),
        name_bn: teacher.name_bn,
        name_en: teacher.name_en,
        role_bn: teacher.role_bn || "শিক্ষক",
        role_en: teacher.role_en || "Teacher",
        image_url: teacher.image_url || "",
        sort_order: members.length + 1,
      }
    ]);
    setSelectedTeacher("");
  };

  // মেম্বার ডিলিট করা
  const handleDeleteMember = async (index: number) => {
    if (!confirm("আপনি কি নিশ্চিত এই প্রোফাইলটি ডিলিট করতে চান?")) return;
    
    const member = members[index];
    
    if (member.id && !member.id.includes("-")) {
      await supabase.from("management").delete().eq("id", member.id);
    }

    if (member.image_url && member.image_url.includes("site-images")) {
      const path = member.image_url.split("/").pop();
      if (path) await supabase.storage.from("site-images").remove([path]);
    }

    const newMembers = [...members];
    newMembers.splice(index, 1);
    setMembers(newMembers);
  };

  // সব সেভ করা
  const handleSave = async () => {
    setSaving(true);
    
    for (const m of members) {
      await supabase.from("management").upsert({
        id: m.id,
        name_bn: m.name_bn,
        name_en: m.name_en,
        role_bn: m.role_bn,
        role_en: m.role_en,
        image_url: m.image_url,
        sort_order: m.sort_order
      });
    }

    await supabase.from("section_backgrounds").upsert({ section_key: "management", image_url: bgImage });
    
    setSaving(false);
    alert("সফলভাবে সেভ হয়েছে!");
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#4CAF50]" size={40} /></div>;

  return (
    <div className="max-w-5xl pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-ink">ম্যানেজমেন্ট টিম এডিটর</h1>
        <button onClick={handleSave} disabled={saving} className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-8 py-2.5 rounded-lg font-bold transition flex items-center gap-2 shadow-md">
          {saving ? <Loader2 className="animate-spin" size={18} /> : "সব সেভ করুন"}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-6">
          {/* সেকশন ব্যাকগ্রাউন্ড */}
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
                {uploading === "bg" ? <Loader2 className="animate-spin text-[#4CAF50] mb-2" /> : <Upload className="text-slate-400 mb-2" size={20} />}
                <p className="text-sm text-slate-500">ব্যাকগ্রাউন্ড আপলোড করুন</p>
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  accept="image/*" 
                  onChange={handleBgUpload} 
                  title=""
                />
              </label>
            )}
          </div>

          {/* শিক্ষক থেকে মেম্বার যোগ */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold mb-4">শিক্ষকদের তালিকা থেকে যোগ করুন</h2>
            <select 
              value={selectedTeacher} 
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full border border-slate-200 p-2.5 rounded-lg mb-4 outline-none focus:border-[#4CAF50]"
            >
              <option value="">শিক্ষক নির্বাচন করুন</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name_bn} ({t.role_bn})</option>
              ))}
            </select>
            <button 
              onClick={handleAddFromTeacher} 
              disabled={!selectedTeacher}
              className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white py-2.5 rounded-lg font-bold transition flex justify-center items-center gap-2"
            >
              <UserPlus size={18} /> মেম্বার হিসেবে যোগ করুন
            </button>
          </div>
        </div>

        {/* ডান কলাম: মেম্বার লিস্ট */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">ম্যানেজমেন্ট মেম্বারবৃন্দ</h2>
            <button onClick={handleAddMember} className="text-sm font-bold text-[#4CAF50] flex items-center gap-1 hover:underline">
              <Plus size={16} /> নতুন মেম্বার
            </button>
          </div>
          
          {members.map((m, i) => (
            <div key={i} className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 flex gap-6 items-start shadow-sm relative group">
              
              {/* মেম্বারের ছবি */}
              <div className="w-24 h-28 rounded-xl overflow-hidden bg-slate-100 relative shrink-0 border border-slate-200">
                {m.image_url ? (
                  <img src={m.image_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs text-center p-2">No Image</div>
                )}
                
                <div className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer pointer-events-none">
                  {uploading === `member-${i}` ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Upload size={18} className="mb-1" />
                      <span className="text-[10px]">Change</span>
                    </>
                  )}
                </div>
                
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  accept="image/*" 
                  onChange={(e) => handleMemberImage(e, i)} 
                  title=""
                />
              </div>

              {/* টেক্সট ফিল্ডসমূহ */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">নাম (বাংলা)</label>
                  <input value={m.name_bn || ""} onChange={(e) => { const n = [...members]; n[i].name_bn = e.target.value; setMembers(n); }} className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Name (EN)</label>
                  <input value={m.name_en || ""} onChange={(e) => { const n = [...members]; n[i].name_en = e.target.value; setMembers(n); }} className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">পদবি (বাংলা)</label>
                  <input value={m.role_bn || ""} onChange={(e) => { const n = [...members]; n[i].role_bn = e.target.value; setMembers(n); }} className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Role (EN)</label>
                  <input value={m.role_en || ""} onChange={(e) => { const n = [...members]; n[i].role_en = e.target.value; setMembers(n); }} className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none" />
                </div>
              </div>

              {/* ডিলিট বাটন */}
              <button onClick={() => handleDeleteMember(i)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition bg-white rounded-full p-1.5 shadow-sm hover:shadow-md border border-slate-100 z-20">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          
          {members.length === 0 && (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 border-dashed">
              <p className="text-slate-500">কোনো মেম্বার নেই। উপরে থেকে নতুন মেম্বার যোগ করুন।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}