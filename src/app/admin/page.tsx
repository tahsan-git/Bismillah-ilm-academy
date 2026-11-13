"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  UserPlus,
  FileText,
  AlertCircle,
  Bell,
  Loader2,
  ArrowRight,
  Send,
  CheckCircle2,
} from "lucide-react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    studentApps: 0,
    teacherApps: 0,
    trialApps: 0,
    complaints: 0,
  });
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [recentTeachers, setRecentTeachers] = useState<any[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);

  // Notice quick form
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    content: "",
    target_audience: "all",
    is_important: false,
  });
  const [sendingNotice, setSendingNotice] = useState(false);
  const [noticeSuccess, setNoticeSuccess] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 1. Pending counts
      const [studentCount, teacherCount, trialCount, complaintCount] =
        await Promise.all([
          supabase
            .from("students")
            .select("*", { count: "exact", head: true })
            .eq("status", "Pending"),
          supabase
            .from("teachers_profile")
            .select("*", { count: "exact", head: true })
            .eq("status", "Pending"),
          supabase
            .from("trial_classes")
            .select("*", { count: "exact", head: true })
            .eq("status", "Pending"),
          supabase
            .from("complaints")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
        ]);

      setStats({
        studentApps: studentCount.count || 0,
        teacherApps: teacherCount.count || 0,
        trialApps: trialCount.count || 0,
        complaints: complaintCount.count || 0,
      });

      // 2. Recent students (pending)
      const { data: students } = await supabase
        .from("students")
        .select("id, name, phone, email, created_at, status")
        .eq("status", "Pending")
        .order("created_at", { ascending: false })
        .limit(5);
      if (students) setRecentStudents(students);

      // 3. Recent teachers (pending)
      const { data: teachers } = await supabase
        .from("teachers_profile")
        .select("id, name, email, created_at, status")
        .eq("status", "Pending")
        .order("created_at", { ascending: false })
        .limit(5);
      if (teachers) setRecentTeachers(teachers);

      // 4. Recent complaints
      const { data: complaints } = await supabase
        .from("complaints")
        .select("id, subject, status, created_at, students(name)")
        .order("created_at", { ascending: false })
        .limit(5);
      if (complaints) setRecentComplaints(complaints);

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) return;

    setSendingNotice(true);
    const { error } = await supabase.from("notices").insert({
      title: noticeForm.title.trim(),
      content: noticeForm.content.trim(),
      target_audience: noticeForm.target_audience,
      is_important: noticeForm.is_important,
    });

    if (!error) {
      setNoticeForm({
        title: "",
        content: "",
        target_audience: "all",
        is_important: false,
      });
      setNoticeSuccess(true);
      setTimeout(() => setNoticeSuccess(false), 3000);
    } else {
      alert("নোটিশ পাঠাতে সমস্যা হয়েছে: " + error.message);
    }
    setSendingNotice(false);
  };

  const statCards = [
    {
      label: "শিক্ষার্থী আবেদন",
      value: stats.studentApps,
      icon: Users,
      href: "/admin/students?tab=pending",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "শিক্ষক আবেদন",
      value: stats.teacherApps,
      icon: UserPlus,
      href: "/admin/teachers-app",
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "ট্রায়াল আবেদন",
      value: stats.trialApps,
      icon: FileText,
      href: "/admin/trials",
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "কমপ্লেইন",
      value: stats.complaints,
      icon: AlertCircle,
      href: "/admin/complaints",
      color: "bg-red-50 text-red-600",
    },
  ];

  const todayDate = new Date().toLocaleDateString("bn-BD", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-[#002A41]" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="bg-[#002A41] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-slate-300 text-sm mb-1">{todayDate}</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-[#FFD700]">
            স্বাগতম, অ্যাডমিন!
          </h1>
          <p className="text-slate-300 text-sm md:text-base">
            আজকের পেন্ডিং কাজগুলো দেখে নিন।
          </p>
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full"></div>
        <div className="absolute right-20 -bottom-10 w-32 h-32 bg-white/5 rounded-full"></div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link key={i} href={stat.href} className="block group">
              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-[#4CAF50] hover:shadow-md transition h-full">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                >
                  <Icon size={20} className="md:w-6 md:h-6" />
                </div>
                <p className="text-xs md:text-sm font-bold text-slate-500 mb-1">
                  {stat.label}
                </p>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#002A41]">
                  {stat.value}
                </h2>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Notice Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <Bell size={20} className="text-[#4CAF50]" />
          <h2 className="text-lg font-bold text-[#002A41]">দ্রুত নোটিশ পাঠান</h2>
        </div>
        <form onSubmit={handleNoticeSubmit} className="p-5 space-y-4">
          <input
            type="text"
            placeholder="নোটিশের শিরোনাম"
            value={noticeForm.title}
            onChange={(e) =>
              setNoticeForm({ ...noticeForm, title: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002A41]/20 text-sm"
          />
          <textarea
            placeholder="নোটিশের বিস্তারিত... (Enter চাপলে নতুন লাইন হবে)"
            value={noticeForm.content}
            onChange={(e) =>
              setNoticeForm({ ...noticeForm, content: e.target.value })
            }
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002A41]/20 resize-none text-sm"
          />
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <select
                value={noticeForm.target_audience}
                onChange={(e) =>
                  setNoticeForm({
                    ...noticeForm,
                    target_audience: e.target.value,
                  })
                }
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#002A41]/20"
              >
                <option value="all">সবার জন্য</option>
                <option value="student">শিক্ষার্থীদের জন্য</option>
                <option value="teacher">শিক্ষকদের জন্য</option>
              </select>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noticeForm.is_important}
                  onChange={(e) =>
                    setNoticeForm({
                      ...noticeForm,
                      is_important: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded accent-[#4CAF50]"
                />
                গুরুত্বপূর্ণ
              </label>
            </div>
            <button
              type="submit"
              disabled={
                sendingNotice ||
                !noticeForm.title.trim() ||
                !noticeForm.content.trim()
              }
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#4CAF50] text-white font-bold text-sm hover:bg-[#388E3C] disabled:opacity-50 transition"
            >
              {sendingNotice ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Send size={16} />
              )}
              নোটিশ পাঠান
            </button>
          </div>
          {noticeSuccess && (
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-4 py-2.5 rounded-xl">
              <CheckCircle2 size={16} /> নোটিশ সফলভাবে পাঠানো হয়েছে!
            </div>
          )}
        </form>
      </div>

      {/* Recent Lists */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Student Applications */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#002A41] flex items-center gap-2">
              <Users size={18} className="text-blue-500" /> সাম্প্রতিক শিক্ষার্থী আবেদন
            </h2>
            <Link
              href="/admin/students?tab=pending"
              className="text-sm font-bold text-[#4CAF50] hover:underline flex items-center gap-1"
            >
              সব দেখুন <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-4">
            {recentStudents.length === 0 ? (
              <p className="text-center text-slate-400 py-6 text-sm">
                কোনো পেন্ডিং আবেদন নেই।
              </p>
            ) : (
              <div className="space-y-2">
                {recentStudents.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 transition"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">
                        {s.name}
                      </p>
                      <p className="text-xs text-slate-500">{s.phone}</p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                      পেন্ডিং
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Teacher Applications */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#002A41] flex items-center gap-2">
              <UserPlus size={18} className="text-purple-500" /> সাম্প্রতিক শিক্ষক আবেদন
            </h2>
            <Link
              href="/admin/teachers-app"
              className="text-sm font-bold text-[#4CAF50] hover:underline flex items-center gap-1"
            >
              সব দেখুন <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-4">
            {recentTeachers.length === 0 ? (
              <p className="text-center text-slate-400 py-6 text-sm">
                কোনো পেন্ডিং আবেদন নেই।
              </p>
            ) : (
              <div className="space-y-2">
                {recentTeachers.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 transition"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">
                        {t.name}
                      </p>
                      <p className="text-xs text-slate-500">{t.email}</p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                      পেন্ডিং
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#002A41] flex items-center gap-2">
            <AlertCircle size={18} className="text-red-500" /> সাম্প্রতিক কমপ্লেইন
          </h2>
          <Link
            href="/admin/complaints"
            className="text-sm font-bold text-[#4CAF50] hover:underline flex items-center gap-1"
          >
            সব দেখুন <ArrowRight size={14} />
          </Link>
        </div>
        <div className="p-4">
          {recentComplaints.length === 0 ? (
            <p className="text-center text-slate-400 py-6 text-sm">
              কোনো কমপ্লেইন নেই।
            </p>
          ) : (
            <div className="space-y-2">
              {recentComplaints.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 transition"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">
                      {c.subject}
                    </p>
                    <p className="text-xs text-slate-500">
                      {c.students?.name || "শিক্ষার্থী"}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                      c.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : c.status === "in_progress"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {c.status === "resolved"
                      ? "সমাধান"
                      : c.status === "in_progress"
                      ? "চলমান"
                      : "পেন্ডিং"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}