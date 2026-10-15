"use client";

import { Fragment, useMemo, useState } from "react";
import { DISEASE_CATEGORIES } from "@/lib/constants";
import { DiseaseCategory, RomMmtData, SessionRecord } from "@/lib/types";

function RomMmtDryTable({ title, data }: { title: string; data: RomMmtData }) {
  const entries = Object.values(data ?? {});
  if (entries.length === 0) return null;
  return (
    <div>
      <h4 className="text-sm font-semibold text-navy mb-1">{title}</h4>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="text-navy/60">
            <th className="text-left font-normal py-1">部位</th>
            <th className="text-right font-normal py-1">左</th>
            <th className="text-right font-normal py-1">右</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((v, i) => (
            <tr key={i} className="border-t border-navy/10">
              <td className="py-1">{v.label}</td>
              <td className="py-1 text-right tabular-nums">{v.left}</td>
              <td className="py-1 text-right tabular-nums">{v.right}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TemplateSaveForm({ sessionId, onSaved }: { sessionId: number; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!name.trim()) {
      setError("テンプレート名を入力してください");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, name: name.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "保存に失敗しました");
      }
      setDone(true);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return <p className="text-sm text-main">テンプレートを保存しました。</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="テンプレート名"
        className="border border-navy/20 rounded-lg px-3 py-2 text-sm flex-1 min-w-[10rem]"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="px-3 py-2 bg-navy text-white rounded-lg text-sm disabled:opacity-50"
      >
        このケースをテンプレートとして保存
      </button>
      {error && <span className="text-coral text-xs">{error}</span>}
    </div>
  );
}

export default function SearchView({
  initialSessions,
  initialTagOptions,
  initialInterventionOptions,
  isAdminView,
}: {
  initialSessions: SessionRecord[];
  initialTagOptions: string[];
  initialInterventionOptions: string[];
  isAdminView: boolean;
}) {
  const [sessions, setSessions] = useState<SessionRecord[]>(initialSessions);
  const [diseaseCategory, setDiseaseCategory] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [intervention, setIntervention] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const tagOptions = useMemo(() => initialTagOptions, [initialTagOptions]);

  async function runSearch(overrides?: {
    diseaseCategory?: string;
    tag?: string;
    intervention?: string;
    keyword?: string;
  }) {
    setLoading(true);
    const params = new URLSearchParams();
    const dc = overrides?.diseaseCategory ?? diseaseCategory;
    const tg = overrides?.tag ?? tag;
    const iv = overrides?.intervention ?? intervention;
    const kw = overrides?.keyword ?? keyword;
    if (dc) params.set("diseaseCategory", dc);
    if (tg) params.set("tag", tg);
    if (iv) params.set("intervention", iv);
    if (kw) params.set("keyword", kw);
    try {
      const res = await fetch(`/api/sessions?${params.toString()}`);
      if (res.ok) {
        setSessions(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setDiseaseCategory("");
    setTag("");
    setIntervention("");
    setKeyword("");
    runSearch({ diseaseCategory: "", tag: "", intervention: "", keyword: "" });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
      <div className="bg-white border border-navy/10 rounded-lg p-3 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="キーワード検索（Assessment本文など）"
            className="flex-1 border border-navy/20 rounded-lg px-3 py-2 text-sm"
          />
          <select
            value={diseaseCategory}
            onChange={(e) => {
              setDiseaseCategory(e.target.value);
              runSearch({ diseaseCategory: e.target.value });
            }}
            className="border border-navy/20 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">疾患区分：すべて</option>
            {DISEASE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={tag}
            onChange={(e) => {
              setTag(e.target.value);
              runSearch({ tag: e.target.value });
            }}
            className="border border-navy/20 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">病名（タグ）：すべて</option>
            {tagOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={intervention}
            onChange={(e) => {
              setIntervention(e.target.value);
              runSearch({ intervention: e.target.value });
            }}
            className="border border-navy/20 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">介入内容：すべて</option>
            {initialInterventionOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => runSearch()}
            className="px-4 py-2 bg-main text-navy rounded-lg text-sm font-medium"
          >
            検索
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 border border-navy/20 rounded-lg text-sm"
          >
            クリア
          </button>
        </div>
        <p className="text-xs text-navy/50">検索結果：{sessions.length}件 {loading && "（更新中...）"}</p>
      </div>

      <div className="bg-white border border-navy/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-main/10 text-navy/70">
              <tr>
                <th className="text-left px-3 py-2 font-medium">病名タグ</th>
                <th className="text-left px-3 py-2 font-medium">疾患区分</th>
                <th className="text-left px-3 py-2 font-medium">年齢</th>
                <th className="text-left px-3 py-2 font-medium">介入日目</th>
                {isAdminView && <th className="text-left px-3 py-2 font-medium">記録者</th>}
                <th className="text-left px-3 py-2 font-medium">Assessment</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const expanded = expandedId === s.id;
                return (
                  <Fragment key={s.id}>
                    <tr
                      onClick={() => setExpandedId(expanded ? null : s.id)}
                      className="border-t border-navy/10 cursor-pointer hover:bg-main/5"
                    >
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {(s.tags ?? []).map((t) => (
                            <span key={t} className="bg-main/20 rounded-full px-2 py-0.5 text-xs">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">{s.disease_category}</td>
                      <td className="px-3 py-2">{s.age ?? "-"}</td>
                      <td className="px-3 py-2">{s.intervention_day ?? "-"}日目</td>
                      {isAdminView && <td className="px-3 py-2 whitespace-nowrap">{s.recorder_name}</td>}
                      <td className="px-3 py-2 max-w-xs truncate">{s.assessment}</td>
                    </tr>
                    {expanded && (
                      <tr key={`${s.id}-expanded`} className="border-t border-navy/10 bg-background">
                        <td colSpan={isAdminView ? 6 : 5} className="px-3 py-3">
                          <div className="space-y-3">
                            <div>
                              <h4 className="text-sm font-semibold text-navy mb-1">Assessment（全文）</h4>
                              <p className="text-sm whitespace-pre-wrap">{s.assessment}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-navy mb-1">介入内容</h4>
                              {/* 複数の介入内容をタグとして表示（過去データは1件のまま表示） */}
                              <div className="flex flex-wrap gap-2">
                                {(s.intervention_contents && s.intervention_contents.length > 0
                                  ? s.intervention_contents
                                  : s.intervention_content
                                    ? [s.intervention_content]
                                    : []
                                ).map((name) => (
                                  <span key={name} className="bg-main/20 text-navy text-sm rounded-full px-3 py-1">
                                    {name}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                              <RomMmtDryTable title="ROM（関節可動域）" data={s.rom_data} />
                              <RomMmtDryTable title="MMT（徒手筋力テスト）" data={s.mmt_data} />
                            </div>
                            {Object.keys(s.disease_specific_data ?? {}).length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-navy mb-1">
                                  {s.disease_category}専用項目
                                </h4>
                                <ul className="text-sm space-y-0.5">
                                  {Object.entries(s.disease_specific_data).map(([k, v]) => (
                                    <li key={k}>
                                      {k}: {String(v)}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <TemplateSaveForm sessionId={s.id} onSaved={() => {}} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={isAdminView ? 6 : 5} className="px-3 py-6 text-center text-navy/50">
                    該当するセッションがありません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
