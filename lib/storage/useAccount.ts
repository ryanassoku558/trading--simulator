"use client";
import { useSyncExternalStore } from "react";
import type { State } from "@/types";
import { localStorageAdapter, storageKey } from "./index";
interface Snapshot {
  state: State | null;
  error: string;
}
const serverSnapshot: Snapshot = { state: null, error: "" };
let snapshot: Snapshot = serverSnapshot;
let initialized = false;
const listeners = new Set<() => void>();
function emit() {
  for (const listener of listeners) listener();
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!initialized) {
    initialized = true;
    try {
      snapshot = { state: localStorageAdapter.load(), error: "" };
    } catch (e) {
      snapshot = { state: null, error: (e as Error).message };
    }
    emit();
  }
  function sync(event: StorageEvent) {
    if (event.key !== storageKey && event.key !== null) return;
    try {
      snapshot = { state: localStorageAdapter.load(), error: "" };
    } catch (e) {
      snapshot = { state: null, error: (e as Error).message };
    }
    emit();
  }
  window.addEventListener("storage", sync);
  return () => {
    window.removeEventListener("storage", sync);
    listeners.delete(listener);
  };
}
function getSnapshot() {
  return snapshot;
}
function getServerSnapshot() {
  return serverSnapshot;
}
function update(state: State) {
  let error = "";
  try {
    localStorageAdapter.save(state);
  } catch {
    error =
      "Your browser could not save progress. Enable local storage or keep this tab open.";
  }
  snapshot = { state, error };
  emit();
}
export function useAccount() {
  const result = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return { ...result, update };
}
