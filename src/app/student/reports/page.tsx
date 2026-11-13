"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BarChart3, Loader2 } from "lucide-react";

export default function StudentReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchReports = async () => {
      const studentId = localStorage.getItem("student_id");
      if (!studentId) { window.location.href = "/student/login"; return; }

      // class_reports → class_schedules (schedule_id) filter by student_id
            const { data } = await supabase
        .from("class_reports")
        .select(`
          id, date, topic_covered, understanding_level,
          homework_given, notes, created_at,
          class_schedules!inner (
            id, student_id, day_of_week, time_slot,
            teachers_profile ( name, role_bn )
          )
        `)
        .eq("class_schedules.student_id", studentId)
        .order("created_at", { ascending: false }); // 🌟 Ekhane created_at diye sort hocche

      if (data) setReports(data);
      setLoading(false);
    };
    fetchReports();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#002A41]">রিপোর্ট</h1>
        <p className="text-slate-500 mt-1">আপনার ক্লাসের রিপোর্ট ও অগ্রগতি</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#002A41]" size={32} /></div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-500">
          এখনো কোনো রিপোর্ট নেই।
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#002A41]/5 text-[#002A41] flex items-center justify-center shrink-0">
                    <BarChart3 size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{r.topic_covered || "ক্লাস রিপোর্ট"}</p>
                    <p className="text-sm text-slate-500">
                      {r.class_schedules?.teachers_profile?.name || "শিক্ষক"} •{" "}
                      {new Date(r.date).toLocaleDateString("bn-BD")}
                    </p>
                  </div>
                </div>
                {r.understanding_level && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#4CAF50]/10 text-[#4CAF50]">
                    {r.understanding_level}
                  </span>
                )}
              </div>
              {r.notes && <p className="text-sm text-slate-600">{r.notes}</p>}
              {r.homework_given && (
                <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                  ✅ এই ক্লাসে হোমওয়ার্ক দেওয়া হয়েছে
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}