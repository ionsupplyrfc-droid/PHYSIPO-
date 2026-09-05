"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SessionUser } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/input", label: "入力" },
  { href: "/search", label: "検索" },
  { href: "/edit", label: "編集" },
  { href: "/templates", label: "テンプレート" },
];

export default function NavHeader({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-main/40 bg-white sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-2 max-w-5xl mx-auto">
        <div className="font-bold text-navy text-lg">フィジポッ</div>
        <div className="text-xs text-navy/70 hidden sm:block">
          {user.name}（{user.role === "player" ? "記録者" : "管理者"}）
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-coral border border-coral rounded px-2 py-1 hover:bg-coral hover:text-white transition"
        >
          ログアウト
        </button>
      </div>
      <nav className="flex px-2 max-w-5xl mx-auto overflow-x-auto">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 ${
              pathname === item.href
                ? "border-main text-navy font-semibold"
                : "border-transparent text-navy/60"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
