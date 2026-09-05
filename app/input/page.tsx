import { requireUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import NavHeader from "@/components/NavHeader";
import SessionInputForm from "@/components/SessionInputForm";

export default async function InputPage() {
  const user = await requireUser();

  const [cases, tags, menu, templates] = await Promise.all([
    sql`select id, case_code, disease_category from cases where user_id = ${user.userId} order by updated_at desc`,
    sql`select id, name from tags where user_id = ${user.userId} order by name asc`,
    sql`select id, name from intervention_menu where user_id = ${user.userId} order by name asc`,
    sql`select id, name, disease_category, template_data from templates where user_id = ${user.userId} order by updated_at desc`,
  ]);

  return (
    <div>
      <NavHeader user={user} />
      <SessionInputForm
        initialCases={cases as never}
        initialTags={tags as never}
        initialMenu={menu as never}
        initialTemplates={templates as never}
      />
    </div>
  );
}
