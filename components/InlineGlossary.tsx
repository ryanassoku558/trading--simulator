"use client";
import { useState } from "react";
import { glossary } from "@/lib/education/discovery";
import Dialog from "./Dialog";
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const expression = new RegExp(
  `\\b(${[...glossary]
    .sort((a, b) => b[0].length - a[0].length)
    .map((t) => escape(t[0]))
    .join("|")})\\b`,
  "gi",
);
export default function InlineGlossary({ text }: { text: string }) {
  const [selected, setSelected] = useState<(typeof glossary)[number] | null>(
    null,
  );
  return (
    <>
      {text.split(expression).map((part, i) => {
        const term = glossary.find(
          (t) => t[0].toLowerCase() === part.toLowerCase(),
        );
        return term ? (
          <button
            className="inline-term"
            key={i}
            aria-label={`Define ${term[0]}`}
            onClick={() => setSelected(term)}
          >
            {part}
          </button>
        ) : (
          part
        );
      })}
      {selected && (
        <Dialog
          title={selected[0]}
          onClose={() => setSelected(null)}
          className="term-dialog"
        >
          <p>{selected[1]}</p>
          <div className="example">{selected[2]}</div>
          <button className="secondary" onClick={() => setSelected(null)}>
            Back to lesson
          </button>
        </Dialog>
      )}
    </>
  );
}
