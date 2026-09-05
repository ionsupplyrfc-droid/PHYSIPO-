"use client";

import { useMemo, useState } from "react";

interface TagOption {
  id: number;
  name: string;
}

export default function TagInput({
  value,
  onChange,
  suggestions,
  onCreated,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: TagOption[];
  onCreated: (name: string) => void;
}) {
  const [text, setText] = useState("");

  const filtered = useMemo(() => {
    if (!text) return [];
    return suggestions
      .filter((s) => s.name.includes(text) && !value.includes(s.name))
      .slice(0, 6);
  }, [text, suggestions, value]);

  function addTag(name: string) {
    const trimmed = name.trim();
    if (!trimmed || value.includes(trimmed)) {
      setText("");
      return;
    }
    onChange([...value, trimmed]);
    if (!suggestions.some((s) => s.name === trimmed)) {
      onCreated(trimmed);
    }
    setText("");
  }

  function removeTag(name: string) {
    onChange(value.filter((t) => t !== name));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-main/20 text-navy text-sm rounded-full px-3 py-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-navy/60 hover:text-coral"
              aria-label={`${tag}を削除`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(text);
              }
            }}
            placeholder="病名タグを入力して追加"
            className="flex-1 border border-navy/20 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-main"
          />
          <button
            type="button"
            onClick={() => addTag(text)}
            className="px-3 py-2 bg-main/30 text-navy rounded-lg text-sm font-medium"
          >
            ＋ 追加
          </button>
        </div>
        {filtered.length > 0 && (
          <ul className="absolute z-10 bg-white border border-navy/20 rounded-lg mt-1 w-full shadow-md max-h-40 overflow-auto">
            {filtered.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => addTag(s.name)}
                  className="w-full text-left px-3 py-2 hover:bg-main/10 text-sm"
                >
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
