"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface Props {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}

export function StringListInput({ label, value, onChange, placeholder }: Props) {
  const [draft, setDraft] = useState("");

  function add() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...value, trimmed]);
    setDraft("");
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-[var(--color-ink)]">{label}</span>
      <div className="flex gap-2">
        <Input
          wrapperClassName="flex-1"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="secondary" onClick={add}>
          + Добавить
        </Button>
      </div>
      <ul className="flex flex-wrap gap-2">
        {value.map((item, idx) => (
          <li
            key={`${item}-${idx}`}
            className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-white px-3 py-1 text-sm"
          >
            <span>{item}</span>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="text-[var(--color-muted)] hover:text-[var(--color-danger)]"
              aria-label={`Удалить ${item}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
