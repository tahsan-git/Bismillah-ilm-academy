"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  LayoutDashboard, Users, CalendarDays, CheckSquare, FileText, 
  StickyNote, BookOpen, TrendingUp, Library, Bell, Wallet, 
  MessageSquare, Trophy, Settings, LogOut, Menu, X
} from "lucide-react";
import { useState } from "react";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // লগইন এবং রেজিস্ট্রেশন পেজে সাইডবার দেখানোর দরকার নেই
  if (pathname === "/teacher/login" || pathname === "/teacher/register") {
    return <>{children}</>;
  }

  // 🌟 টেস্ট মোড: বাইপাস অথ (এখানে লগইন চেক নেই)
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) router.push("/teacher/login");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/teacher/login");
    router.refresh();
  };

  const menuItems = [
    { name: "ড্যাশবোর্ড", href: "/teacher/dashboard", icon: LayoutDashboard },
    { name: "আমার শিক্ষার্থী", href: "/teacher/students", icon: Users },
    { name: "ক্লাস রুটিন", href: "/teacher/schedule", icon: CalendarDays },
    { name: "উপস্থিতি", href: "/teacher/attendance", icon: CheckSquare },
    { name: "ক্লাস রিপোর্ট", href: "/teacher/reports", icon: FileText },
    { name: "স্টুডেন্ট নোট", href: "/teacher/notes", icon: StickyNote },
    { name: "হোমওয়ার্ক", href: "/teacher/homework", icon: BookOpen },
    { name: "অগ্রগতি", href: "/teacher/progress", icon: TrendingUp },
    { name: "ডিজিটাল লাইব্রেরি", href: "/teacher/library", icon: Library },
    { name: "নোটিশ", href: "/teacher/notices", icon: Bell },
    { name: "বেতন", href: "/teacher/salary", icon: Wallet },
    { name: "পারফরম্যান্স", href: "/teacher/performance", icon: Trophy },
    { name: "প্রোফাইল ও সেটিংস", href: "/teacher/profile", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#002A41] text-white flex flex-col transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
          <span className="text-xl font-bold">শিক্ষক প্যানেল</span>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive 
                    ? "bg-white/10 text-white font-bold border-l-4 border-[#4CAF50]" 
                    : "text-slate-300 hover:bg-white/5 hover:text-white font-medium"
                }`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 font-medium transition"
          >
            <LogOut size={20} /> লগআউট
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <button className="lg:hidden text-ink" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm font-bold text-slate-600">শিক্ষক</span>
            <div className="w-10 h-10 rounded-full bg-[#002A41] flex items-center justify-center text-white font-bold">
              T
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}