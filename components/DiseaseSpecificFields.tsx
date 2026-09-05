"use client";

import { DiseaseCategory } from "@/lib/types";
import { BRUNNSTROM_OPTIONS, MAS_OPTIONS, SENSORY_OPTIONS } from "@/lib/constants";

export function buildDefaultDiseaseSpecific(category: DiseaseCategory): Record<string, unknown> {
  if (category === "脳血管") {
    return { brunnstrom: "", sensory: "", mas: "" };
  }
  if (category === "運動器") {
    return { vas: 0, weightBearing: "", gaitStatus: "" };
  }
  return {};
}

export default function DiseaseSpecificFields({
  category,
  data,
  onChange,
}: {
  category: DiseaseCategory;
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}) {
  if (category === "脳血管") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1">
            Brunnstrom Stage（上肢のみ）
          </label>
          <select
            value={(data.brunnstrom as string) ?? ""}
            onChange={(e) => onChange({ ...data, brunnstrom: e.target.value })}
            className="w-full border border-navy/20 rounded-lg px-3 py-3 text-base"
          >
            <option value="">選択してください</option>
            {BRUNNSTROM_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-1">感覚検査（触覚）</label>
          <div className="flex flex-wrap gap-3">
            {SENSORY_OPTIONS.map((v) => (
              <label key={v} className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="sensory"
                  checked={data.sensory === v}
                  onChange={() => onChange({ ...data, sensory: v })}
                />
                {v}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-1">MAS（上肢屈曲のみ）</label>
          <select
            value={(data.mas as string) ?? ""}
            onChange={(e) => onChange({ ...data, mas: e.target.value })}
            className="w-full border border-navy/20 rounded-lg px-3 py-3 text-base"
          >
            <option value="">選択してください</option>
            {MAS_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  if (category === "運動器") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1">
            疼痛スケール（VAS/NRS）: {(data.vas as number) ?? 0} / 10
          </label>
          <input
            type="range"
            min={0}
            max={10}
            value={(data.vas as number) ?? 0}
            onChange={(e) => onChange({ ...data, vas: Number(e.target.value) })}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1">荷重制限の状況</label>
          <input
            type="text"
            value={(data.weightBearing as string) ?? ""}
            onChange={(e) => onChange({ ...data, weightBearing: e.target.value })}
            placeholder="例：部分荷重（松葉杖使用）"
            className="w-full border border-navy/20 rounded-lg px-3 py-3 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1">歩行距離・歩行速度</label>
          <input
            type="text"
            value={(data.gaitStatus as string) ?? ""}
            onChange={(e) => onChange({ ...data, gaitStatus: e.target.value })}
            placeholder="例：屋内100m程度、速度ゆっくり"
            className="w-full border border-navy/20 rounded-lg px-3 py-3 text-base"
          />
        </div>
      </div>
    );
  }

  return <p className="text-sm text-navy/50">廃用区分の専用項目はありません。</p>;
}
