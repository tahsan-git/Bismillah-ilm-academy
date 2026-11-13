"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Loader2,
  TrendingUp
} from "lucide-react";

export default function StudentAttendance() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      const studentId = localStorage.getItem("student_id");
      if (!studentId) {
        window.location.href = "/student/login";
        return;
      }

      // ১. class_schedules theke schedule_id ber koro
      const { data: schedules } = await supabase
        .from("class_schedules")
        .select("id, time_slot")
        .eq("student_id", studentId);

      if (schedules && schedules.length > 0) {
        const scheduleIds = schedules.map(s => s.id);
        
        // ২. Attendance record ber koro (with schedule info)
        const { data: attData } = await supabase
          .from("attendance")
          .select(`
            *,
            class_schedules (
              time_slot
            )
          `)
          .in("schedule_id", scheduleIds)
          .order("date", { ascending: false });

        if (attData) setAttendance(attData);
      }
      setLoading(false);
    };

    fetchAttendance();
  }, []);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'present': return <CheckCircle2 className="text-green-600" size={20} />;
      case 'absent': return <XCircle className="text-red-600" size={20} />;
      case 'late': return <Clock className="text-orange-600" size={20} />;
      case 'cancelled': return <AlertCircle className="text-slate-600" size={20} />;
      default: return null;
    }
  };

  const getStatusBn = (status: string) => {
    switch(status) {
      case 'present': return 'উপস্থিত';
      case 'absent': return 'অনুপস্থিত';
      case 'late': return 'দেরি';
      case 'cancelled': return 'বাতিল';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'present': return 'text-green-600 bg-green-50';
      case 'absent': return 'text-red-600 bg-red-50';
      case 'late': return 'text-orange-600 bg-orange-50';
      case 'cancelled': return 'text-slate-600 bg-slate-100';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#002A41]" size={32} /></div>;

  // Stats Calculate
  const totalClasses = attendance.length;
  const presentCount = attendance.filter(a => a.status === "present").length;
  const absentCount = attendance.filter(a => a.status === "absent").length;
  const lateCount = attendance.filter(a => a.status === "late").length;
  const attendancePercentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-[#002A41]">উপস্থিতি</h1>
        <p className="text-slate-500 mt-1">আপনার উপস্থিতির রিপোর্ট</p>
      </div>

      {/* 🌟 Summary Card */}
      {totalClasses > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#002A41] p-5 rounded-2xl text-white">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-3">
              <TrendingUp size={20} />
            </div>
            <p className="text-xs text-slate-300 mb-1">সামগ্রিক উপস্থিতি</p>
            <h2 className="text-3xl font-extrabold text-[#FFD700]">{attendancePercentage}%</h2>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mb-3">
              <CheckCircle2 size={20} />
            </div>
            <p className="text-xs text-slate-500 mb-1">উপস্থিত</p>
            <h2 className="text-2xl font-extrabold text-slate-800">{presentCount}</h2>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-3">
              <XCircle size={20} />
            </div>
            <p className="text-xs text-slate-500 mb-1">অনুপস্থিত</p>
            <h2 className="text-2xl font-extrabold text-slate-800">{absentCount}</h2>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
              <Clock size={20} />
            </div>
            <p className="text-xs text-slate-500 mb-1">দেরি</p>
            <h2 className="text-2xl font-extrabold text-slate-800">{lateCount}</h2>
          </div>
        </div>
      )}

      {/* 🌟 Attendance List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <Calendar size={18} className="text-[#002A41]" />
          <h2 className="font-bold text-[#002A41]">উপস্থিতির তালিকা</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {attendance.length === 0 ? (
            <div className="p-10 text-center text-slate-500">কোনো উপস্থিতির রেকর্ড নেই।</div>
          ) : (
            attendance.map((record) => {
              // 🌟 Date ke bangla format e convert koro
              const [y, m, d] = record.date.split('-').map(Number);
              const dateObj = new Date(y, m - 1, d);
              const formattedDate = dateObj.toLocaleDateString("bn-BD", { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              });

              return (
                <div key={record.id} className="p-4 md:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getStatusColor(record.status).split(' ')[1]}`}>
                      {getStatusIcon(record.status)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{formattedDate}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {record.class_schedules?.time_slot || "ক্লাসের সময় নেই"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${getStatusColor(record.status)}`}>
                      {getStatusBn(record.status)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}