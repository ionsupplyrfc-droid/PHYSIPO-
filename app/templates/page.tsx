import { requireUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import NavHeader from "@/components/NavHeader";
import PcOnlyGuard from "@/components/PcOnlyGuard";
import TemplatesView from "@/components/TemplatesView";
import { TemplateRecord } from "@/lib/types";

export default async function TemplatesPage() {
  const user = await requireUser();

  const templates = await sql`
    select id, name, disease_category, template_data, created_at, updated_at
    from templates
    where user_id = ${user.userId}
    order by updated_at desc
  `;

  return (
    <div>
      <NavHeader user={user} />
      <PcOnlyGuard>
        <TemplatesView initialTemplates={templates as unknown as TemplateRecord[]} />
      </PcOnlyGuard>
    </div>
  );
}
