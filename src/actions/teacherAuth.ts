
"use server";

import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase configuration missing.");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function normalizeBDPhone(value: string) {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("8801") && digits.length === 13) {
    digits = "0" + digits.slice(3);
  } else if (digits.startsWith("1") && digits.length === 10) {
    digits = "0" + digits;
  }

  return /^01[3-9]\d{8}$/.test(digits) ? digits : "";
}

export async function findTeacherAuthEmail(identity: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const value = identity.trim();

    if (!value) {
      return { success: false, error: "Gmail অথবা ফোন নম্বর দিন।" };
    }

    let query = supabaseAdmin
      .from("teachers")
      .select("phone, email, status");

    if (value.includes("@")) {
      query = query.eq("email", value.toLowerCase());
    } else {
      const phone = normalizeBDPhone(value);

      if (!phone) {
        return {
          success: false,
          error: "সঠিক বাংলাদেশি ফোন নম্বর দিন।",
        };
      }

      query = query.eq("phone", phone);
    }

    const { data: teacher, error } = await query.maybeSingle();

    if (error || !teacher?.phone) {
      return {
        success: false,
        error: "এই Gmail বা ফোন নম্বর দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।",
      };
    }

    return {
      success: true,
      authEmail: `${teacher.phone}@gmail.com`,
    };
  } catch (error) {
    console.error("Teacher lookup error:", error);

    return {
      success: false,
      error: "Login করা যাচ্ছে না। পরে আবার চেষ্টা করুন।",
    };
  }
}
