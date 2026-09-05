"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TemplateRecord } from "@/lib/types";

export default function TemplatesView({ initialTemplates }: { initialTemplates: TemplateRecord[] }) {
  const router = useRouter();
  const [templates, setTemplates] = useState(initialTemplates);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<TemplateRecord | null>(null);
  const [message, setMessage] = useState("");

  function startEdit(t: TemplateRecord) {
    setEditingId(t.id);
    setEditingName(t.name);
  }

  async function saveRename(id: number) {
    if (!editingName.trim()) return;
    const res = await fetch(`/api/templates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingName.trim() }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTemplates((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setEditingId(null);
      router.refresh();
    } else {
      setMessage("名称の変更に失敗しました。");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/templates/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      setTemplates((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
      router.refresh();
    } else {
      setMessage("削除に失敗しました。");
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <h1 className="font-semibold text-navy text-lg mb-4">テンプレート一覧</h1>
      {message && <p className="text-coral text-sm mb-2">{message}</p>}
      <div className="bg-white border border-navy/10 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-main/10 text-navy/70">
            <tr>
              <th className="text-left px-3 py-2 font-medium">テンプレート名</th>
              <th className="text-left px-3 py-2 font-medium">疾患区分</th>
              <th className="text-left px-3 py-2 font-medium">保存日</th>
              <th className="text-left px-3 py-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.id} className="border-t border-navy/10">
                <td className="px-3 py-2">
                  {editingId === t.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="border border-navy/20 rounded-lg px-2 py-1 text-sm w-full"
                      autoFocus
                    />
                  ) : (
                    t.name
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{t.disease_category}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {new Date(t.created_at).toLocaleDateString("ja-JP")}
                </td>
                <td className="px-3 py-2 whitespace-nowrap space-x-2">
                  {editingId === t.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => saveRename(t.id)}
                        className="text-main font-medium"
                      >
                        保存
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="text-navy/50">
                        取消
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => startEdit(t)} className="text-navy underline">
                        名称変更
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(t)}
                        className="text-coral underline"
                      >
                        削除
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {templates.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-navy/50">
                  保存済みのテンプレートはありません。閲覧・検索画面からセッションをテンプレートとして保存できます。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 bg-navy/40 flex items-center justify-center z-20 px-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full space-y-4">
            <p className="font-semibold text-navy">本当に削除しますか？</p>
            <p className="text-sm text-navy/60">
              テンプレート「{deleteTarget.name}」を削除します。この操作は取り消せません。
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-navy/20 rounded-lg text-sm"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-coral text-white rounded-lg text-sm"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
