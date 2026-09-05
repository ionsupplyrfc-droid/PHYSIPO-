"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_MMT_ITEMS,
  DEFAULT_ROM_ITEMS,
  DISEASE_CATEGORIES,
  buildDefaultMmtData,
  buildDefaultRomData,
} from "@/lib/constants";
import { DiseaseCategory, RomMmtData } from "@/lib/types";
import RomMmtEditor from "./RomMmtEditor";
import TagInput from "./TagInput";
import CreatableSelect from "./CreatableSelect";
import DiseaseSpecificFields, { buildDefaultDiseaseSpecific } from "./DiseaseSpecificFields";

interface CaseOption {
  id: number;
  case_code: string;
  disease_category: DiseaseCategory;
}

interface NameOption {
  id: number;
  name: string;
}

interface TemplateOption {
  id: number;
  name: string;
  disease_category: DiseaseCategory;
  template_data: {
    rom_data?: RomMmtData;
    mmt_data?: RomMmtData;
    disease_specific_data?: Record<string, unknown>;
    tags?: string[];
  };
}

export default function SessionInputForm({
  initialCases,
  initialTags,
  initialMenu,
  initialTemplates,
}: {
  initialCases: CaseOption[];
  initialTags: NameOption[];
  initialMenu: NameOption[];
  initialTemplates: TemplateOption[];
}) {
  const router = useRouter();

  const [diseaseCategory, setDiseaseCategory] = useState<DiseaseCategory>("脳血管");
  const [cases, setCases] = useState(initialCases);
  const [caseMode, setCaseMode] = useState<"existing" | "new">(
    initialCases.some((c) => c.disease_category === "脳血管") ? "existing" : "new"
  );
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [newCaseCode, setNewCaseCode] = useState("");

  const [tagSuggestions, setTagSuggestions] = useState(initialTags);
  const [menuOptions, setMenuOptions] = useState(initialMenu);
  const [templates] = useState(initialTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const [age, setAge] = useState("");
  const [interventionDay, setInterventionDay] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [romData, setRomData] = useState<RomMmtData>(buildDefaultRomData());
  const [mmtData, setMmtData] = useState<RomMmtData>(buildDefaultMmtData());
  const [diseaseSpecific, setDiseaseSpecific] = useState<Record<string, unknown>>(
    buildDefaultDiseaseSpecific("脳血管")
  );
  const [interventionContent, setInterventionContent] = useState("");
  const [assessment, setAssessment] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const casesForCategory = useMemo(
    () => cases.filter((c) => c.disease_category === diseaseCategory),
    [cases, diseaseCategory]
  );
  const templatesForCategory = useMemo(
    () => templates.filter((t) => t.disease_category === diseaseCategory),
    [templates, diseaseCategory]
  );

  function resetSessionFields(category: DiseaseCategory) {
    setRomData(buildDefaultRomData());
    setMmtData(buildDefaultMmtData());
    setDiseaseSpecific(buildDefaultDiseaseSpecific(category));
    setTags([]);
    setAge("");
    setInterventionDay("");
    setInterventionContent("");
    setAssessment("");
    setSelectedTemplateId("");
  }

  function handleCategoryChange(category: DiseaseCategory) {
    setDiseaseCategory(category);
    setSelectedCaseId("");
    setNewCaseCode("");
    setCaseMode(cases.some((c) => c.disease_category === category) ? "existing" : "new");
    resetSessionFields(category);
  }

  async function handleSelectCase(caseId: string) {
    setSelectedCaseId(caseId);
    if (!caseId) return;
    try {
      const res = await fetch(`/api/cases/${caseId}/last-session`);
      if (res.ok) {
        const data = await res.json();
        setRomData(data.rom_data ?? buildDefaultRomData());
        setMmtData(data.mmt_data ?? buildDefaultMmtData());
      }
    } catch {
      // 前回値の取得に失敗しても入力は継続できるようにする
    }
  }

  function handleSelectTemplate(templateId: string) {
    setSelectedTemplateId(templateId);
    const template = templates.find((t) => String(t.id) === templateId);
    if (!template) return;
    const td = template.template_data ?? {};
    if (td.rom_data) setRomData(td.rom_data);
    if (td.mmt_data) setMmtData(td.mmt_data);
    if (td.disease_specific_data) setDiseaseSpecific(td.disease_specific_data);
    if (td.tags) setTags(td.tags);
  }

  function updateRomMmt(
    setter: React.Dispatch<React.SetStateAction<RomMmtData>>,
    key: string,
    side: "left" | "right",
    value: number
  ) {
    setter((prev) => ({
      ...prev,
      [key]: { ...prev[key], [side]: value },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!interventionContent || !assessment.trim()) {
      setMessage({ type: "error", text: "介入内容とAssessmentは必須です。" });
      return;
    }
    if (caseMode === "new" && !newCaseCode.trim()) {
      setMessage({ type: "error", text: "症例コードを入力してください。" });
      return;
    }
    if (caseMode === "existing" && !selectedCaseId) {
      setMessage({ type: "error", text: "症例を選択してください。" });
      return;
    }

    setSaving(true);
    try {
      let caseId = selectedCaseId ? Number(selectedCaseId) : null;

      if (caseMode === "new") {
        const res = await fetch("/api/cases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caseCode: newCaseCode.trim(), diseaseCategory }),
        });
        if (!res.ok) throw new Error("症例の作成に失敗しました。");
        const created = await res.json();
        caseId = created.id;
        setCases((prev) => [
          { id: created.id, case_code: created.case_code, disease_category: created.disease_category },
          ...prev,
        ]);
      }

      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          interventionDay: interventionDay ? Number(interventionDay) : null,
          age: age ? Number(age) : null,
          romData,
          mmtData,
          diseaseSpecificData: diseaseSpecific,
          interventionContent,
          assessment,
          tags,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "保存に失敗しました。");
      }

      setMessage({ type: "success", text: "セッションを保存しました。" });
      setCaseMode("existing");
      setSelectedCaseId(String(caseId));
      setNewCaseCode("");
      resetSessionFields(diseaseCategory);
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "保存に失敗しました。" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto px-4 py-4 space-y-6 pb-24">
      <div>
        <div className="grid grid-cols-3 gap-2">
          {DISEASE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={`py-2 rounded-lg text-sm font-semibold border ${
                diseaseCategory === cat
                  ? "bg-main text-navy border-main"
                  : "bg-white text-navy/60 border-navy/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold text-navy">症例</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCaseMode("existing")}
            className={`flex-1 py-2 rounded-lg text-sm border ${
              caseMode === "existing" ? "bg-navy text-white border-navy" : "border-navy/20 text-navy/60"
            }`}
          >
            継続中の症例
          </button>
          <button
            type="button"
            onClick={() => {
              setCaseMode("new");
              setSelectedCaseId("");
              resetSessionFields(diseaseCategory);
            }}
            className={`flex-1 py-2 rounded-lg text-sm border ${
              caseMode === "new" ? "bg-navy text-white border-navy" : "border-navy/20 text-navy/60"
            }`}
          >
            新規症例
          </button>
        </div>

        {caseMode === "existing" ? (
          <select
            value={selectedCaseId}
            onChange={(e) => handleSelectCase(e.target.value)}
            className="w-full border border-navy/20 rounded-lg px-3 py-3 text-base"
          >
            <option value="">症例を選択してください</option>
            {casesForCategory.map((c) => (
              <option key={c.id} value={c.id}>
                {c.case_code}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={newCaseCode}
            onChange={(e) => setNewCaseCode(e.target.value)}
            placeholder="症例コード（例：A-01）※個人情報は入力しないでください"
            className="w-full border border-navy/20 rounded-lg px-3 py-3 text-base"
          />
        )}

        {templatesForCategory.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-navy mb-1">テンプレート読込</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="w-full border border-navy/20 rounded-lg px-3 py-3 text-base"
            >
              <option value="">テンプレートを選択（任意）</option>
              {templatesForCategory.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-navy">共通項目</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-navy mb-1">年齢</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full border border-navy/20 rounded-lg px-3 py-3 text-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">介入◯日目</label>
            <input
              type="number"
              value={interventionDay}
              onChange={(e) => setInterventionDay(e.target.value)}
              className="w-full border border-navy/20 rounded-lg px-3 py-3 text-base"
              required
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
              setTagSuggestions((prev) =>
                prev.some((t) => t.name === name) ? prev : [...prev, { id: -Date.now(), name }]
              )
            }
          />
        </div>
      </section>

      <section>
        <RomMmtEditor
          title="ROM（関節可動域）"
          items={DEFAULT_ROM_ITEMS}
          data={romData}
          unit="°"
          onChange={(key, side, value) => updateRomMmt(setRomData, key, side, value)}
        />
      </section>

      <section>
        <RomMmtEditor
          title="MMT（徒手筋力テスト）"
          items={DEFAULT_MMT_ITEMS}
          data={mmtData}
          onChange={(key, side, value) => updateRomMmt(setMmtData, key, side, value)}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-navy">{diseaseCategory}専用項目</h2>
        <DiseaseSpecificFields
          category={diseaseCategory}
          data={diseaseSpecific}
          onChange={setDiseaseSpecific}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-navy">テキストデータ</h2>
        <div>
          <label className="block text-sm font-medium text-navy mb-1">
            介入内容（実施した訓練メニュー）<span className="text-coral">必須</span>
          </label>
          <CreatableSelect
            value={interventionContent}
            onChange={setInterventionContent}
            options={menuOptions}
            onCreated={(name) =>
              setMenuOptions((prev) => (prev.some((m) => m.name === name) ? prev : [...prev, { id: -Date.now(), name }]))
            }
            placeholder="新しい介入内容を入力"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1">
            Assessment（評価・判断・工夫）<span className="text-coral">必須</span>
          </label>
          <textarea
            value={assessment}
            onChange={(e) => setAssessment(e.target.value)}
            rows={6}
            placeholder="ここに入力してください"
            className="w-full border border-navy/20 rounded-lg px-3 py-3 text-base"
          />
        </div>
      </section>

      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-main" : "text-coral"}`}>
          {message.text}
        </p>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-navy/10 p-3">
        <button
          type="submit"
          disabled={saving}
          className="w-full max-w-xl mx-auto block bg-main text-navy font-semibold rounded-lg py-3 disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </div>
    </form>
  );
}
