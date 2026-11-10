"use client";
import { Sprout, ArrowRight } from "lucide-react";
export default function LessonIntro({
  title,
  label,
  onContinue,
}: {
  title: string;
  label: string;
  onContinue: () => void;
}) {
  return (
    <section className="lesson-intro" aria-label="Lesson opening">
      <div className="lesson-intro-mark">
        <Sprout size={64} strokeWidth={1.8} />
      </div>
      <span className="eyebrow">{label}</span>
      <h3>{title}</h3>
      <p>Understand the idea. See an example. Practice your reasoning.</p>
      <button className="secondary" onClick={onContinue}>
        Begin learning <ArrowRight size={16} />
      </button>
    </section>
  );
}
