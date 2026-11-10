import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initialState, executeTrade, placeLimit } from "../lib/trading";
import { answerLesson } from "../lib/education";
import { localStorageAdapter, storageKey } from "../lib/storage";
import { isAccountState } from "../lib/storage/schema";
let stored = new Map<string, string>();
beforeEach(() => {
  stored = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => stored.get(key) || null,
    setItem: (key: string, value: string) => stored.set(key, value),
  });
});
afterEach(() => vi.unstubAllGlobals());
describe("saved account validation", () => {
  it("accepts a full account with trades, learning and pending orders", () => {
    let state = answerLesson(initialState(), 1, 1);
    state = executeTrade(state, "AAPL", "buy", 2).state;
    state = placeLimit(state, "MSFT", "buy", 1, 400);
    expect(isAccountState(state)).toBe(true);
    localStorageAdapter.save(state);
    expect(localStorageAdapter.load()).toEqual(state);
  });
  it("creates a fresh account when storage is empty", () =>
    expect(localStorageAdapter.load().cash).toBe(10000));
  it.each(["{broken", "null", "[]", "{}"])(
    "gives a recovery message for invalid saved JSON: %s",
    (raw) => {
      stored.set(storageKey, raw);
      expect(() => localStorageAdapter.load()).toThrow(
        "Reset your local account",
      );
    },
  );
  it.each([
    { cash: -1 },
    { tick: -1 },
    { holdings: [{ ticker: "BOGUS", shares: 1, averageCost: 100 }] },
    { holdings: [{ ticker: "AAPL", shares: -1, averageCost: 100 }] },
    { watchlist: ["AAPL", "AAPL"] },
    { orders: [{ ticker: "AAPL", status: "unknown" }] },
    { snapshots: [] },
    {
      learning: {
        completed: "broken",
        attempts: [],
        xp: 0,
        streak: 0,
        lastDay: "",
      },
    },
    {
      profile: {
        id: "local",
        name: "Alex",
        experience: "unknown",
        beginner: true,
        onboarded: true,
      },
    },
  ])("rejects malformed nested data without rendering it", (patch) => {
    stored.set(storageKey, JSON.stringify({ ...initialState(), ...patch }));
    expect(() => localStorageAdapter.load()).toThrow(
      "Reset your local account",
    );
  });
});
