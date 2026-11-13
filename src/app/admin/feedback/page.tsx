"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, Loader2, Star, User } from "lucide-react";

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      // Join kore student ar teacher er nam niye asha hocche
      const { data } = await supabase
        .from("feedback")
        .select(`
          *,
          students ( name, phone ),
          teachers_profile ( name )
        `)
        .order("created_at", { ascending: false });

      if (data) setFeedbacks(data);
      setLoading(false);
    };
    fetchFeedback();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-[#002A41] flex items-center gap-2">
          <MessageSquare size={24} className="text-[#4CAF50]" /> শিক্ষার্থীদের মতামত
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          শিক্ষার্থীরা শিক্ষকদের সম্পর্কে যে মতামত দিয়েছে
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#4CAF50]" size={40} />
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
          এখনো কোনো মতামত দেওয়া হয়নি।
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <p className="font-bold text-slate-800 flex items-center gap-2">
                    <User size={16} className="text-slate-400"/> 
                    {fb.students?.name || "শিক্ষার্থী"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    শিক্ষক: {fb.teachers_profile?.name || "সাধারণ মতামত"}
                  </p>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      className={i < fb.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{fb.message}</p>
              <p className="text-xs text-slate-400 text-right mt-2">
                {new Date(fb.created_at).toLocaleDateString("bn-BD", {
                  year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}