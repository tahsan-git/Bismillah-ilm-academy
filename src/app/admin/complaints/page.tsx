"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  AlertCircle,
  Loader2,
  Trash2,
  CheckCircle2,
  Clock,
  MessageSquare,
} from "lucide-react";

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "in_progress" | "resolved">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const supabase = createClient();

  const fetchComplaints = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("complaints")
      .select("*, students(name, phone, image_url)")
      .order("created_at", { ascending: false });
    if (data) setComplaints(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filtered = complaints.filter((c) => {
    if (filter === "all") return true;
    return c.status === filter;
  });

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id);
    await supabase.from("complaints").update({ status }).eq("id", id);
    await fetchComplaints();
    setUpdatingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি এই কমপ্লেইনটি ডিলিট করতে চান?")) return;
    await supabase.from("complaints").delete().eq("id", id);
    fetchComplaints();
  };

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: "পেন্ডিং", color: "bg-amber-100 text-amber-700", icon: Clock },
    in_progress: { label: "চলমান", color: "bg-blue-100 text-blue-700", icon: AlertCircle },
    resolved: { label: "সমাধান", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#002A41] flex items-center gap-2">
            <AlertCircle size={24} className="text-red-500" /> কমপ্লেইন
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            শিক্ষার্থীদের অভিযোগ দেখুন ও সমাধান করুন
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 px-4 py-2 rounded-xl flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <div>
            <p className="text-xs font-bold text-red-700">মোট</p>
            <p className="text-xl font-extrabold text-red-800">{filtered.length} টি</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "in_progress", "resolved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              filter === f
                ? "bg-[#4CAF50] text-white"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {f === "all" ? "সব" : statusConfig[f].label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#4CAF50]" size={40} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
          কোনো কমপ্লেইন নেই।
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const config = statusConfig[c.status || "pending"];
            const Icon = config.icon;
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {c.students?.image_url ? (
                      <img
                        src={c.students.image_url}
                        alt={c.students.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        <MessageSquare size={18} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{c.students?.name || "শিক্ষার্থী"}</p>
                      <p className="text-xs text-slate-500">{c.students?.phone || ""}</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${config.color}`}>
                    <Icon size={12} /> {config.label}
                  </span>
                </div>

                <div>
                  <p className="font-bold text-slate-800">{c.subject}</p>
                  <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{c.message}</p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-400">
                    {new Date(c.created_at).toLocaleDateString("bn-BD", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <div className="flex gap-2">
                    <select
                      value={c.status || "pending"}
                      onChange={(e) => handleStatusChange(c.id, e.target.value)}
                      disabled={updatingId === c.id}
                      className="text-xs font-bold px-2 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20"
                    >
                      <option value="pending">পেন্ডিং</option>
                      <option value="in_progress">চলমান</option>
                      <option value="resolved">সমাধান</option>
                    </select>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}