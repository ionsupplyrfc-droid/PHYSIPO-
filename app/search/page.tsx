import { isAdmin, requireUser } from "@/lib/auth";
import { fetchSessions } from "@/lib/sessions";
import { sql } from "@/lib/db";
import NavHeader from "@/components/NavHeader";
import SearchView from "@/components/SearchView";
import { SessionRecord } from "@/lib/types";

export default async function SearchPage() {
  const user = await requireUser();
  const admin = isAdmin(user);

  const [sessions, tagRows, menuRows] = await Promise.all([
    fetchSessions(user, {}),
    admin
      ? sql`select distinct name from tags order by name asc`
      : sql`select name from tags where user_id = ${user.userId} order by name asc`,
    admin
      ? sql`select distinct name from intervention_menu order by name asc`
      : sql`select name from intervention_menu where user_id = ${user.userId} order by name asc`,
  ]);

  const tagOptions = (tagRows as { name: string }[]).map((t) => t.name);
  const interventionOptions = (menuRows as { name: string }[]).map((m) => m.name);

  return (
    <div>
      <NavHeader user={user} />
      <SearchView
        initialSessions={sessions as unknown as SessionRecord[]}
        initialTagOptions={tagOptions}
        initialInterventionOptions={interventionOptions}
        isAdminView={admin}
      />
    </div>
  );
}
