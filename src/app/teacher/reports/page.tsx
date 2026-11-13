"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  FileText, 
  Plus, 
  X, 
  Loader2, 
  Calendar, 
  User, 
  Send, 
  CheckCircle2, 
  Trash2 
} from "lucide-react";

export default function TeacherReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    student_id: "",
    date: new Date().toISOString().split('T')[0],
    topic_covered: "",
    understanding_level: "ভালো",
    homework_given: false,
    notes: "",
  });

  const supabase = createClient();

  const loadData = async () => {
    setLoading(true);
    const teacherId = localStorage.getItem("teacher_id");
    if (!teacherId) { window.location.href = "/teacher/login"; return; }

    // ১. Assigned Students
    const { data: assignedData } = await supabase
      .from("teacher_students")
      .select("student_id, students(id, name)")
      .eq("teacher_id", teacherId);

    if (assignedData) {
      setStudents(assignedData.map((a: any) => a.students).filter(Boolean));
    }

    // ২. Recent Reports (Teacher er deya)
    const { data: reportsData } = await supabase
      .from("class_reports")
      .select(`
        *,
        class_schedules!inner (
          teacher_id,
          students ( name )
        )
      `)
      .eq("class_schedules.teacher_id", teacherId)
      .order("date", { ascending: false });

    if (reportsData) setReports(reportsData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const teacherId = localStorage.getItem("teacher_id");
    if (!teacherId || !formData.student_id) return;

    setSubmitting(true);
    try {
      // ১. Oi student er jonno ekta schedule khujo
      const { data: scheduleData } = await supabase
        .from("class_schedules")
        .select("id")
        .eq("student_id", formData.student_id)
        .eq("teacher_id", teacherId)
        .limit(1)
        .maybeSingle();

      if (!scheduleData) {
        throw new Error("এই শিক্ষার্থীর কোনো ক্লাস শিডিউল পাওয়া যায়নি। আগে শিডিউল তৈরি করুন।");
      }

      // ২. Report insert
      const { error } = await supabase.from("class_reports").insert({
        schedule_id: scheduleData.id,
        date: formData.date,
        topic_covered: formData.topic_covered,
        understanding_level: formData.understanding_level,
        homework_given: formData.homework_given,
        notes: formData.notes,
      });

      if (error) throw error;

      setShowModal(false);
      setFormData({
        student_id: "",
        date: new Date().toISOString().split('T')[0],
        topic_covered: "",
        understanding_level: "ভালো",
        homework_given: false,
        notes: "",
      });
      loadData();
    } catch (error: any) {
      alert("সেভ করতে সমস্যা: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 🌟 Delete Report Logic
  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি এই রিপোর্টটি ডিলিট করতে চান?")) return;

    try {
      const { error } = await supabase
        .from("class_reports")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      loadData(); // Data refresh
    } catch (error: any) {
      alert("ডিলিট করতে সমস্যা: " + error.message);
    }
  };

  const getLevelColor = (level: string) => {
    if (level === "চমৎকার") return "bg-green-100 text-green-700";
    if (level === "ভালো") return "bg-blue-100 text-blue-700";
    if (level === "মাঝারি") return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#002A41] flex items-center gap-2">
            <FileText size={24} className="text-[#4CAF50]" /> ক্লাস রিপোর্ট
          </h1>
          <p className="text-slate-500 mt-1">শিক্ষার্থীদের ক্লাসের অগ্রগতি রিপোর্ট তৈরি করুন</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#002A41] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-[#003D5C] transition text-sm w-full md:w-auto justify-center"
        >
          <Plus size={18} /> নতুন রিপোর্ট
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#002A41]" size={40} /></div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
          এখনো কোনো রিপোর্ট তৈরি করা হয়নি।
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#002A41]/5 text-[#002A41] flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{r.topic_covered}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <User size={12} /> {r.class_schedules?.students?.name || "শিক্ষার্থী"}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${getLevelColor(r.understanding_level)}`}>
                  {r.understanding_level}
                </span>
              </div>

              {r.notes && (
                <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
                  {r.notes}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {new Date(r.date).toLocaleDateString("bn-BD")}
                </span>
                
                <div className="flex items-center gap-3">
                  {r.homework_given && (
                    <span className="flex items-center gap-1 text-green-600 font-bold">
                      <CheckCircle2 size={12} /> হোমওয়ার্ক দেওয়া হয়েছে
                    </span>
                  )}
                  
                  {/* 🌟 Delete Button */}
                  <button 
                    onClick={() => handleDelete(r.id)}
                    className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition"
                    title="ডিলিট করুন"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-[#002A41]">নতুন ক্লাস রিপোর্ট</h2>
              <button onClick={() => setShowModal(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20} /></button>
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
                  {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">তারিখ *</label>
                <input 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#002A41]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">আজকের পড়ানো বিষয় / টপিক *</label>
                <input 
                  type="text" 
                  required
                  placeholder="যেমন: সূরা ফাতিহা তিলাওয়াত"
                  value={formData.topic_covered}
                  onChange={(e) => setFormData({...formData, topic_covered: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#002A41]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">বোঝার মাত্রা *</label>
                <select 
                  required 
                  value={formData.understanding_level}
                  onChange={(e) => setFormData({...formData, understanding_level: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#002A41]"
                >
                  <option value="চমৎকার">চমৎকার</option>
                  <option value="ভালো">ভালো</option>
                  <option value="মাঝারি">মাঝারি</option>
                  <option value="দুর্বল">দুর্বল</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="hw"
                  checked={formData.homework_given}
                  onChange={(e) => setFormData({...formData, homework_given: e.target.checked})}
                  className="w-4 h-4 accent-[#4CAF50]"
                />
                <label htmlFor="hw" className="text-sm font-bold text-slate-700 cursor-pointer">হোমওয়ার্ক দেওয়া হয়েছে</label>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">অতিরিক্ত নোট (ঐচ্ছিক)</label>
                <textarea 
                  rows={3}
                  placeholder="আজকের ক্লাস সম্পর্কে বিস্তারিত..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#002A41]"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-[#002A41] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#003D5C] transition disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                {submitting ? "সেভ হচ্ছে..." : "রিপোর্ট সেভ করুন"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}