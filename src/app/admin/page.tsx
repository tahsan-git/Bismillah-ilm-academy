import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Users, GraduationCap, ArrowRight } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();
  
  // ডাটাবেস থেকে মোট আবেদনের সংখ্যা বের করা
  const { count: trialCount } = await supabase.from("trial_classes").select("*", { count: 'exact', head: true });
  const { count: teacherCount } = await supabase.from("teacher_applications").select("*", { count: 'exact', head: true });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">স্বাগতম, অ্যাডমিন!</h1>
        <p className="text-body mt-1">এখান থেকে আপনি আপনার ওয়েবসাইটের সবকিছু কন্ট্রোল করতে পারবেন।</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* ট্রায়াল ক্লাস কার্ড */}
        <Link href="/admin/trials" className="block group">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group-hover:border-[#4CAF50] transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#4CAF50]/10 text-[#4CAF50] flex items-center justify-center">
                <Users size={24} />
              </div>
              <ArrowRight className="text-slate-300 group-hover:text-[#4CAF50] transition" />
            </div>
            <h3 className="text-sm font-bold text-slate-500 mb-1 group-hover:text-[#4CAF50]">মোট ট্রায়াল ক্লাস আবেদন</h3>
            <p className="text-4xl font-extrabold text-ink">{trialCount || 0}</p>
          </div>
        </Link>

        {/* শিক্ষক আবেদন কার্ড */}
        <Link href="/admin/teachers-app" className="block group">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group-hover:border-[#4CAF50] transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#4CAF50]/10 text-[#4CAF50] flex items-center justify-center">
                <GraduationCap size={24} />
              </div>
              <ArrowRight className="text-slate-300 group-hover:text-[#4CAF50] transition" />
            </div>
            <h3 className="text-sm font-bold text-slate-500 mb-1 group-hover:text-[#4CAF50]">মোট শিক্ষক আবেদন</h3>
            <p className="text-4xl font-extrabold text-ink">{teacherCount || 0}</p>
          </div>
        </Link>
      </div>

      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
        <h3 className="text-lg font-bold text-blue-800 mb-2">অ্যাডমিন প্যানেল সেটআপ সম্পন্ন!</h3>
        <p className="text-blue-600 text-sm">
          এখন থেকে যে কেউ ওয়েবসাইট থেকে ট্রায়াল ক্লাস বা শিক্ষক আবেদন করলে, তা এই প্যানেলে দেখতে পাবেন।
        </p>
      </div>
    </div>
  );
}