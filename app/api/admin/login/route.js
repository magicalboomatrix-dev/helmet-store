import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  createAdminSession,
  isAdminRequest,
} from "@/lib/adminAuth";

export async function GET(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  return NextResponse.json({ success: true });
}

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const expectedEmail = (process.env.ADMIN_EMAIL || "admin@helmetstore.com").toLowerCase();
    const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";

    const cleanInputEmail = (email || "").trim().toLowerCase();
    const cleanInputPass = (password || "").trim();

    const isEmailValid =
      cleanInputEmail === expectedEmail ||
      cleanInputEmail === "admin" ||
      cleanInputEmail === "admin@helmetstore.com";

    const isPassValid = cleanInputPass === expectedPassword;

    if (!isEmailValid || !isPassValid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. Please check your username/email and password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: {
        email: expectedEmail,
        role: "admin",
      },
    });
    response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSession(), adminSessionCookieOptions);
    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: "Login failed: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    ...adminSessionCookieOptions,
    maxAge: 0,
  });
  return response;
}
