"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserOption {
  id: number;
  name: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data: UserOption[]) => {
        setUsers(data);
        if (data.length > 0) setUserId(String(data[0].id));
      })
      .catch(() => setError("利用者一覧の取得に失敗しました。"));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: Number(userId), password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "氏名または合言葉が正しくありません");
        setLoading(false);
        return;
      }
      router.push("/input");
      router.refresh();
    } catch {
      setError("通信エラーが発生しました。時間を置いて再度お試しください。");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-navy text-center mb-1">フィジポッ</h1>
        <p className="text-center text-navy/60 text-sm mb-8">Physipo ログイン</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy mb-1">氏名</label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full border border-navy/20 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-main"
              required
            >
              {users.length === 0 && <option value="">読み込み中...</option>}
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-1">合言葉</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-navy/20 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-main"
              required
            />
          </div>

          {error && <p className="text-coral text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || !userId}
            className="w-full bg-main text-navy font-semibold rounded-lg py-3 disabled:opacity-50"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}
