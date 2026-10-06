import type { State } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { initialState } from "@/lib/trading";
import { isAccountState } from "./schema";
export interface CloudAccount {
  state: State;
  version: string;
}
export async function loadCloudAccount(
  id: string,
  email: string,
): Promise<CloudAccount> {
  const { data, error } = await supabase
    .from("paper_accounts")
    .select("account,updated_at")
    .eq("user_id", id)
    .maybeSingle();
  if (error)
    throw new Error(`Unable to load your cloud account: ${error.message}`);
  if (data) {
    if (!isAccountState(data.account))
      throw new Error(
        "Your saved cloud account has an unsupported format. Guest practice remains available after signing out.",
      );
    return { state: data.account, version: data.updated_at };
  }
  const state = initialState();
  state.profile = {
    ...state.profile,
    id,
    name: email.split("@")[0].slice(0, 30) || "Learner",
  };
  const inserted = await supabase
    .from("paper_accounts")
    .insert({ user_id: id, account: state })
    .select("updated_at")
    .single();
  if (inserted.error) {
    // Another tab may have initialized this same account first.
    if (inserted.error.code === "23505") return loadCloudAccount(id, email);
    throw new Error(
      `Unable to create your cloud account: ${inserted.error.message}`,
    );
  }
  return { state, version: inserted.data.updated_at };
}
export async function saveCloudAccount(
  id: string,
  state: State,
  version: string,
): Promise<string> {
  if (!isAccountState(state))
    throw new Error(
      "This account cannot be saved because its data is invalid.",
    );
  const stamp = new Date(
    Math.max(Date.now(), Date.parse(version) + 1),
  ).toISOString();
  const { data, error } = await supabase
    .from("paper_accounts")
    .update({ account: state, updated_at: stamp })
    .eq("user_id", id)
    .eq("updated_at", version)
    .select("updated_at");
  if (error) throw new Error(`Your changes were not saved: ${error.message}`);
  if (!data?.length)
    throw new Error(
      "Your account changed in another tab or device. Reload to see the latest account before trying again.",
    );
  return data[0].updated_at;
}
