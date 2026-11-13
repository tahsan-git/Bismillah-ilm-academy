"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Check, Trash2, Loader2, Users, Eye, X, Upload, Image as ImageIcon, Printer } from "lucide-react";

function StudentsContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as "all" | "active" | "pending") || "all";

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [planValue, setPlanValue] = useState<string>("Basic");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [activeTab, setActiveTab] = useState<"all" | "active" | "pending">(initialTab);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const fetchStudents = async () => {
    setLoading(true);
    const { data } = await supabase.from("students").select("*").order("created_at", { ascending: false });
    if (data) setStudents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((s) => {
    const status = String(s.status || "").toLowerCase();
    if (activeTab === "active") return status === "active";
    if (activeTab === "pending") return status === "pending";
    return true;
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      if (imageUrl) {
        const oldFileName = imageUrl.split('/').pop();
        if (oldFileName) await supabase.storage.from('site-images').remove([oldFileName]);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `student-${Math.random()}.${fileExt}`;

      const { error } = await supabase.storage.from('site-images').upload(fileName, file);
      if (error) throw error;

      const { data } = supabase.storage.from('site-images').getPublicUrl(fileName);
      setImageUrl(data.publicUrl);
    } catch (error) {
      alert("ছবি আপলোড বা ডিলিট করতে সমস্যা হয়েছে!");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setUpdating(true);
    const { error } = await supabase.from("students").update({
      status: "Active",
      plan: planValue,
      image_url: imageUrl
    }).eq("id", id);

    if (error) {
      alert("আপডেট করতে সমস্যা হয়েছে!");
    } else {
      setSelectedStudent(null);
      fetchStudents();
    }
    setUpdating(false);
  };

  const handleDelete = async (id: string, imageUrlToDelete: string | null) => {
    if (confirm("আপনি কি এই শিক্ষার্থীকে ডিলিট করতে চান?")) {
      try {
        if (imageUrlToDelete) {
          const fileName = imageUrlToDelete.split('/').pop();
          if (fileName) await supabase.storage.from('site-images').remove([fileName]);
        }
        await supabase.from("students").delete().eq("id", id);
        fetchStudents();
      } catch (error) {
        console.error("Delete error:", error);
        alert("ডিলিট করতে সমস্যা হয়েছে!");
      }
    }
  };

  const openViewModal = (student: any) => {
    setSelectedStudent(student);
    setPlanValue(student.plan || "Basic");
    setImageUrl(student.image_url || null);
  };

  return (
    <div className="max-w-[1000px] mx-auto relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">শিক্ষার্থী ম্যানেজমেন্ট</h1>
          <p className="text-body mt-1">সকল শিক্ষার্থীর তালিকা এবং আবেদন।</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-xl flex items-center gap-3">
          <Users className="text-yellow-600" size={20} />
          <div>
            <p className="text-xs font-bold text-yellow-700">মোট</p>
            <p className="text-xl font-extrabold text-yellow-800">{filteredStudents.length} জন</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab("all")} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === "all" ? "bg-[#4CAF50] text-white" : "bg-white text-slate-600 border border-slate-200"}`}>সব</button>
        <button onClick={() => setActiveTab("active")} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === "active" ? "bg-[#4CAF50] text-white" : "bg-white text-slate-600 border border-slate-200"}`}>সক্রিয়</button>
        <button onClick={() => setActiveTab("pending")} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === "pending" ? "bg-[#4CAF50] text-white" : "bg-white text-slate-600 border border-slate-200"}`}>অপেক্ষমাণ</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-body">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">নাম</th>
                <th className="px-6 py-4">ফোন ও ইমেইল</th>
                <th className="px-6 py-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && <tr><td colSpan={3} className="text-center py-8"><Loader2 className="animate-spin mx-auto text-[#4CAF50]" size={24} /></td></tr>}

              {!loading && filteredStudents.length === 0 && (
                <tr><td colSpan={3} className="text-center py-12 text-slate-400">কোনো ডাটা পাওয়া যায়নি!</td></tr>
              )}

              {!loading && filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-bold text-ink">{s.name}</td>
                  <td className="px-6 py-4">
                    <div>{s.phone}</div>
                    <div className="text-xs text-slate-400">{s.email}</div>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <button onClick={() => openViewModal(s)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => handleDelete(s.id, s.image_url)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-ink">শিক্ষার্থীর তথ্য</h2>
              <button onClick={() => setSelectedStudent(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                <X size={20} />
              </button>
            </div>

            <div id="printable-area" className="p-6 space-y-4">
              <div className="flex flex-col items-center justify-center mb-6 print:hidden">
                <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-[#4CAF50] overflow-hidden flex items-center justify-center mb-2">
                  {imageUrl ? <img src={imageUrl} alt="Student" className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300" size={40} />}
                </div>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="text-xs flex items-center gap-1 font-bold text-[#4CAF50] hover:underline">
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} ছবি আপলোড করুন
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-slate-500">শিক্ষার্থীর নাম</p><p className="font-bold">{selectedStudent.name}</p></div>
                <div><p className="text-xs text-slate-500">মোবাইল</p><p className="font-bold">{selectedStudent.phone}</p></div>
                <div className="col-span-2"><p className="text-xs text-slate-500">ইমেইল</p><p className="font-bold">{selectedStudent.email}</p></div>
              </div>

              <hr className="border-slate-100" />

              <div>
                <h3 className="font-bold text-[#4CAF50] mb-4">ফর্মের অন্যান্য তথ্য</h3>
                <div className="space-y-4">
                  {Object.entries(selectedStudent.application_data || {}).map(([key, value]) => {
                    const label = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
                    return (
                      <div key={key} className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-xs text-slate-500 mb-1">{label}</p>
                        <p className="text-sm text-ink font-medium">{String(value) || "-"}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 print:hidden">
                <label className="block text-sm font-bold text-ink mb-2">প্ল্যান নির্বাচন করুন</label>
                <select value={planValue} onChange={(e) => setPlanValue(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none bg-white mb-4">
                  <option value="Basic">Basic Plan</option>
                  <option value="Standard">Standard Plan</option>
                  <option value="Premium">Premium Plan</option>
                </select>

                {String(selectedStudent.status).toLowerCase() === "pending" && (
                  <button onClick={() => handleApprove(selectedStudent.id)} disabled={updating} className="w-full bg-[#4CAF50] hover:bg-[#388E3C] text-white py-3 rounded-lg font-bold transition flex justify-center items-center gap-2 mb-2">
                    {updating ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />} Approve করুন
                  </button>
                )}

                <button onClick={() => window.print()} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-lg font-bold transition flex justify-center items-center gap-2">
                  <Printer size={20} /> প্রিন্ট / PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function AdminStudents() {
  return (
    <Suspense fallback={<div className="text-center py-20">লোড হচ্ছে...</div>}>
      <StudentsContent />
    </Suspense>
  );
}