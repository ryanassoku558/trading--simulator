import type { State } from "@/types";
import { initialState } from "@/lib/trading";
import { isAccountState } from "./schema";
export interface StateStorage {
  load(): State;
  save(state: State): void;
}
export const storageKey = "sprout-trading-v1";
export const localStorageAdapter: StateStorage = {
  load() {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return initialState();
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(
        "Saved data could not be read. Reset your local account to start fresh.",
      );
    }
    if (!isAccountState(parsed))
      throw new Error(
        "Saved data could not be read. Reset your local account to start fresh.",
      );
    if (parsed.profile.id === "local" && parsed.profile.name === "Alex")
      return { ...parsed, profile: { ...parsed.profile, name: "Guest" } };
    return parsed;
  },
  save(state) {
    localStorage.setItem(storageKey, JSON.stringify(state));
  },
};
