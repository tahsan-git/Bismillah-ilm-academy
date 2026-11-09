import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Users, GraduationCap, BookOpen, Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();
  
  // ১. স্টুডেন্টদের ডাটা
  const { count: activeStudents } = await supabase.from("students").select("*", { count: 'exact', head: true }).ilike("status", "active");
  const { count: pendingStudents } = await supabase.from("students").select("*", { count: 'exact', head: true }).ilike("status", "pending");

  // ২. শিক্ষকদের ডাটা
  const { count: activeTeachers } = await supabase.from("teachers_profile").select("*", { count: 'exact', head: true }).ilike("status", "active");
  const { count: pendingTeachers } = await supabase.from("teachers").select("*", { count: 'exact', head: true }).ilike("status", "pending");

  // ৩. ট্রায়াল ক্লাসের ডাটা
  const { count: totalTrials } = await supabase.from("trial_classes").select("*", { count: 'exact', head: true });
  const { count: pendingTrials } = await supabase.from("trial_classes").select("*", { count: 'exact', head: true }).ilike("status", "pending");

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">স্বাগতম, অ্যাডমিন!</h1>
        <p className="text-body mt-1">এখান থেকে আপনি আপনার ওয়েবসাইটের সবকিছু কন্ট্রোল করতে পারবেন।</p>
      </div>
      
      {/* ================= মূল ৩টি কার্ড (অ্যাক্টিভ) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* 🌟 অ্যাক্টিভ স্টুডেন্ট (লিংকে ?tab=active যুক্ত করা হলো) */}
        <Link href="/admin/students?tab=active" className="block group">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group-hover:border-[#4CAF50] transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                <Users size={24} />
              </div>
              <ArrowRight className="text-slate-300 group-hover:text-[#4CAF50] transition" />
            </div>
            <h3 className="text-sm font-bold text-slate-500 mb-1 group-hover:text-[#4CAF50]">সক্রিয় শিক্ষার্থী</h3>
            <p className="text-4xl font-extrabold text-ink">{activeStudents || 0}</p>
          </div>
        </Link>

        {/* 🌟 অ্যাক্টিভ শিক্ষক (লিংকে ?tab=active যুক্ত করা হলো) */}
        <Link href="/admin/teachers?tab=active" className="block group">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group-hover:border-[#4CAF50] transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#4CAF50]/10 text-[#4CAF50] flex items-center justify-center">
                <GraduationCap size={24} />
              </div>
              <ArrowRight className="text-slate-300 group-hover:text-[#4CAF50] transition" />
            </div>
            <h3 className="text-sm font-bold text-slate-500 mb-1 group-hover:text-[#4CAF50]">সক্রিয় শিক্ষক</h3>
            <p className="text-4xl font-extrabold text-ink">{activeTeachers || 0}</p>
          </div>
        </Link>

        {/* মোট ট্রায়াল ক্লাস */}
        <Link href="/admin/trials" className="block group">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group-hover:border-[#4CAF50] transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#F2A007]/10 text-[#F2A007] flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <ArrowRight className="text-slate-300 group-hover:text-[#4CAF50] transition" />
            </div>
            <h3 className="text-sm font-bold text-slate-500 mb-1 group-hover:text-[#4CAF50]">মোট ট্রায়াল ক্লাস আবেদন</h3>
            <p className="text-4xl font-extrabold text-ink">{totalTrials || 0}</p>
          </div>
        </Link>
      </div>

      {/* ================= নিচের ৩টি স্ট্যাটাস কার্ড (অপেক্ষমাণ) ================= */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-ink">অপেক্ষমাণ আবেদনসমূহ</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 🌟 অপেক্ষমাণ স্টুডেন্ট (লিংকে ?tab=pending যুক্ত করা হলো) */}
        <Link href="/admin/students?tab=pending" className="block">
          <div className="bg-[#FFF8E7] p-6 rounded-2xl border border-[#F2A007]/20 hover:shadow-md transition">
            <div className="flex items-center gap-2 text-[#F2A007] font-bold mb-2">
              <Clock size={18} /> অপেক্ষমাণ স্টুডেন্ট
            </div>
            <p className="text-3xl font-extrabold text-ink">{pendingStudents || 0}</p>
          </div>
        </Link>

        {/* 🌟 অপেক্ষমাণ শিক্ষক (লিংকে ?tab=pending যুক্ত করা হলো) */}
        <Link href="/admin/teachers-app?tab=pending" className="block">
          <div className="bg-[#F0FDF4] p-6 rounded-2xl border border-[#4CAF50]/20 hover:shadow-md transition">
            <div className="flex items-center gap-2 text-[#4CAF50] font-bold mb-2">
              <CheckCircle2 size={18} /> অপেক্ষমাণ শিক্ষক
            </div>
            <p className="text-3xl font-extrabold text-ink">{pendingTeachers || 0}</p>
          </div>
        </Link>

        {/* 🌟 অপেক্ষমাণ ট্রায়াল ক্লাস */}
        <Link href="/admin/trials?tab=pending" className="block">
          <div className="bg-[#FEF2F2] p-6 rounded-2xl border border-red-200 hover:shadow-md transition">
            <div className="flex items-center gap-2 text-red-500 font-bold mb-2">
              <XCircle size={18} /> অপেক্ষমাণ ট্রায়াল ক্লাস
            </div>
            <p className="text-3xl font-extrabold text-ink">{pendingTrials || 0}</p>
          </div>
        </Link>

      </div>
    </div>
  );
}