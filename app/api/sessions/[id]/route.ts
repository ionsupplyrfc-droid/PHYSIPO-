import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { normalizeInterventionContents } from "@/lib/sessions";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const { id } = await params;
  const sessionId = Number(id);

  const existing = await sql`select id, case_id from sessions where id = ${sessionId} and user_id = ${user.userId}`;
  if (existing.length === 0) {
    return NextResponse.json({ error: "セッションが見つかりません" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const {
    interventionDay,
    age,
    romData,
    mmtData,
    diseaseSpecificData,
    interventionContent,
    interventionContents,
    assessment,
    tags,
  } = body ?? {};
  // 介入内容は複数選択（配列）。古い形式（文字列1つ）で送られてきても受け付ける
  const contents = normalizeInterventionContents(interventionContents, interventionContent);

  if (contents.length === 0 || !assessment) {
    return NextResponse.json({ error: "介入内容とAssessmentは必須です" }, { status: 400 });
  }

  await sql`
    update sessions set
      intervention_day = ${interventionDay ?? null},
      age = ${age ?? null},
      rom_data = ${JSON.stringify(romData ?? {})},
      mmt_data = ${JSON.stringify(mmtData ?? {})},
      disease_specific_data = ${JSON.stringify(diseaseSpecificData ?? {})},
      intervention_content = ${contents.join("、")},
      intervention_contents = ${contents}::text[],
      assessment = ${assessment},
      updated_at = now()
    where id = ${sessionId} and user_id = ${user.userId}
  `;

  await sql`delete from session_tags where session_id = ${sessionId}`;
  const tagNames: string[] = Array.isArray(tags) ? tags.filter((t) => typeof t === "string" && t.trim()) : [];
  for (const rawName of tagNames) {
    const name = rawName.trim();
    await sql`
      insert into tags (user_id, name) values (${user.userId}, ${name})
      on conflict (user_id, name) do nothing
    `;
    const tagRows = await sql`select id from tags where user_id = ${user.userId} and name = ${name}`;
    const tagId = tagRows[0]?.id;
    if (tagId) {
      await sql`
        insert into session_tags (session_id, tag_id) values (${sessionId}, ${tagId})
        on conflict do nothing
      `;
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const { id } = await params;
  const sessionId = Number(id);

  const rows = await sql`
    delete from sessions where id = ${sessionId} and user_id = ${user.userId} returning id
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "セッションが見つかりません" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
