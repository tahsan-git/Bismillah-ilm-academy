"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  CheckCircle2, XCircle, Clock, AlertCircle, Calendar, Save, Loader2
} from "lucide-react";

export default function AttendancePage() {
  // Default date: Ajker local date (UTC issue avoid korte)
  const today = new Date();
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const [selectedDate, setSelectedDate] = useState(localToday);
  const [studentsWithSchedule, setStudentsWithSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const supabase = createClient();

  const fetchAttendance = async () => {
    setLoading(true);
    const teacherId = localStorage.getItem("teacher_id");
    if (!teacherId) {
      window.location.href = "/teacher/login";
      return;
    }

    // 🌟 Timezone safe Date parsing (String theke direct local date)
    const [year, month, day] = selectedDate.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    
    const daysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = daysEn[localDate.getDay()];

    // ১. teacher_students relations
    const { data: relations } = await supabase
      .from("teacher_students")
      .select("student_id")
      .eq("teacher_id", teacherId);

    if (!relations || relations.length === 0) {
      setStudentsWithSchedule([]);
      setLoading(false);
      return;
    }

    const studentIds = relations.map(r => r.student_id);

    // ২. Oi diner schedule ber koro
    const { data: schedulesData } = await supabase
      .from("class_schedules")
      .select(`
        *,
        students (name, plan)
      `)
      .eq("teacher_id", teacherId)
      .eq("day_of_week", dayOfWeek)
      .in("student_id", studentIds);

    if (schedulesData && schedulesData.length > 0) {
      // ৩. Attendance record ber koro (selected date er jonno)
      const scheduleIds = schedulesData.map(s => s.id);
      const { data: attendanceData } = await supabase
        .from("attendance")
        .select("*")
        .in("schedule_id", scheduleIds)
        .eq("date", selectedDate);

      // ৪. Merge koro
      const merged = schedulesData.map(schedule => {
        const record = attendanceData?.find(a => a.schedule_id === schedule.id);
        return {
          ...schedule,
          status: record ? record.status : "present", // Default present
        };
      });

      setStudentsWithSchedule(merged);
    } else {
      setStudentsWithSchedule([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const handleStatusChange = (scheduleId: string, newStatus: string) => {
    setStudentsWithSchedule(studentsWithSchedule.map(s => s.id === scheduleId ? { ...s, status: newStatus } : s));
  };

  const handleSave = async () => {
    if (studentsWithSchedule.length === 0) return;
    setSaving(true);
    
    const records = studentsWithSchedule.map(s => ({
      schedule_id: s.id,
      date: selectedDate,
      status: s.status,
      notes: "" 
    }));

    const { error } = await supabase
      .from("attendance")
      .upsert(records, { 
        onConflict: "schedule_id, date", 
        ignoreDuplicates: false 
      });

    if (!error) {
      alert("উপস্থিতি সফলভাবে সেভ হয়েছে!");
    } else {
      alert("সেভ করতে সমস্যা হয়েছে: " + error.message);
    }
    setSaving(false);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'present': return 'bg-green-50 text-green-700 border-green-200';
      case 'absent': return 'bg-red-50 text-red-700 border-red-200';
      case 'late': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'cancelled': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#002A41]">উপস্থিতি</h1>
          <p className="text-slate-500 mt-1">নির্বাচিত দিনের ক্লাসের উপস্থিতি নিন</p>
        </div>

        <div className="flex items-center gap-3">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-[#002A41] text-sm"
          />
          <button 
            onClick={handleSave}
            disabled={saving || studentsWithSchedule.length === 0}
            className="bg-[#002A41] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-[#003D5C] transition disabled:opacity-50 text-sm"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            সেভ করুন
          </button>
        </div>
      </div>

      {/* শিক্ষার্থী লিস্ট */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-[#002A41] flex items-center gap-2">
            <Calendar size={18} /> 
            {/* 🌟 Timezone safe Date display */}
            {(() => {
              const [y, m, d] = selectedDate.split('-').map(Number);
              return new Date(y, m - 1, d).toLocaleDateString("bn-BD", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            })()}
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#002A41]" size={32} /></div>
          ) : studentsWithSchedule.length === 0 ? (
            <div className="p-10 text-center text-slate-500">এই দিনে এই শিক্ষকের কোনো ক্লাস নেই।</div>
          ) : (
            studentsWithSchedule.map((schedule) => (
              <div key={schedule.id} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                <div className="flex items-center gap-3 md:w-1/3">
                  <div className="w-10 h-10 rounded-full bg-[#002A41]/10 text-[#002A41] flex items-center justify-center font-bold shrink-0">
                    {schedule.students?.name?.charAt(0) || "S"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm md:text-base">{schedule.students?.name}</p>
                    <p className="text-xs text-slate-500">{schedule.time_slot}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => handleStatusChange(schedule.id, 'present')}
                    className={`px-2 py-2 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1 ${schedule.status === 'present' ? getStatusColor('present') : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    <CheckCircle2 size={14} /> <span className="hidden md:inline">উপস্থিত</span>
                  </button>
                  <button 
                    onClick={() => handleStatusChange(schedule.id, 'absent')}
                    className={`px-2 py-2 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1 ${schedule.status === 'absent' ? getStatusColor('absent') : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    <XCircle size={14} /> <span className="hidden md:inline">অনুপস্থিত</span>
                  </button>
                  <button 
                    onClick={() => handleStatusChange(schedule.id, 'late')}
                    className={`px-2 py-2 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1 ${schedule.status === 'late' ? getStatusColor('late') : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    <Clock size={14} /> <span className="hidden md:inline">দেরি</span>
                  </button>
                  <button 
                    onClick={() => handleStatusChange(schedule.id, 'cancelled')}
                    className={`px-2 py-2 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1 ${schedule.status === 'cancelled' ? getStatusColor('cancelled') : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    <AlertCircle size={14} /> <span className="hidden md:inline">বাতিল</span>
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}