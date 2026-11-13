"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Upload, Trash2, Plus, Eye, EyeOff, Phone, Mail, Lock } from "lucide-react";

export default function AdminTeachers() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  
  const [teachers, setTeachers] = useState<any[]>([]);
  
  // 🌟 Background states
  const [bgMale, setBgMale] = useState("");
  const [bgFemale, setBgFemale] = useState("");
  const [uploadingBg, setUploadingBg] = useState<string | null>(null);

  // 🌟 Password visibility state
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const [teachersData, maleBgData, femaleBgData] = await Promise.all([
        supabase.from("teachers_profile").select("*").order("created_at", { ascending: false }),
        supabase.from("section_backgrounds").select("*").eq("section_key", "teachers_male").maybeSingle(),
        supabase.from("section_backgrounds").select("*").eq("section_key", "teachers_female").maybeSingle(),
      ]);
      
      if (teachersData.data) setTeachers(teachersData.data);
      if (maleBgData.data) setBgMale(maleBgData.data.image_url || "");
      if (femaleBgData.data) setBgFemale(femaleBgData.data.image_url || "");
      
      setLoading(false);
    };
    fetchData();
  }, [supabase]);

  const togglePassword = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Background Upload
  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "male" | "female") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBg(type);
    
    const sectionKey = type === "male" ? "teachers_male" : "teachers_female";
    const oldUrl = type === "male" ? bgMale : bgFemale;
    const fileName = `${sectionKey}-bg-${Date.now()}.${file.name.split('.').pop()}`;
    
    try {
      const { error } = await supabase.storage.from("site-images").upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from("site-images").getPublicUrl(fileName);
      
      if (oldUrl && oldUrl.includes("site-images")) {
        const oldPath = oldUrl.split("/").pop();
        if (oldPath) await supabase.storage.from("site-images").remove([oldPath]);
      }
      
      if (type === "male") setBgMale(data.publicUrl);
      else setBgFemale(data.publicUrl);
      
      await supabase.from("section_backgrounds").upsert(
        { section_key: sectionKey, image_url: data.publicUrl }, 
        { onConflict: 'section_key' }
      );
    } catch (error: any) {
      alert("ব্যাকগ্রাউন্ড আপলোডে সমস্যা: " + error.message);
    } finally {
      setUploadingBg(null);
    }
  };

  // New Teacher Add
  const handleAddTeacher = () => {
    setTeachers([
      {
        id: `new-${Date.now()}`,
        name: "",
        role_bn: "শিক্ষক",
        role_en: "Teacher",
        gender: "male",
        status: "Active",
        image_url: "",
        rating: 5,
        salary: 0,
        phone: "",
        email: "",
        password: "teacher123", // Default password
        description_bn: "",
        description_en: "",
        created_at: new Date().toISOString(),
      },
      ...teachers,
    ]);
  };

  // Teacher Image Upload
  const handleTeacherImage = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(id);
    const fileName = `teacher-${id}-${Date.now()}.${file.name.split('.').pop()}`;
    
    try {
      const { error: uploadError } = await supabase.storage.from("site-images").upload(fileName, file);
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from("site-images").getPublicUrl(fileName);
      
      const oldImg = teachers.find(t => t.id === id)?.image_url;
      if (oldImg && oldImg.includes("site-images")) {
        const oldPath = oldImg.split("/").pop();
        if (oldPath) await supabase.storage.from("site-images").remove([oldPath]);
      }

      setTeachers((prev) => 
        prev.map(t => t.id === id ? { ...t, image_url: data.publicUrl } : t)
      );
      
    } catch (error: any) {
      alert("ছবি আপলোডে সমস্যা: " + error.message);
    } finally {
      setUploadingId(null);
    }
  };

  // Delete Teacher
  const handleDeleteTeacher = async (id: string, imageUrl: string | null) => {
    if (!confirm("আপনি কি নিশ্চিত এই শিক্ষককে ডিলিট করতে চান?")) return;
    
    if (!id.startsWith("new-")) {
      await supabase.from("teachers_profile").delete().eq("id", id);
    }
    
    if (imageUrl && imageUrl.includes("site-images")) {
      const path = imageUrl.split("/").pop();
      if (path) await supabase.storage.from("site-images").remove([path]);
    }

    setTeachers((prev) => prev.filter(t => t.id !== id));
  };

  // Save All
  const handleSave = async () => {
    setSaving(true);
    try {
      for (const t of teachers) {
        if (!t.name) {
          alert("অনুগ্রহ করে ফাঁকা কার্ডের নাম পূরণ করুন।");
          setSaving(false);
          return;
        }
        if (!t.email) {
          alert("অনুগ্রহ করে শিক্ষকের ইমেইল পূরণ করুন।");
          setSaving(false);
          return;
        }

        const payload: any = {
          name: t.name,
          role_bn: t.role_bn,
          role_en: t.role_en,
          gender: t.gender,
          status: t.status,
          image_url: t.image_url,
          rating: t.rating ? Number(t.rating) : 5,
          salary: t.salary ? Number(t.salary) : 0,
          phone: t.phone || "",
          email: t.email || "",
          password: t.password || "teacher123", // Default if empty
          description_bn: t.description_bn || "",
          description_en: t.description_en || "",
        };

        if (!t.id.startsWith("new-")) {
          payload.id = t.id;
        }

        const { error } = await supabase.from("teachers_profile").upsert(payload, { 
          onConflict: 'id' 
        });

        if (error) {
          alert(`সেভ করতে সমস্যা: ${error.message}`);
          throw error;
        }
      }
      alert("সফলভাবে সেভ হয়েছে!");
      window.location.reload();
    } catch (error: any) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#4CAF50]" size={40} /></div>;

  return (
    <div className="max-w-6xl pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-ink">শিক্ষক-শিক্ষিকা এডিটর</h1>
        <button onClick={handleSave} disabled={saving} className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-8 py-2.5 rounded-lg font-bold transition flex items-center gap-2 shadow-md">
          {saving ? <Loader2 className="animate-spin" size={18} /> : "সব সেভ করুন"}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-6">
          {/* Backgrounds */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold mb-4">শিক্ষক সেকশনের ব্যাকগ্রাউন্ড</h2>
            {bgMale ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden group border border-slate-200">
                <img src={bgMale} alt="BG Male" className="w-full h-full object-cover" />
                <button onClick={() => setBgMale("")} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition z-20">
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <label className="relative flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition overflow-hidden">
                {uploadingBg === "male" ? <Loader2 className="animate-spin text-[#4CAF50] mb-1" /> : <Upload className="text-slate-400 mb-1" size={18} />}
                <p className="text-xs text-slate-500">আপলোড করুন</p>
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleBgUpload(e, "male")} title="" />
              </label>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold mb-4">শিক্ষিকা সেকশনের ব্যাকগ্রাউন্ড</h2>
            {bgFemale ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden group border border-slate-200">
                <img src={bgFemale} alt="BG Female" className="w-full h-full object-cover" />
                <button onClick={() => setBgFemale("")} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition z-20">
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <label className="relative flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition overflow-hidden">
                {uploadingBg === "female" ? <Loader2 className="animate-spin text-[#4CAF50] mb-1" /> : <Upload className="text-slate-400 mb-1" size={18} />}
                <p className="text-xs text-slate-500">আপলোড করুন</p>
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleBgUpload(e, "female")} title="" />
              </label>
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">শিক্ষক লিস্ট</h2>
            <button onClick={handleAddTeacher} className="text-sm font-bold text-[#4CAF50] flex items-center gap-1 hover:underline">
              <Plus size={16} /> নতুন শিক্ষক
            </button>
          </div>
          
          <div className="grid gap-4">
            {teachers.map((t) => (
              <div key={t.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-6 items-start shadow-sm relative group">
                
                {/* Image */}
                <div className="w-24 h-28 rounded-xl overflow-hidden bg-slate-100 relative shrink-0 border border-slate-200">
                  {t.image_url ? (
                    <img src={t.image_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs text-center p-2">No Image</div>
                  )}
                  
                  <div className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer pointer-events-none">
                    {uploadingId === t.id ? <Loader2 className="animate-spin" size={20} /> : <><Upload size={18} className="mb-1" /><span className="text-[10px]">Change</span></>}
                  </div>
                  
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleTeacherImage(e, t.id)} title="" />
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">নাম</label>
                    <input value={t.name || ""} onChange={(e) => setTeachers(prev => prev.map(item => item.id === t.id ? {...item, name: e.target.value} : item))} className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none" />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">পদবি (বাংলা)</label>
                    <input value={t.role_bn || ""} onChange={(e) => setTeachers(prev => prev.map(item => item.id === t.id ? {...item, role_bn: e.target.value} : item))} className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Role (EN)</label>
                    <input value={t.role_en || ""} onChange={(e) => setTeachers(prev => prev.map(item => item.id === t.id ? {...item, role_en: e.target.value} : item))} className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none" />
                  </div>

                  {/* Phone & Email */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block flex items-center gap-1"><Phone size={12} /> মোবাইল নম্বর</label>
                    <input type="tel" value={t.phone || ""} onChange={(e) => setTeachers(prev => prev.map(item => item.id === t.id ? {...item, phone: e.target.value} : item))} className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none" placeholder="017XXXXXXXX" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block flex items-center gap-1"><Mail size={12} /> জিমেইল</label>
                    <input type="email" value={t.email || ""} onChange={(e) => setTeachers(prev => prev.map(item => item.id === t.id ? {...item, email: e.target.value} : item))} className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none" placeholder="example@gmail.com" />
                  </div>

                  {/* Password (with Eye Toggle) */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1 block flex items-center gap-1"><Lock size={12} /> পাসওয়ার্ড</label>
                    <div className="relative">
                      <input 
                        type={visiblePasswords[t.id] ? "text" : "password"} 
                        value={t.password || ""} 
                        onChange={(e) => setTeachers(prev => prev.map(item => item.id === t.id ? {...item, password: e.target.value} : item))} 
                        className="w-full border border-slate-200 p-2 pr-10 rounded-lg text-sm focus:border-[#4CAF50] outline-none" 
                        placeholder="teacher123"
                      />
                      <button 
                        type="button"
                        onClick={() => togglePassword(t.id)}
                        className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 transition"
                      >
                        {visiblePasswords[t.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Gender & Status */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-500 mb-1 block">জেন্ডার</label>
                      <select value={t.gender || "male"} onChange={(e) => setTeachers(prev => prev.map(item => item.id === t.id ? {...item, gender: e.target.value} : item))} className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none">
                        <option value="male">পুরুষ</option>
                        <option value="female">মহিলা</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-500 mb-1 block">স্ট্যাটাস</label>
                      <select value={t.status || "Active"} onChange={(e) => setTeachers(prev => prev.map(item => item.id === t.id ? {...item, status: e.target.value} : item))} className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none">
                        <option value="Active">অ্যাক্টিভ</option>
                        <option value="Pending">পেন্ডিং</option>
                        <option value="Inactive">ইনঅ্যাক্টিভ</option>
                      </select>
                    </div>
                  </div>

                  {/* Rating & Salary */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">রেটিং (১ - ৫)</label>
                    <input type="number" step="0.1" min="1" max="5" value={t.rating || 5} onChange={(e) => setTeachers(prev => prev.map(item => item.id === t.id ? {...item, rating: parseFloat(e.target.value)} : item))} className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">মাসিক বেতন (৳)</label>
                    <input type="number" min="0" value={t.salary || 0} onChange={(e) => setTeachers(prev => prev.map(item => item.id === t.id ? {...item, salary: parseFloat(e.target.value)} : item))} className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none" />
                  </div>

                  {/* Descriptions */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">ডেসক্রিপশন (বাংলা)</label>
                    <textarea rows={3} value={t.description_bn || ""} onChange={(e) => setTeachers(prev => prev.map(item => item.id === t.id ? {...item, description_bn: e.target.value} : item))} placeholder="শিক্ষকের সম্পর্কে বিস্তারিত লিখুন..." className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none resize-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Description (English)</label>
                    <textarea rows={3} value={t.description_en || ""} onChange={(e) => setTeachers(prev => prev.map(item => item.id === t.id ? {...item, description_en: e.target.value} : item))} placeholder="Write about the teacher..." className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:border-[#4CAF50] outline-none resize-none" />
                  </div>

                </div>

                <button onClick={() => handleDeleteTeacher(t.id, t.image_url)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition bg-white rounded-full p-1.5 shadow-sm hover:shadow-md border border-slate-100 z-20">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}