import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { signSession } from "@/lib/session";
import { COOKIE_NAME } from "@/lib/constants";
import { Role } from "@/lib/types";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const userId = body?.userId;
  const password = body?.password;

  if (!userId || typeof password !== "string" || password.length === 0) {
    return NextResponse.json({ error: "氏名または合言葉が正しくありません" }, { status: 401 });
  }

  const sharedPassword = process.env.APP_SHARED_PASSWORD;
  if (!sharedPassword) {
    return NextResponse.json(
      { error: "サーバー設定が未完了です。管理者に連絡してください。" },
      { status: 500 }
    );
  }

  if (!safeEqual(password, sharedPassword)) {
    return NextResponse.json({ error: "氏名または合言葉が正しくありません" }, { status: 401 });
  }

  const rows = await sql`select id, name, role from users where id = ${userId}`;
  const user = rows[0] as { id: number; name: string; role: Role } | undefined;
  if (!user) {
    return NextResponse.json({ error: "氏名または合言葉が正しくありません" }, { status: 401 });
  }

  const token = signSession({ userId: user.id, name: user.name, role: user.role });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ ok: true });
}
