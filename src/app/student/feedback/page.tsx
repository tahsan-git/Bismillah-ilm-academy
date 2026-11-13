"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, Loader2, Send, Star } from "lucide-react";

export default function StudentFeedback() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ teacher_id: "", message: "", rating: 5 });
  const supabase = createClient();

  const loadAll = async (studentId: string) => {
    // student er assigned teachers
    const { data: assigned } = await supabase
      .from("teacher_students")
      .select("teacher_id, teachers_profile ( id, name, role_bn )")
      .eq("student_id", studentId);

    if (assigned) {
      const list = assigned
        .map((a: any) => a.teachers_profile)
        .filter(Boolean);
      setTeachers(list);
    }

    const { data: fb } = await supabase
      .from("feedback")
      .select(`
        id, rating, message, created_at,
        teachers_profile ( name, role_bn )
      `)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (fb) setFeedbacks(fb);
    setLoading(false);
  };

  useEffect(() => {
    const studentId = localStorage.getItem("student_id");
    if (!studentId) { window.location.href = "/student/login"; return; }
    loadAll(studentId);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const studentId = localStorage.getItem("student_id");
    if (!studentId || !form.message.trim()) return;

    setSending(true);
    await supabase.from("feedback").insert({
      student_id: studentId,
      teacher_id: form.teacher_id || null,
      message: form.message,
      rating: form.rating,
    });
    setForm({ teacher_id: "", message: "", rating: 5 });
    await loadAll(studentId);
    setSending(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#002A41]">ফিডব্যাক</h1>
        <p className="text-slate-500 mt-1">শিক্ষকদের জন্য আপনার মতামত জানান</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <select
          value={form.teacher_id}
          onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#002A41]/20"
        >
          <option value="">শিক্ষক নির্বাচন করুন (ঐচ্ছিক)</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>{t.name} — {t.role_bn}</option>
          ))}
        </select>

        <textarea
          placeholder="আপনার মতামত লিখুন..."
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002A41]/20 resize-none"
        />

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-600">রেটিং:</span>
          {[1,2,3,4,5].map((n) => (
            <button type="button" key={n} onClick={() => setForm({ ...form, rating: n })}>
              <Star size={22} className={n <= form.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={sending || !form.message.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#002A41] text-white font-bold text-sm hover:opacity-90 disabled:opacity-50"
        >
          {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
          পাঠান
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#002A41]" size={28} /></div>
      ) : feedbacks.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold text-[#002A41] flex items-center gap-2">
            <MessageSquare size={18} /> আপনার দেওয়া ফিডব্যাক
          </h2>
          {feedbacks.map((fb) => (
            <div key={fb.id} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-800">
                  {fb.teachers_profile?.name || "সাধারণ ফিডব্যাক"}
                </p>
                <div className="flex gap-0.5">
                  {Array.from({ length: fb.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-600">{fb.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}