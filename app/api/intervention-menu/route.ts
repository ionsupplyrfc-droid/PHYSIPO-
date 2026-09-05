import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const rows = await sql`
    select id, name from intervention_menu where user_id = ${user.userId} order by name asc
  `;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = (body?.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "メニュー名を入力してください" }, { status: 400 });

  await sql`
    insert into intervention_menu (user_id, name) values (${user.userId}, ${name})
    on conflict (user_id, name) do nothing
  `;
  const rows = await sql`
    select id, name from intervention_menu where user_id = ${user.userId} and name = ${name}
  `;
  return NextResponse.json(rows[0]);
}
