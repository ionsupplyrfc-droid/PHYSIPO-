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
  const password = body?.password;

  if (typeof password !== "string" || password.length === 0) {
    return NextResponse.json({ error: "合言葉が正しくありません" }, { status: 401 });
  }

  const sharedPassword = process.env.APP_SHARED_PASSWORD;
  if (!sharedPassword) {
    return NextResponse.json(
      { error: "サーバー設定が未完了です。管理者に連絡してください。" },
      { status: 500 }
    );
  }

  if (!safeEqual(password, sharedPassword)) {
    return NextResponse.json({ error: "合言葉が正しくありません" }, { status: 401 });
  }

  // 本人専用アプリのため、氏名選択は行わず登録済みの利用者（role: player）を自動的にログイン対象とする。
  const rows = await sql`select id, name, role from users where role = 'player' order by id asc limit 1`;
  const user = rows[0] as { id: number; name: string; role: Role } | undefined;
  if (!user) {
    return NextResponse.json(
      { error: "利用者が登録されていません。管理者に連絡してください。" },
      { status: 500 }
    );
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
