import { describe, it, expect } from "vitest";
import { lessons, beginnerLearningOrder } from "../lib/education";
import { learningModules } from "../lib/billing/curriculum";
import tutorials from "../lib/education/tutorials.json";
import { profileInsights } from "../lib/profile";
import { initialState } from "../lib/trading";
import { isAccountState } from "../lib/storage/schema";
import { glossary } from "../lib/education/discovery";
describe("trading-focused curriculum", () => {
  it("retires household finance without renumbering active historical lessons", () => {
    const removed = new Set([13, 14, 15, 16, 19, 20, 21, 22]);
    expect(lessons.some((l) => removed.has(l.level))).toBe(false);
    expect(lessons.find((l) => l.id === 143)?.title).toBeTruthy();
    expect(
      lessons.filter((l) => l.level === 41 || l.level === 42),
    ).toHaveLength(8);
    expect(lessons.find((l) => l.id === 173)?.title).toBe(
      "Compounding investment returns",
    );
    expect(lessons).toHaveLength(159);
    expect(learningModules).toHaveLength(41);
  });
  it("preserves historical progress for retired lessons", () => {
    const state = initialState();
    state.learning.completed = [60, 75, 84, 99];
    state.learning.attempts=[{lessonId:60,correct:false,date:new Date().toISOString()}];
    expect(isAccountState(state)).toBe(true);
    expect(profileInsights(state).weak).toEqual([]);
    expect(profileInsights(initialState()).modules).toBe(0);
    state.learning.completed = [999];
    expect(isAccountState(state)).toBe(false);
  });
  it("keeps every current module, path, glossary and video lesson reference valid", () => {
    const ids = new Set(lessons.map((l) => l.id));
    expect(new Set(lessons.map((l) => l.id)).size).toBe(lessons.length);
    expect(beginnerLearningOrder.every((id) => ids.has(id))).toBe(true);
    expect(learningModules.flatMap((m) => m.ids).sort((a, b) => a - b)).toEqual(
      [...ids].sort((a, b) => a - b),
    );
    expect(tutorials.some((t) => t.slug === "budgeting")).toBe(false);
    expect(tutorials.every((t) => t.lessonIds.every((id) => ids.has(id)))).toBe(
      true,
    );
    expect(glossary.every((g) => ids.has(g[3]))).toBe(true);
  });
});
