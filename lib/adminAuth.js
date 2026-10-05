import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "helmet_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "admin123";
}

function signExpiry(expiry) {
  return createHmac("sha256", getSessionSecret()).update(expiry).digest("hex");
}

export function createAdminSession() {
  const expiry = String(Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS);
  return `${expiry}.${signExpiry(expiry)}`;
}

export function isAdminRequest(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`));

  if (!cookie) return false;

  const token = cookie.slice(ADMIN_SESSION_COOKIE.length + 1);
  const [expiry, signature] = token.split(".");
  if (!expiry || !signature || Number(expiry) <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expected = Buffer.from(signExpiry(expiry), "hex");
  const actual = Buffer.from(signature, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export const adminSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge: SESSION_DURATION_SECONDS,
};