import { requireUser } from "@/lib/auth";
import { fetchOwnSessions } from "@/lib/sessions";
import { sql } from "@/lib/db";
import NavHeader from "@/components/NavHeader";
import PcOnlyGuard from "@/components/PcOnlyGuard";
import EditView from "@/components/EditView";
import { SessionRecord } from "@/lib/types";

export default async function EditPage() {
  const user = await requireUser();

  const [sessions, tags, menu] = await Promise.all([
    fetchOwnSessions(user.userId),
    sql`select id, name from tags where user_id = ${user.userId} order by name asc`,
    sql`select id, name from intervention_menu where user_id = ${user.userId} order by name asc`,
  ]);

  return (
    <div>
      <NavHeader user={user} />
      <PcOnlyGuard>
        <EditView
          initialSessions={sessions as unknown as SessionRecord[]}
          tagSuggestions={tags as never}
          menuOptions={menu as never}
        />
      </PcOnlyGuard>
    </div>
  );
}
