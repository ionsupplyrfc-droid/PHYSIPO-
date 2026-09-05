import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME } from "./constants";
import { verifySession } from "./session";
import { SessionUser } from "./types";

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifySession(token);
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export function isAdmin(user: SessionUser): boolean {
  return user.role === "staff" || user.role === "coach";
}
