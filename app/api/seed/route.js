import { NextResponse } from "next/server";

function seedingDisabledResponse() {
  return NextResponse.json(
    {
      success: false,
      error: "Sample catalog seeding is disabled. Add real products from the admin catalog.",
    },
    { status: 410 }
  );
}

export async function POST() {
  return seedingDisabledResponse();
}

export async function GET() {
  return seedingDisabledResponse();
}
