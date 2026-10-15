"use client";

import CreatableSelect from "./CreatableSelect";

interface Option {
  id: number;
  name: string;
}

// 複数選択用の部品。選んだ項目は小さなタグとして並べ、タグごとに外せる。
// 追加はプルダウン（一覧から選択、または「＋ 新規追加」）で行う。
export default function MultiCreatableSelect({
  value,
  onChange,
  options,
  onCreated,
  placeholder,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  options: Option[];
  onCreated: (name: string) => void;
  placeholder?: string;
}) {
  function add(name: string) {
    const trimmed = name.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
  }

  function remove(name: string) {
    onChange(value.filter((v) => v !== name));
  }

  return (
    <div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 bg-main/20 text-navy text-sm rounded-full px-3 py-1"
            >
              {name}
              <button
                type="button"
                onClick={() => remove(name)}
                className="text-navy/60 hover:text-coral"
                aria-label={`${name}を削除`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      {/* value を常に空にして、選ぶたびにプルダウンが「選択してください」に戻るようにする */}
      <CreatableSelect
        value=""
        onChange={add}
        options={options.filter((o) => !value.includes(o.name))}
        onCreated={onCreated}
        placeholder={placeholder}
      />
    </div>
  );
}
