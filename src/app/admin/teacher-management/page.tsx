"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  GraduationCap,
  Search,
  Eye,
  Trash2,
  Loader2,
  X,
  Users,
  Phone,
  Mail,
  CheckCircle2,
} from "lucide-react";

export default function AdminTeacherManagement() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [assignedMap, setAssignedMap] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    
    // 1. Sob Active Teacher fetch koro
    const { data: teachersData } = await supabase
      .from("teachers_profile")
      .select("*")
      .eq("status", "Active")
      .order("name");

    // 2. Sob assignment fetch koro (student details soho)
    const { data: assignedData } = await supabase
      .from("teacher_students")
      .select(`
        teacher_id, 
        student_id, 
        students ( id, name, phone, email, plan, image_url )
      `);

    if (teachersData) setTeachers(teachersData);

    if (assignedData) {
      // Map banai: { teacher_id: [student_obj, student_obj] }
      const map: Record<string, any[]> = {};
      assignedData.forEach((row: any) => {
        if (row.students) {
          if (!map[row.teacher_id]) map[row.teacher_id] = [];
          map[row.teacher_id].push(row.students);
        }
      });
      setAssignedMap(map);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = teachers.filter((t) => {
    return (
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase()) ||
      t.phone?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleDelete = async (teacher: any) => {
    if (
      !confirm(
        `আপনি কি "${teacher.name}" শিক্ষককে ডিলিট করতে চান? উনার অধীনে থাকা শিক্ষার্থীরা টিচারলেস হয়ে যাবে।`
      )
    )
      return;

    try {
      // 1. Bucket theke image delete
      if (teacher.image_url) {
        const fileName = teacher.image_url.split("/").pop();
        if (fileName) await supabase.storage.from("site-images").remove([fileName]);
      }

      // 2. Teacher_students relation delete
      await supabase.from("teacher_students").delete().eq("teacher_id", teacher.id);
      
      // 3. Class schedules theke teacher_id null kore dao (jate schedule table clean thake)
      await supabase.from("class_schedules").update({ teacher_id: null }).eq("teacher_id", teacher.id);

      // 4. Teacher delete
      await supabase.from("teachers_profile").delete().eq("id", teacher.id);

      fetchData();
    } catch (error: any) {
      alert("ডিলিট করতে সমস্যা: " + error.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#002A41] flex items-center gap-2">
            <GraduationCap size={24} className="text-[#4CAF50]" /> শিক্ষক ম্যানেজমেন্ট
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            সব শিক্ষকের তালিকা এবং তাদের অধীনে থাকা শিক্ষার্থী
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-xl flex items-center gap-3">
          <GraduationCap className="text-yellow-600" size={20} />
          <div>
            <p className="text-xs font-bold text-yellow-700">মোট</p>
            <p className="text-xl font-extrabold text-yellow-800">{filtered.length} জন</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="নাম, ফোন বা ইমেইল দিয়ে খুঁজুন..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#002A41]/20 text-sm"
        />
      </div>

      {/* Teacher Grid/List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#4CAF50]" size={40} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">কোনো শিক্ষক পাওয়া যায়নি।</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => {
            const studentsCount = assignedMap[t.id]?.length || 0;
            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    {t.image_url ? (
                      <img
                        src={t.image_url}
                        alt={t.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-[#4CAF50]"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-slate-200">
                        <GraduationCap size={24} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{t.name}</h3>
                      <p className="text-xs text-slate-500">{t.role_bn || "শিক্ষক"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4 text-sm text-slate-600">
                  <p className="flex items-center gap-2"><Phone size={14} className="text-slate-400"/> {t.phone || "—"}</p>
                  <p className="flex items-center gap-2"><Mail size={14} className="text-slate-400"/> {t.email || "—"}</p>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#4CAF50] bg-[#4CAF50]/10 px-3 py-1.5 rounded-lg">
                    <Users size={16} /> {studentsCount} জন শিক্ষার্থী
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedTeacher(t)}
                      className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition"
                      title="বিস্তারিত দেখুন"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(t)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                      title="ডিলিট করুন"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Teacher Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-[#002A41]">শিক্ষকের প্রোফাইল</h2>
              <button
                onClick={() => setSelectedTeacher(null)}
                className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Teacher Info */}
              <div className="flex flex-col items-center text-center">
                {selectedTeacher.image_url ? (
                  <img
                    src={selectedTeacher.image_url}
                    alt={selectedTeacher.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#4CAF50]/20 mb-3"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <GraduationCap size={40} />
                  </div>
                )}
                <h3 className="text-xl font-bold text-slate-800">{selectedTeacher.name}</h3>
                <p className="text-[#4CAF50] font-bold text-sm">{selectedTeacher.role_bn}</p>
                <p className="text-sm text-slate-500">{selectedTeacher.phone} • {selectedTeacher.email}</p>
              </div>

              <hr className="border-slate-100" />

              {/* Assigned Students List */}
              <div>
                <h3 className="font-bold text-[#002A41] mb-3 flex items-center gap-2">
                  <Users size={18} className="text-[#4CAF50]" /> 
                  অধীনে থাকা শিক্ষার্থী ({(assignedMap[selectedTeacher.id] || []).length} জন)
                </h3>
                
                {(assignedMap[selectedTeacher.id] || []).length === 0 ? (
                  <div className="bg-slate-50 text-center py-6 rounded-xl border border-slate-100 text-slate-400 text-sm">
                    এই শিক্ষকের অধীনে এখনো কোনো শিক্ষার্থী নেই।
                  </div>
                ) : (
                  <div className="space-y-2">
                    {assignedMap[selectedTeacher.id].map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3">
                          {s.image_url ? (
                            <img src={s.image_url} alt={s.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                              <Users size={18} />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-sm text-slate-800">{s.name}</p>
                            <p className="text-xs text-slate-500">{s.phone}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold px-2 py-1 rounded bg-[#002A41]/5 text-[#002A41]">
                            {s.plan}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}