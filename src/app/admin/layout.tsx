"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Info, 
  Users, 
  GraduationCap, 
  HelpCircle, 
  DollarSign, 
  LogOut, 
  Menu, 
  X 
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // লগইন পেজে সাইডবার দেখানোর দরকার নেই
  if (pathname === "/admin/login") return <>{children}</>;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const menuItems = [
    { name: "ড্যাশবোর্ড", href: "/admin", icon: LayoutDashboard },
    { name: "হিরো সেকশন", href: "/admin/hero", icon: ImageIcon },
    { name: "ম্যানেজমেন্ট", href: "/admin/management", icon: Users },
    { name: "প্রশ্নোত্তর (FAQ)", href: "/admin/faq", icon: HelpCircle },
    { name: "প্রাইসিং", href: "/admin/pricing", icon: DollarSign },
    { name: "ট্রায়াল আবেদন", href: "/admin/trials", icon: Users },
    { name: "শিক্ষক আবেদন", href: "/admin/teachers-app", icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
          <span className="text-xl font-bold text-[#4CAF50]">অ্যাডমিন প্যানেল</span>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-160px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${isActive ? "bg-[#4CAF50] text-white font-bold" : "text-slate-600 hover:bg-slate-50 font-medium"}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-100 bg-white">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 font-medium transition"
          >
            <LogOut size={20} />
            লগআউট করুন
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm font-bold text-slate-600">অ্যাডমিন</span>
            <div className="w-10 h-10 rounded-full bg-[#4CAF50]/10 flex items-center justify-center text-[#4CAF50] font-bold">
              A
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