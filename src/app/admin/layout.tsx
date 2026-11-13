"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Image as ImageIcon,
  BarChart3,
  Gift,
  Users,
  GraduationCap,
  HelpCircle,
  MessageSquare,
  DollarSign,
  UserPlus,
  FileText,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Globe,
  School,
  UserCheck,
  ClipboardList,
  AlertCircle,
  CalendarDays,
  Bell,
  Library,
  Wallet
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("dashboard");

  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (pathname === "/admin/login") return <>{children}</>;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  // 🌟 3 ta main section + Dashboard
  const menuGroups = [
    {
      id: "user-site",
      title: "ইউজার সাইট কন্ট্রোল",
      icon: Globe,
      items: [
        { name: "হিরো সেকশন", href: "/admin/hero", icon: ImageIcon },
        { name: "স্ট্যাটস (কাউন্টার)", href: "/admin/stats", icon: BarChart3 },
        { name: "ফিচার (বৈশিষ্ট্য)", href: "/admin/features", icon: Gift },
        { name: "ম্যানেজমেন্ট", href: "/admin/management", icon: Users },
        { name: "শিক্ষক-শিক্ষিকা (কার্ড)", href: "/admin/teachers", icon: GraduationCap },
        { name: "প্রশ্নোত্তর (FAQ)", href: "/admin/faq", icon: HelpCircle },
        { name: "মন্তব্য (Testimonials)", href: "/admin/testimonials", icon: MessageSquare },
        { name: "প্রাইসিং", href: "/admin/pricing", icon: DollarSign },
      ],
    },
    {
      id: "student-section",
      title: "শিক্ষার্থী সেকশন",
      icon: Users,
      items: [
        { name: "শিক্ষার্থী আবেদন", href: "/admin/students", icon: UserCheck },
        { name: "সব শিক্ষার্থী", href: "/admin/student-management", icon: ClipboardList },
        { name: "ক্লাস শিডিউল", href: "/admin/student-management/schedule", icon: CalendarDays },
        { name: "কমপ্লেইন", href: "/admin/complaints", icon: AlertCircle },
        { name: "ট্রায়াল আবেদন", href: "/admin/trials", icon: FileText },
      ],
    },
    // admin/layout.tsx e import korun

// menuGroups array te notun section add korun (ba Student section er moddhe add korun)
{
  id: "feedback-section",
  title: "শিক্ষার্থীদের মতামত",
  icon: MessageSquare,
  items: [
    { name: "মতামত দেখুন", href: "/admin/feedback", icon: MessageSquare },
  ]
},
    {
      id: "teacher-section",
      title: "শিক্ষক সেকশন",
      icon: School,
      items: [
        { name: "শিক্ষক আবেদন", href: "/admin/teachers-app", icon: UserPlus },
        { name: "সব শিক্ষক", href: "/admin/teacher-management", icon: GraduationCap },
      ],
    },
    {
      id: "notice-section",
      title: "নোটিশ",
      icon: Bell,
      items: [
        { name: "নোটিশ ম্যানেজমেন্ট", href: "/admin/notices", icon: Bell },
      ],
    },
    {
  id: "library-section",
  title: "ডিজিটাল লাইব্রেরি",
  icon: Library,
  items: [
    { name: "লাইব্রেরি ম্যানেজমেন্ট", href: "/admin/library", icon: Library },
  ]
},
{
  id: "payment-section",
  title: "পেমেন্ট ও কালেকশন",
  icon: Wallet,
  items: [
    { name: "বেতন ও ফি", href: "/admin/payments", icon: Wallet },
  ]
},
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#002A41] text-white flex flex-col transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
          <span className="text-xl font-bold">অ্যাডমিন প্যানেল</span>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 flex-1 overflow-y-auto no-scrollbar space-y-1">
          {/* Dashboard (separate link) */}
          <Link
            href="/admin"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              pathname === "/admin"
                ? "bg-white/10 text-white font-bold border-l-4 border-[#4CAF50]"
                : "text-slate-300 hover:bg-white/5 hover:text-white font-medium"
            }`}
          >
            <LayoutDashboard size={20} /> ড্যাশবোর্ড
          </Link>

          {/* Expandable groups */}
          {menuGroups.map((group) => {
            const GroupIcon = group.icon;
            const isOpen = openSection === group.id;
            const hasActiveChild = group.items.some((item) =>
              pathname.startsWith(item.href)
            );

            return (
              <div key={group.id} className="pt-1">
                <button
                  onClick={() => toggleSection(group.id)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition ${
                    hasActiveChild
                      ? "text-white font-bold"
                      : "text-slate-300 font-medium hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GroupIcon size={20} /> {group.title}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="mt-1 space-y-1 pl-4">
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
                            isActive
                              ? "bg-[#4CAF50] text-white font-bold"
                              : "text-slate-400 hover:bg-white/5 hover:text-white font-medium"
                          }`}
                        >
                          <ItemIcon size={16} />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 bg-[#002A41] shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 font-medium transition"
          >
            <LogOut size={20} /> লগআউট করুন
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
          <button
            className="lg:hidden text-[#002A41]"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm font-bold text-slate-600 hidden sm:block">অ্যাডমিন</span>
            <div className="w-10 h-10 rounded-full bg-[#002A41] flex items-center justify-center text-white font-bold">
              A
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}