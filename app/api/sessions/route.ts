import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { fetchSessions } from "@/lib/sessions";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const rows = await fetchSessions(user, {
    diseaseCategory: searchParams.get("diseaseCategory"),
    tag: searchParams.get("tag"),
    keyword: searchParams.get("keyword"),
  });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const caseId = Number(body?.caseId);
  const {
    interventionDay,
    age,
    romData,
    mmtData,
    diseaseSpecificData,
    interventionContent,
    assessment,
    tags,
  } = body ?? {};

  if (!caseId) {
    return NextResponse.json({ error: "症例を選択してください" }, { status: 400 });
  }
  if (!interventionContent || !assessment) {
    return NextResponse.json(
      { error: "介入内容とAssessmentは必須です" },
      { status: 400 }
    );
  }

  const caseRows = await sql`
    select id from cases where id = ${caseId} and user_id = ${user.userId}
  `;
  if (caseRows.length === 0) {
    return NextResponse.json({ error: "症例が見つかりません" }, { status: 404 });
  }

  const inserted = await sql`
    insert into sessions (
      case_id, user_id, intervention_day, age, rom_data, mmt_data,
      disease_specific_data, intervention_content, assessment
    ) values (
      ${caseId}, ${user.userId}, ${interventionDay ?? null}, ${age ?? null},
      ${JSON.stringify(romData ?? {})}, ${JSON.stringify(mmtData ?? {})},
      ${JSON.stringify(diseaseSpecificData ?? {})}, ${interventionContent}, ${assessment}
    )
    returning id
  `;
  const sessionId = inserted[0].id as number;

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

  if (typeof interventionContent === "string" && interventionContent.trim()) {
    await sql`
      insert into intervention_menu (user_id, name) values (${user.userId}, ${interventionContent.trim()})
      on conflict (user_id, name) do nothing
    `;
  }

  await sql`update cases set updated_at = now() where id = ${caseId}`;

  return NextResponse.json({ id: sessionId });
}
