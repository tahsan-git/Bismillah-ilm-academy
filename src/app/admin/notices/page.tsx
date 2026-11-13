"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Bell,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  AlertTriangle,
} from "lucide-react";

export default function AdminNotices() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "student" | "teacher">("all");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    target_audience: "all",
    is_important: false,
  });

  const supabase = createClient();

  const fetchNotices = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("notices")
      .select("*")
      .order("is_important", { ascending: false })
      .order("created_at", { ascending: false });
    if (data) setNotices(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const filteredNotices = notices.filter((n) => {
    if (filter === "all") return true;
    return n.target_audience === filter || n.target_audience === "all";
  });

  const openCreateModal = () => {
    setEditingNotice(null);
    setForm({ title: "", content: "", target_audience: "all", is_important: false });
    setModalOpen(true);
  };

  const openEditModal = (notice: any) => {
    setEditingNotice(notice);
    setForm({
      title: notice.title || "",
      content: notice.content || "",
      target_audience: notice.target_audience || "all",
      is_important: notice.is_important || false,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      target_audience: form.target_audience,
      is_important: form.is_important,
    };

    if (editingNotice) {
      await supabase.from("notices").update(payload).eq("id", editingNotice.id);
    } else {
      await supabase.from("notices").insert(payload);
    }

    setSaving(false);
    setModalOpen(false);
    fetchNotices();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি এই নোটিশটি ডিলিট করতে চান?")) return;
    await supabase.from("notices").delete().eq("id", id);
    fetchNotices();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#002A41] flex items-center gap-2">
            <Bell size={24} className="text-[#4CAF50]" /> নোটিশ ম্যানেজমেন্ট
          </h1>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-md w-full sm:w-auto justify-center"
        >
          <Plus size={18} /> নতুন নোটিশ
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "student", "teacher"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              filter === f ? "bg-[#4CAF50] text-white" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {f === "all" ? "সব" : f === "student" ? "শিক্ষার্থী" : "শিক্ষক"}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#4CAF50]" size={40} /></div>
      ) : filteredNotices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">কোনো নোটিশ নেই।</div>
      ) : (
        <div className="space-y-3">
          {filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className={`bg-white rounded-2xl border shadow-sm p-4 md:p-5 space-y-3 ${
                notice.is_important ? "border-red-200 bg-red-50/30" : "border-slate-100"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {notice.is_important && (
                      <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                        <AlertTriangle size={12} /> গুরুত্বপূর্ণ
                      </span>
                    )}
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {notice.target_audience === "all" ? "সবাই" : notice.target_audience === "student" ? "শিক্ষার্থী" : "শিক্ষক"}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg break-words">{notice.title}</h3>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEditModal(notice)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(notice.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed break-words">
                {notice.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-[#002A41]">{editingNotice ? "নোটিশ সম্পাদনা" : "নতুন নোটিশ"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">শিরোনাম *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002A41]/20 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">বিস্তারিত *</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002A41]/20 resize-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">কাদের জন্য</label>
                <select
                  value={form.target_audience}
                  onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#002A41]/20"
                >
                  <option value="all">সবার জন্য</option>
                  <option value="student">শিক্ষার্থীদের জন্য</option>
                  <option value="teacher">শিক্ষকদের জন্য</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_important}
                  onChange={(e) => setForm({ ...form, is_important: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#4CAF50]"
                />
                গুরুত্বপূর্ণ হিসেবে চিহ্নিত করুন
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition">
                  বাতিল
                </button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#4CAF50] text-white font-bold text-sm hover:bg-[#388E3C] disabled:opacity-50 transition">
                  {saving ? <Loader2 className="animate-spin" size={16} /> : "সেভ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}