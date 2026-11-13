import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list: any[]) =>
          list.forEach((c) =>
            response.cookies.set(c.name, c.value, c.options)
          ),
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // 🌟 Admin Protection
  if (path.startsWith("/admin") && !path.startsWith("/admin/login")) {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    const allowedEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
    if (!user.email || !allowedEmails.includes(user.email.toLowerCase())) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 🌟 Admin login page e login kora thakle dashboard e pathao
  if (path === "/admin/login" && user) {
    const allowedEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
    if (user.email && allowedEmails.includes(user.email.toLowerCase())) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // 🌟 Teacher Protection
  if (path.startsWith("/teacher") && !path.startsWith("/teacher/login") && !path.startsWith("/teacher/register")) {
    const teacherId = request.cookies.get("teacher_id")?.value;
    if (!teacherId) {
      return NextResponse.redirect(new URL("/teacher/login", request.url));
    }
  }

  // 🌟 Student Protection
  if (path.startsWith("/student") && !path.startsWith("/student/login") && !path.startsWith("/student/register")) {
    const studentId = request.cookies.get("student_id")?.value;
    if (!studentId) {
      return NextResponse.redirect(new URL("/student/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
  ],
};