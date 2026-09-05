import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const { id } = await params;
  const templateId = Number(id);
  const body = await req.json().catch(() => null);
  const name = (body?.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "テンプレート名を入力してください" }, { status: 400 });

  const rows = await sql`
    update templates set name = ${name}, updated_at = now()
    where id = ${templateId} and user_id = ${user.userId}
    returning id, name, disease_category, template_data, created_at, updated_at
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "テンプレートが見つかりません" }, { status: 404 });
  }
  return NextResponse.json(rows[0]);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const { id } = await params;
  const templateId = Number(id);
  const rows = await sql`
    delete from templates where id = ${templateId} and user_id = ${user.userId} returning id
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "テンプレートが見つかりません" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
