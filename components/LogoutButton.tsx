"use client";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function LogoutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function logout() {
    setBusy(true);
    setError("");
    try {
      const result = await supabase.auth.signOut();
      if (result.error) throw result.error;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not log out. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return <div><button className="secondary" disabled={busy} onClick={() => void logout()}><LogOut size={16} aria-hidden="true" />{busy ? "Logging out…" : "Log out"}</button>{error && <p role="alert">{error}</p>}</div>;
}
