
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { findTeacherAuthEmail } from "@/actions/teacherAuth";
import { Lock, Mail, Loader2, Info, Phone } from "lucide-react";
import Link from "next/link";

export default function TeacherLogin() {
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setPending(false);

    try {
      // Gmail অথবা ফোন থেকে Auth email খুঁজে বের করা
      const lookup = await findTeacherAuthEmail(identity);

      if (!lookup.success || !lookup.authEmail) {
        setError(lookup.error || "অ্যাকাউন্ট পাওয়া যায়নি।");
        setLoading(false);
        return;
      }

      // Supabase Auth দিয়ে password যাচাই
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: lookup.authEmail,
          password,
        });

      if (authError || !authData.user) {
        setError("Gmail/ফোন নম্বর অথবা পাসওয়ার্ড সঠিক নয়।");
        setLoading(false);
        return;
      }

      // Approval status যাচাই
      const { data: teacher, error: teacherError } = await supabase
        .from("teachers")
        .select("status")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (teacherError || !teacher || teacher.status !== "Active") {
        await supabase.auth.signOut();

        if (teacher?.status === "Pending") {
          setPending(true);
        } else {
          setError("আপনার অ্যাকাউন্ট এখন সক্রিয় নেই। Admin-এর সঙ্গে যোগাযোগ করুন।");
        }

        setLoading(false);
        return;
      }

      router.push("/teacher/dashboard");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Login করা যায়নি। আবার চেষ্টা করুন।");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Teacher Login
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            আপনার Gmail অথবা ফোন নম্বর দিয়ে প্রবেশ করুন
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Gmail অথবা ফোন নম্বর
            </label>

            <div className="relative">
              {identity.includes("@") ? (
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              ) : (
                <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              )}

              <input
                type="text"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                placeholder="Gmail অথবা 017XXXXXXXX"
                required
                className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="আপনার পাসওয়ার্ড"
                required
                className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {pending && (
            <div className="flex gap-2 rounded-lg bg-orange-50 p-3 text-sm text-orange-700">
              <Info className="h-5 w-5 shrink-0" />
              আপনার আবেদন এখনো Admin অনুমোদন করেননি। অনুমোদনের পর Login করতে পারবেন।
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {loading ? "অপেক্ষা করুন..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          এখনো আবেদন করেননি?{" "}
          <Link
            href="/teacher/register"
            className="font-semibold text-blue-600 hover:underline"
          >
            আবেদন করুন
          </Link>
        </p>
      </div>
    </div>
  );
}
