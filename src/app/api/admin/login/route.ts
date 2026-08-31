import { NextResponse } from "next/server";
import { checkPassword, signSession, sessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  let body: { password?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (!checkPassword(body.password || "")) {
    return NextResponse.json({ error: "That password is not right." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  const cookie = sessionCookie(signSession());
  res.cookies.set(cookie);
  return res;
}
