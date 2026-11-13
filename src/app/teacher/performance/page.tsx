"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Users, 
  Star,
  Award,
  Loader2
} from "lucide-react";

export default function MyPerformance() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClasses: 0,
    completedClasses: 0,
    cancelledClasses: 0,
    totalHours: 0,
    monthlyAttendance: 0,
    rating: 4.8, // Default rating (pore teacher table theke ashbe)
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    const fetchPerformanceData = async () => {
      setLoading(true);
      const teacherId = localStorage.getItem("teacher_id");
      if (!teacherId) { window.location.href = "/teacher/login"; return; }

      // ১. Teacher er sob schedule ber koro
      const { data: schedules } = await supabase
        .from("class_schedules")
        .select("id")
        .eq("teacher_id", teacherId);

      const scheduleIds = schedules?.map(s => s.id) || [];

      // ২. Sob attendance record ber koro
      let allAttendance: any[] = [];
      if (scheduleIds.length > 0) {
        const { data: attData } = await supabase
          .from("attendance")
          .select("*")
          .in("schedule_id", scheduleIds);
        
        if (attData) allAttendance = attData;
      }

      // ৩. Statistics Calculate
      const totalClasses = scheduleIds.length;
      const completedClasses = allAttendance.length; // Prottek attendance = ekta class complete
      const presentCount = allAttendance.filter(a => a.status === "present").length;
      const monthlyAttendance = completedClasses > 0 ? Math.round((presentCount / completedClasses) * 100) : 0;

      // Total hours (Approx: prottek class 1 hour dhore)
      const totalHours = completedClasses; 

      // Cancelled (Schedules jekhane attendance nei = cancelled ba pending)
      const cancelledClasses = Math.max(0, totalClasses - completedClasses);

      setStats({
        totalClasses,
        completedClasses,
        cancelledClasses,
        totalHours,
        monthlyAttendance,
        rating: 4.8, // Hardcoded (pore rating system add korte parben)
      });

      // ৪. Monthly Data (Group by Month)
      const monthlyMap: Record<string, { classes: number, present: number, total: number }> = {};
      
      allAttendance.forEach(att => {
        const monthStr = new Date(att.date).toLocaleDateString("bn-BD", { month: "long", year: "numeric" });
        if (!monthlyMap[monthStr]) {
          monthlyMap[monthStr] = { classes: 0, present: 0, total: 0 };
        }
        monthlyMap[monthStr].classes += 1;
        monthlyMap[monthStr].total += 1;
        if (att.status === "present") {
          monthlyMap[monthStr].present += 1;
        }
      });

      const monthlyArr = Object.keys(monthlyMap).map(month => {
        const data = monthlyMap[month];
        return {
          month,
          classes: data.classes,
          hours: data.classes, // Approx 1 hour per class
          attendance: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
        };
      });

      // Sort by month (recent first)
      monthlyArr.sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateB.getTime() - dateA.getTime();
      });

      setMonthlyData(monthlyArr);
      setLoading(false);
    };

    fetchPerformanceData();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#002A41]" size={40} /></div>;
  }

  // Achievements (Auto-generated based on stats)
  const achievements = [
    { 
      id: 1, 
      title: `${stats.completedClasses} ক্লাস সম্পন্ন`, 
      icon: Trophy, 
      color: "text-yellow-500", 
      bg: "bg-yellow-50",
      show: stats.completedClasses >= 10
    },
    { 
      id: 2, 
      title: `${stats.monthlyAttendance}% উপস্থিতি`, 
      icon: Award, 
      color: "text-green-500", 
      bg: "bg-green-50",
      show: stats.monthlyAttendance >= 90
    },
    { 
      id: 3, 
      title: "সেরা শিক্ষক", 
      icon: Star, 
      color: "text-orange-500", 
      bg: "bg-orange-50",
      show: stats.rating >= 4.5
    },
  ].filter(a => a.show);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      <div>
        <h1 className="text-2xl font-bold text-[#002A41]">আমার পারফরম্যান্স</h1>
        <p className="text-slate-500 mt-1">আপনার কার্যক্রমের সারসংক্ষেপ ও পরিসংখ্যান</p>
      </div>

      {/* স্ট্যাটস */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 rounded-lg bg-[#002A41]/10 text-[#002A41] flex items-center justify-center mb-3">
            <CheckCircle2 size={20} />
          </div>
          <p className="text-xs text-slate-500 font-bold mb-1">মোট ক্লাস</p>
          <h2 className="text-2xl font-extrabold text-slate-800">{stats.totalClasses}</h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mb-3">
            <TrendingUp size={20} />
          </div>
          <p className="text-xs text-slate-500 font-bold mb-1">সম্পন্ন ক্লাস</p>
          <h2 className="text-2xl font-extrabold text-slate-800">{stats.completedClasses}</h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-3">
            <XCircle size={20} />
          </div>
          <p className="text-xs text-slate-500 font-bold mb-1">বাতিল / পেন্ডিং</p>
          <h2 className="text-2xl font-extrabold text-slate-800">{stats.cancelledClasses}</h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Clock size={20} />
          </div>
          <p className="text-xs text-slate-500 font-bold mb-1">মোট পড়ানোর সময়</p>
          <h2 className="text-2xl font-extrabold text-slate-800">{stats.totalHours} ঘণ্টা</h2>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* রেটিং & Attendance */}
        <div className="space-y-6">
          <div className="bg-[#002A41] p-6 rounded-2xl shadow-md text-white">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Star size={20} className="text-[#FFD700]" /> শিক্ষার্থী রেটিং
            </h3>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-5xl font-extrabold text-[#FFD700]">{stats.rating}</span>
              <span className="text-slate-400 text-sm mb-1">/ ৫.০</span>
            </div>
            <div className="flex gap-1 text-[#FFD700]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill={i < Math.floor(stats.rating) ? "currentColor" : "none"} />
              ))}
            </div>
            <p className="text-xs text-slate-300 mt-4">শিক্ষার্থীদের গড় সন্তুষ্টির মাত্রা</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Users size={18} className="text-[#4CAF50]" /> সামগ্রিক উপস্থিতি
            </h3>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full flex items-center justify-center border-4 border-slate-100">
                <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="36" stroke="#4CAF50" strokeWidth="6" fill="none" strokeDasharray={`${(stats.monthlyAttendance / 100) * 226} 226`} />
                </svg>
                <span className="text-lg font-bold text-slate-800">{stats.monthlyAttendance}%</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">চমৎকার!</p>
                <p className="text-xs text-slate-500 mt-1">আপনার ক্লাসের উপস্থিতির হার।</p>
              </div>
            </div>
          </div>
        </div>

        {/* মাসিক রিপোর্ট */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-[#002A41] flex items-center gap-2">
              <TrendingUp size={18} /> মাসিক পারফরম্যান্স রিপোর্ট
            </h2>
          </div>
          
          {monthlyData.length === 0 ? (
            <div className="p-10 text-center text-slate-500">এখনো কোনো রিপোর্ট নেই।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold">
                  <tr>
                    <th className="px-5 py-3 rounded-tl-lg">মাস</th>
                    <th className="px-5 py-3">ক্লাস</th>
                    <th className="px-5 py-3">সময় (ঘণ্টা)</th>
                    <th className="px-5 py-3 rounded-tr-lg">উপস্থিতি</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyData.map((data, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4 font-bold text-slate-800">{data.month}</td>
                      <td className="px-5 py-4 text-slate-600">{data.classes}</td>
                      <td className="px-5 py-4 text-slate-600">{data.hours}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${data.attendance >= 95 ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                          {data.attendance}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* অ্যাচিভমেন্ট */}
      {achievements.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-[#002A41] mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-[#F2A007]" /> আপনার অর্জনসমূহ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements.map((ach) => {
              const Icon = ach.icon;
              return (
                <div key={ach.id} className={`p-4 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-center gap-4`}>
                  <div className={`w-12 h-12 rounded-full ${ach.bg} ${ach.color} flex items-center justify-center shrink-0`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{ach.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">অভিনন্দন!</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}