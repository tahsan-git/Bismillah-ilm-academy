"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { BookOpen, Clock, Bell, User } from "lucide-react";

export default function StudentDashboard() {
  const [student, setStudent] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/student/login");
        return;
      }

      // ১. স্টুডেন্টের ডাটা
      const { data: studentData } = await supabase.from("students").select("*").eq("user_id", user.id).single();
      setStudent(studentData);

      // ২. ক্লাস রুটিন (যদি থাকে)
      if (studentData) {
        const { data: scheduleData } = await supabase
          .from("class_schedules")
          .select("*, teachers_profile(name, image_url)")
          .eq("student_id", studentData.id);
        setSchedules(scheduleData || []);
      }

      // ৩. নোটিশ (সব স্টুডেন্টের জন্য)
      const { data: noticeData } = await supabase
        .from("announcements")
        .select("*")
        .in("target_audience", ["all", "student"])
        .order("created_at", { ascending: false })
        .limit(5);
      setAnnouncements(noticeData || []);

      setLoading(false);
    };
    fetchData();
  }, [router, supabase]);

  if (loading) return <div className="p-8 text-center">লোড হচ্ছে...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ওয়েলকাম কার্ড */}
      <div className="bg-[#4CAF50] rounded-3xl p-8 text-white flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-3xl font-bold mb-2">আসসালামু আলাইকুম, {student?.name}!</h1>
          <p className="text-white/80">আপনার আজকের পড়াশোনা শুরু করা যাক।</p>
        </div>
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
          <User size={40} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ক্লাস রুটিন */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
            <Clock className="text-[#4CAF50]" /> ক্লাস রুটিন
          </h2>
          <div className="space-y-3">
            {schedules.length === 0 ? (
              <p className="text-slate-500 text-sm">এখনো কোনো ক্লাস রুটিন তৈরি হয়নি।</p>
            ) : (
              schedules.map((s) => (
                <div key={s.id} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                  <div>
                    <p className="font-bold text-ink">{s.day_of_week}</p>
                    <p className="text-sm text-slate-600">{s.time_slot}</p>
                    <p className="text-xs text-[#4CAF50] mt-1 font-bold">শিক্ষক: {s.teachers_profile?.name}</p>
                  </div>
                  <BookOpen size={20} className="text-slate-400" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* নোটিশ বোর্ড */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
            <Bell className="text-[#4CAF50]" /> নোটিশ বোর্ড
          </h2>
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-slate-500 text-sm">কোনো নতুন নোটিশ নেই।</p>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="p-4 bg-slate-50 rounded-xl border-l-4 border-[#4CAF50]">
                  <h3 className="font-bold text-ink text-sm">{a.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{a.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}