"use server";

import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase server configuration missing.");
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function getAdminContext() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase configuration missing.");
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: any[]) {  // 🌟 এখানে any[] টাইপ যোগ করা হলো
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {}
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    throw new Error("অনুমতি নেই।");
  }

  const allowedEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!allowedEmails.includes(user.email.toLowerCase())) {
    throw new Error("আপনি Admin নন।");
  }

  return {
    admin: getSupabaseAdmin(),
  };
}

export async function getTeacherApplications() {
  try {
    const { admin } = await getAdminContext();

    const { data, error } = await admin
      .from("teachers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      applications: data || [],
    };
  } catch (error) {
    console.error("Fetch teacher applications:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "আবেদনগুলো লোড করা যায়নি।",
      applications: [],
    };
  }
}

export async function approveTeacherApplication(id: string) {
  try {
    const { admin } = await getAdminContext();

    const { data: application, error: fetchError } = await admin
      .from("teachers")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !application) {
      throw new Error("আবেদনটি পাওয়া যায়নি।");
    }

    if (!application.user_id) {
      throw new Error("এই আবেদনের সঙ্গে কোনো Auth account যুক্ত নেই।");
    }

    const profileData = {
      user_id: application.user_id,
      name:
        application.name_bn ||
        application.name_en ||
        "Teacher",
      email: application.email || null,
      phone: application.phone || null,
      image_url: application.image_url || null,
      status: "Active",
      role_bn: application.role_bn || "শিক্ষক",
      role_en: application.role_en || "Teacher",
    };

    // Profile না থাকলে তৈরি হবে, থাকলে Update হবে।
    const { error: profileError } = await admin
      .from("teachers_profile")
      .upsert(profileData, {
        onConflict: "user_id",
      });

    if (profileError) throw profileError;

    // মূল আবেদন Active করা।
    const { error: updateError } = await admin
      .from("teachers")
      .update({ status: "Active" })
      .eq("id", id);

    if (updateError) {
      // Status update ব্যর্থ হলে তৈরি হওয়া profile সরানোর চেষ্টা।
      await admin
        .from("teachers_profile")
        .delete()
        .eq("user_id", application.user_id);

      throw updateError;
    }

    return { success: true };
  } catch (error) {
    console.error("Approve teacher application:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "আবেদন Approve করা যায়নি।",
    };
  }
}

export async function deleteTeacherApplication(id: string) {
  try {
    const { admin } = await getAdminContext();

    const { data: application, error: fetchError } = await admin
      .from("teachers")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !application) {
      throw new Error("আবেদনটি পাওয়া যায়নি।");
    }

    // প্রথমে সংশ্লিষ্ট Profile Delete।
    if (application.user_id) {
      const { error: profileError } = await admin
        .from("teachers_profile")
        .delete()
        .eq("user_id", application.user_id);

      if (profileError) throw profileError;
    }

    // এরপর মূল Application Delete।
    const { error: applicationError } = await admin
      .from("teachers")
      .delete()
      .eq("id", id);

    if (applicationError) throw applicationError;

    // সবশেষে Supabase Auth account Delete।
    if (application.user_id) {
      const { error: authError } = await admin.auth.admin.deleteUser(
        application.user_id
      );

      if (authError) {
        console.error("Auth account deletion error:", authError);

        return {
          success: false,
          error:
            "আবেদন ও Profile মুছে গেছে, কিন্তু Auth account মুছতে সমস্যা হয়েছে।",
        };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Delete teacher application:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "আবেদন Delete করা যায়নি।",
    };
  }
}