import { sql } from "./db";
import { isAdmin } from "./auth";
import { SessionUser } from "./types";

export interface SessionFilters {
  diseaseCategory?: string | null;
  tag?: string | null;
  keyword?: string | null;
}

export async function fetchSessions(user: SessionUser, filters: SessionFilters = {}) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (!isAdmin(user)) {
    values.push(user.userId);
    conditions.push(`s.user_id = $${values.length}`);
  }

  if (filters.diseaseCategory) {
    values.push(filters.diseaseCategory);
    conditions.push(`c.disease_category = $${values.length}`);
  }

  if (filters.tag) {
    values.push(filters.tag);
    conditions.push(
      `exists (select 1 from session_tags st2 join tags t2 on t2.id = st2.tag_id where st2.session_id = s.id and t2.name = $${values.length})`
    );
  }

  if (filters.keyword) {
    values.push(`%${filters.keyword}%`);
    const idx = values.length;
    conditions.push(
      `(s.assessment ilike $${idx} or s.intervention_content ilike $${idx} or c.case_code ilike $${idx})`
    );
  }

  const whereClause = conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";

  const query = `
    select
      s.id, s.case_id, s.user_id, s.intervention_day, s.age,
      s.rom_data, s.mmt_data, s.disease_specific_data,
      s.intervention_content, s.assessment, s.created_at, s.updated_at,
      c.case_code, c.disease_category, u.name as recorder_name,
      coalesce(
        (select array_agg(t.name order by t.name)
         from session_tags st join tags t on t.id = st.tag_id
         where st.session_id = s.id),
        '{}'
      ) as tags
    from sessions s
    join cases c on c.id = s.case_id
    join users u on u.id = s.user_id
    ${whereClause}
    order by s.created_at desc
    limit 500
  `;

  return sql(query, values);
}

// S4編集専用画面向け。role・staff/coachともに、常に自分（user_id）が記録したセッションのみを対象とする。
export async function fetchOwnSessions(userId: number) {
  return sql`
    select
      s.id, s.case_id, s.user_id, s.intervention_day, s.age,
      s.rom_data, s.mmt_data, s.disease_specific_data,
      s.intervention_content, s.assessment, s.created_at, s.updated_at,
      c.case_code, c.disease_category,
      coalesce(
        (select array_agg(t.name order by t.name)
         from session_tags st join tags t on t.id = st.tag_id
         where st.session_id = s.id),
        '{}'
      ) as tags
    from sessions s
    join cases c on c.id = s.case_id
    where s.user_id = ${userId}
    order by s.created_at desc
    limit 500
  `;
}
