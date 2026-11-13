"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  Search,
  Eye,
  Trash2,
  Loader2,
  X,
  Upload,
  Image as ImageIcon,
  CalendarDays,
  Check,
  UserCheck,
  EyeOff,
  Lock,
  Wallet
} from "lucide-react";

export default function AdminStudentManagement() {
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [assignedMap, setAssignedMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");

  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [planValue, setPlanValue] = useState("Basic");
  const [statusValue, setStatusValue] = useState("Active");
  const [teacherId, setTeacherId] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 🌟 Password & Salary states
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [salary, setSalary] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    const [studentsRes, teachersRes, assignedRes] = await Promise.all([
      supabase.from("students").select("*").order("created_at", { ascending: false }),
      supabase.from("teachers_profile").select("id, name, role_bn").eq("status", "Active"),
      supabase.from("teacher_students").select("student_id, teacher_id"),
    ]);

    if (studentsRes.data) setStudents(studentsRes.data);
    if (teachersRes.data) setTeachers(teachersRes.data);

    if (assignedRes.data) {
      const map: Record<string, string> = {};
      assignedRes.data.forEach((a: any) => {
        map[a.student_id] = a.teacher_id;
      });
      setAssignedMap(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.phone?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === "all" || s.plan === planFilter;
    return matchSearch && matchPlan;
  });

  const openModal = (student: any) => {
    setSelectedStudent(student);
    setPlanValue(student.plan || "Basic");
    setStatusValue(student.status || "Active");
    setTeacherId(assignedMap[student.id] || "");
    setImageUrl(student.image_url || null);
    setPassword(student.password || "");
    setSalary(student.monthly_fee || 0); // 🌟 Salary load
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      if (imageUrl) {
        const oldFileName = imageUrl.split("/").pop();
        if (oldFileName) await supabase.storage.from("site-images").remove([oldFileName]);
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `student-${Math.random()}.${fileExt}`;

      const { error } = await supabase.storage.from("site-images").upload(fileName, file);
      if (error) throw error;

      const { data } = supabase.storage.from("site-images").getPublicUrl(fileName);
      setImageUrl(data.publicUrl);
    } catch (error) {
      alert("ছবি আপলোডে সমস্যা হয়েছে!");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedStudent) return;
    setSaving(true);

    try {
      // 1. Student update (password, salary soho)
      const { error: studentError } = await supabase
        .from("students")
        .update({
          plan: planValue,
          status: statusValue,
          image_url: imageUrl,
          password: password,
          monthly_fee: salary, // 🌟 Salary update
        })
        .eq("id", selectedStudent.id);

      if (studentError) throw studentError;

      // 2. Teacher assign
      if (statusValue === "Active" && teacherId) {
        const existingTeacherId = assignedMap[selectedStudent.id];

        if (existingTeacherId !== teacherId) {
          if (existingTeacherId) {
            await supabase
              .from("teacher_students")
              .delete()
              .eq("student_id", selectedStudent.id);
          }

          const selectedTeacher = teachers.find((t) => t.id === teacherId);

          await supabase.from("teacher_students").insert({
            teacher_id: teacherId,
            student_id: selectedStudent.id,
            student_name: selectedStudent.name,
            teacher_name: selectedTeacher?.name || "",
          });

          await supabase
            .from("class_schedules")
            .update({ teacher_id: teacherId })
            .eq("student_id", selectedStudent.id);
        }
      }

      if (statusValue !== "Active" && assignedMap[selectedStudent.id]) {
        await supabase
          .from("teacher_students")
          .delete()
          .eq("student_id", selectedStudent.id);
      }

      setSelectedStudent(null);
      fetchData();
    } catch (error: any) {
      alert("সেভ করতে সমস্যা: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (student: any) => {
    if (!confirm(`আপনি কি "${student.name}" কে ডিলিট করতে চান? সব ডাটা মুছে যাবে।`)) return;

    try {
      if (student.image_url) {
        const fileName = student.image_url.split("/").pop();
        if (fileName) await supabase.storage.from("site-images").remove([fileName]);
      }

      await supabase.from("teacher_students").delete().eq("student_id", student.id);
      await supabase.from("class_schedules").delete().eq("student_id", student.id);
      await supabase.from("homework").delete().eq("student_id", student.id);
      await supabase.from("complaints").delete().eq("student_id", student.id);
      await supabase.from("students").delete().eq("id", student.id);

      fetchData();
    } catch (error: any) {
      alert("ডিলিট করতে সমস্যা: " + error.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#002A41] flex items-center gap-2">
            <Users size={24} className="text-[#4CAF50]" /> শিক্ষার্থী ম্যানেজমেন্ট
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            সব শিক্ষার্থীর তালিকা, টিচার অ্যাসাইন ও প্রোফাইল
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-xl flex items-center gap-3">
          <Users className="text-yellow-600" size={20} />
          <div>
            <p className="text-xs font-bold text-yellow-700">মোট</p>
            <p className="text-xl font-extrabold text-yellow-800">{filtered.length} জন</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম, ফোন বা ইমেইল দিয়ে খুঁজুন..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#002A41]/20 text-sm"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#002A41]/20"
        >
          <option value="all">সব প্ল্যান</option>
          <option value="Basic">Basic</option>
          <option value="Standard">Standard</option>
          <option value="Premium">Premium</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#4CAF50]" size={40} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">কোনো শিক্ষার্থী পাওয়া যায়নি।</div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">শিক্ষার্থী</th>
                    <th className="px-6 py-4">ফোন ও ইমেইল</th>
                    <th className="px-6 py-4">প্ল্যান</th>
                    <th className="px-6 py-4">স্ট্যাটাস</th>
                    <th className="px-6 py-4">টিচার</th>
                    <th className="px-6 py-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((s) => {
                    const teacher = teachers.find((t) => t.id === assignedMap[s.id]);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {s.image_url ? (
                              <img src={s.image_url} alt={s.name} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <Users size={18} />
                              </div>
                            )}
                            <span className="font-bold text-slate-800">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-700">{s.phone || "—"}</div>
                          <div className="text-xs text-slate-400">{s.email || "—"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#002A41]/5 text-[#002A41]">
                            {s.plan || "Basic"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                            s.status === "Active" ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                          }`}>
                            {s.status === "Active" ? "সক্রিয়" : "পেন্ডিং"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {teacher ? (
                            <span className="text-slate-700 text-sm">{teacher.name}</span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openModal(s)}
                              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(s)}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filtered.map((s) => {
                const teacher = teachers.find((t) => t.id === assignedMap[s.id]);
                return (
                  <div key={s.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {s.image_url ? (
                          <img src={s.image_url} alt={s.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                            <Users size={18} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{s.name}</p>
                          <p className="text-xs text-slate-500 truncate">{s.phone}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => openModal(s)} className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleDelete(s)} className="p-2 bg-red-50 text-red-600 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs font-bold px-2 py-1 rounded bg-[#002A41]/5 text-[#002A41]">
                        {s.plan || "Basic"}
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        s.status === "Active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {s.status === "Active" ? "সক্রিয়" : "পেন্ডিং"}
                      </span>
                      {teacher && (
                        <span className="text-xs px-2 py-1 rounded bg-purple-50 text-purple-700">
                          {teacher.name}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-[#002A41]">শিক্ষার্থীর প্রোফাইল</h2>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Image Upload */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-[#4CAF50] overflow-hidden flex items-center justify-center mb-2">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="text-slate-300" size={40} />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-xs flex items-center gap-1 font-bold text-[#4CAF50] hover:underline"
                >
                  {uploading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Upload size={14} />
                  )}
                  ছবি আপলোড করুন
                </button>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">নাম</p>
                  <p className="font-bold">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">মোবাইল</p>
                  <p className="font-bold">{selectedStudent.phone || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-500">ইমেইল</p>
                  <p className="font-bold">{selectedStudent.email || "—"}</p>
                </div>
              </div>

              {/* Application Data */}
              {selectedStudent.application_data &&
                Object.keys(selectedStudent.application_data).length > 0 && (
                  <div>
                    <h3 className="font-bold text-[#4CAF50] mb-2 text-sm">ফর্মের তথ্য</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {Object.entries(selectedStudent.application_data).map(([key, value]) => (
                        <div key={key} className="bg-slate-50 p-2 rounded-lg">
                          <p className="text-xs text-slate-500">{key.replace(/_/g, " ")}</p>
                          <p className="text-sm text-slate-800">{String(value) || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <hr className="border-slate-100" />

              {/* 🌟 Password Field */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Lock size={14} /> পাসওয়ার্ড
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none bg-white"
                    placeholder="পাসওয়ার্ড দিন"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* 🌟 Salary Field */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Wallet size={14} /> মাসিক ফি / বেতন (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none bg-white"
                  placeholder="যেমন: ৩০০০"
                />
              </div>

              {/* Plan */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">প্ল্যান</label>
                <select
                  value={planValue}
                  onChange={(e) => setPlanValue(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none bg-white"
                >
                  <option value="Basic">Basic</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">স্ট্যাটাস</label>
                <select
                  value={statusValue}
                  onChange={(e) => setStatusValue(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Teacher Assign (only if Active) */}
              {statusValue === "Active" && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                    <UserCheck size={16} className="text-[#4CAF50]" /> শিক্ষক নিয়োগ
                  </label>
                  <select
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4CAF50] outline-none bg-white"
                  >
                    <option value="">— শিক্ষক নির্বাচন করুন —</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} {t.role_bn ? `(${t.role_bn})` : ""}
                      </option>
                    ))}
                  </select>
                  {teacherId && (
                    <Link
                      href={`/admin/student-management/schedule?student=${selectedStudent.id}`}
                      className="mt-2 flex items-center gap-2 text-xs font-bold text-[#4CAF50] hover:underline"
                    >
                      <CalendarDays size={14} /> এই শিক্ষার্থীর ক্লাস শিডিউল দেখুন/এডিট করুন
                    </Link>
                  )}
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#4CAF50] hover:bg-[#388E3C] text-white py-3 rounded-lg font-bold transition flex justify-center items-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                সেভ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}