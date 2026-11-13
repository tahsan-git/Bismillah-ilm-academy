"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Check, Trash2, Loader2, Users, Eye, X } from "lucide-react";

function TeachersContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as "all" | "active" | "pending") || "pending"; 

  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [message, setMessage] = useState("");
  
  const [activeTab, setActiveTab] = useState<"all" | "active" | "pending">(initialTab);
  
  const supabase = createClient();

  const fetchTeachers = async () => {
    setLoading(true);
    const { data } = await supabase.from("teachers").select("*").order("created_at", { ascending: false });
    if (data) setTeachers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // 🌟 Filter
  const filteredTeachers = teachers.filter((t) => {
    const status = String(t.status || "").toLowerCase();
    if (activeTab === "active") return status === "active";
    if (activeTab === "pending") return status === "pending";
    return true;
  });

  // 🌟 Approve Logic (Fixed)
  const handleApprove = async (id: string) => {
    if (!confirm("আপনি কি এই আবেদনটি Approve করতে চান?")) return;
    setBusyId(id);
    setMessage("");

    try {
      // Teacher table theke data niye teachers_profile e move koro
      const teacherToApprove = teachers.find(t => t.id === id);
      if (!teacherToApprove) throw new Error("Teacher not found");

      const { error: profileError } = await supabase.from("teachers_profile").insert({
        name: teacherToApprove.name_bn || teacherToApprove.name,
        email: teacherToApprove.email,
        phone: teacherToApprove.phone,
        gender: teacherToApprove.gender || "male",
        status: "Active",
        role_bn: "শিক্ষক",
        role_en: "Teacher",
        description_bn: teacherToApprove.application_data?.bio || "",
        description_en: "",
        image_url: teacherToApprove.application_data?.image_url || "",
        password: teacherToApprove.password || "teacher123",
      });

      if (profileError) throw profileError;

      // Teacher table theke delete koro (ba status update)
      await supabase.from("teachers").delete().eq("id", id);

      setMessage("আবেদন সফলভাবে Approve হয়েছে।");
      await fetchTeachers();
    } catch (err) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : "Approve করা যায়নি।");
    }

    setBusyId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("আপনি কি এই আবেদনটি ডিলিট করতে চান?")) {
      await supabase.from("teachers").delete().eq("id", id);
      fetchTeachers();
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">শিক্ষক ম্যানেজমেন্ট</h1>
          <p className="text-body mt-1">সকল শিক্ষকের তালিকা এবং আবেদন।</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-xl flex items-center gap-3">
          <Users className="text-yellow-600" size={20} />
          <div>
            <p className="text-xs font-bold text-yellow-700">মোট</p>
            <p className="text-xl font-extrabold text-yellow-800">{filteredTeachers.length} জন</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm font-bold mb-4 ${message.includes("সফলভাবে") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          {message}
        </div>
      )}

      {/* Tabs */}
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
              
              {!loading && filteredTeachers.length === 0 && (
                <tr><td colSpan={3} className="text-center py-12 text-slate-400">কোনো ডাটা পাওয়া যায়নি!</td></tr>
              )}

              {!loading && filteredTeachers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-bold text-ink">{t.name_bn || t.name}</td>
                  <td className="px-6 py-4">
                    <div>{t.phone}</div>
                    <div className="text-xs text-slate-400">{t.email}</div>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <button onClick={() => setSelectedTeacher(t)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-ink">আবেদনের বিস্তারিত</h2>
              <button onClick={() => setSelectedTeacher(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-slate-500">নাম</p><p className="font-bold">{selectedTeacher.name_bn || selectedTeacher.name}</p></div>
                <div><p className="text-xs text-slate-500">ফোন</p><p className="font-bold">{selectedTeacher.phone}</p></div>
                <div><p className="text-xs text-slate-500">ইমেইল</p><p className="font-bold">{selectedTeacher.email}</p></div>
                <div><p className="text-xs text-slate-500">জেন্ডার</p><p className="font-bold capitalize">{selectedTeacher.gender}</p></div>
              </div>

              <hr className="border-slate-100" />

              <div>
                <h3 className="font-bold text-[#4CAF50] mb-4">ফর্মের অন্যান্য তথ্য</h3>
                <div className="space-y-4">
                  {Object.entries(selectedTeacher.application_data || {}).map(([key, value]) => {
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

              {String(selectedTeacher.status).toLowerCase() === "pending" && (
                <button onClick={() => handleApprove(selectedTeacher.id)} disabled={busyId === selectedTeacher.id} className="w-full bg-[#4CAF50] hover:bg-[#388E3C] text-white py-3 rounded-lg font-bold transition flex justify-center items-center gap-2 disabled:opacity-50">
                  {busyId === selectedTeacher.id ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />} Approve করুন
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminTeachersApp() {
  return (
    <Suspense fallback={<div className="text-center py-20">লোড হচ্ছে...</div>}>
      <TeachersContent />
    </Suspense>
  );
}