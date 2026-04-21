import { adminAuth } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, newPassword } = await req.json();

  try {
    const user = await adminAuth.getUserByEmail(email);
    await adminAuth.updateUser(user.uid, { password: newPassword });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}