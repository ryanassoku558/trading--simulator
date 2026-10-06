import { it, expect } from "vitest";
import { lessons, levels, answerLesson } from "../lib/education";
import { initialState } from "../lib/trading";
import { isAccountState } from "../lib/storage/schema";
it("keeps the original lesson IDs and adds five candle lessons", () => {
  expect(lessons).toHaveLength(151);
  expect(levels).toHaveLength(35);
  expect(lessons.find((l) => l.id === 18)?.title).toBe("Candlesticks");
  expect(lessons.find((l) => l.id === 25)?.title).toBe("Reviewing performance");
  expect(lessons.filter((l) => l.level === 6)).toHaveLength(5);
  expect(isAccountState(initialState())).toBe(true);
});
it("persists new lesson progress with one-time XP and a level completion bonus", () => {
  let state = initialState();
  for (const lesson of lessons.filter((l) => l.level === 6))
    state = answerLesson(state, lesson.id, lesson.quiz.answer);
  expect(state.learning.xp).toBe(275);
  expect(isAccountState(state)).toBe(true);
  expect(answerLesson(state, 26, 1).learning.xp).toBe(275);
  const invalid = {
    ...state,
    learning: { ...state.learning, completed: [152] },
  };
  expect(isAccountState(invalid)).toBe(false);
});
