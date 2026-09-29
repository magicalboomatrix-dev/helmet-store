import { NextResponse } from "next/server";

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

    return NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: {
        email: expectedEmail,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: "Login failed: " + error.message },
      { status: 500 }
    );
  }
}
