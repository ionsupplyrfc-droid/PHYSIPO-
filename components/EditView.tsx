"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_MMT_ITEMS, DEFAULT_ROM_ITEMS } from "@/lib/constants";
import { RomMmtData, SessionRecord } from "@/lib/types";
import RomMmtEditor from "./RomMmtEditor";
import TagInput from "./TagInput";
import MultiCreatableSelect from "./MultiCreatableSelect";
import DiseaseSpecificFields from "./DiseaseSpecificFields";

interface NameOption {
  id: number;
  name: string;
}

export default function EditView({
  initialSessions,
  tagSuggestions: initialTagSuggestions,
  menuOptions: initialMenuOptions,
}: {
  initialSessions: SessionRecord[];
  tagSuggestions: NameOption[];
  menuOptions: NameOption[];
}) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initialSessions);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [tagSuggestions, setTagSuggestions] = useState(initialTagSuggestions);
  const [menuOptions, setMenuOptions] = useState(initialMenuOptions);

  const [age, setAge] = useState("");
  const [interventionDay, setInterventionDay] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [romData, setRomData] = useState<RomMmtData>({});
  const [mmtData, setMmtData] = useState<RomMmtData>({});
  const [diseaseSpecific, setDiseaseSpecific] = useState<Record<string, unknown>>({});
  const [interventionContents, setInterventionContents] = useState<string[]>([]);
  const [assessment, setAssessment] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const selected = sessions.find((s) => s.id === selectedId) ?? null;

  function loadSession(s: SessionRecord) {
    setSelectedId(s.id);
    setAge(s.age != null ? String(s.age) : "");
    setInterventionDay(s.intervention_day != null ? String(s.intervention_day) : "");
    setTags(s.tags ?? []);
    setRomData(s.rom_data ?? {});
    setMmtData(s.mmt_data ?? {});
    setDiseaseSpecific(s.disease_specific_data ?? {});
    // 過去データ（介入内容が1つだけ）も、1件選択された状態で開く
    setInterventionContents(
      s.intervention_contents && s.intervention_contents.length > 0
        ? s.intervention_contents
        : s.intervention_content
          ? [s.intervention_content]
          : []
    );
    setAssessment(s.assessment ?? "");
    setMessage("");
  }

  function updateRomMmt(
    setter: React.Dispatch<React.SetStateAction<RomMmtData>>,
    key: string,
    side: "left" | "right",
    value: number
  ) {
    setter((prev) => ({ ...prev, [key]: { ...prev[key], [side]: value } }));
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`/api/sessions/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interventionDay: interventionDay ? Number(interventionDay) : null,
          age: age ? Number(age) : null,
          romData,
          mmtData,
          diseaseSpecificData: diseaseSpecific,
          interventionContents,
          assessment,
          tags,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "更新に失敗しました");
      }
      setSessions((prev) =>
        prev.map((s) =>
          s.id === selected.id
            ? {
                ...s,
                age: age ? Number(age) : null,
                intervention_day: interventionDay ? Number(interventionDay) : null,
                rom_data: romData,
                mmt_data: mmtData,
                disease_specific_data: diseaseSpecific,
                intervention_content: interventionContents.join("、"),
                intervention_contents: interventionContents,
                assessment,
                tags,
              }
            : s
        )
      );
      setMessage("更新しました。");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "更新に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/sessions/${selected.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("削除に失敗しました");
      setSessions((prev) => prev.filter((s) => s.id !== selected.id));
      setSelectedId(null);
      setConfirmDelete(false);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "削除に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-3 gap-4">
      <div className="col-span-1 bg-white border border-navy/10 rounded-lg overflow-hidden">
        <h2 className="font-semibold text-navy px-3 py-2 border-b border-navy/10">編集対象セッション</h2>
        <div className="max-h-[70vh] overflow-y-auto">
          {sessions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => loadSession(s)}
              className={`w-full text-left px-3 py-2 border-b border-navy/5 text-sm hover:bg-main/10 ${
                selectedId === s.id ? "bg-main/20" : ""
              }`}
            >
              <div className="font-medium">
                {s.case_code}（{s.disease_category}）
              </div>
              <div className="text-navy/60 text-xs">
                {s.intervention_day ?? "-"}日目・{new Date(s.created_at).toLocaleDateString("ja-JP")}
              </div>
            </button>
          ))}
          {sessions.length === 0 && (
            <p className="px-3 py-4 text-sm text-navy/50">編集可能なセッションがありません。</p>
          )}
        </div>
      </div>

      <div className="col-span-2 bg-white border border-navy/10 rounded-lg p-4 space-y-4">
        {!selected ? (
          <p className="text-navy/50 text-sm">左の一覧からセッションを選択してください。</p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-navy/50">症例</span>
                <p className="font-semibold text-navy">
                  {selected.case_code}（{selected.disease_category}）
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="px-3 py-2 border border-coral text-coral rounded-lg text-sm"
              >
                削除
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-navy mb-1">年齢</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full border border-navy/20 rounded-lg px-3 py-2 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">介入◯日目</label>
                <input
                  type="number"
                  value={interventionDay}
                  onChange={(e) => setInterventionDay(e.target.value)}
                  className="w-full border border-navy/20 rounded-lg px-3 py-2 text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1">病名タグ</label>
              <TagInput
                value={tags}
                onChange={setTags}
                suggestions={tagSuggestions}
                onCreated={(name) =>
                  setTagSuggestions((prev) => (prev.some((t) => t.name === name) ? prev : [...prev, { id: -Date.now(), name }]))
                }
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <RomMmtEditor
                title="ROM（関節可動域）"
                items={DEFAULT_ROM_ITEMS}
                data={romData}
                unit="°"
                step={5}
                onChange={(key, side, value) => updateRomMmt(setRomData, key, side, value)}
              />
              <RomMmtEditor
                title="MMT（徒手筋力テスト）"
                items={DEFAULT_MMT_ITEMS}
                data={mmtData}
                onChange={(key, side, value) => updateRomMmt(setMmtData, key, side, value)}
              />
            </div>

            <DiseaseSpecificFields
              category={selected.disease_category!}
              data={diseaseSpecific}
              onChange={setDiseaseSpecific}
            />

            <div>
              <label className="block text-sm font-medium text-navy mb-1">介入内容（実施した訓練メニュー）</label>
              <MultiCreatableSelect
                value={interventionContents}
                onChange={setInterventionContents}
                options={menuOptions}
                onCreated={(name) =>
                  setMenuOptions((prev) => (prev.some((m) => m.name === name) ? prev : [...prev, { id: -Date.now(), name }]))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1">Assessment（評価・判断・工夫）</label>
              <textarea
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
                rows={6}
                className="w-full border border-navy/20 rounded-lg px-3 py-2 text-base"
              />
            </div>

            {message && <p className="text-sm text-navy">{message}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-main text-navy rounded-lg font-semibold disabled:opacity-50"
              >
                保存する
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={saving}
                className="px-4 py-2 border border-coral text-coral rounded-lg"
              >
                削除
              </button>
            </div>
          </>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-navy/40 flex items-center justify-center z-20 px-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full space-y-4">
            <p className="font-semibold text-navy">本当に削除しますか？</p>
            <p className="text-sm text-navy/60">このセッション記録を削除します。この操作は取り消せません。</p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 border border-navy/20 rounded-lg text-sm"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2 bg-coral text-white rounded-lg text-sm disabled:opacity-50"
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
