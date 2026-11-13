"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { 
  BookOpen, 
  Calendar, 
  MessageSquare,
  Clock,
  ArrowRight,
  Loader2,
  Bell,
  AlertTriangle,
  UserCheck,
  Library,
  AlertCircle,
  User,
} from "lucide-react";

// Helper Function: Class ashonno (upcoming) kina check korar jonno
const isClassUpcoming = (timeSlot: string) => {
  try {
    const startTimeString = timeSlot.split(" - ")[0]; 
    const [time, modifier] = startTimeString.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    
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

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [teacher, setTeacher] = useState<any>(null);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<any[]>([]);
  const [pendingHomework, setPendingHomework] = useState(0);
  const [notices, setNotices] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const studentId = localStorage.getItem("student_id");
      if (!studentId) {
        window.location.href = "/student/login";
        return;
      }

      // ১. স্টুডেন্ট প্রোফাইল
      const { data: profileData } = await supabase
        .from("students")
        .select("*")
        .eq("id", studentId)
        .single();

      if (profileData) setStudent(profileData);

      // ২. টিচার ইনফরমেশন
      const { data: assignedData } = await supabase
        .from("teacher_students")
        .select("teacher_id")
        .eq("student_id", studentId)
        .maybeSingle();

      if (assignedData?.teacher_id) {
        const { data: teacherData } = await supabase
          .from("teachers_profile")
          .select("name, role_bn, phone, image_url")
          .eq("id", assignedData.teacher_id)
          .maybeSingle();
        if (teacherData) setTeacher(teacherData);
      }

      // ৩. আজকের ক্লাস রুটিন (Filtered)
      const daysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const todayEn = daysEn[new Date().getDay()];
      
      const { data: schedulesData } = await supabase
        .from("class_schedules")
        .select("*")
        .eq("student_id", studentId)
        .eq("day_of_week", todayEn);

      if (schedulesData) {
        const upcomingClasses = schedulesData.filter((cls) => isClassUpcoming(cls.time_slot));
        setTodaySchedule(upcomingClasses);
      }

      // ৪. সাম্প্রতিক রিপোর্ট
      const { data: reportsData } = await supabase
        .from("class_reports")
        .select(`
          *,
          class_schedules!inner (
            student_id
          )
        `)
        .eq("class_schedules.student_id", studentId)
        .order("created_at", { ascending: false })
        .limit(2);

      if (reportsData) setRecentReports(reportsData);

      // ৫. Teacher er deya Note (Student er kase ashe)
      const { data: notesData } = await supabase
        .from("student_notes")
        .select("*, teachers_profile(name)")
        .eq("student_id", studentId)
        .eq("type", "feedback")
        .order("created_at", { ascending: false })
        .limit(3);

      if (notesData) setRecentFeedback(notesData);

      // ৬. Pending Homework Count
      const { count: hwCount } = await supabase
        .from("homework")
        .select("*", { count: "exact", head: true })
        .eq("student_id", studentId)
        .eq("status", "pending");

      setPendingHomework(hwCount || 0);

      // ৭. নোটিশ বোর্ড
      const { data: noticeData } = await supabase
        .from("notices")
        .select("*")
        .in("target_audience", ["all", "student"])
        .order("is_important", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(3);

      if (noticeData) setNotices(noticeData);

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-[#002A41]" size={40} /></div>;
  }

  const todayDate = new Date().toLocaleDateString("bn-BD", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  // 🌟 Stat Cards (Notice er upore)
  const statsData = [
    { label: "হোমওয়ার্ক", value: pendingHomework, icon: BookOpen, color: "bg-orange-50 text-orange-600", href: "/student/homework" },
    { label: "ক্লাস রিপোর্ট", value: recentReports.length, icon: MessageSquare, color: "bg-blue-50 text-blue-600", href: "/student/reports" },
    { label: "শিক্ষকের মতামত", value: recentFeedback.length, icon: UserCheck, color: "bg-purple-50 text-purple-600", href: "/student/feedback" },
  ];

  // 🌟 Menu Cards (Niche grid e)
  const menuCards = [
    { label: "আমার রুটিন", icon: Calendar, color: "bg-blue-50 text-blue-600", href: "/student/schedule", desc: "সাপ্তাহিক ক্লাস রুটিন" },
    { label: "ডিজিটাল লাইব্রেরি", icon: Library, color: "bg-teal-50 text-teal-600", href: "/student/library", desc: "বই ও স্টাডি মেটেরিয়াল" },
    { label: "কমপ্লেইন বক্স", icon: AlertCircle, color: "bg-red-50 text-red-600", href: "/student/complaints", desc: "অভিযোগ জানান" },
    { label: "প্রোফাইল", icon: User, color: "bg-slate-100 text-slate-700", href: "/student/profile", desc: "আপনার তথ্য" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* ১. ওয়েলকাম হেডার */}
      <div className="bg-[#002A41] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-slate-300 text-sm mb-1">{todayDate}</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-[#FFD700]">
            আসসালামু আলাইকুম, {student?.name || "শিক্ষার্থী"}!
          </h1>
          <p className="text-slate-300 text-sm md:text-base">আজকের দিনটি আপনার জন্য বরকতময় হোক। চলুন আপনার পড়াশোনার অগ্রগতি দেখে নিই।</p>
        </div>
        
        {teacher && (
          <div className="relative z-10 mt-5 inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10">
            <div className="w-8 h-8 rounded-full bg-[#4CAF50] flex items-center justify-center text-white shrink-0">
              {teacher.image_url ? (
                <img src={teacher.image_url} alt={teacher.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <UserCheck size={16} />
              )}
            </div>
            <div>
              <p className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">আপনার শিক্ষক</p>
              <p className="text-sm font-bold text-white">{teacher.name}</p>
            </div>
          </div>
        )}

        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full"></div>
        <div className="absolute right-20 -bottom-10 w-32 h-32 bg-white/5 rounded-full"></div>
      </div>

      {/* ২. Stat Cards (Homework, Report, Feedback) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* ৩. নোটিশ বোর্ড (Jodi notice thake tobei show hobe) */}
      {notices.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#002A41] flex items-center gap-2">
              <Bell size={20} className="text-orange-500" /> নোটিশ বোর্ড
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

      {/* ৪. আজকের ক্লাস (Sob somoy visible thakbe) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#002A41] flex items-center gap-2">
            <Clock size={20} className="text-[#4CAF50]" /> আজকের ক্লাস
          </h2>
          <Link href="/student/schedule" className="text-sm font-bold text-[#4CAF50] hover:underline flex items-center gap-1">
            সব দেখুন <ArrowRight size={14} />
          </Link>
        </div>
        <div className="p-4">
          {todaySchedule.length === 0 ? (
            <div className="text-center text-slate-500 py-6">আজ আর কোনো ক্লাস বাকি নেই বা ক্লাস নেই।</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {todaySchedule.map((cls, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#4CAF50] text-white flex items-center justify-center font-bold text-lg shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">আসন্ন ক্লাস</p>
                    <p className="text-sm text-slate-600 font-medium">{cls.time_slot}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ৫. Menu Section Cards */}
      <div>
        <h2 className="text-lg font-bold text-[#002A41] mb-4">আপনার মেনু</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {menuCards.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link key={idx} href={item.href} className="block group">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-[#4CAF50] hover:shadow-md transition h-full flex flex-col">
                  <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 mb-1">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}