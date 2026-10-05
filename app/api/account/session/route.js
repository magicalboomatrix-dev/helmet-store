import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { CUSTOMER_SESSION_COOKIE, getCustomerSession, customerSessionCookieOptions } from "@/lib/customerAuth";

export async function GET(request) {
  const session = getCustomerSession(request);
  if (!session) {
    return NextResponse.json({ success: true, customer: null });
  }

  try {
    await connectToDatabase();
    const customer = await Customer.findById(session.userId).select("name email");
    if (!customer) return NextResponse.json({ success: true, customer: null });
    return NextResponse.json({
      success: true,
      customer: { id: String(customer._id), name: customer.name, email: customer.email },
    });
  } catch (error) {
    console.error("Customer session lookup error:", error);
    return NextResponse.json({ success: false, error: "Could not check account session." }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(CUSTOMER_SESSION_COOKIE, "", { ...customerSessionCookieOptions, maxAge: 0 });
  return response;
}
