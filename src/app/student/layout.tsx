"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  LayoutDashboard, 
  CalendarDays, 
  CheckSquare, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Library, 
  AlertCircle,
  User,
  LogOut,
  Menu,
  X,
  StarIcon
} from "lucide-react";
import { useState, useEffect } from "react";

// ⚠️ TEMPORARY DEV BYPASS — REMOVE BEFORE PRODUCTION
const DEV_STUDENT_ID = "01dd9ca2-2668-4828-a6ba-ebb505d475e7";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // ⚠️ TEMPORARY DEV BYPASS — REMOVE BEFORE PRODUCTION
  useEffect(() => {
    if (
      pathname !== "/student/login" &&
      pathname !== "/student/register" &&
      !localStorage.getItem("student_id")
    ) {
      localStorage.setItem("student_id", DEV_STUDENT_ID);
      localStorage.setItem("student_name", "Test Student");
    }
  }, [pathname]);

  // লগইন এবং রেজিস্ট্রেশন পেজে সাইডবার দেখানোর দরকার নেই
  if (pathname === "/student/login" || pathname === "/student/register") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    localStorage.removeItem("student_id");
    localStorage.removeItem("student_name");
    router.push("/student/login");
  };

  const menuItems = [
    { name: "ড্যাশবোর্ড", href: "/student/dashboard", icon: LayoutDashboard },
    { name: "আমার রুটিন", href: "/student/schedule", icon: CalendarDays },
    { name: "ক্লাস রিপোর্ট", href: "/student/reports", icon: FileText },
    { name: "হোমওয়ার্ক", href: "/student/homework", icon: BookOpen },
    { name: "অ্যাটেনডেন্স", href: "/student/attendance", icon: CheckSquare },
    { name: "ডিজিটাল লাইব্রেরি", href: "/student/library", icon: Library },
    { name: "শিক্ষকের রেটিং দিন", href: "/student/feedback", icon: StarIcon },
    { name: "কমপ্লেইন বক্স", href: "/student/complaints", icon: AlertCircle },
    { name: "প্রোফাইল", href: "/student/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* মোবাইল সাইডবার ওভারলে */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* সাইডবার */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#002A41] text-white flex flex-col transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
          <span className="text-xl font-bold">স্টুডেন্ট প্যানেল</span>
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
                <div className="p-4 border-t border-white/10 bg-[#002A41] shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 font-medium transition"
          >
            <LogOut size={20} /> লগআউট
          </button>
          
          {/* 🌟 Developed By Text with Link */}
          <div className="mt-3 text-center">
            <p className="text-[10px] text-slate-400">
              Developed by{" "}
              <a 
                href="https://facebook.com/TahsanBillah" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-bold text-[#4CAF50] hover:underline"
              >
                Tahsan
              </a>
            </p>
          </div>
        </div>
      </aside>

      {/* মূল কন্টেন্ট */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <button className="lg:hidden text-ink" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm font-bold text-slate-600">শিক্ষার্থী</span>
            <div className="w-10 h-10 rounded-full bg-[#002A41] flex items-center justify-center text-white font-bold">
              S
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