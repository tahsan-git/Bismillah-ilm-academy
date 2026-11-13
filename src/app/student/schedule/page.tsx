"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  CalendarDays, 
  Clock, 
  Loader2, 
  User, 
  Video, 
  Link as LinkIcon 
} from "lucide-react";

export default function StudentSchedule() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState("Saturday");

  const supabase = createClient();
  
  const daysEn = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const daysBn: Record<string, string> = { 
    Saturday: "শনিবার", Sunday: "রবিবার", Monday: "সোমবার", 
    Tuesday: "মঙ্গলবার", Wednesday: "বুধবার", Thursday: "বৃহস্পতিবার", Friday: "শুক্রবার" 
  };

  const fetchSchedules = async () => {
    setLoading(true);
    const studentId = localStorage.getItem("student_id");
    if (!studentId) {
      window.location.href = "/student/login";
      return;
    }

    const { data } = await supabase
      .from("class_schedules")
      .select(`
        *,
        teachers_profile (
          name,
          role_bn
        )
      `)
      .eq("student_id", studentId);

    if (data) setSchedules(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const filteredSchedules = schedules.filter(s => s.day_of_week === activeDay);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-[#002A41]">আমার রুটিন</h1>
        <p className="text-slate-500 mt-1">আপনার সাপ্তাহিক ক্লাসের সময়সূচি</p>
      </div>

      {/* দিনের ট্যাব */}
      <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
        {daysEn.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition ${
              activeDay === day ? "bg-[#002A41] text-white shadow-md" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {daysBn[day]}
          </button>
        ))}
      </div>

      {/* ক্লাস লিস্ট */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-[#002A41]/5 flex items-center gap-2">
          <CalendarDays size={20} className="text-[#002A41]" />
          <h2 className="text-lg font-bold text-[#002A41]">{daysBn[activeDay]}-এর ক্লাস</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#002A41]" size={32} />
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="p-10 text-center text-slate-500">এই দিনে কোনো ক্লাস নেই।</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredSchedules.map((schedule) => (
              <div key={schedule.id} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#4CAF50]/10 text-[#4CAF50] flex items-center justify-center shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-lg">{schedule.time_slot}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                      <User size={14} /> শিক্ষক: {schedule.teachers_profile?.name || "শিক্ষক"}
                    </div>
                  </div>
                </div>

                {/* 🌟 Join Button (Jodi link thake) */}
                <div className="flex items-center gap-2">
                  {schedule.meeting_link ? (
                    <a 
                      href={schedule.meeting_link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="w-full md:w-auto text-sm font-bold text-white bg-[#4CAF50] flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg hover:bg-[#388E3C] transition shadow-sm"
                    >
                      <Video size={18} /> Join Class
                    </a>
                  ) : (
                    <div className="w-full md:w-auto text-sm font-bold text-orange-600 bg-orange-50 border border-orange-100 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg">
                      <LinkIcon size={18} /> লিংক দেওয়া হয়নি
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}