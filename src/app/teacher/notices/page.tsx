"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Loader2,
  FileText
} from "lucide-react";

export default function TeacherNoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true);
      
      // 🌟 Teacher der jonno 'all' + 'teacher' audience er notice fetch kora hocche
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .in("target_audience", ["all", "teacher"])
        .order("is_important", { ascending: false })
        .order("created_at", { ascending: false });

      if (data) setNotices(data);
      if (error) console.error("Error fetching notices:", error);
      
      setLoading(false);
    };

    fetchNotices();
  }, []);

  // Notice er style determine kora (Important hole red, na hole blue)
  const getTypeStyles = (isImportant: boolean) => {
    if (isImportant) {
      return { 
        bg: 'bg-red-50', 
        border: 'border-red-200', 
        icon: AlertTriangle, 
        iconColor: 'text-red-600', 
        badge: 'গুরুত্বপূর্ণ' 
      };
    }
    return { 
      bg: 'bg-blue-50', 
      border: 'border-blue-200', 
      icon: FileText, 
      iconColor: 'text-blue-600', 
      badge: 'সাধারণ' 
    };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* হেডার */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#002A41]">নোটিশ ও বিজ্ঞপ্তি</h1>
          <p className="text-slate-500 mt-1">অ্যাডমিনের পাঠানো নতুন আপডেট দেখুন</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-[#002A41] text-white flex items-center justify-center relative">
          <Bell size={24} />
          {notices.length > 0 && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </div>
      </div>

      {/* 🌟 নোটিশ লিস্ট */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#002A41]" size={40} />
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
          এখনো কোনো নোটিশ পাঠানো হয়নি।
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => {
            const styles = getTypeStyles(notice.is_important);
            const Icon = styles.icon;

            return (
              <div key={notice.id} className={`bg-white rounded-2xl shadow-sm border p-5 transition flex flex-col md:flex-row gap-4 ${styles.border}`}>
                
                {/* আইকন */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${styles.bg} ${styles.iconColor}`}>
                  <Icon size={24} />
                </div>

                {/* কন্টেন্ট */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-lg text-slate-900">{notice.title}</h3>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${styles.bg} ${styles.iconColor} uppercase tracking-wider`}>
                        {styles.badge}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 leading-relaxed mb-3 whitespace-pre-wrap">
                    {notice.content}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock size={12} />
                    {new Date(notice.created_at).toLocaleDateString("bn-BD", {
                      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}