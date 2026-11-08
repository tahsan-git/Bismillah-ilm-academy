
"use server";

import { createClient } from "@supabase/supabase-js";

type RegisterTeacherData = {
  name: string;
  email: string;
  phone: string;
  password: string;
  applicationData: Record<string, string>;
};

function normalizeBDPhone(value: string) {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("8801") && digits.length === 13) {
    digits = "0" + digits.slice(3);
  } else if (digits.startsWith("1") && digits.length === 10) {
    digits = "0" + digits;
  }

  return /^01[3-9]\d{8}$/.test(digits) ? digits : "";
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase server configuration missing.");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function registerTeacher(data: RegisterTeacherData) {
  try {
    const name = data.name?.trim();
    const email = data.email?.trim().toLowerCase();
    const phone = normalizeBDPhone(data.phone || "");
    const password = data.password;

    if (!name || !email || !phone || !password || password.length < 6) {
      return {
        success: false,
        error: "সঠিক তথ্য প্রদান করুন। পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।",
      };
    }

    const gender = data.applicationData?.gender;

    if (gender !== "male" && gender !== "female") {
      return {
        success: false,
        error: "শিক্ষক অথবা শিক্ষিকা নির্বাচন করুন।",
      };
    }

    const supabaseAdmin = getSupabaseAdmin();

    // একই Gmail দিয়ে আগে আবেদন করা হয়েছে কি না
    const { data: existingEmail } = await supabaseAdmin
      .from("teachers")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingEmail) {
      return {
        success: false,
        error: "এই Gmail দিয়ে ইতোমধ্যে আবেদন করা হয়েছে।",
      };
    }

    // একই ফোন নম্বর দিয়ে আগে আবেদন করা হয়েছে কি না
    const { data: existingPhone } = await supabaseAdmin
      .from("teachers")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (existingPhone) {
      return {
        success: false,
        error: "এই ফোন নম্বর দিয়ে ইতোমধ্যে আবেদন করা হয়েছে।",
      };
    }

    // Phone Auth ছাড়াই phone-based internal email
    const authEmail = `${phone}@gmail.com`;

    const genderInfo =
      gender === "female"
        ? { roleBn: "শিক্ষিকা", roleEn: "Female Teacher" }
        : { roleBn: "শিক্ষক", roleEn: "Teacher" };

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: authEmail,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          actual_email: email,
          phone,
          gender,
          role: "teacher",
        },
      });

    if (authError || !authData.user) {
      console.error("Auth registration error:", authError);

      return {
        success: false,
        error: "অ্যাকাউন্ট তৈরি করা যায়নি। Gmail বা ফোন নম্বর যাচাই করুন।",
      };
    }

    const { error: dbError } = await supabaseAdmin
      .from("teachers")
      .insert({
        user_id: authData.user.id,
        name_bn: name,
        name_en: name,
        email,
        phone,
        role_bn: genderInfo.roleBn,
        role_en: genderInfo.roleEn,
        status: "Pending",
        application_data: data.applicationData,
      });

    if (dbError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

      console.error("Teacher application error:", dbError);

      return {
        success: false,
        error: "আবেদন সংরক্ষণ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);

    return {
      success: false,
      error: "রেজিস্ট্রেশন সম্পন্ন করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।",
    };
  }
}
