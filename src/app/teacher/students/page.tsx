"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Search, Eye, X, Loader2, Phone, Calendar
} from "lucide-react";

export default function MyStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentSchedule, setStudentSchedule] = useState<any[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      const teacherId = localStorage.getItem("teacher_id");
      if (!teacherId) {
        window.location.href = "/teacher/login";
        return;
      }

      // 🌟 ১. teacher_students থেকে এই শিক্ষকের student_id গুলো বের করা
      const { data: relations, error } = await supabase
        .from("teacher_students")
        .select("student_id")
        .eq("teacher_id", teacherId);

      if (error) {
        console.error("Relation fetch error:", error);
      }

      if (relations && relations.length > 0) {
        const studentIds = relations.map(r => r.student_id);
        
        // 🌟 ২. students টেবিল থেকে সেই আইডিগুলোর ডাটা আনা
        const { data: studentsData, error: studentsError } = await supabase
          .from("students")
          .select("*")
          .in("id", studentIds);

        if (studentsError) {
          console.error("Students fetch error:", studentsError);
        }

        if (studentsData) setStudents(studentsData);
      } else {
        setStudents([]);
      }
      setLoading(false);
    };

    fetchStudents();
  }, []);

  const openProfile = async (student: any) => {
    setSelectedStudent(student);
    setLoadingSchedule(true);

    const { data } = await supabase
      .from("class_schedules")
      .select("*")
      .eq("student_id", student.id);

    if (data) setStudentSchedule(data);
    setLoadingSchedule(false);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.phone && s.phone.includes(searchTerm))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#002A41]">আমার শিক্ষার্থী</h1>
          <p className="text-slate-500 mt-1">আপনার অধীনে থাকা সকল শিক্ষার্থীর তালিকা</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="নাম বা ফোন দিয়ে খুঁজুন..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#002A41] outline-none text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#002A41]" size={32} /></div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl text-center border border-slate-100 text-slate-500">
          আপনার অধীনে কোনো শিক্ষার্থী এখনো যুক্ত হয়নি। (অ্যাডমিন প্যানেল থেকে যুক্ত করুন)
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#002A41]/10 text-[#002A41] flex items-center justify-center font-bold text-lg shrink-0">
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">{student.name}</h3>
                  <p className="text-sm text-[#4CAF50] font-medium">{student.plan} প্ল্যান</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Phone size={12} /> {student.phone}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className={`text-xs font-bold px-2 py-1 rounded ${student.status?.toLowerCase() === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {student.status?.toLowerCase() === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                </span>
                <button onClick={() => openProfile(student)} className="text-sm font-bold text-[#002A41] hover:underline flex items-center gap-1">
                  <Eye size={14} /> প্রোফাইল
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-[#002A41]">শিক্ষার্থীর প্রোফাইল</h2>
              <button onClick={() => setSelectedStudent(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-[#002A41]/10 text-[#002A41] flex items-center justify-center font-bold text-3xl">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedStudent.name}</h3>
                  <p className="text-sm text-[#4CAF50] font-bold">{selectedStudent.plan} প্ল্যান</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">মোবাইল</p>
                  <p className="font-bold text-sm text-slate-800">{selectedStudent.phone || "-"}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">ইমেইল</p>
                  <p className="font-bold text-sm text-slate-800 truncate">{selectedStudent.email || "-"}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#002A41] mb-3 flex items-center gap-2">
                  <Calendar size={16} /> ক্লাস রুটিন
                </h4>
                {loadingSchedule ? (
                  <div className="text-center py-4"><Loader2 className="animate-spin mx-auto text-slate-400" size={20} /></div>
                ) : studentSchedule.length === 0 ? (
                  <div className="bg-slate-50 p-3 rounded-lg text-center text-sm text-slate-500">
                    কোনো ক্লাস রুটিন তৈরি হয়নি।
                  </div>
                ) : (
                  <div className="space-y-2">
                    {studentSchedule.map((sch, i) => (
                      <div key={i} className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-sm">{sch.day_of_week}</span>
                        <span className="text-sm text-[#4CAF50] font-bold">{sch.time_slot}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}