import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const rows = await sql`
    select id, name, disease_category, template_data, created_at, updated_at
    from templates
    where user_id = ${user.userId}
    order by updated_at desc
  `;
  return NextResponse.json(rows);
}

// S3閲覧画面の「このケースをテンプレートとして保存」用。
// sessionIdで指定されたセッションのROM・MMT・疾患区分別項目・病名タグのみを抽出して保存する（Assessment等の自由記述は含めない）。
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const sessionId = Number(body?.sessionId);
  const name = (body?.name ?? "").trim();

  if (!sessionId || !name) {
    return NextResponse.json({ error: "テンプレート名を入力してください" }, { status: 400 });
  }

  const rows = await sql`
    select s.rom_data, s.mmt_data, s.disease_specific_data, c.disease_category,
      coalesce(
        (select array_agg(t.name order by t.name)
         from session_tags st join tags t on t.id = st.tag_id
         where st.session_id = s.id),
        '{}'
      ) as tags
    from sessions s
    join cases c on c.id = s.case_id
    where s.id = ${sessionId}
  `;
  const source = rows[0];
  if (!source) {
    return NextResponse.json({ error: "元になるセッションが見つかりません" }, { status: 404 });
  }

  const templateData = {
    rom_data: source.rom_data,
    mmt_data: source.mmt_data,
    disease_specific_data: source.disease_specific_data,
    tags: source.tags,
  };

  const inserted = await sql`
    insert into templates (user_id, name, disease_category, template_data)
    values (${user.userId}, ${name}, ${source.disease_category}, ${JSON.stringify(templateData)})
    returning id, name, disease_category, template_data, created_at, updated_at
  `;
  return NextResponse.json(inserted[0]);
}
