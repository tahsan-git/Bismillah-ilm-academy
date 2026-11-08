
"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Trash2,
  Eye,
  Download,
  Loader2,
  RefreshCw,
  X,
  FileText,
} from "lucide-react";

import {
  getTeacherApplications,
  approveTeacherApplication,
  deleteTeacherApplication,
} from "@/actions/adminTeacherApps";

type Application = {
  id: string;
  user_id: string | null;
  name_bn: string | null;
  name_en: string | null;
  email: string | null;
  phone: string | null;
  role_bn: string | null;
  role_en: string | null;
  status: string | null;
  application_data: Record<string, unknown> | null;
  created_at: string | null;
};

const labels: Record<string, string> = {
  gender: "আবেদনকারীর ধরন",
  hifz_year: "হিফজ সম্পন্ন করার বছর",
  hifz_madrasa: "হিফজ মাদরাসার নাম",
  other_studies: "অন্যান্য পড়াশোনা",
  present_address: "বর্তমান ঠিকানা",
  permanent_address: "স্থায়ী ঠিকানা",
  age: "বয়স",
  marital_status: "বৈবাহিক অবস্থা",

  dawra_year: "দাওরায়ে হাদিসের বছর",
  dawra_madrasa: "দাওরায়ে হাদিস মাদরাসা",
  current_work: "বর্তমান পেশা",
  work_objection: "কাজের বিষয়ে আপত্তি",
  guardian_communication: "অভিভাবকের সঙ্গে যোগাযোগ",
  avoid_hifz: "হিফজ এড়িয়ে যাওয়ার কারণ",
  long_leave: "দীর্ঘ ছুটির বিষয়",
  free_time: "অবসর সময়",
  phone_model: "ফোনের মডেল",

  jamath_studies: "জামাত ও পড়াশোনা",
  children: "সন্তান",
  residential_madrasa: "আবাসিক মাদরাসা",
  family_permission: "পরিবারের অনুমতি",
  maternity_leave: "মাতৃত্বকালীন ছুটি",

  teaching_ability: "শিক্ষাদানের সক্ষমতা",
  internet_type: "ইন্টারনেটের ধরন",
  teaching_language: "শিক্ষাদানের ভাষা",
  quiet_environment: "নিরিবিলি পরিবেশ",
  other_academy: "অন্য কোনো একাডেমিতে যুক্ত কি না",
  long_term: "দীর্ঘমেয়াদি কাজের আগ্রহ",
  opinion: "নিজের মতামত",
};

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "উল্লেখ করা হয়নি";
  }

  if (typeof value === "boolean") {
    return value ? "হ্যাঁ" : "না";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function escapeHTML(value: unknown) {
  return displayValue(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br>");
}

function downloadApplicationPDF(application: Application) {
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("PDF তৈরি করতে নতুন Window খুলতে অনুমতি দিন।");
    return;
  }

  const answers = Object.entries(application.application_data || {});

  const rows = answers
    .map(([key, value]) => {
      const label = labels[key] || key;

      return `
        <tr>
          <th>${escapeHTML(label)}</th>
          <td>${escapeHTML(value)}</td>
        </tr>
      `;
    })
    .join("");

  const createdAt = application.created_at
    ? new Date(application.created_at).toLocaleString("bn-BD")
    : "উল্লেখ করা হয়নি";

  const html = `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8" />
      <title>Teacher Application - ${escapeHTML(application.name_bn)}</title>

      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <style>
        * { box-sizing: border-box; }

        body {
          font-family: "Noto Sans Bengali", sans-serif;
          color: #222;
          padding: 30px;
          line-height: 1.8;
        }

        h1 {
          text-align: center;
          margin-bottom: 4px;
          font-size: 24px;
        }

        .subtitle {
          text-align: center;
          color: #666;
          margin-bottom: 25px;
        }

        h2 {
          font-size: 17px;
          margin-top: 25px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 7px;
        }

        .info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin: 20px 0;
        }

        .info div {
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 9px;
        }

        .info strong {
          display: block;
          color: #555;
          font-size: 12px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
        }

        th, td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
          vertical-align: top;
          font-size: 13px;
        }

        th {
          width: 35%;
          background: #f7f7f7;
          font-weight: 600;
        }

        .footer {
          margin-top: 30px;
          text-align: center;
          color: #777;
          font-size: 11px;
        }

        @media print {
          body { padding: 0; }
          tr { page-break-inside: avoid; }
        }
      </style>
    </head>

    <body>
      <h1>Bismillah Ilm Academy</h1>
      <div class="subtitle">শিক্ষক নিয়োগের আবেদনপত্র</div>

      <h2>ব্যক্তিগত তথ্য</h2>

      <div class="info">
        <div>
          <strong>নাম</strong>
          ${escapeHTML(application.name_bn || application.name_en)}
        </div>

        <div>
          <strong>ইমেইল</strong>
          ${escapeHTML(application.email)}
        </div>

        <div>
          <strong>ফোন নম্বর</strong>
          ${escapeHTML(application.phone)}
        </div>

        <div>
          <strong>আবেদনের তারিখ</strong>
          ${escapeHTML(createdAt)}
        </div>

        <div>
          <strong>পদ</strong>
          ${escapeHTML(application.role_bn)}
        </div>

        <div>
          <strong>আবেদনের অবস্থা</strong>
          ${escapeHTML(application.status)}
        </div>
      </div>

      <h2>আবেদনপত্রের সম্পূর্ণ উত্তর</h2>

      <table>
        <tbody>
          ${rows || "<tr><td>কোনো উত্তর পাওয়া যায়নি।</td></tr>"}
        </tbody>
      </table>

      <div class="footer">
        Bismillah Ilm Academy — Teacher Application
      </div>

      <script>
        window.onload = () => {
          setTimeout(() => window.print(), 700);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

export default function AdminTeacherApps() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Application | null>(null);
  const [message, setMessage] = useState("");

  const fetchApplications = async () => {
    setLoading(true);

    const result = await getTeacherApplications();

    if (result.success) {
      setApplications(result.applications as Application[]);
      setMessage("");
    } else {
      setMessage(result.error || "আবেদন লোড করা যায়নি।");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (id: string) => {
    if (!confirm("আপনি কি এই আবেদনটি Approve করতে চান?")) return;

    setBusyId(id);
    setMessage("");

    const result = await approveTeacherApplication(id);

    if (!result.success) {
      setMessage(result.error || "Approve করা যায়নি।");
    } else {
      setMessage("আবেদন সফলভাবে Approve হয়েছে।");
      await fetchApplications();
    }

    setBusyId(null);
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "আপনি কি নিশ্চিত? আবেদন, Teacher Profile এবং সংশ্লিষ্ট Auth account মুছে ফেলা হবে।"
      )
    ) {
      return;
    }

    setBusyId(id);
    setMessage("");

    const result = await deleteTeacherApplication(id);

    if (!result.success) {
      setMessage(result.error || "Delete করা যায়নি।");
    } else {
      setMessage("আবেদন সফলভাবে Delete হয়েছে।");
      if (selected?.id === id) setSelected(null);
      await fetchApplications();
    }

    setBusyId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Teacher Applications
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            সকল শিক্ষক আবেদন দেখুন, অনুমোদন করুন অথবা মুছে ফেলুন।
          </p>
        </div>

        <button
          onClick={fetchApplications}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {message && (
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          {message}
        </div>
      )}

      <div className="rounded-xl border bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            আবেদন লোড হচ্ছে...
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            কোনো আবেদন পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-4">নাম</th>
                  <th className="px-5 py-4">যোগাযোগ</th>
                  <th className="px-5 py-4">পদ</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">আবেদন</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {applications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900">
                        {application.name_bn || application.name_en || "নাম নেই"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div>{application.email || "—"}</div>
                      <div className="text-gray-500">
                        {application.phone || "—"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {application.role_bn || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          application.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {application.status || "Pending"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {application.created_at
                        ? new Date(application.created_at).toLocaleDateString("bn-BD")
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected(application)}
                          title="আবেদন দেখুন"
                          className="rounded-lg border p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => downloadApplicationPDF(application)}
                          title="PDF Save করুন"
                          className="rounded-lg border p-2 text-purple-600 hover:bg-purple-50"
                        >
                          <Download className="h-4 w-4" />
                        </button>

                        {application.status !== "Active" && (
                          <button
                            onClick={() => handleApprove(application.id)}
                            disabled={busyId === application.id}
                            title="Approve"
                            className="rounded-lg border p-2 text-green-600 hover:bg-green-50 disabled:opacity-50"
                          >
                            {busyId === application.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(application.id)}
                          disabled={busyId === application.id}
                          title="Delete"
                          className="rounded-lg border p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white p-5">
              <div>
                <h3 className="text-lg font-bold">সম্পূর্ণ আবেদন</h3>
                <p className="text-sm text-gray-500">
                  {selected.name_bn || selected.name_en}
                </p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Gmail</p>
                  <p className="break-all font-medium">{selected.email || "—"}</p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">ফোন</p>
                  <p className="font-medium">{selected.phone || "—"}</p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">পদ</p>
                  <p className="font-medium">{selected.role_bn || "—"}</p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="font-medium">{selected.status || "Pending"}</p>
                </div>
              </div>

              <div>
                <h4 className="mb-3 flex items-center gap-2 font-semibold">
                  <FileText className="h-4 w-4" />
                  আবেদনপত্রের উত্তর
                </h4>

                <div className="divide-y rounded-lg border">
                  {Object.entries(selected.application_data || {}).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="grid gap-2 p-3 sm:grid-cols-[220px_1fr]"
                      >
                        <div className="text-sm font-semibold text-gray-600">
                          {labels[key] || key}
                        </div>

                        <div className="whitespace-pre-wrap break-words text-sm text-gray-900">
                          {displayValue(value)}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <button
                onClick={() => downloadApplicationPDF(selected)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700"
              >
                <Download className="h-5 w-5" />
                PDF Download / Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
