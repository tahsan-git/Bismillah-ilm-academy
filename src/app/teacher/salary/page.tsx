"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Wallet, 
  Download, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  FileText,
  Calendar,
  Loader2,
  X
} from "lucide-react";

export default function MySalary() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [selectedSlip, setSelectedSlip] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const teacherId = localStorage.getItem("teacher_id");
      if (!teacherId) { window.location.href = "/teacher/login"; return; }

      // ১. Profile data (salary)
      const { data: profileData } = await supabase
        .from("teachers_profile")
        .select("name, email, role_bn, salary, image_url")
        .eq("id", teacherId)
        .single();
        
      if (profileData) setProfile(profileData);

      // ২. Payment history
      const { data: paymentData } = await supabase
        .from("payment_records")
        .select("*")
        .eq("user_id", teacherId)
        .eq("user_type", "teacher")
        .order("month", { ascending: false });

      if (paymentData) setPayments(paymentData);

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-[#002A41]" size={40} /></div>;
  }

  // Stats Calculate
  const monthlySalary = profile?.salary || 0;
  const paidSalary = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const dueSalary = payments.filter(p => p.status === 'due').reduce((sum, p) => sum + Number(p.amount), 0);

  // Next payment date calculate (Simple logic)
  const nextPaymentDate = new Date();
  nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
  nextPaymentDate.setDate(10); // Prottek mash er 10 tarikh
  const formattedNextDate = nextPaymentDate.toLocaleDateString("bn-BD", {
    day: "numeric", month: "long", year: "numeric"
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* হেডার */}
      <div>
        <h1 className="text-2xl font-bold text-[#002A41]">আমার বেতন</h1>
        <p className="text-slate-500 mt-1">আপনার বেতন ও পেমেন্ট সংক্রান্ত তথ্য</p>
      </div>

      {/* স্ট্যাটস কার্ড */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* নির্ধারিত বেতন */}
        <div className="bg-[#002A41] p-6 rounded-2xl shadow-md text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-4">
              <Wallet size={20} />
            </div>
            <p className="text-sm text-slate-300 mb-1">নির্ধারিত মাসিক বেতন</p>
            <h2 className="text-3xl font-extrabold text-[#FFD700]">৳ {monthlySalary.toLocaleString('bn-BD')}</h2>
          </div>
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full"></div>
        </div>

        {/* পেইড বেতন */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mb-4">
              <CheckCircle2 size={20} />
            </div>
            <p className="text-sm text-slate-500 font-bold mb-1">মোট পরিশোধিত</p>
            <h2 className="text-3xl font-extrabold text-slate-800">৳ {paidSalary.toLocaleString('bn-BD')}</h2>
          </div>
          <p className="text-xs text-green-600 font-bold mt-2">সর্বমোট {payments.filter(p => p.status === 'paid').length} টি পেমেন্ট</p>
        </div>

        {/* ডিউ বেতন */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
              <Clock size={20} />
            </div>
            <p className="text-sm text-slate-500 font-bold mb-1">বাকি বেতন</p>
            <h2 className="text-3xl font-extrabold text-slate-800">৳ {dueSalary.toLocaleString('bn-BD')}</h2>
          </div>
          <p className="text-xs text-orange-600 font-bold mt-2 flex items-center gap-1">
            <Calendar size={12} /> পরবর্তী পেমেন্ট: {formattedNextDate}
          </p>
        </div>

      </div>

      {/* বেতনের ইতিহাস */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="font-bold text-[#002A41] flex items-center gap-2">
            <FileText size={18} /> বেতনের ইতিহাস
          </h2>
        </div>

        {payments.length === 0 ? (
          <div className="p-10 text-center text-slate-500">এখনো কোনো পেমেন্ট রেকর্ড নেই।</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {payments.map((item) => (
              <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition">
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#002A41] flex items-center justify-center shrink-0 font-bold">
                    {item.month.charAt(5)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{new Date(item.month + "-01").toLocaleDateString("bn-BD", { month: "long", year: "numeric" })}</p>
                    <p className="text-xs text-slate-500 mt-0.5">স্ট্যাটাস: {item.status === 'paid' ? 'পরিশোধিত' : 'বাকি'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-6">
                  <div className="text-left md:text-right">
                    <p className="font-extrabold text-slate-800">৳ {Number(item.amount).toLocaleString('bn-BD')}</p>
                    {item.status === "paid" ? (
                      <p className="text-xs text-green-600 font-bold flex items-center gap-1 md:justify-end mt-0.5">
                        <CheckCircle2 size={10} /> পরিশোধিত
                      </p>
                    ) : (
                      <p className="text-xs text-orange-600 font-bold flex items-center gap-1 md:justify-end mt-0.5">
                        <Clock size={10} /> বাকি
                      </p>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setSelectedSlip(item)}
                    className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    <Download size={16} /> স্লিপ
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* নোটিশ */}
      <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
          <TrendingUp size={16} />
        </div>
        <div>
          <h4 className="font-bold text-blue-800 text-sm">স্যালারি স্লিপ ডাউনলোড</h4>
          <p className="text-blue-600 text-sm mt-1">
            প্রতিটি মাসের স্যালারি স্লিপ PDF আকারে ডাউনলোড করতে পারবেন। কোনো অসঙ্গতি থাকলে অ্যাডমিনের সাথে যোগাযোগ করুন।
          </p>
        </div>
      </div>

      {/* 🌟 Salary Slip Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            
            <div className="flex justify-between items-center mb-4 print:hidden">
              <h2 className="text-lg font-bold text-[#002A41]">স্যালারি স্লিপ</h2>
              <button onClick={() => setSelectedSlip(null)} className="p-1 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20} /></button>
            </div>

            {/* Print Area */}
            <div id="salary-slip" className="p-4 border border-slate-200 rounded-xl bg-white space-y-4">
              
              {/* Header */}
              <div className="text-center border-b border-slate-200 pb-3">
                <h3 className="text-xl font-bold text-[#002A41]">বিসমিল্লাহ ইলম একাডেমি</h3>
                <p className="text-xs text-slate-500">স্যালারি স্লিপ</p>
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">শিক্ষকের নাম:</span>
                  <span className="font-bold">{profile?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">মাস:</span>
                  <span className="font-bold">{new Date(selectedSlip.month + "-01").toLocaleDateString("bn-BD", { month: "long", year: "numeric" })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">পদবি:</span>
                  <span className="font-bold">{profile?.role_bn || "শিক্ষক"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">স্ট্যাটাস:</span>
                  <span className={`font-bold ${selectedSlip.status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                    {selectedSlip.status === 'paid' ? 'পরিশোধিত' : 'বাকি'}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                <span className="font-bold text-slate-700">মোট বেতন:</span>
                <span className="text-xl font-extrabold text-[#002A41]">৳ {Number(selectedSlip.amount).toLocaleString('bn-BD')}</span>
              </div>

              {/* Note */}
              {selectedSlip.note && (
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1">নোট:</p>
                  <p className="text-sm text-slate-600 italic bg-blue-50 p-2 rounded">{selectedSlip.note}</p>
                </div>
              )}

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400">
                এই স্লিপটি স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে।
              </div>
            </div>

            {/* Print Button */}
            <button 
              onClick={() => window.print()} 
              className="w-full mt-4 bg-[#002A41] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#003D5C] transition print:hidden"
            >
              <Download size={18} /> প্রিন্ট / PDF ডাউনলোড
            </button>
          </div>
        </div>
      )}

      {/* Print CSS */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #salary-slip, #salary-slip * { visibility: visible; }
          #salary-slip { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>

    </div>
  );
}