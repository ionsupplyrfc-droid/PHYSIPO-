import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { DISEASE_CATEGORIES } from "@/lib/constants";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const rows = await sql`
    select id, case_code, disease_category, created_at, updated_at
    from cases
    where user_id = ${user.userId}
    order by updated_at desc
  `;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const caseCode = (body?.caseCode ?? "").trim();
  const diseaseCategory = body?.diseaseCategory;

  if (!caseCode) {
    return NextResponse.json({ error: "症例コードを入力してください" }, { status: 400 });
  }
  if (!DISEASE_CATEGORIES.includes(diseaseCategory)) {
    return NextResponse.json({ error: "疾患区分が不正です" }, { status: 400 });
  }

  const rows = await sql`
    insert into cases (user_id, case_code, disease_category)
    values (${user.userId}, ${caseCode}, ${diseaseCategory})
    returning id, case_code, disease_category, created_at, updated_at
  `;
  return NextResponse.json(rows[0]);
}
