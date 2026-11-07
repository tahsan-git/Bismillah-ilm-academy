"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Check, X, Loader2 } from "lucide-react";

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchStudents = async () => {
    setLoading(true);
    const { data } = await supabase.from("students").select("*").order("created_at", { ascending: false });
    if (data) setStudents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from("students").update({ status: newStatus }).eq("id", id);
    fetchStudents();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">স্টুডেন্ট ম্যানেজমেন্ট</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-body">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">নাম</th>
                <th className="px-6 py-4">ইমেইল</th>
                <th className="px-6 py-4">মোবাইল</th>
                <th className="px-6 py-4">স্ট্যাটাস</th>
                <th className="px-6 py-4">একশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" /></td></tr>}
              {!loading && students.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400">কোনো স্টুডেন্ট পাওয়া যায়নি।</td></tr>}
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-ink">{s.name}</td>
                  <td className="px-6 py-4">{s.email}</td>
                  <td className="px-6 py-4">{s.phone || "-"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {s.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    {s.status !== 'Active' && (
                      <button onClick={() => updateStatus(s.id, 'Active')} className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition">
                        <Check size={14} /> অ্যাপ্রুভ
                      </button>
                    )}
                    {s.status === 'Active' && (
                      <button onClick={() => updateStatus(s.id, 'Pending')} className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition">
                        <X size={14} /> ব্লক
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}