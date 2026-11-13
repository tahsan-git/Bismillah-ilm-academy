"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  CalendarDays,
  Clock,
  Plus,
  Trash2,
  Loader2,
  Pencil,
  X,
  Check,
  Users,
  ArrowRight,
} from "lucide-react";

const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DAYS_BN: Record<string, string> = {
  Saturday: "শনিবার",
  Sunday: "রবিবার",
  Monday: "সোমবার",
  Tuesday: "মঙ্গলবার",
  Wednesday: "বুধবার",
  Thursday: "বৃহস্পতিবার",
  Friday: "শুক্রবার",
};

function ScheduleContent() {
  const searchParams = useSearchParams();
  const initialStudent = searchParams.get("student") || "";

  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>(initialStudent);
  const [teacher, setTeacher] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  
  // 🌟 Start & End Time states
  const [form, setForm] = useState({ day_of_week: "Saturday" });
  
  const [startHour, setStartHour] = useState("08");
  const [startMinute, setStartMinute] = useState("00");
  const [startAmpm, setStartAmpm] = useState("AM");

  const [endHour, setEndHour] = useState("09");
  const [endMinute, setEndMinute] = useState("00");
  const [endAmpm, setEndAmpm] = useState("AM");

  const supabase = createClient();

  useEffect(() => {
    const fetchStudents = async () => {
      const { data } = await supabase
        .from("students")
        .select("id, name, phone, status")
        .eq("status", "Active")
        .order("name");
      if (data) setStudents(data);
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!selectedStudent) {
      setSchedules([]);
      setTeacher(null);
      return;
    }
    const fetchScheduleData = async () => {
      setLoading(true);

      // 1. Teacher info
      const { data: assignment } = await supabase
        .from("teacher_students")
        .select("teacher_id, teachers_profile(id, name, role_bn)")
        .eq("student_id", selectedStudent)
        .maybeSingle();

      if (assignment?.teachers_profile) {
        setTeacher(assignment.teachers_profile);
      } else {
        setTeacher(null);
      }

      // 2. Schedules
      const { data: scheduleData } = await supabase
        .from("class_schedules")
        .select("*")
        .eq("student_id", selectedStudent)
        .order("day_of_week");

      if (scheduleData) setSchedules(scheduleData);
      setLoading(false);
    };
    fetchScheduleData();
  }, [selectedStudent]);

  const loadSchedules = async () => {
    if (!selectedStudent) return;
    const { data } = await supabase
      .from("class_schedules")
      .select("*")
      .eq("student_id", selectedStudent)
      .order("day_of_week");
    if (data) setSchedules(data);
  };

  const openCreate = (day?: string) => {
    if (!teacher) {
      alert("প্রথমে এই শিক্ষার্থীকে একজন শিক্ষক অ্যাসাইন করুন।");
      return;
    }
    setEditingSchedule(null);
    setForm({ day_of_week: day || "Saturday" });
    
    // Default Start & End time
    setStartHour("08");
    setStartMinute("00");
    setStartAmpm("AM");
    
    setEndHour("09");
    setEndMinute("00");
    setEndAmpm("AM");

    setModalOpen(true);
  };

  const openEdit = (schedule: any) => {
    setEditingSchedule(schedule);
    setForm({ day_of_week: schedule.day_of_week });
    
    // 🌟 Database theke time split koro (Format: "08:00 AM - 09:00 AM")
    const [startTime, endTime] = schedule.time_slot.split(" - ");
    
    if (startTime) {
      const [sTime, sMod] = startTime.split(" ");
      const [sHour, sMinute] = sTime.split(":");
      setStartHour(sHour || "08");
      setStartMinute(sMinute || "00");
      setStartAmpm(sMod || "AM");
    }

    if (endTime) {
      const [eTime, eMod] = endTime.split(" ");
      const [eHour, eMinute] = eTime.split(":");
      setEndHour(eHour || "09");
      setEndMinute(eMinute || "00");
      setEndAmpm(eMod || "AM");
    }
    
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !teacher) return;

    setSaving(true);
    
    // 🌟 Time Range toiri koro (Jemon: "08:00 AM - 09:30 AM")
    const formattedStartTime = `${startHour}:${startMinute} ${startAmpm}`;
    const formattedEndTime = `${endHour}:${endMinute} ${endAmpm}`;
    const finalTimeSlot = `${formattedStartTime} - ${formattedEndTime}`;

    const payload = {
      student_id: selectedStudent,
      teacher_id: teacher.id,
      day_of_week: form.day_of_week,
      time_slot: finalTimeSlot,
    };

    if (editingSchedule) {
      await supabase.from("class_schedules").update(payload).eq("id", editingSchedule.id);
    } else {
      await supabase.from("class_schedules").insert(payload);
    }

    setSaving(false);
    setModalOpen(false);
    loadSchedules();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি এই ক্লাস শিডিউলটি ডিলিট করতে চান?")) return;
    await supabase.from("class_schedules").delete().eq("id", id);
    loadSchedules();
  };

  const schedulesByDay = DAYS.reduce((acc, day) => {
    acc[day] = schedules.filter((s) => s.day_of_week === day);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-[#002A41] flex items-center gap-2">
          <CalendarDays size={24} className="text-[#4CAF50]" /> ক্লাস শিডিউল
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          শিক্ষার্থী নির্বাচন করে সাপ্তাহিক শিডিউল তৈরি করুন
        </p>
      </div>

      {/* Student Selector */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
        <label className="block text-sm font-bold text-slate-700">শিক্ষার্থী নির্বাচন করুন</label>
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#002A41]/20 text-sm"
        >
          <option value="">— শিক্ষার্থী বাছাই করুন —</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.name} ({s.phone})</option>
          ))}
        </select>

        {selectedStudent && teacher && (
          <div className="flex items-center gap-2 text-sm text-purple-700 bg-purple-50 px-3 py-2 rounded-lg">
            <Users size={16} /> অ্যাসাইনড টিচার: <strong>{teacher.name}</strong>
          </div>
        )}

        {selectedStudent && !teacher && (
          <div className="text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
            ⚠️ এই শিক্ষার্থীকে এখনো কোনো শিক্ষক অ্যাসাইন করা হয়নি। Student Management থেকে অ্যাসাইন করুন।
          </div>
        )}
      </div>

      {selectedStudent && teacher && (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => openCreate()}
              className="flex items-center gap-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-md"
            >
              <Plus size={18} /> নতুন ক্লাস যোগ করুন
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-[#4CAF50]" size={40} />
            </div>
          ) : schedules.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
              কোনো শিডিউল নেই। উপরের বাটন থেকে যোগ করুন।
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {DAYS.map((day) => {
                const daySchedules = schedulesByDay[day];
                return (
                  <div key={day} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-[#002A41]">{DAYS_BN[day]}</h3>
                      <button
                        onClick={() => openCreate(day)}
                        className="p-1.5 bg-[#4CAF50]/10 text-[#4CAF50] rounded-lg hover:bg-[#4CAF50]/20"
                        title="এই দিনে ক্লাস যোগ করুন"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    {daySchedules.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-2">কোনো ক্লাস নেই</p>
                    ) : (
                      <div className="space-y-2">
                        {daySchedules.map((s) => (
                          <div key={s.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-2.5">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                              <Clock size={14} className="text-[#4CAF50]" />
                              {s.time_slot}
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => openEdit(s)}
                                className="p-1.5 text-slate-500 hover:bg-slate-200 rounded"
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                onClick={() => handleDelete(s.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-[#002A41]">
                {editingSchedule ? "শিডিউল সম্পাদনা" : "নতুন শিডিউল"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">দিন</label>
                <select
                  value={form.day_of_week}
                  onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:border-[#4CAF50] outline-none"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{DAYS_BN[d]}</option>
                  ))}
                </select>
              </div>
              
              {/* 🌟 Start Time */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">ক্লাস শুরু</label>
                <div className="flex gap-2 items-center">
                  <select value={startHour} onChange={(e) => setStartHour(e.target.value)} className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 bg-white focus:border-[#4CAF50] outline-none text-center font-bold">
                    {Array.from({ length: 12 }, (_, i) => {
                      const h = (i + 1).toString().padStart(2, "0");
                      return <option key={h} value={h}>{h}</option>;
                    })}
                  </select>
                  <span className="font-bold text-slate-400">:</span>
                  <select value={startMinute} onChange={(e) => setStartMinute(e.target.value)} className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 bg-white focus:border-[#4CAF50] outline-none text-center font-bold">
                    {["00", "15", "30", "45"].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select value={startAmpm} onChange={(e) => setStartAmpm(e.target.value)} className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 bg-white focus:border-[#4CAF50] outline-none text-center font-bold">
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              {/* 🌟 End Time */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">ক্লাস শেষ</label>
                <div className="flex gap-2 items-center">
                  <select value={endHour} onChange={(e) => setEndHour(e.target.value)} className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 bg-white focus:border-[#4CAF50] outline-none text-center font-bold">
                    {Array.from({ length: 12 }, (_, i) => {
                      const h = (i + 1).toString().padStart(2, "0");
                      return <option key={h} value={h}>{h}</option>;
                    })}
                  </select>
                  <span className="font-bold text-slate-400">:</span>
                  <select value={endMinute} onChange={(e) => setEndMinute(e.target.value)} className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 bg-white focus:border-[#4CAF50] outline-none text-center font-bold">
                    {["00", "15", "30", "45"].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select value={endAmpm} onChange={(e) => setEndAmpm(e.target.value)} className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 bg-white focus:border-[#4CAF50] outline-none text-center font-bold">
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#4CAF50] hover:bg-[#388E3C] text-white py-3 rounded-lg font-bold transition flex justify-center items-center gap-2 mt-4"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                সেভ করুন
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminSchedule() {
  return (
    <Suspense fallback={<div className="text-center py-20">লোড হচ্ছে...</div>}>
      <ScheduleContent />
    </Suspense>
  );
}