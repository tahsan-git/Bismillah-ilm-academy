"use server";
import { createClient } from "@supabase/supabase-js";

export async function registerTeacher(data: { name: string; email: string; phone: string; password: string }) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // ১. Admin API দিয়ে ইউজার তৈরি
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true, 
    user_metadata: { name: data.name, phone: data.phone },
  });

  if (authError) return { success: false, error: authError.message };

  // ২. teachers টেবিলে ডাটা পাঠানো (Pending হিসেবে)
  const { error: dbError } = await supabaseAdmin.from("teachers").upsert({
    user_id: authData.user.id,
    name_bn: data.name,
    name_en: data.name,
    email: data.email,
    phone: data.phone,
    role_bn: "শিক্ষক",
    role_en: "Teacher",
    status: "Pending",
  }, { onConflict: "user_id" });

  if (dbError) return { success: false, error: dbError.message };
  return { success: true };
}