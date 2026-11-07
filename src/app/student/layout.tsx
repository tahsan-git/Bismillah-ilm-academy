// src/app/student/layout.tsx
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LayoutDashboard, LogOut } from "lucide-react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // 🌟 এখানে /student/login এবং /student/register দুটোই বাদ দেওয়া হলো
  if (pathname === "/student/login" || pathname === "/student/register") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/student/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <span className="text-xl font-bold text-[#4CAF50]">স্টুডেন্ট প্যানেল</span>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          <Link href="/student/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname === "/student/dashboard" ? "bg-[#4CAF50] text-white font-bold" : "text-slate-600 hover:bg-slate-50 font-medium"}`}>
            <LayoutDashboard size={20} /> ড্যাশবোর্ড
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 font-medium transition">
            <LogOut size={20} /> লগআউট
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}