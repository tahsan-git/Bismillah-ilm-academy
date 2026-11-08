
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Trial applications
  const { count: trialCount } = await supabase
    .from("trial_classes")
    .select("*", { count: "exact", head: true });

  // All teacher applications
  const { count: teacherCount } = await supabase
    .from("teachers")
    .select("*", { count: "exact", head: true });

  // Pending teacher applications
  const { count: pendingCount } = await supabase
    .from("teachers")
    .select("*", { count: "exact", head: true })
    .eq("status", "Pending");

  // Approved teachers
  const { count: approvedCount } = await supabase
    .from("teachers")
    .select("*", { count: "exact", head: true })
    .eq("status", "Active");

  // Cancelled applications
  const { count: cancelledCount } = await supabase
    .from("teachers")
    .select("*", { count: "exact", head: true })
    .eq("status", "Cancelled");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">
          স্বাগতম, অ্যাডমিন!
        </h1>
        <p className="mt-1 text-body">
          এখান থেকে আপনি আপনার ওয়েবসাইটের সবকিছু কন্ট্রোল করতে পারবেন।
        </p>
      </div>

      {/* Main Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">

        {/* Trial Classes */}
        <Link href="/admin/trials" className="group block">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition group-hover:border-[#4CAF50]">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4CAF50]/10 text-[#4CAF50]">
                <Users size={24} />
              </div>
              <ArrowRight className="text-slate-300 transition group-hover:text-[#4CAF50]" />
            </div>

            <h3 className="mb-1 text-sm font-bold text-slate-500 group-hover:text-[#4CAF50]">
              মোট ট্রায়াল ক্লাস আবেদন
            </h3>

            <p className="text-4xl font-extrabold text-ink">
              {trialCount ?? 0}
            </p>
          </div>
        </Link>

        {/* Total Teacher Applications */}
        <Link href="/admin/teachers-app" className="group block">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition group-hover:border-[#4CAF50]">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4CAF50]/10 text-[#4CAF50]">
                <GraduationCap size={24} />
              </div>
              <ArrowRight className="text-slate-300 transition group-hover:text-[#4CAF50]" />
            </div>

            <h3 className="mb-1 text-sm font-bold text-slate-500 group-hover:text-[#4CAF50]">
              মোট শিক্ষক আবেদন
            </h3>

            <p className="text-4xl font-extrabold text-ink">
              {teacherCount ?? 0}
            </p>
          </div>
        </Link>
      </div>

      {/* Teacher Application Statistics */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-bold text-ink">
          শিক্ষক আবেদনের বিস্তারিত
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* Pending */}
          <Link href="/admin/teachers-app">
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-5 transition hover:shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-amber-600">
                <Clock size={20} />
                <span className="text-sm font-semibold">
                  অপেক্ষমাণ আবেদন
                </span>
              </div>

              <p className="text-3xl font-bold text-amber-700">
                {pendingCount ?? 0}
              </p>
            </div>
          </Link>

          {/* Approved */}
          <Link href="/admin/teachers-app">
            <div className="rounded-xl border border-green-100 bg-green-50 p-5 transition hover:shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-green-600">
                <CheckCircle size={20} />
                <span className="text-sm font-semibold">
                  অনুমোদিত শিক্ষক
                </span>
              </div>

              <p className="text-3xl font-bold text-green-700">
                {approvedCount ?? 0}
              </p>
            </div>
          </Link>

          {/* Cancelled */}
          <Link href="/admin/teachers-app">
            <div className="rounded-xl border border-red-100 bg-red-50 p-5 transition hover:shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-red-600">
                <XCircle size={20} />
                <span className="text-sm font-semibold">
                  বাতিল আবেদন
                </span>
              </div>

              <p className="text-3xl font-bold text-red-700">
                {cancelledCount ?? 0}
              </p>
            </div>
          </Link>

        </div>
      </div>

      {/* Information */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
        <h3 className="mb-2 text-lg font-bold text-blue-800">
          অ্যাডমিন প্যানেল
        </h3>

        <p className="text-sm text-blue-600">
          নতুন শিক্ষক আবেদন, অনুমোদিত শিক্ষক এবং বাতিল আবেদন
          এখন একই teachers টেবিল থেকে পরিচালিত হচ্ছে।
        </p>
      </div>
    </div>
  );
}