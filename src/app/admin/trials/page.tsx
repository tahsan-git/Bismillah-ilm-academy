"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle, Clock, Trash2 } from "lucide-react";

export default function AdminTrials() {
  const [trials, setTrials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchTrials = async () => {
    setLoading(true);
    const { data } = await supabase.from("trial_classes").select("*").order("created_at", { ascending: false });
    if (data) setTrials(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTrials();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from("trial_classes").update({ status: newStatus }).eq("id", id);
    fetchTrials();
  };

  const handleDelete = async (id: string) => {
    if (confirm("আপনি কি নিশ্চিতভাবে এই আবেদনটি ডিলিট করতে চান?")) {
      await supabase.from("trial_classes").delete().eq("id", id);
      fetchTrials();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">ট্রায়াল ক্লাস আবেদনসমূহ</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-body">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">নাম</th>
                <th className="px-6 py-4">মোবাইল</th>
                <th className="px-6 py-4">বার্তা</th>
                <th className="px-6 py-4">স্ট্যাটাস</th>
                <th className="px-6 py-4 text-center">একশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" /></td></tr>}
              
              {!loading && trials.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">কোনো আবেদন পাওয়া যায়নি।</td></tr>
              )}
              
              {trials.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-ink">{t.name}</td>
                  <td className="px-6 py-4">{t.phone}</td>
                  <td className="px-6 py-4 max-w-xs truncate">{t.message || "-"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      t.status === 'Processed' ? 'bg-green-100 text-green-700' : 
                      t.status === 'Deleted' ? 'bg-red-100 text-red-700' : 
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {t.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center justify-center gap-2">
                    {t.status !== 'Processed' && (
                      <button onClick={() => updateStatus(t.id, 'Processed')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-500 hover:text-white transition" title="প্রসেসড করুন">
                        <CheckCircle size={18} />
                      </button>
                    )}
                    {t.status !== 'Pending' && (
                      <button onClick={() => updateStatus(t.id, 'Pending')} className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-500 hover:text-white transition" title="পেন্ডিং করুন">
                        <Clock size={18} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(t.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition" title="ডিলিট করুন">
                      <Trash2 size={18} />
                    </button>
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