import { describe, it, expect } from "vitest";
import {
  initialState,
  executeTrade,
  portfolio,
  scenarios,
  placeLimit,
  advanceMarket,
  resetSimulator,
  resetLearning,
} from "../lib/trading";
import { answerLesson } from "../lib/education";
import { quote } from "../lib/market";
import { localStorageAdapter, storageKey } from "../lib/storage";
import { vi } from "vitest";
describe("virtual account", () => {
  it("starts with $10,000 and no investments", () => {
    expect(initialState().cash).toBe(10000);
    expect(portfolio(initialState()).value).toBe(10000);
  });
  it("buys shares, updates holdings and preserves account value", () => {
    const { state } = executeTrade(initialState(), "AAPL", "buy", 2);
    expect(state.cash).toBe(9573.86);
    expect(state.holdings[0].shares).toBe(2);
    expect(portfolio(state).value).toBe(10000);
    expect(state.learning.xp).toBe(50);
  });
  it("rejects overspending, invalid sizes and unknown stocks", () => {
    expect(() => executeTrade(initialState(), "AAPL", "buy", 1000)).toThrow(
      "cash",
    );
    for (const n of [0, -1, 1.5, NaN, Infinity])
      expect(() => executeTrade(initialState(), "AAPL", "buy", n)).toThrow(
        "whole number",
      );
    expect(() => executeTrade(initialState(), "BOGUS", "buy", 1)).toThrow(
      "valid stock",
    );
  });
  it("rejects overselling", () => {
    expect(() => executeTrade(initialState(), "AAPL", "sell", 1)).toThrow(
      "own",
    );
  });
  it("calculates weighted average cost and realized return", () => {
    let s = executeTrade(initialState(), "AAPL", "buy", 2).state;
    s = { ...s, tick: 1 };
    const second = quote("AAPL", 1).price;
    s = executeTrade(s, "AAPL", "buy", 1).state;
    expect(s.holdings[0].averageCost).toBeCloseTo((426.14 + second) / 3);
    const avg = s.holdings[0].averageCost;
    const result = executeTrade(s, "AAPL", "sell", 2);
    expect(result.state.holdings[0].shares).toBe(1);
    expect(result.state.cash).toBeCloseTo(s.cash + second * 2);
    expect(result.trade.realized).toBeCloseTo(
      Math.round((second - avg) * 2 * 100) / 100,
    );
  });
  it("removes fully sold holdings and does not repeatedly award first-trade XP", () => {
    let s = executeTrade(initialState(), "AAPL", "buy", 1).state;
    s = executeTrade(s, "AAPL", "sell", 1).state;
    expect(s.cash).toBe(10000);
    expect(s.holdings).toEqual([]);
    expect(s.learning.xp).toBe(50);
  });
  it("calculates portfolio gains at updated quotes", () => {
    let s = executeTrade(initialState(), "AAPL", "buy", 2).state;
    s = { ...s, tick: 1 };
    expect(portfolio(s).gain).toBeCloseTo(
      (quote("AAPL", 1).price - 213.07) * 2,
    );
    expect(portfolio(s).percent).toBeCloseTo(portfolio(s).gain / 100);
  });
  it("explains 5% and 10% moves", () => {
    const t = executeTrade(initialState(), "AAPL", "buy", 2).trade;
    const values = scenarios({ ...t, price: 200, total: 400 });
    expect(values.map((v) => v.price)).toEqual([180, 190, 210, 220]);
    expect(values.map((v) => v.profit)).toEqual([-40, -20, 20, 40]);
    expect(values.map((v) => v.value)).toEqual([360, 380, 420, 440]);
  });
  it("validates a limit buy using its limit price rather than today’s quote", () => {
    const state = { ...initialState(), cash: 200 };
    expect(placeLimit(state, "AAPL", "buy", 1, 190).orders[0].status).toBe(
      "pending",
    );
    expect(() => placeLimit(state, "AAPL", "buy", 1, 201)).toThrow("cash");
    expect(() => placeLimit(state, "AAPL", "buy", 0, 190)).toThrow(
      "whole number",
    );
    expect(() => placeLimit(state, "AAPL", "buy", 1, NaN)).toThrow(
      "positive limit",
    );
  });
  it("fills eligible limits only once and leaves other orders pending", () => {
    let s = placeLimit(initialState(), "AAPL", "buy", 1, 220);
    s = placeLimit(s, "MSFT", "buy", 1, 1);
    const result = advanceMarket(s);
    expect(result.filled).toHaveLength(1);
    expect(
      result.state.orders.filter((o) => o.status === "pending"),
    ).toHaveLength(1);
    expect(advanceMarket(result.state).filled).toHaveLength(0);
  });
  it("cancels triggered orders if funds are no longer available", () => {
    let s = placeLimit(initialState(), "AAPL", "buy", 40, 220);
    s = executeTrade(s, "MSFT", "buy", 20).state;
    const result = advanceMarket(s);
    expect(result.state.orders[0].status).toBe("cancelled");
    expect(result.filled).toHaveLength(0);
  });
  it("reset clears real financial activity while preserving profile and learning", () => {
    let state = answerLesson(initialState(), 1, 1);
    state = executeTrade(state, "AAPL", "buy", 1).state;
    state = placeLimit(state, "MSFT", "buy", 1, 400);
    state = { ...state, profile: { ...state.profile, onboarded: true } };
    const reset = resetSimulator(state);
    expect(reset.cash).toBe(10000);
    expect(reset.holdings).toEqual([]);
    expect(reset.trades).toEqual([]);
    expect(reset.orders).toEqual([]);
    expect(reset.learning).toEqual(state.learning);
    expect(reset.profile.onboarded).toBe(true);
    const educationReset = resetLearning(state);
    expect(educationReset.learning.xp).toBe(0);
    expect(educationReset.learning.completed).toEqual([]);
    expect(educationReset.holdings).toEqual(state.holdings);
  });
});
describe("learning and persistence", () => {
  it("records incorrect attempts without completing lessons", () => {
    const s = answerLesson(initialState(), 1, 0);
    expect(s.learning.completed).toEqual([]);
    expect(s.learning.xp).toBe(0);
    expect(s.learning.attempts[0].correct).toBe(false);
  });
  it("completes correct quizzes and prevents duplicate XP", () => {
    let s = answerLesson(initialState(), 1, 1);
    expect(s.learning.completed).toEqual([1]);
    expect(s.learning.xp).toBe(35);
    s = answerLesson(s, 1, 1);
    expect(s.learning.xp).toBe(35);
    expect(s.learning.streak).toBe(1);
  });
  it("awards a level bonus", () => {
    let s = initialState();
    for (let i = 1; i <= 5; i++) s = answerLesson(s, i, 1);
    expect(s.learning.xp).toBe(275);
  });
  it("persists onboarding, holdings, trades, and progress", () => {
    const map = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => map.get(k) || null,
      setItem: (k: string, v: string) => map.set(k, v),
    });
    let s = answerLesson(initialState(), 1, 1);
    s = {
      ...s,
      profile: { ...s.profile, onboarded: true, experience: "basics" },
    };
    s = executeTrade(s, "AAPL", "buy", 1).state;
    localStorageAdapter.save(s);
    expect(localStorageAdapter.load()).toEqual(s);
    expect(map.has(storageKey)).toBe(true);
    vi.unstubAllGlobals();
  });
});
