"use client";

import { useState } from "react";

interface Option {
  id: number;
  name: string;
}

export default function CreatableSelect({
  value,
  onChange,
  options,
  onCreated,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  onCreated: (name: string) => void;
  placeholder?: string;
}) {
  const [adding, setAdding] = useState(false);
  const [newValue, setNewValue] = useState("");

  if (adding) {
    return (
      <div className="flex gap-2">
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 border border-navy/20 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-main"
          autoFocus
        />
        <button
          type="button"
          onClick={() => {
            const trimmed = newValue.trim();
            if (trimmed) {
              onChange(trimmed);
              onCreated(trimmed);
            }
            setAdding(false);
            setNewValue("");
          }}
          className="px-3 py-2 bg-main text-navy rounded-lg text-sm font-medium"
        >
          決定
        </button>
        <button
          type="button"
          onClick={() => {
            setAdding(false);
            setNewValue("");
          }}
          className="px-3 py-2 border border-navy/20 rounded-lg text-sm"
        >
          取消
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <select
        value={value}
        onChange={(e) => {
          if (e.target.value === "__new__") {
            setAdding(true);
          } else {
            onChange(e.target.value);
          }
        }}
        className="flex-1 border border-navy/20 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-main"
      >
        <option value="">選択してください</option>
        {options.map((o) => (
          <option key={o.id} value={o.name}>
            {o.name}
          </option>
        ))}
        <option value="__new__">＋ 新規追加</option>
      </select>
    </div>
  );
}
