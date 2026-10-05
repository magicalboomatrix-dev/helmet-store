import { NextResponse } from "next/server";
import { promisify } from "node:util";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import connectToDatabase from "@/lib/mongodb";
import Customer from "@/models/Customer";
import {
  CUSTOMER_SESSION_COOKIE,
  createCustomerSession,
  customerSessionCookieOptions,
} from "@/lib/customerAuth";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

async function hashPassword(password, salt) {
  const key = await scrypt(password, salt, KEY_LENGTH);
  return `${salt}:${key.toString("hex")}`;
}

async function verifyPassword(password, storedHash) {
  const [salt, hash] = (storedHash || "").split(":");
  if (!salt || !hash) return false;
  const actual = await scrypt(password, salt, KEY_LENGTH);
  const expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const { action, name = "", email = "", password = "" } = await request.json();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return NextResponse.json({ success: false, error: "Enter a valid email address." }, { status: 400 });
    }
    if (String(password).length < 10 || String(password).length > 128) {
      return NextResponse.json({ success: false, error: "Password must be between 10 and 128 characters." }, { status: 400 });
    }

    let customer;
    if (action === "register") {
      if (!cleanName || cleanName.length > 100) {
        return NextResponse.json({ success: false, error: "Enter your name (up to 100 characters)." }, { status: 400 });
      }
      const salt = randomBytes(16).toString("hex");
      const passwordHash = await hashPassword(String(password), salt);
      customer = await Customer.create({ name: cleanName, email: cleanEmail, passwordHash });
    } else if (action === "login") {
      customer = await Customer.findOne({ email: cleanEmail }).select("+passwordHash");
      if (!customer || !(await verifyPassword(String(password), customer.passwordHash))) {
        return NextResponse.json({ success: false, error: "Email or password is incorrect." }, { status: 401 });
      }
    } else {
      return NextResponse.json({ success: false, error: "Choose sign in or create account." }, { status: 400 });
    }

    const response = NextResponse.json({
      success: true,
      customer: { id: String(customer._id), name: customer.name, email: customer.email },
    });
    response.cookies.set(CUSTOMER_SESSION_COOKIE, createCustomerSession(customer), customerSessionCookieOptions);
    return response;
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json({ success: false, error: "An account with this email already exists. Sign in instead." }, { status: 409 });
    }
    console.error("Customer authentication error:", error);
    return NextResponse.json({ success: false, error: "Could not complete account request." }, { status: 500 });
  }
}
