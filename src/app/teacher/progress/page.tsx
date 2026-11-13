"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  TrendingUp, 
  BookOpen, 
  CheckCircle2, 
  Star,
  ChevronRight,
  Award,
  Clock,
  Loader2,
  User
} from "lucide-react";

export default function StudentProgress() {
  const [progressData, setProgressData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      const teacherId = localStorage.getItem("teacher_id");
      if (!teacherId) { window.location.href = "/teacher/login"; return; }

      // ১. Teacher er assigned student der list
      const { data: assigned } = await supabase
        .from("teacher_students")
        .select("student_id, students(id, name)")
        .eq("teacher_id", teacherId);

      if (!assigned || assigned.length === 0) {
        setLoading(false);
        return;
      }

      const studentIds = assigned.map((a: any) => a.student_id);

      // ২. Oi student der class reports ber koro
      const { data: reports } = await supabase
        .from("class_reports")
        .select(`
          *,
          class_schedules!inner (
            student_id
          )
        `)
        .in("class_schedules.student_id", studentIds)
        .order("date", { ascending: false });

      // ৩. Data aggregate koro student onujayi
      const aggregated = assigned.map((a: any) => {
        const student = a.students;
        const studentReports = reports?.filter(
          (r: any) => r.class_schedules.student_id === student.id
        ) || [];

        const totalReports = studentReports.length;
        
        // Understanding level count
        const chomokkar = studentReports.filter((r: any) => r.understanding_level === "চমৎকার").length;
        const valo = studentReports.filter((r: any) => r.understanding_level === "ভালো").length;
        const majhari = studentReports.filter((r: any) => r.understanding_level === "মাঝারি").length;
        const durbal = studentReports.filter((r: any) => r.understanding_level === "দুর্বল").length;

        // Rating calculate (chomokkar=5, valo=4, majhari=3, durbal=2)
        let totalPoints = (chomokkar * 5) + (valo * 4) + (majhari * 3) + (durbal * 2);
        let rating = totalReports > 0 ? (totalPoints / totalReports).toFixed(1) : "0.0";

        // Progress % (100 reports = 100% dhore nechi)
        const progressPercent = Math.min(Math.round((totalReports / 20) * 100), 100);

        // Last update
        const lastUpdate = studentReports.length > 0 
          ? new Date(studentReports[0].date).toLocaleDateString("bn-BD")
          : "কোনো রিপোর্ট নেই";

        // Overall Level
        let overallLevel = "রিপোর্ট নেই";
        if (chomokkar > valo && chomokkar > majhari) overallLevel = "চমৎকার";
        else if (valo > majhari && valo > durbal) overallLevel = "ভালো";
        else if (majhari > durbal) overallLevel = "মাঝারি";
        else if (durbal > 0) overallLevel = "দুর্বল";

        return {
          id: student.id,
          name: student.name,
          totalReports,
          progressPercent,
          rating,
          overallLevel,
          lastUpdate,
          chomokkar,
          valo,
          majhari,
          durbal
        };
      });

      setProgressData(aggregated);
      setLoading(false);
    };

    fetchProgress();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#002A41]" size={40} /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      <div>
        <h1 className="text-2xl font-bold text-[#002A41]">শিক্ষার্থীর অগ্রগতি</h1>
        <p className="text-slate-500 mt-1">শিক্ষার্থীদের পড়াশোনার অগ্রগতি ট্র্যাক করুন</p>
      </div>

      {progressData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
          কোনো শিক্ষার্থী পাওয়া যায়নি।
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {progressData.map((student) => (
            <div key={student.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              
              {/* কার্ড হেডার */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#002A41] text-white flex items-center justify-center font-bold text-lg">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{student.name}</h3>
                    <p className="text-xs text-slate-500 font-medium bg-slate-200/50 px-2 py-0.5 rounded inline-block mt-1">
                      মোট রিপোর্ট: {student.totalReports}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 bg-[#4CAF50]/10 text-[#4CAF50] px-3 py-1.5 rounded-lg">
                  <Star size={16} fill="currentColor" />
                  <span className="font-bold text-sm">{student.rating}</span>
                </div>
              </div>

              {/* কার্ড বডি */}
              <div className="p-5 grid md:grid-cols-3 gap-6">
                
                {/* ১. অগ্রগতি */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
                      <BookOpen size={16} className="text-[#4CAF50]" /> সামগ্রিক অগ্রগতি
                    </span>
                    <span className="text-sm font-bold text-[#002A41]">{student.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div 
                      className="bg-[#4CAF50] h-2.5 rounded-full transition-all" 
                      style={{ width: `${student.progressPercent}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {student.totalReports} টি রিপোর্টের ভিত্তিতে
                  </p>
                </div>

                {/* ২. মানসম্মত বিভাজন */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
                      <TrendingUp size={16} className="text-blue-500" /> পারফরম্যান্স
                    </span>
                  </div>
                  <div className="flex gap-1 h-2.5 rounded-full overflow-hidden">
                    {student.chomokkar > 0 && <div className="bg-green-500" style={{ flex: student.chomokkar }} title={`চমৎকার: ${student.chomokkar}`}></div>}
                    {student.valo > 0 && <div className="bg-blue-500" style={{ flex: student.valo }} title={`ভালো: ${student.valo}`}></div>}
                    {student.majhari > 0 && <div className="bg-amber-500" style={{ flex: student.majhari }} title={`মাঝারি: ${student.majhari}`}></div>}
                    {student.durbal > 0 && <div className="bg-red-500" style={{ flex: student.durbal }} title={`দুর্বল: ${student.durbal}`}></div>}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> চমৎকার</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> ভালো</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> মাঝারি</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> দুর্বল</span>
                  </div>
                </div>

                {/* ৩. সামগ্রিক মান */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
                      <Award size={16} className="text-orange-500" /> সামগ্রিক মান
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      student.overallLevel === 'চমৎকার' ? 'bg-green-100 text-green-700' : 
                      student.overallLevel === 'ভালো' ? 'bg-blue-100 text-blue-700' : 
                      student.overallLevel === 'মাঝারি' ? 'bg-amber-100 text-amber-700' : 
                      student.overallLevel === 'দুর্বল' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {student.overallLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                    <Clock size={12} /> সর্বশেষ: {student.lastUpdate}
                  </p>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

      <div className="bg-[#002A41]/5 border border-[#002A41]/10 p-5 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[#002A41]/10 text-[#002A41] flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 size={16} />
        </div>
        <div>
          <h4 className="font-bold text-[#002A41] text-sm">অটো-জেনারেটেড অগ্রগতি</h4>
          <p className="text-[#002A41]/70 text-sm mt-1">
            এই অগ্রগতি রিপোর্টটি শিক্ষার্থীদের ক্লাস রিপোর্টের ভিত্তিতে সম্পূর্ণ স্বয়ংক্রিয়ভাবে তৈরি হয়েছে।
          </p>
        </div>
      </div>

    </div>
  );
}