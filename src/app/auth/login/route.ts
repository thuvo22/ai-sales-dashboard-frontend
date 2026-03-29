import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const correctPassword = process.env.DASHBOARD_PASSWORD || "onpoint2026";

  if (password === correctPassword) {
    const response = NextResponse.json({ ok: true });

    // Set auth cookie — 30 days, httpOnly, secure in production
    response.cookies.set("dash_auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}
