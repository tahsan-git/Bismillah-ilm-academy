"use server";
import { createClient } from "@supabase/supabase-js";

export async function registerStudent(data: { name: string; email: string; phone: string; password: string }) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // ১. Admin API দিয়ে ইউজার তৈরি করা (ইমেইল কনফার্মেশন ছাড়াই)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true, // অটোমেটিক কনফার্ম
    user_metadata: {
      name: data.name,
      phone: data.phone,
    },
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  // ২. students টেবিলে ডাটা পাঠানো (আমাদের ডাটাবেস ট্রিগার এটা করবে, তবে আমরা নিশ্চিত হচ্ছি)
  const { error: dbError } = await supabaseAdmin.from("students").upsert({
    user_id: authData.user.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    status: "Pending",
  }, { onConflict: "user_id" });

  if (dbError) {
    return { success: false, error: dbError.message };
  }

  return { success: true };
}