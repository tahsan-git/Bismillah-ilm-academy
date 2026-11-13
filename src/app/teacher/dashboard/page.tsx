"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  Calendar,
  CheckSquare,
  FileText,
  Clock,
  ArrowRight,
  Loader2,
  Bell,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

// 🌟 Helper Function: Class ashonno (upcoming) kina check korar jonno
const isClassUpcoming = (timeSlot: string) => {
  try {
    const startTimeString = timeSlot.split(" - ")[0];
    const [time, modifier] = startTimeString.split(" ");
    let [hours] = time.split(":").map(Number);
    const [, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    const now = new Date();
    const classStartTime = new Date();
    classStartTime.setHours(hours, minutes, 0, 0);

    return now < classStartTime;
  } catch (e) {
    return true;
  }
};

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayClasses: 0,
    completedClasses: 0,
    pendingReports: 0,
  });

  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const teacherId = localStorage.getItem("teacher_id");
      if (!teacherId) {
        window.location.href = "/teacher/login";
        return;
      }

      // ১. প্রোফাইল আনা
      const { data: profileData } = await supabase
        .from("teachers_profile")
        .select("*")
        .eq("id", teacherId)
        .single();

      if (profileData) setProfile(profileData);

      // ২. মোট শিক্ষার্থী সংখ্যা
      const { count: studentCount } = await supabase
        .from("teacher_students")
        .select("*", { count: "exact", head: true })
        .eq("teacher_id", teacherId);

      // ৩. আজকের ক্লাস রুটিন
      const daysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const todayEn = daysEn[new Date().getDay()];

      const { data: schedulesData } = await supabase
        .from("class_schedules")
        .select(`
          *,
          students (
            name,
            phone
          )
        `)
        .eq("teacher_id", teacherId)
        .eq("day_of_week", todayEn);

      if (schedulesData) {
        // 🌟 Sudhu ashonno class gulo filter kora hocche
        const upcomingClasses = schedulesData.filter((cls) => isClassUpcoming(cls.time_slot));
        setTodaySchedule(upcomingClasses);
      }

      // ৪. নোটিশ বোর্ড
      const { data: noticeData } = await supabase
        .from("notices")
        .select("*")
        .in("target_audience", ["all", "teacher"])
        .order("is_important", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(3);

      if (noticeData) setNotices(noticeData);

      setStats(prev => ({
        ...prev,
        totalStudents: studentCount || 0,
        todayClasses: schedulesData?.filter((cls) => isClassUpcoming(cls.time_slot)).length || 0,
      }));

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-[#002A41]" size={40} />
      </div>
    );
  }

  const todayDate = new Date().toLocaleDateString("bn-BD", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const statsData = [
    { label: "মোট শিক্ষার্থী", value: stats.totalStudents, icon: Users, color: "bg-[#002A41]/10 text-[#002A41]", href: "/teacher/students" },
    { label: "আজকের ক্লাস", value: stats.todayClasses, icon: Calendar, color: "bg-[#4CAF50]/10 text-[#4CAF50]", href: "/teacher/schedule" },
    { label: "সম্পন্ন ক্লাস", value: stats.completedClasses, icon: CheckSquare, color: "bg-blue-50 text-blue-600", href: "/teacher/reports" },
    { label: "পেন্ডিং রিপোর্ট", value: stats.pendingReports, icon: FileText, color: "bg-orange-50 text-orange-600", href: "/teacher/reports" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">

      {/* ওয়েলকাম হেডার */}
      <div className="bg-[#002A41] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-slate-300 text-sm mb-1">{todayDate}</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-[#FFD700]">
            আসসালামু আলাইকুম, {profile?.name || "শিক্ষক"}!
          </h1>
          <p className="text-slate-300 text-sm md:text-base">আজকের দিনটি আপনার জন্য বরকতময় হোক। চলুন আপনার কার্যক্রম দেখে নিই।</p>
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full"></div>
        <div className="absolute right-20 -bottom-10 w-32 h-32 bg-white/5 rounded-full"></div>
      </div>

      {/* স্ট্যাটস কার্ড */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={index} href={stat.href} className="block group">
              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:border-[#4CAF50] hover:shadow-md transition h-full">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon size={20} className="md:w-6 md:h-6" />
                </div>
                <div>
                  <p className="text-xs md:text-sm font-bold text-slate-500 mb-1">{stat.label}</p>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#002A41]">{stat.value}</h2>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 🌟 নোটিশ বোর্ড (Jodi notice thake tobei show hobe) */}
      {notices.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#002A41] flex items-center gap-2">
              <Bell size={20} className="text-[#4CAF50]" /> নোটিশ বোর্ড
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {notices.map((n) => (
              <div key={n.id} className={`p-4 rounded-xl border ${n.is_important ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  {n.is_important && <AlertTriangle size={16} className="text-red-500" />}
                  {n.title}
                </h3>
                <div className="text-sm text-slate-600 mt-2 whitespace-pre-wrap leading-relaxed">
                  {n.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ক্লাস শিডিউল এবং নোটিফিকেশন */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* আজকের আসন্ন ক্লাস শিডিউল */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#002A41] flex items-center gap-2">
              <Clock size={20} className="text-[#4CAF50]" /> আজকের ক্লাস শিডিউল
            </h2>
            <Link href="/teacher/schedule" className="text-sm font-bold text-[#4CAF50] hover:underline flex items-center gap-1">
              সব দেখুন <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-4">
            {todaySchedule.length === 0 ? (
              <div className="text-center text-slate-500 py-6">আজ আর কোনো ক্লাস বাকি নেই বা ক্লাস নেই।</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {todaySchedule.map((cls, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
                    <div className="w-12 h-12 rounded-full bg-[#4CAF50] text-white flex items-center justify-center font-bold text-lg shrink-0">
                      <Clock size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{cls.students?.name || "শিক্ষার্থী"}</p>
                      <p className="text-sm text-slate-600 font-medium">{cls.time_slot}</p>
                      <span className="text-xs text-green-600 font-bold flex items-center gap-1 mt-1">
                        <CheckCircle2 size={12} /> আসন্ন
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* নোটিফিকেশন */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-bold text-[#002A41] flex items-center gap-2">
              <Bell size={20} className="text-red-500" /> নোটিফিকেশন
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {todaySchedule.length > 0 ? (
              <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0 animate-pulse"></div>
                <div>
                  <p className="text-sm font-bold text-red-800">আজ আপনার {todaySchedule.length}টি ক্লাস বাকি আছে!</p>
                  <p className="text-xs text-red-600 mt-1">সময়মতো ক্লাস শুরু করুন।</p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm text-slate-500 text-center">আজ আর কোনো ক্লাস নেই।</p>
              </div>
            )}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-sm font-bold text-slate-700">রিপোর্ট রিমাইন্ডার</p>
              <p className="text-xs text-slate-500 mt-1">ক্লাস শেষে রিপোর্ট জমা দিতে ভুলবেন না।</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}