"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Plus, 
  X, 
  Loader2, 
  Send,
  Eye,
  Lock,
  Trash2
} from "lucide-react";

export default function StudentNotes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "personal" | "feedback">("all");

  const [formData, setFormData] = useState({
    student_id: "",
    type: "personal",
    content: "",
  });

  const supabase = createClient();

  // 🌟 Data Load Logic
  const fetchData = async () => {
    setLoading(true);
    const teacherId = localStorage.getItem("teacher_id");
    if (!teacherId) {
      window.location.href = "/teacher/login";
      return;
    }

    // ১. Teacher er assigned student list
    const { data: assignedData } = await supabase
      .from("teacher_students")
      .select("student_id, students(id, name)")
      .eq("teacher_id", teacherId);

    if (assignedData) {
      setStudents(assignedData.map((a: any) => a.students).filter(Boolean));
    }

    // ২. Teacher er deya notes
    const { data: notesData } = await supabase
      .from("student_notes")
      .select("*, students(name)")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false });

    if (notesData) setNotes(notesData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🌟 Note Save Logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const teacherId = localStorage.getItem("teacher_id");
    if (!teacherId || !formData.student_id) return;

    setSubmitting(true);
    
    const { error } = await supabase.from("student_notes").insert({
      teacher_id: teacherId,
      student_id: formData.student_id,
      type: formData.type,
      content: formData.content,
    });

    if (error) {
      alert("সেভ করতে সমস্যা হয়েছে: " + error.message);
    } else {
      setShowModal(false);
      setFormData({ student_id: "", type: "personal", content: "" });
      fetchData(); // Data refresh
    }
    setSubmitting(false);
  };

  // 🌟 Delete Note Logic
  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি এই নোটটি ডিলিট করতে চান?")) return;

    const { error } = await supabase
      .from("student_notes")
      .delete()
      .eq("id", id);

    if (error) {
      alert("ডিলিট করতে সমস্যা: " + error.message);
    } else {
      fetchData();
    }
  };

  // 🌟 Filter
  const filteredNotes = notes.filter(n => activeTab === "all" ? true : n.type === activeTab);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* হেডার */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#002A41]">স্টুডেন্ট নোট ও ফিডব্যাক</h1>
          <p className="text-slate-500 mt-1">শিক্ষার্থীদের ব্যক্তিগত নোট ও ফিডব্যাক পরিচালনা করুন</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#002A41] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-[#003D5C] transition text-sm w-full md:w-auto justify-center"
        >
          <Plus size={18} /> নতুন নোট
        </button>
      </div>

      {/* 🌟 ট্যাব */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-max">
        <button 
          onClick={() => setActiveTab("all")}
          className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === "all" ? "bg-white text-[#002A41] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          সব নোট
        </button>
        <button 
          onClick={() => setActiveTab("personal")}
          className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${activeTab === "personal" ? "bg-white text-[#002A41] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <Lock size={14} /> ব্যক্তিগত
        </button>
        <button 
          onClick={() => setActiveTab("feedback")}
          className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${activeTab === "feedback" ? "bg-white text-[#002A41] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <Eye size={14} /> ফিডব্যাক
        </button>
      </div>

      {/* 🌟 নোট লিস্ট */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#002A41]" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div key={note.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col relative group">
              
              {/* Delete Button (Hover korle dekhabe) */}
              <button
                onClick={() => handleDelete(note.id)}
                className="absolute top-4 right-4 p-1.5 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition"
                title="ডিলিট করুন"
              >
                <Trash2 size={14} />
              </button>

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#002A41]/10 text-[#002A41] flex items-center justify-center font-bold text-sm">
                    {note.students?.name?.charAt(0) || "S"}
                  </div>
                  <span className="font-bold text-slate-800">{note.students?.name || "শিক্ষার্থী"}</span>
                </div>
                {note.type === 'personal' ? (
                  <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 mt-6">
                    <Lock size={10} /> ব্যক্তিগত
                  </span>
                ) : (
                  <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 mt-6">
                    <Eye size={10} /> ফিডব্যাক
                  </span>
                )}
              </div>
              
              <div className="flex-1 bg-slate-50 p-3 rounded-xl">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">"{note.content}"</p>
              </div>
              
              <div className="mt-3 text-right">
                <p className="text-xs text-slate-400">
                  {new Date(note.created_at).toLocaleDateString("bn-BD")}
                </p>
              </div>
            </div>
          ))}
          {filteredNotes.length === 0 && (
            <div className="col-span-full p-10 text-center text-slate-500 bg-white rounded-2xl border border-slate-100">
              কোনো নোট পাওয়া যায়নি। নতুন নোট যোগ করুন।
            </div>
          )}
        </div>
      )}

      {/* 🌟 নতুন নোট মোডাল */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            
            <div className="flex justify-between items-center p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-[#002A41]">নতুন নোট যোগ করুন</h2>
              <button onClick={() => setShowModal(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">শিক্ষার্থী *</label>
                <select 
                  required 
                  value={formData.student_id}
                  onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#002A41]"
                >
                  <option value="">সিলেক্ট করুন</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">নোটের ধরন *</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition ${formData.type === 'personal' ? 'border-[#002A41] bg-[#002A41]/5' : 'border-slate-200 hover:border-[#002A41]'}`}>
                    <input 
                      type="radio" 
                      name="type" 
                      value="personal" 
                      checked={formData.type === 'personal'}
                      onChange={() => setFormData({...formData, type: 'personal'})}
                      className="accent-[#002A41]"
                    />
                    <div>
                      <p className="font-bold text-slate-800">ব্যক্তিগত নোট</p>
                      <p className="text-xs text-slate-500">শুধু আপনি দেখবেন</p>
                    </div>
                  </label>
                  <label className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition ${formData.type === 'feedback' ? 'border-[#002A41] bg-[#002A41]/5' : 'border-slate-200 hover:border-[#002A41]'}`}>
                    <input 
                      type="radio" 
                      name="type" 
                      value="feedback" 
                      checked={formData.type === 'feedback'}
                      onChange={() => setFormData({...formData, type: 'feedback'})}
                      className="accent-[#002A41]"
                    />
                    <div>
                      <p className="font-bold text-slate-800">ফিডব্যাক</p>
                      <p className="text-xs text-slate-500">শিক্ষার্থী দেখবে</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">নোটের বিবরণ *</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="বিস্তারিত লিখুন..."
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#002A41]"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-[#002A41] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#003D5C] transition disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                {submitting ? "সেভ হচ্ছে..." : "নোট সেভ করুন"}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}