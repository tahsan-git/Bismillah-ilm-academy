"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Eye,
  FileDown,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  getTeacherApplications,
  approveTeacherApplication,
  deleteTeacherApplication,
} from "@/actions/adminTeacherApps";

type TeacherApplication = {
  id: string;
  user_id: string | null;
  name_bn: string | null;
  name_en: string | null;
  email: string | null;
  phone: string | null;
  role_bn: string | null;
  role_en: string | null;
  image_url: string | null;
  status: string | null;
  application_data: Record<string, unknown> | null;
  created_at: string;
};

type FilterType = "All" | "Pending" | "Active" | "Cancelled";

const statusLabels: Record<string, string> = {
  Pending: "অপেক্ষমাণ",
  Active: "অনুমোদিত",
  Cancelled: "বাতিল",
};

function formatDate(date: string) {
  if (!date) return "—";

  return new Date(date).toLocaleString("bn-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "হ্যাঁ" : "না";
  }

  if (Array.isArray(value)) {
    return value.map(formatValue).join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

export default function AdminTeacherApps() {
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("All");
  const [search, setSearch] = useState("");
  const [selectedApplication, setSelectedApplication] =
    useState<TeacherApplication | null>(null);
  const [error, setError] = useState("");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    const result = await getTeacherApplications();

    if (result.success) {
      setApplications(
        (result.applications || []) as TeacherApplication[]
      );
    } else {
      setError(result.error || "আবেদনগুলো লোড করা যায়নি।");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const matchesFilter =
        filter === "All" || application.status === filter;

      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        [
          application.name_bn,
          application.name_en,
          application.email,
          application.phone,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(searchText)
          );

      return matchesFilter && matchesSearch;
    });
  }, [applications, filter, search]);

  const counts = useMemo(
    () => ({
      All: applications.length,
      Pending: applications.filter((item) => item.status === "Pending")
        .length,
      Active: applications.filter((item) => item.status === "Active")
        .length,
      Cancelled: applications.filter(
        (item) => item.status === "Cancelled"
      ).length,
    }),
    [applications]
  );

  const handleApprove = async (application: TeacherApplication) => {
    const confirmed = window.confirm(
      `আপনি কি ${application.name_bn || application.name_en || "এই আবেদন"}-কে Approve করতে চান?`
    );

    if (!confirmed) return;

    setActionId(application.id);

    const result = await approveTeacherApplication(application.id);

    if (!result.success) {
      window.alert(result.error || "Approve করা যায়নি।");
    } else {
      window.alert("আবেদনটি সফলভাবে Approve হয়েছে।");
      await fetchApplications();
    }

    setActionId(null);
  };

  const handleDelete = async (application: TeacherApplication) => {
    const name =
      application.name_bn || application.name_en || "এই আবেদন";

    const confirmed = window.confirm(
      `আপনি কি "${name}"-এর আবেদন স্থায়ীভাবে Delete করতে চান?\n\nএতে আবেদন, Teacher Profile এবং সংশ্লিষ্ট Login Account—সব মুছে যাবে। এই কাজটি আর Undo করা যাবে না।`
    );

    if (!confirmed) return;

    setActionId(application.id);

    const result = await deleteTeacherApplication(application.id);

    if (!result.success) {
      window.alert(result.error || "Delete করা যায়নি।");
    } else {
      if (selectedApplication?.id === application.id) {
        setSelectedApplication(null);
      }

      window.alert("আবেদনটি স্থায়ীভাবে Delete করা হয়েছে।");
      await fetchApplications();
    }

    setActionId(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          .application-print-area,
          .application-print-area * {
            visibility: visible !important;
          }

          .application-print-area {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            padding: 24px !important;
            background: white !important;
            color: black !important;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            শিক্ষক আবেদনসমূহ
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            সকল Pending, Approved এবং Cancelled আবেদন পরিচালনা করুন।
          </p>
        </div>

        <button
          type="button"
          onClick={fetchApplications}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(
          [
            ["All", "সর্বমোট আবেদন", "text-gray-900"],
            ["Pending", "অপেক্ষমাণ", "text-amber-600"],
            ["Active", "অনুমোদিত", "text-green-600"],
            ["Cancelled", "বাতিল", "text-red-600"],
          ] as const
        ).map(([key, label, color]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-xl border bg-white p-4 text-left transition ${
              filter === key
                ? "border-blue-500 ring-2 ring-blue-100"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`mt-2 text-2xl font-bold ${color}`}>
              {counts[key]}
            </p>
          </button>
        ))}
      </div>

      {/* Search and filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="নাম, Gmail অথবা ফোন নম্বর দিয়ে খুঁজুন..."
            className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500"
          />
        </div>

        <select
          value={filter}
          onChange={(event) =>
            setFilter(event.target.value as FilterType)
          }
          className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
        >
          <option value="All">সকল আবেদন</option>
          <option value="Pending">অপেক্ষমাণ</option>
          <option value="Active">অনুমোদিত</option>
          <option value="Cancelled">বাতিল</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Applications */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex min-h-52 items-center justify-center gap-3 text-gray-500">
            <Loader2 className="animate-spin" size={22} />
            আবেদন লোড হচ্ছে...
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center px-4 text-center">
            <Search size={28} className="mb-3 text-gray-300" />
            <p className="font-medium text-gray-700">
              কোনো আবেদন পাওয়া যায়নি।
            </p>
            <p className="mt-1 text-sm text-gray-400">
              অন্য Filter অথবা Search দিয়ে চেষ্টা করুন।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-4 font-semibold">শিক্ষক</th>
                  <th className="px-5 py-4 font-semibold">যোগাযোগ</th>
                  <th className="px-5 py-4 font-semibold">আবেদনের তারিখ</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredApplications.map((application) => {
                  const status = application.status || "Pending";
                  const isBusy = actionId === application.id;

                  return (
                    <tr
                      key={application.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {application.image_url ? (
                            <img
                              src={application.image_url}
                              alt=""
                              className="h-10 w-10 rounded-full border border-gray-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">
                              {(application.name_bn ||
                                application.name_en ||
                                "T")[0]}
                            </div>
                          )}

                          <div>
                            <p className="font-semibold text-gray-900">
                              {application.name_bn ||
                                application.name_en ||
                                "নাম নেই"}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500">
                              {application.role_bn || "শিক্ষক"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-gray-700">
                          {application.email || "—"}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {application.phone || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {formatDate(application.created_at)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            status === "Active"
                              ? "bg-green-50 text-green-700"
                              : status === "Cancelled"
                                ? "bg-red-50 text-red-700"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {statusLabels[status] || status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            title="আবেদনের বিস্তারিত"
                            onClick={() =>
                              setSelectedApplication(application)
                            }
                            className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100"
                          >
                            <Eye size={16} />
                          </button>

                          {status !== "Active" && (
                            <button
                              type="button"
                              title="Approve"
                              disabled={isBusy}
                              onClick={() => handleApprove(application)}
                              className="rounded-lg border border-green-200 p-2 text-green-700 transition hover:bg-green-50 disabled:opacity-50"
                            >
                              {isBusy ? (
                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <Check size={16} />
                              )}
                            </button>
                          )}

                          <button
                            type="button"
                            title="স্থায়ীভাবে Delete"
                            disabled={isBusy}
                            onClick={() => handleDelete(application)}
                            className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            {isBusy ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400">
        দেখানো হচ্ছে {filteredApplications.length}টি / মোট{" "}
        {applications.length}টি আবেদন।
      </p>

      {/* Application details modal */}
      {selectedApplication && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedApplication(null);
            }
          }}
        >
          <div className="application-print-area max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
              <div>
                <h3 className="font-bold text-gray-900">
                  সম্পূর্ণ আবেদন
                </h3>
                <p className="text-xs text-gray-500">
                  Teacher Application Details
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <FileDown size={16} />
                  PDF / Print
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedApplication(null)}
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-7 border-b border-gray-200 pb-5 text-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  Bismillah Ilm Academy
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                  Teacher Registration Application
                </p>
              </div>

              <div className="mb-7 flex flex-col items-center gap-3 sm:flex-row">
                {selectedApplication.image_url && (
                  <img
                    src={selectedApplication.image_url}
                    alt=""
                    className="h-20 w-20 rounded-full border object-cover"
                  />
                )}

                <div className="text-center sm:text-left">
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedApplication.name_bn ||
                      selectedApplication.name_en ||
                      "নাম নেই"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedApplication.role_bn || "শিক্ষক"}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    আবেদন: {formatDate(selectedApplication.created_at)}
                  </p>
                </div>
              </div>

              <div className="mb-7 grid gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="mt-1 break-all font-medium text-gray-900">
                    {selectedApplication.email || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {selectedApplication.phone || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">বর্তমান Status</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {statusLabels[selectedApplication.status || "Pending"] ||
                      selectedApplication.status}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Application ID</p>
                  <p className="mt-1 break-all font-medium text-gray-900">
                    {selectedApplication.id}
                  </p>
                </div>
              </div>

              <h3 className="mb-4 border-b border-gray-200 pb-2 font-bold text-gray-900">
                আবেদনের বিস্তারিত তথ্য
              </h3>

              {selectedApplication.application_data &&
              Object.keys(selectedApplication.application_data).length >
                0 ? (
                <div className="space-y-3">
                  {Object.entries(
                    selectedApplication.application_data
                  ).map(([key, value]) => (
                    <div
                      key={key}
                      className="grid gap-1 border-b border-gray-100 pb-3 sm:grid-cols-[190px_1fr]"
                    >
                      <p className="break-words text-sm font-medium text-gray-500">
                        {key}
                      </p>

                      <p className="whitespace-pre-wrap break-words text-sm text-gray-900">
                        {formatValue(value)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  অতিরিক্ত কোনো তথ্য পাওয়া যায়নি।
                </p>
              )}

              <div className="mt-10 border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
                Bismillah Ilm Academy — Teacher Application
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}