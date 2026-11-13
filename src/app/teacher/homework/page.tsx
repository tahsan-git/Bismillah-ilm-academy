"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  BookOpen, Plus, X, Loader2, Calendar, User, CheckCircle2, 
  Clock, Send, FileText, Image as ImageIcon, Mic, Trash2
} from "lucide-react";

export default function HomeworkManagement() {
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Review Modal States
  const [reviewHw, setReviewHw] = useState<any>(null);
  const [reviewFiles, setReviewFiles] = useState<any[]>([]);
  const [reviewing, setReviewing] = useState(false);
  const [teacherRemarks, setTeacherRemarks] = useState(""); 

  const [formData, setFormData] = useState({ title: "", student_id: "", deadline: "", description: "" });
  const supabase = createClient();

  const loadData = async () => {
    setLoading(true);
    const teacherId = localStorage.getItem("teacher_id");
    if (!teacherId) { window.location.href = "/teacher/login"; return; }

    // ১. Students load
    const { data: assignedData } = await supabase
      .from("teacher_students")
      .select("student_id, students(id, name)")
      .eq("teacher_id", teacherId);
      
    if (assignedData) setStudents(assignedData.map((a: any) => a.students).filter(Boolean));

    // ২. Homeworks load
    const { data: homeworkData } = await supabase
      .from("homework")
      .select(`*, students ( name )`)
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false });
      
    if (homeworkData) setHomeworks(homeworkData);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // 🌟 New Homework
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const teacherId = localStorage.getItem("teacher_id");
    if (!teacherId || !formData.student_id) return;
    setSubmitting(true);
    
    const { error } = await supabase.from("homework").insert({ 
      teacher_id: teacherId, 
      student_id: formData.student_id, 
      title: formData.title, 
      description: formData.description, 
      deadline: formData.deadline, 
      status: "pending" 
    });

    if (error) alert("সমস্যা হয়েছে: " + error.message);
    else { 
      setShowModal(false); 
      setFormData({ title: "", student_id: "", deadline: "", description: "" }); 
      loadData(); 
    }
    setSubmitting(false);
  };

  // 🌟 Review open
  const openReview = async (hw: any) => {
    setReviewHw(hw);
    setReviewFiles([]);
    setTeacherRemarks(hw.teacher_remarks || ""); 

    const { data, error } = await supabase
      .from("homework_submissions")
      .select("*")
      .eq("homework_id", hw.id);

    if (error) {
      console.error("Error fetching files:", error);
      alert("ফাইল লোড করতে সমস্যা হয়েছে!");
    } else if (data) {
      setReviewFiles(data);
    }
  };

  // 🌟 Review Submit
  const handleReviewSubmit = async () => {
    if (!reviewHw) return;
    setReviewing(true);
    
    const { error } = await supabase
      .from("homework")
      .update({ 
        status: "reviewed", 
        reviewed_at: new Date().toISOString(),
        teacher_remarks: teacherRemarks
      })
      .eq("id", reviewHw.id);

    if (error) {
      alert("আপডেটে সমস্যা: " + error.message);
    } else {
      setReviewHw(null);
      setTeacherRemarks("");
      loadData();
    }
    setReviewing(false);
  };

  // 🌟 Manual Delete Logic (Database + Bucket)
  const handleDelete = async (hw: any) => {
    if (!confirm(`আপনি কি "${hw.title}" হোমওয়ার্কটি ডিলিট করতে চান? এর সব ফাইলও মুছে যাবে।`)) return;

    try {
      // ১. File gulo bucket theke delete koro
      const { data: submissions } = await supabase
        .from("homework_submissions")
        .select("file_url")
        .eq("homework_id", hw.id);

      if (submissions && submissions.length > 0) {
        const filesToDelete = submissions
          .map((s: any) => s.file_url.split('/site-images/')[1])
          .filter(Boolean);
          
        if (filesToDelete.length > 0) {
          await supabase.storage.from('site-images').remove(filesToDelete);
        }
      }

      // ২. Database theke Homework delete koro 
      // (CASCADE er karone homework_submissions o auto delete hobe)
      const { error } = await supabase
        .from("homework")
        .delete()
        .eq("id", hw.id);

      if (error) throw error;

      // ৩. Data refresh
      loadData();
    } catch (error: any) {
      alert("ডিলিট করতে সমস্যা: " + error.message);
    }
  };

  const images = reviewFiles.filter(f => f.file_type === 'image');
  const audios = reviewFiles.filter(f => f.file_type === 'audio');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* হেডার */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#002A41]">হোমওয়ার্ক</h1>
          <p className="text-slate-500 mt-1">শিক্ষার্থীদের হোমওয়ার্ক তৈরি ও রিভিউ করুন</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#002A41] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-[#003D5C] transition text-sm w-full md:w-auto justify-center">
          <Plus size={18} /> নতুন হোমওয়ার্ক
        </button>
      </div>

      {/* সামারি কার্ড */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0"><Clock size={24} /></div>
          <div><p className="text-sm text-slate-500 font-bold mb-1">পেন্ডিং</p><p className="text-2xl font-extrabold text-slate-800">{homeworks.filter(h => h.status === 'pending').length}</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><FileText size={24} /></div>
          <div><p className="text-sm text-slate-500 font-bold mb-1">জমা দিয়েছে</p><p className="text-2xl font-extrabold text-slate-800">{homeworks.filter(h => h.status === 'submitted').length}</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0"><CheckCircle2 size={24} /></div>
          <div><p className="text-sm text-slate-500 font-bold mb-1">রিভিউ সম্পন্ন</p><p className="text-2xl font-extrabold text-slate-800">{homeworks.filter(h => h.status === 'reviewed').length}</p></div>
        </div>
      </div>

      {/* হোমওয়ার্ক লিস্ট */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-[#002A41] flex items-center gap-2"><BookOpen size={18} /> সকল হোমওয়ার্ক</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#002A41]" size={32} /></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {homeworks.map((hw) => (
              <div key={hw.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${hw.status === 'reviewed' ? 'bg-green-50 text-green-600' : hw.status === 'submitted' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{hw.title}</h3>
                    {hw.description && <p className="text-sm text-slate-500 mt-1 line-clamp-1">{hw.description}</p>}
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><User size={12} /> {hw.students?.name || "শিক্ষার্থী"}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> ডেডলাইন: {hw.deadline || "—"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {hw.status === 'pending' && <span className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-xs font-bold">পেন্ডিং</span>}
                  {hw.status === 'submitted' && <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold">জমা দিয়েছে</span>}
                  {hw.status === 'reviewed' && <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold">রিভিউ সম্পন্ন</span>}
                  
                  {hw.status === 'submitted' && (
                    <button onClick={() => openReview(hw)} className="text-sm font-bold text-white bg-[#4CAF50] px-4 py-2 rounded-lg hover:bg-[#388E3C] transition">রিভিউ করুন</button>
                  )}
                  {hw.status === 'reviewed' && (
                    <button onClick={() => openReview(hw)} className="text-sm font-bold text-slate-600 bg-slate-100 px-4 py-2 rounded-lg hover:bg-slate-200 transition">দেখুন</button>
                  )}

                  {/* 🌟 Manual Delete Button */}
                  <button 
                    onClick={() => handleDelete(hw)} 
                    className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition"
                    title="ডিলিট করুন"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Create */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-[#002A41]">নতুন হোমওয়ার্ক</h2>
              <button onClick={() => setShowModal(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div><label className="block text-sm font-bold text-slate-700 mb-1">হোমওয়ার্কের নাম *</label><input type="text" required placeholder="যেমন: সূরা ফাতিহা মুখস্থ" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#002A41]" /></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-1">শিক্ষার্থী *</label><select required value={formData.student_id} onChange={(e) => setFormData({...formData, student_id: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#002A41]"><option value="">সিলেক্ট করুন</option>{students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-1">ডেডলাইন *</label><input type="date" required value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#002A41]" /></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-1">বিস্তারিত</label><textarea rows={3} placeholder="হোমওয়ার্কের বিবরণ..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#002A41]"></textarea></div>
              <button type="submit" disabled={submitting} className="w-full bg-[#002A41] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#003D5C] transition disabled:opacity-50">{submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}{submitting ? "সেভ হচ্ছে..." : "হোমওয়ার্ক তৈরি করুন"}</button>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-[#002A41]">হোমওয়ার্ক রিভিউ</h2>
              <button onClick={() => setReviewHw(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20} /></button>
            </div>
            
            <div className="p-5 space-y-5">
              <div>
                <p className="text-sm font-bold text-slate-700">শিক্ষার্থী: {reviewHw.students?.name}</p>
                <p className="text-sm font-bold text-slate-700">হোমওয়ার্ক: {reviewHw.title}</p>
              </div>

              {/* Images Preview */}
              {images.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1"><ImageIcon size={14} /> জমা দেওয়া ছবি ({images.length})</p>
                  <div className="grid grid-cols-2 gap-2">
                    {images.map((img, i) => (
                      <a key={i} href={img.file_url} target="_blank" rel="noreferrer" className="block w-full h-24 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 hover:opacity-90">
                        <img src={img.file_url} alt="Homework" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Audio Player */}
              {audios.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1"><Mic size={14} /> জমা দেওয়া অডিও ({audios.length})</p>
                  <div className="space-y-2">
                    {audios.map((aud, i) => (
                      <audio key={i} controls src={aud.file_url} className="w-full h-10" />
                    ))}
                  </div>
                </div>
              )}

              {/* Teacher Remarks Input */}
              <div className="pt-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">আপনার মতামত (ঐচ্ছিক)</label>
                <textarea
                  rows={3}
                  placeholder="শিক্ষার্থীর কাজ সম্পর্কে আপনার মতামত লিখুন..."
                  value={teacherRemarks}
                  onChange={(e) => setTeacherRemarks(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#4CAF50]"
                ></textarea>
              </div>

              {/* Review Button */}
              {reviewHw.status === 'submitted' ? (
                <button onClick={handleReviewSubmit} disabled={reviewing} className="w-full bg-[#4CAF50] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#388E3C] disabled:opacity-50 mt-2">
                  {reviewing ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  রিভিউ সম্পন্ন করুন
                </button>
              ) : (
                <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm font-bold text-center flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} /> ইতিমধ্যে রিভিউ করা হয়েছে
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}