import Link from "next/link";
import { ShieldCheck, GraduationCap, BookOpen, ArrowRight } from "lucide-react";

export default function LoginSelectionPage() {
  const loginOptions = [
    {
      title: "স্টুডেন্ট লগইন",
      desc: "শিক্ষার্থী হিসেবে লগইন করে ক্লাস ও অন্যান্য তথ্য দেখুন।",
      href: "/student/login",
      icon: GraduationCap,
      color: "text-blue-500",
      bg: "bg-blue-50",
      border: "hover:border-blue-500",
    },
    {
      title: "শিক্ষক লগইন",
      desc: "শিক্ষক হিসেবে লগইন করে ক্লাস ও স্টুডেন্টদের তথ্য দেখুন।",
      href: "/teacher/login",
      icon: BookOpen,
      color: "text-orange-500",
      bg: "bg-orange-50",
      border: "hover:border-orange-500",
    },
    {
      title: "অ্যাডমিন লগইন",
      desc: "অ্যাডমিন হিসেবে লগইন করে পুরো ওয়েবসাইট কন্ট্রোল করুন।",
      href: "/admin/login",
      icon: ShieldCheck,
      color: "text-[#4CAF50]",
      bg: "bg-[#4CAF50]/10",
      border: "hover:border-[#4CAF50]",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-soft2 px-5 py-20">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 md:p-10 shadow-2xl border border-slate-100 relative z-10">
        
        {/* হেডিং */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-ink mb-2">লগইন করুন</h1>
          <p className="text-body">আপনার ধরন অনুযায়ী লগইন করুন</p>
        </div>

        {/* অপশন লিস্ট (রো টাইপ) */}
        <div className="flex flex-col gap-4">
          {loginOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <Link
                key={opt.href}
                href={opt.href}
                className={`group flex items-center justify-between p-5 rounded-2xl border-2 border-slate-100 transition-all duration-300 hover:shadow-lg ${opt.border}`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${opt.bg} ${opt.color} group-hover:scale-110 transition-transform`}>
                    <Icon size={28} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-ink">{opt.title}</h2>
                    <p className="text-sm text-slate-500 mt-1">{opt.desc}</p>
                  </div>
                </div>
                <ArrowRight size={20} className={`text-slate-300 group-hover:translate-x-1 transition-transform ${opt.color}`} />
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}