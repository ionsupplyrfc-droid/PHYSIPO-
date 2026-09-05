import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const { id } = await params;
  const caseId = Number(id);
  const caseRows = await sql`select id from cases where id = ${caseId} and user_id = ${user.userId}`;
  if (caseRows.length === 0) {
    return NextResponse.json({ error: "症例が見つかりません" }, { status: 404 });
  }

  const rows = await sql`
    select rom_data, mmt_data
    from sessions
    where case_id = ${caseId}
    order by created_at desc
    limit 1
  `;

  if (rows.length === 0) {
    return NextResponse.json({ rom_data: null, mmt_data: null });
  }
  return NextResponse.json(rows[0]);
}
