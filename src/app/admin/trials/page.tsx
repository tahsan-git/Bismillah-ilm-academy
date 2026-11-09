"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Loader2, Users, CheckCircle2, Clock } from "lucide-react";

function TrialsContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as "all" | "pending" | "processed") || "all";

  const [trials, setTrials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // 🌟 ট্যাব স্টেট (all, pending, processed)
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "processed">(initialTab);
  
  const supabase = createClient();

  const fetchTrials = async () => {
    setLoading(true);
    const { data } = await supabase.from("trial_classes").select("*").order("created_at", { ascending: false });
    if (data) setTrials(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTrials();
  }, []);

  // 🌟 ডাটা ফিল্টার (URL থেকে আসা tab অনুযায়ী)
  const filteredTrials = trials.filter((t) => {
    const status = String(t.status || "").toLowerCase();
    if (activeTab === "pending") return status === "pending";
    if (activeTab === "processed") return status === "processed";
    return true;
  });

  // Approve (Process) করার লজিক
  const handleProcess = async (id: string) => {
    if (confirm("আপনি কি এই আবেদনটি প্রসেসড হিসেবে মার্ক করতে চান?")) {
      await supabase.from("trial_classes").update({ status: "processed" }).eq("id", id);
      fetchTrials();
    }
  };

  // Delete লজিক
  const handleDelete = async (id: string) => {
    if (confirm("আপনি কি এই আবেদনটি ডিলিট করতে চান?")) {
      await supabase.from("trial_classes").delete().eq("id", id);
      fetchTrials();
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto relative">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">ট্রায়াল ক্লাস আবেদন</h1>
          <p className="text-body mt-1">ট্রায়াল ক্লাসের সকল আবেদন এখানে দেখুন।</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-xl flex items-center gap-3">
          <Users className="text-yellow-600" size={20} />
          <div>
            <p className="text-xs font-bold text-yellow-700">মোট</p>
            <p className="text-xl font-extrabold text-yellow-800">{filteredTrials.length} জন</p>
          </div>
        </div>
      </div>

      {/* 🌟 ট্যাব বাটন */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab("all")} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === "all" ? "bg-[#4CAF50] text-white" : "bg-white text-slate-600 border border-slate-200"}`}>সব</button>
        <button onClick={() => setActiveTab("pending")} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === "pending" ? "bg-[#4CAF50] text-white" : "bg-white text-slate-600 border border-slate-200"}`}>অপেক্ষমাণ</button>
        <button onClick={() => setActiveTab("processed")} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === "processed" ? "bg-[#4CAF50] text-white" : "bg-white text-slate-600 border border-slate-200"}`}>প্রসেসড</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-body">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">নাম</th>
                <th className="px-6 py-4">মোবাইল ও ইমেইল</th>
                <th className="px-6 py-4">স্ট্যাটাস</th>
                <th className="px-6 py-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && <tr><td colSpan={4} className="text-center py-8"><Loader2 className="animate-spin mx-auto text-[#4CAF50]" size={24} /></td></tr>}
              
              {!loading && filteredTrials.length === 0 && (
                <tr><td colSpan={4} className="text-center py-12 text-slate-400">কোনো ডাটা পাওয়া যায়নি!</td></tr>
              )}

              {!loading && filteredTrials.map((t) => {
                const isPending = String(t.status).toLowerCase() === "pending";
                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-bold text-ink">{t.name}</td>
                    <td className="px-6 py-4">
                      <div>{t.phone}</div>
                      <div className="text-xs text-slate-400">{t.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {isPending ? (
                        <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded w-fit text-xs font-bold">
                          <Clock size={14} /> অপেক্ষমাণ
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded w-fit text-xs font-bold">
                          <CheckCircle2 size={14} /> প্রসেসড
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      {isPending && (
                        <button onClick={() => handleProcess(t.id)} className="px-3 py-1.5 bg-[#4CAF50] text-white text-xs font-bold rounded-lg hover:bg-[#388E3C] transition">
                          প্রসেস করুন
                        </button>
                      )}
                      <button onClick={() => handleDelete(t.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminTrials() {
  return (
    <Suspense fallback={<div className="text-center py-20">লোড হচ্ছে...</div>}>
      <TrialsContent />
    </Suspense>
  );
}