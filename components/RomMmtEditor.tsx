"use client";

import { RomMmtData } from "@/lib/types";

interface Item {
  key: string;
  label: string;
  min: number;
  max: number;
}

export default function RomMmtEditor({
  title,
  items,
  data,
  onChange,
  unit,
  step,
}: {
  title: string;
  items: Item[];
  data: RomMmtData;
  onChange: (key: string, side: "left" | "right", value: number) => void;
  unit?: string;
  step?: number;
}) {
  return (
    <div>
      <h3 className="font-semibold text-navy mb-2">{title}</h3>
      {/* 左右の見出し：広い画面（横並び表示）のときだけ表示 */}
      <div className="hidden sm:grid grid-cols-2 gap-x-2 text-xs text-navy/60 mb-1 pl-28">
        <span className="text-center">左</span>
        <span className="text-center">右</span>
      </div>
      <div className="space-y-3">
        {items.map((item) => {
          const entry = data[item.key] ?? { label: item.label, left: item.min, right: item.min };
          return (
            // スマホ：1段目に項目名、2段目に「左」「右」のスライダーを縦に並べる
            // 広い画面（sm 以上）：項目名・左・右を横一列に並べる
            <div key={item.key} className="sm:flex sm:items-center sm:gap-2">
              <span className="block mb-1 sm:mb-0 sm:w-28 sm:shrink-0 text-sm text-navy">{item.label}</span>
              <div className="space-y-1 sm:space-y-0 sm:flex-1 sm:min-w-0 sm:grid sm:grid-cols-2 sm:gap-2">
                {(["left", "right"] as const).map((side) => (
                  <div key={side} className="flex items-center gap-2 min-w-0">
                    {/* スマホでは各行の先頭に「左」「右」を表示 */}
                    <span className="sm:hidden w-4 shrink-0 text-xs text-navy/60">
                      {side === "left" ? "左" : "右"}
                    </span>
                    {/* min-w-0 でスライダーを縮められるようにし、数字が押し出されないようにする */}
                    <input
                      type="range"
                      min={item.min}
                      max={item.max}
                      step={step ?? 1}
                      value={entry[side]}
                      onChange={(e) => onChange(item.key, side, Number(e.target.value))}
                      className="flex-1 min-w-0 w-full"
                    />
                    {/* 数字は縮まない固定幅にして、スライダーと重ならないようにする */}
                    <span className="w-11 shrink-0 text-right text-sm tabular-nums whitespace-nowrap">
                      {entry[side]}
                      {unit ?? ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
