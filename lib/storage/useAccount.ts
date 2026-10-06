"use client";
import { useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import type { State } from "@/types";
import { localStorageAdapter, storageKey } from "./index";
import { supabase } from "@/lib/supabase/client";
import { loadCloudAccount, saveCloudAccount } from "./cloud";
interface Snapshot {
  state: State | null;
  error: string;
  user: User | null;
  pending: boolean;
}
const serverSnapshot: Snapshot = {
  state: null,
  error: "",
  user: null,
  pending: false,
};
let snapshot = serverSnapshot,
  initialized = false,
  version = "",
  generation = 0;
const listeners = new Set<() => void>();
function emit() {
  for (const listener of listeners) listener();
}
function loadGuest() {
  try {
    snapshot = {
      state: localStorageAdapter.load(),
      error: "",
      user: null,
      pending: false,
    };
  } catch (e) {
    snapshot = { ...serverSnapshot, error: (e as Error).message };
  }
  emit();
}
async function switchUser(user: User | null) {
  if (user?.id === snapshot.user?.id) return;
  const current = ++generation;
  version = "";
  if (!user) {
    loadGuest();
    return;
  }
  snapshot = { state: null, error: "", user, pending: true };
  emit();
  try {
    const result = await loadCloudAccount(user.id, user.email || "");
    if (current !== generation) return;
    version = result.version;
    snapshot = { state: result.state, error: "", user, pending: false };
  } catch (e) {
    if (current !== generation) return;
    snapshot = {
      state: null,
      error: (e as Error).message,
      user,
      pending: false,
    };
  }
  emit();
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!initialized) {
    initialized = true;
    loadGuest();
    supabase.auth.onAuthStateChange((_event, session) => {
      queueMicrotask(() => void switchUser(session?.user || null));
    });
  }
  function sync(event: StorageEvent) {
    if (!snapshot.user && (event.key === storageKey || event.key === null))
      loadGuest();
  }
  window.addEventListener("storage", sync);
  return () => {
    window.removeEventListener("storage", sync);
    listeners.delete(listener);
  };
}
async function update(state: State) {
  if (snapshot.pending) return false;
  if (!snapshot.user) {
    let error = "";
    try {
      localStorageAdapter.save(state);
    } catch {
      error =
        "Your browser could not save progress. Enable local storage or keep this tab open.";
    }
    snapshot = { ...snapshot, state, error };
    emit();
    return true;
  }
  if (!snapshot.state || !version) return false;
  const previous = snapshot,
    current = generation;
  snapshot = { ...snapshot, state, pending: true, error: "" };
  emit();
  try {
    const nextVersion = await saveCloudAccount(
      previous.user!.id,
      state,
      version,
    );
    if (current !== generation) return;
    version = nextVersion;
    snapshot = { ...snapshot, pending: false };
    emit();
    return true;
  } catch (e) {
    if (current !== generation) return;
    snapshot = { ...previous, error: (e as Error).message, pending: false };
    emit();
    return false;
  }
}
function retry() {
  const user = snapshot.user;
  snapshot = { ...snapshot, user: null };
  void switchUser(user);
}
export function useAccount() {
  const result = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => serverSnapshot,
  );
  return { ...result, update, retry };
}
