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
}: {
  title: string;
  items: Item[];
  data: RomMmtData;
  onChange: (key: string, side: "left" | "right", value: number) => void;
  unit?: string;
}) {
  return (
    <div>
      <h3 className="font-semibold text-navy mb-2">{title}</h3>
      <div className="grid grid-cols-2 gap-x-2 text-xs text-navy/60 mb-1 pl-28">
        <span className="text-center">左</span>
        <span className="text-center">右</span>
      </div>
      <div className="space-y-3">
        {items.map((item) => {
          const entry = data[item.key] ?? { label: item.label, left: item.min, right: item.min };
          return (
            <div key={item.key} className="flex items-center gap-2">
              <span className="w-28 shrink-0 text-sm text-navy">{item.label}</span>
              <div className="flex-1 grid grid-cols-2 gap-2">
                {(["left", "right"] as const).map((side) => (
                  <div key={side} className="flex items-center gap-1">
                    <input
                      type="range"
                      min={item.min}
                      max={item.max}
                      value={entry[side]}
                      onChange={(e) => onChange(item.key, side, Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="w-9 text-right text-sm tabular-nums">
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
