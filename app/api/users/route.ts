import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// ログイン画面のプルダウン用。氏名のみ返し、role等は含めない。
export async function GET() {
  const rows = await sql`select id, name from users order by id asc`;
  return NextResponse.json(rows);
}
