"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "合言葉が正しくありません");
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
            <label className="block text-sm font-medium text-navy mb-1">合言葉</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-navy/20 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-main"
              required
              autoFocus
            />
          </div>

          {error && <p className="text-coral text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-main text-navy font-semibold rounded-lg py-3 disabled:opacity-50"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}
