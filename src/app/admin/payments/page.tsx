"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Wallet, 
  Users, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  X, 
  Save,
  User,
  GraduationCap,
  CalendarDays,
  Filter
} from "lucide-react";

export default function AdminPayments() {
  const [activeTab, setActiveTab] = useState<"teacher" | "student">("teacher");
  const [loading, setLoading] = useState(true);
  
  const [selectedMonth, setSelectedMonth] = useState("2026-11");
  const [statusFilter, setStatusFilter] = useState<"all" | "due" | "paid">("all");

  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]);
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editStatus, setEditStatus] = useState("due");
  const [editNote, setEditNote] = useState("");
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    
    const [tData, sData] = await Promise.all([
      supabase.from("teachers_profile").select("id, name, email, salary").eq("status", "Active"),
      // 🌟 Students fetch ekhon monthly_fee soho
      supabase.from("students").select("id, name, phone, plan, monthly_fee").eq("status", "Active")
    ]);
    
    if (tData.data) setTeachers(tData.data);
    if (sData.data) setStudents(sData.data);

    const { data: pData } = await supabase.from("payment_records").select("*");
    if (pData) setAllPayments(pData);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getPayment = (userId: string, type: string) => {
    return allPayments.find(p => p.user_id === userId && p.user_type === type && p.month === selectedMonth);
  };

  const filteredUsers = (activeTab === "teacher" ? teachers : students).filter(user => {
    if (statusFilter === "due" || statusFilter === "paid") {
      return allPayments.some(p => 
        p.user_id === user.id && 
        p.user_type === activeTab && 
        p.status === statusFilter
      );
    }
    return true;
  });

  const openEdit = (user: any, type: string) => {
    setSelectedUser({ ...user, type });
    const existing = getPayment(user.id, type);
    setEditStatus(existing?.status || "due");
    setEditNote(existing?.note || "");
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setSaving(true);

    const existing = getPayment(selectedUser.id, selectedUser.type);
    // 🌟 Teacher er amount = salary, Student er amount = monthly_fee
    const amountToSave = selectedUser.type === "teacher" 
      ? selectedUser.salary 
      : selectedUser.monthly_fee || 0;

    if (existing) {
      await supabase.from("payment_records")
        .update({ status: editStatus, note: editNote })
        .eq("id", existing.id);
    } else {
      await supabase.from("payment_records").insert({
        user_type: selectedUser.type,
        user_id: selectedUser.id,
        amount: amountToSave,
        month: selectedMonth,
        status: editStatus,
        note: editNote
      });
    }
    
    setSaving(false);
    setSelectedUser(null);
    fetchData();
  };

  const getAvailableMonths = () => {
    const months = [];
    const startYear = 2026;
    const startMonth = 10; // November

    const now = new Date();
    const endYear = now.getFullYear();
    const endMonth = now.getMonth();

    let y = startYear;
    let m = startMonth;

    while (y < endYear || (y === endYear && m <= endMonth)) {
      const monthStr = `${y}-${String(m + 1).padStart(2, '0')}`;
      months.push(monthStr);

      m++;
      if (m > 11) {
        m = 0;
        y++;
      }
    }
    
    return months.reverse();
  };

  const availableMonths = getAvailableMonths();

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#002A41]" size={40} /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#002A41] flex items-center gap-2">
            <Wallet size={24} className="text-[#4CAF50]" /> পেমেন্ট ও কালেকশন
          </h1>
          <p className="text-slate-500 mt-1">মাসিক বেতন ও ছাত্রদের ফি ব্যবস্থাপনা করুন</p>
        </div>

        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
          <CalendarDays size={18} className="text-slate-400 ml-2" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent font-bold text-[#002A41] outline-none text-sm pr-2"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {new Date(m + "-01").toLocaleDateString("bn-BD", { month: "long", year: "numeric" })}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-max">
          <button 
            onClick={() => setActiveTab("teacher")}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === "teacher" ? "bg-white text-[#002A41] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <GraduationCap size={18} /> শিক্ষকদের বেতন
          </button>
          <button 
            onClick={() => setActiveTab("student")}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === "student" ? "bg-white text-[#002A41] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Users size={18} /> শিক্ষার্থীদের ফি
          </button>
        </div>

        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-max">
          <button 
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${statusFilter === "all" ? "bg-white text-[#002A41] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Filter size={16} /> All
          </button>
          <button 
            onClick={() => setStatusFilter("due")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${statusFilter === "due" ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Clock size={16} /> Due
          </button>
          <button 
            onClick={() => setStatusFilter("paid")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${statusFilter === "paid" ? "bg-white text-green-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <CheckCircle2 size={16} /> Paid
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full text-center py-10 text-slate-500 bg-white rounded-2xl border border-slate-100">
            কোনো রেকর্ড পাওয়া যায়নি।
          </div>
        ) : (
          filteredUsers.map((user) => {
            let payment = getPayment(user.id, activeTab);
            if (statusFilter === "due" || statusFilter === "paid") {
              payment = allPayments.find(p => 
                p.user_id === user.id && 
                p.user_type === activeTab && 
                p.status === statusFilter
              );
            }

            const isPaid = payment?.status === "paid";
            
            // 🌟 Amount logic: teacher = salary, student = monthly_fee
            const displayAmount = activeTab === "teacher" 
              ? user.salary 
              : user.monthly_fee || 0;
            
            return (
              <div key={user.id} className={`bg-white rounded-2xl border p-5 shadow-sm transition ${isPaid ? 'border-green-200 bg-green-50/20' : 'border-red-200 bg-red-50/20'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPaid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {activeTab === "teacher" ? <GraduationCap size={20} /> : <User size={20} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{user.name}</h3>
                      <p className="text-xs text-slate-500">{activeTab === "teacher" ? "শিক্ষক" : user.plan}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 ${isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {isPaid ? <><CheckCircle2 size={12} /> Paid</> : <><Clock size={12} /> Due</>}
                  </span>
                </div>

                <div className="mb-3">
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    মাস: {payment?.month ? new Date(payment.month + "-01").toLocaleDateString("bn-BD", { month: "long", year: "numeric" }) : "N/A"}
                  </span>
                </div>

                {payment?.note && (
                  <div className="mb-4 text-xs text-slate-500 bg-white/50 p-2 rounded-lg border border-slate-100">
                    <span className="font-bold">নোট:</span> {payment.note}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100/50">
                  <div>
                    <p className="text-xs text-slate-500">পরিমাণ</p>
                    <p className="font-bold text-[#002A41]">৳ {displayAmount}</p>
                  </div>
                  <button 
                    onClick={() => openEdit(user, activeTab)}
                    className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-50"
                  >
                    {isPaid ? "বিস্তারিত দেখুন" : "আপডেট করুন"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#002A41]">পেমেন্ট আপডেট</h2>
              <button onClick={() => setSelectedUser(null)} className="p-1 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20} /></button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-2">
                <p className="text-xs text-slate-500 mb-1">নাম:</p>
                <p className="font-bold text-slate-800">{selectedUser.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  মাস: {new Date(selectedMonth + "-01").toLocaleDateString("bn-BD", { month: "long", year: "numeric" })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">পরিমাণ (৳)</label>
                <div className="w-full p-2.5 border rounded-lg bg-slate-100 text-slate-600 font-bold">
                  {/* 🌟 Read-only amount: teacher = salary, student = monthly_fee */}
                  ৳ {selectedUser.type === "teacher" ? selectedUser.salary : selectedUser.monthly_fee || 0}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">স্ট্যাটাস</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full p-2.5 border rounded-lg focus:border-[#4CAF50] outline-none">
                  <option value="due">Due (বাকি)</option>
                  <option value="paid">Paid (পরিশোধিত)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">নোট (ঐচ্ছিক)</label>
                <textarea 
                  value={editNote} 
                  onChange={(e) => setEditNote(e.target.value)} 
                  rows={2}
                  placeholder="যেমন: বিকাশে পেমেন্ট করা হয়েছে..."
                  className="w-full p-2.5 border rounded-lg focus:border-[#4CAF50] outline-none resize-none" 
                />
              </div>

              <button onClick={handleSave} disabled={saving} className="w-full bg-[#4CAF50] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#388E3C] transition disabled:opacity-50 mt-2">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} সেভ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}