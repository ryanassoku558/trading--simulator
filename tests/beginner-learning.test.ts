import { it, expect } from "vitest";
import {
  lessons,
  levels,
  beginnerLearningOrder,
  answerLesson,
  accountRulesMetadata,
} from "../lib/education";
import { initialState } from "../lib/trading";
import { isAccountState } from "../lib/storage/schema";
it("provides 24 new complete lessons and a path that covers each lesson once", () => {
  expect(lessons.filter((l) => l.id >= 31 && l.id <= 54)).toHaveLength(24);
  expect(new Set(beginnerLearningOrder).size).toBe(lessons.length);
  expect([...beginnerLearningOrder].sort((a, b) => a - b)).toEqual(
    lessons.map((l) => l.id),
  );
  for (const l of lessons) {
    expect(l.title.length).toBeGreaterThan(0);
    expect(l.explanation.length).toBeGreaterThan(20);
    expect(l.example.length).toBeGreaterThan(20);
    expect(l.why.length).toBeGreaterThan(20);
    expect(new Set(l.quiz.options).size).toBe(3);
    expect(l.quiz.options[l.quiz.answer]).toBeTruthy();
    expect(levels[l.level - 1]).toBeTruthy();
  }
  for (const prerequisite of [33, 34, 35, 37, 38, 41, 44])
    expect(beginnerLearningOrder.indexOf(prerequisite)).toBeLessThan(
      beginnerLearningOrder.indexOf(18),
    );
});
it("preserves old completions and records new ones with one-time XP", () => {
  let state = initialState();
  for (const id of [1, 18, 25, 30]) state = answerLesson(state, id, 1);
  const oldXP = state.learning.xp;
  expect(isAccountState(state)).toBe(true);
  state = answerLesson(state, 31, 1);
  expect(state.learning.completed).toEqual([1, 18, 25, 30, 31]);
  expect(state.learning.xp).toBe(oldXP + 35);
  expect(answerLesson(state, 31, 1).learning.xp).toBe(state.learning.xp);
  expect(isAccountState(state)).toBe(true);
});
it("supports full completion and the four-lesson planning module bonus", () => {
  let state = initialState();
  for (const l of lessons.filter((l) => l.level === 9))
    state = answerLesson(state, l.id, l.quiz.answer);
  expect(state.learning.xp).toBe(4 * 35 + 100);
  state = initialState();
  for (const id of beginnerLearningOrder) state = answerLesson(state, id, lessons.find(l=>l.id===id)!.quiz.answer);
  expect(state.learning.completed).toHaveLength(151);
  expect(state.learning.xp).toBe(151 * 35 + levels.length * 100);
  expect(isAccountState(state)).toBe(true);
});
it("identifies the jurisdiction and update date for account-rule guidance", () => {
  expect(accountRulesMetadata.scope).toContain("US");
  expect(accountRulesMetadata.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(
    accountRulesMetadata.sources.some((s) => s.url.includes("finra.org")),
  ).toBe(true);
});
