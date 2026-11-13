"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, Loader2, FileText, Trash2, ExternalLink, Edit } from "lucide-react";

export default function AdminLibrary() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title_bn: "",
    title_en: "",
    description: "",
    class_level: "",
    file_url: "",
    file_type: "pdf",
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // 🌟 ডাটা ফেচ
  const fetchResources = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("library_resources").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("Fetch error:", error);
      alert("ডাটা লোডে সমস্যা: " + error.message);
    }
    if (data) setResources(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // 🌟 ফাইল সিলেক্ট ও আপলোড (বাটনে ক্লিক না করেই ফাইল সিলেক্ট হলে স্টেটে সেভ হবে)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ফাইল সিলেক্ট হলে শুধু নামটা স্টেটে রাখি, আপলোড হবে সেভ বাটনে
    setFormData({ ...formData, file_url: file.name, file_type: file.name.split('.').pop() || "pdf" });
    
    // ফাইলটি একটি গ্লোবাল ভেরিয়েবলে রাখি আপলোডের জন্য
    (window as any).selectedFile = file;
  };

  // 🌟 সেভ লজিক (ফাইল আপলোড + ডাটাবেসে সেভ)
  const handleSave = async () => {
    if (!formData.title_bn) {
      alert("বইয়ের নাম দিন!");
      return;
    }

    const file = (window as any).selectedFile;
    if (!editingId && !file) {
      alert("একটি PDF ফাইল সিলেক্ট করুন!");
      return;
    }

    setUploading(true);
    let newFileUrl = formData.file_url;

    try {
      // ১. নতুন ফাইল আপলোড (যদি নতুন ফাইল থাকে)
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `pdf-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('site-images')
          .upload(fileName, file);

        if (uploadError) {
          alert("PDF আপলোডে সমস্যা: " + uploadError.message);
          setUploading(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage.from('site-images').getPublicUrl(fileName);
        newFileUrl = publicUrlData.publicUrl;
      }

      // ২. ডাটাবেসে সেভ/আপডেট
      if (editingId) {
        const { error } = await supabase.from("library_resources").update({
          title_bn: formData.title_bn,
          title_en: formData.title_en,
          description: formData.description,
          class_level: formData.class_level,
          file_url: newFileUrl,
          file_type: formData.file_type,
        }).eq("id", editingId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase.from("library_resources").insert({
          title_bn: formData.title_bn,
          title_en: formData.title_en,
          description: formData.description,
          class_level: formData.class_level,
          file_url: newFileUrl,
          file_type: formData.file_type,
        });
        
        if (error) throw error;
      }

      // ৩. সফল হলে ফর্ম ক্লিয়ার ও রিফ্রেশ
      setEditingId(null);
      setFormData({ title_bn: "", title_en: "", description: "", class_level: "", file_url: "", file_type: "pdf" });
      (window as any).selectedFile = null;
      fetchResources();
      
    } catch (err: any) {
      alert("সমস্যা হয়েছে: " + err.message);
    } finally {
      setUploading(false);
    }
  };

    // 🌟 ডিলিট (Storage থেকে ফাইলসহ)
  const handleDelete = async (id: string, fileUrl: string) => {
    if (confirm("আপনি কি এই বইটি ডিলিট করতে চান?")) {
      
      // ১. Storage থেকে ফাইল ডিলিট (Fixed Logic)
      if (fileUrl && fileUrl !== "") {
        // URL ke /site-images/ diye split koro
        const urlParts = fileUrl.split("/site-images/");
        
        if (urlParts.length > 1) {
          // URL decode koro (%20 ba onno encoding fix korar jonno)
          const fileName = decodeURIComponent(urlParts[1]);
          
          const { error: storageError } = await supabase.storage
            .from('site-images')
            .remove([fileName]);

          if (storageError) {
            console.error("Storage Delete Error:", storageError);
            alert("স্টোরেজ থেকে ফাইল ডিলিট করতে সমস্যা: " + storageError.message);
            return; // Error hole database theke delete hobe na
          }
        }
      }

      // ২. Database থেকে ডিলিট
      const { error: dbError } = await supabase
        .from("library_resources")
        .delete()
        .eq("id", id);

      if (dbError) {
        alert("ডাটাবেস থেকে ডিলিট করতে সমস্যা: " + dbError.message);
        return;
      }

      fetchResources();
    }
  };

  // 🌟 এডিট
  const handleEdit = (r: any) => {
    setEditingId(r.id);
    setFormData({
      title_bn: r.title_bn || "",
      title_en: r.title_en || "",
      description: r.description || "",
      class_level: r.class_level || "",
      file_url: r.file_url || "",
      file_type: r.file_type || "pdf",
    });
    (window as any).selectedFile = null; // নতুন ফাইল সিলেক্ট করা না থাকলে আগেরটা থাকবে
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-[1000px] mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-6">Digital Library (PDF Management)</h1>

      {/* 🌟 আপলোড ফর্ম */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <h2 className="text-lg font-bold mb-4">{editingId ? "বইয়ের তথ্য আপডেট করুন" : "নতুন PDF আপলোড করুন"}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input type="text" placeholder="বইয়ের নাম (বাংলা) *" value={formData.title_bn} onChange={(e) => setFormData({...formData, title_bn: e.target.value})} className="w-full p-3 border rounded-lg focus:border-[#002A41] outline-none" />
          <input type="text" placeholder="Class Level (যেমন: হিফজ, নাজেরা)" value={formData.class_level} onChange={(e) => setFormData({...formData, class_level: e.target.value})} className="w-full p-3 border rounded-lg focus:border-[#002A41] outline-none" />
          <input type="text" placeholder="Description (ঐচ্ছিক)" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-3 border rounded-lg focus:border-[#002A41] outline-none md:col-span-2" />
        </div>
        
        <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
        
        <div className="flex gap-3 mt-4">
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()} 
            disabled={uploading}
            className="bg-white border-2 border-[#002A41] text-[#002A41] px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-50 transition"
          >
            <Upload size={20} />
            {formData.file_url ? formData.file_url.split('/').pop() : "PDF সিলেক্ট করুন"}
          </button>

          <button 
            onClick={handleSave}
            disabled={uploading}
            className="bg-[#002A41] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#003D5C] transition disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? <Loader2 className="animate-spin" size={20} /> : null}
            {editingId ? "আপডেট করুন" : "সেভ করুন"}
          </button>

          {editingId && (
            <button 
              onClick={() => { setEditingId(null); setFormData({ title_bn: "", title_en: "", description: "", class_level: "", file_url: "", file_type: "pdf" }); (window as any).selectedFile = null; }}
              className="bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-bold hover:bg-slate-300 transition"
            >
              বাতিল
            </button>
          )}
        </div>
      </div>

      {/* 🌟 লিস্ট */}
      <div className="grid md:grid-cols-2 gap-4">
        {loading && <div className="col-span-full text-center py-10"><Loader2 className="animate-spin mx-auto text-[#002A41]" /></div>}
        
        {!loading && resources.length === 0 && (
          <div className="col-span-full text-center py-10 text-slate-400">
            কোনো PDF আপলোড করা হয়নি। উপরের ফর্ম থেকে নতুন PDF যোগ করুন।
          </div>
        )}

        {!loading && resources.map((r) => (
          <div key={r.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#002A41]/10 text-[#002A41] flex items-center justify-center shrink-0">
              <FileText size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-ink">{r.title_bn}</h3>
              <p className="text-xs text-slate-500">{r.class_level || "General"}</p>
              
              <div className="flex gap-4 mt-3">
                <a href={r.file_url} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#002A41] hover:underline flex items-center gap-1">
                  <ExternalLink size={14} /> View
                </a>
                <button onClick={() => handleEdit(r)} className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
                  <Edit size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(r.id, r.file_url)} className="text-sm font-bold text-red-500 hover:underline flex items-center gap-1">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}