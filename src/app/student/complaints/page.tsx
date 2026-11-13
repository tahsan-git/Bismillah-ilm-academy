"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, Loader2, Send } from "lucide-react";

export default function StudentComplaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ subject: "", message: "" });
  const supabase = createClient();

  const loadComplaints = async (studentId: string) => {
    const { data } = await supabase
      .from("complaints")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });
    if (data) setComplaints(data);
    setLoading(false);
  };

  useEffect(() => {
    const studentId = localStorage.getItem("student_id");
    if (!studentId) { window.location.href = "/student/login"; return; }
    loadComplaints(studentId);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const studentId = localStorage.getItem("student_id");
    if (!studentId || !form.subject.trim() || !form.message.trim()) return;

    setSending(true);
    await supabase.from("complaints").insert({
      student_id: studentId,
      subject: form.subject,
      message: form.message,
      status: "pending",
    });
    setForm({ subject: "", message: "" });
    await loadComplaints(studentId);
    setSending(false);
  };

  const statusStyle = (s: string) =>
    s === "resolved" ? "bg-green-100 text-green-700"
    : s === "in_progress" ? "bg-amber-100 text-amber-700"
    : "bg-slate-100 text-slate-600";

  const statusLabel = (s: string) =>
    s === "resolved" ? "সমাধান হয়েছে"
    : s === "in_progress" ? "প্রক্রিয়াধীন"
    : "অপেক্ষমাণ";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#002A41]">অভিযোগ</h1>
        <p className="text-slate-500 mt-1">আপনার সমস্যা বা অভিযোগ জানান</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <input
          type="text"
          placeholder="বিষয়"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002A41]/20"
        />
        <textarea
          placeholder="বিস্তারিত লিখুন..."
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002A41]/20 resize-none"
        />
        <button
          type="submit"
          disabled={sending || !form.subject.trim() || !form.message.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#002A41] text-white font-bold text-sm hover:opacity-90 disabled:opacity-50"
        >
          {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
          জমা দিন
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#002A41]" size={28} /></div>
      ) : complaints.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold text-[#002A41] flex items-center gap-2">
            <AlertCircle size={18} /> আপনার অভিযোগ
          </h2>
          {complaints.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-800">{c.subject}</p>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${statusStyle(c.status)}`}>
                  {statusLabel(c.status)}
                </span>
              </div>
              <p className="text-sm text-slate-600">{c.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}