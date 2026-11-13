"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  CalendarDays, 
  Clock, 
  Edit, 
  X, 
  Loader2, 
  Save, 
  Video, 
  User, 
  Link as LinkIcon 
} from "lucide-react";

export default function ClassSchedule() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState("Saturday");
  
  // Edit Modal State (Sudhu Link er jonno)
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);
  const [editLink, setEditLink] = useState("");
  const [saving, setSaving] = useState(false);

  const supabase = createClient();
  
  const daysEn = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const daysBn: Record<string, string> = { 
    Saturday: "শনিবার", Sunday: "রবিবার", Monday: "সোমবার", 
    Tuesday: "মঙ্গলবার", Wednesday: "বুধবার", Thursday: "বৃহস্পতিবার", Friday: "শুক্রবার" 
  };

  const fetchSchedules = async () => {
    setLoading(true);
    const teacherId = localStorage.getItem("teacher_id");
    
    if (teacherId) {
      const { data } = await supabase
        .from("class_schedules")
        .select(`
          *,
          students ( name )
        `)
        .eq("teacher_id", teacherId);
        
      if (data) setSchedules(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleEditClick = (schedule: any) => {
    setSelectedSchedule(schedule);
    setEditLink(schedule.meeting_link || ""); 
  };

  const handleSave = async () => {
    setSaving(true);
    // 🌟 Sudhu meeting_link update hocche
    const { error } = await supabase
      .from("class_schedules")
      .update({ 
        meeting_link: editLink.trim() || null 
      })
      .eq("id", selectedSchedule.id);

    if (!error) {
      setSelectedSchedule(null);
      fetchSchedules(); 
    } else {
      alert("আপডেট করতে সমস্যা হয়েছে: " + error.message);
    }
    setSaving(false);
  };

    // 🌟 Sorting Logic: Time onujayi sort (Ajker din hole current time er kachakachi upore)
  const filteredSchedules = schedules
    .filter(s => s.day_of_week === activeDay)
    .sort((a, b) => {
      // Helper function time parse korar jonno
      const getTime = (timeStr: string) => {
        const startTime = timeStr.split(" - ")[0]; // "08:00 AM"
        const [time, modifier] = startTime.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (modifier === "PM" && hours < 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };

      const timeA = getTime(a.time_slot);
      const timeB = getTime(b.time_slot);

      const daysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const todayEn = daysEn[new Date().getDay()];

      // Jodi ajker din hoy, tokhon current time er kachakachi class upore thakbe
      if (activeDay === todayEn) {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        // Jodi class time par hoye geche, seta niche chole jabe
        const isPastA = timeA < currentTime;
        const isPastB = timeB < currentTime;

        if (isPastA !== isPastB) return isPastA ? 1 : -1;
      }

      // Baki sob somoy time onujayi sort hobe (Morning to Night)
      return timeA - timeB;
    });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-[#002A41]">ক্লাস রুটিন</h1>
        <p className="text-slate-500 mt-1">আপনার ক্লাসের সময়সূচি দেখুন এবং লিংক দিন</p>
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
        <div className="p-5 border-b border-slate-100 bg-[#002A41]/5">
          <h2 className="text-lg font-bold text-[#002A41] flex items-center gap-2">
            <CalendarDays size={20} /> {daysBn[activeDay]}-এর ক্লাস
          </h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#002A41]" size={32} /></div>
        ) : filteredSchedules.length === 0 ? (
          <div className="p-10 text-center text-slate-500">এই দিনে কোনো ক্লাস নেই।</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredSchedules.map((schedule) => (
              <div key={schedule.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#4CAF50]/10 text-[#4CAF50] flex items-center justify-center shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-lg">{schedule.time_slot}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                      <User size={14} /> {schedule.students?.name || "শিক্ষার্থী"}
                    </p>
                    
                    {/* Link Preview */}
                    {schedule.meeting_link ? (
                      <p className="text-xs text-green-600 font-bold flex items-center gap-1 mt-1">
                        <Video size={12} /> লিংক দেওয়া আছে
                      </p>
                    ) : (
                      <p className="text-xs text-orange-500 font-bold flex items-center gap-1 mt-1">
                        <LinkIcon size={12} /> লিংক দেওয়া হয়নি
                      </p>
                    )}
                  </div>
                </div>
                
                {/* 🌟 Button Group */}
                <div className="flex items-center gap-2">
                  {/* Join Button (Jodi link thake) */}
                  {schedule.meeting_link && (
                    <a 
                      href={schedule.meeting_link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-sm font-bold text-white bg-[#4CAF50] flex items-center justify-center gap-1 px-4 py-2 rounded-lg hover:bg-[#388E3C] transition"
                    >
                      <Video size={16} /> Join
                    </a>
                  )}

                  {/* Add/Edit Button (Dynamic Color) */}
                  <button 
                    onClick={() => handleEditClick(schedule)}
                    className={`text-sm font-bold flex items-center justify-center gap-1 px-4 py-2 rounded-lg transition ${
                      schedule.meeting_link 
                        ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100" 
                        : "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100"
                    }`}
                  >
                    {schedule.meeting_link ? (
                      <>
                        <Edit size={16} /> লিংক পরিবর্তন
                      </>
                    ) : (
                      <>
                        <LinkIcon size={16} /> লিংক অ্যাড করুন
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      

      {/* এডিট মোডাল (Sudhu Link) */}
      {selectedSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#002A41]">মিটিং লিংক দিন</h2>
              <button onClick={() => setSelectedSchedule(null)} className="p-1 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20} /></button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-2">
                <p className="text-xs text-slate-500 mb-1">ক্লাসের সময়:</p>
                <p className="font-bold text-slate-800">{selectedSchedule.day_of_week}, {selectedSchedule.time_slot}</p>
                <p className="text-xs text-slate-500 mt-1">শিক্ষার্থী: {selectedSchedule.students?.name}</p>
              </div>

              {/* Meeting Link Input */}
              <div>
                <label className="block text-sm font-bold mb-1 flex items-center gap-1">
                  <LinkIcon size={14} /> মিটিং লিংক (Zoom/Meet)
                </label>
                <input 
                  type="url" 
                  value={editLink} 
                  onChange={(e) => setEditLink(e.target.value)} 
                  className="w-full p-2.5 border rounded-lg focus:border-[#4CAF50] outline-none" 
                  placeholder="https://zoom.us/j/..." 
                />
                <p className="text-[10px] text-slate-400 mt-1">ক্লাস শেষ হলে এই লিংক স্বয়ংক্রিয়ভাবে মুছে যাবে।</p>
              </div>

              <button onClick={handleSave} disabled={saving} className="w-full bg-[#4CAF50] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#388E3C] transition disabled:opacity-50 mt-2">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} সেভ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}