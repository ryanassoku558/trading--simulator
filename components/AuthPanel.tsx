"use client";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
export default function AuthPanel({
  user,
  pending,
}: {
  user: User | null;
  pending: boolean;
}) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function authenticate(signup: boolean) {
    if (signup && !firstName.trim()) {
      setMessage("Enter your first name to create your account.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const result = signup
        ? await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin, data: { first_name: firstName.trim() } },
          })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      setPassword("");
      setMessage(
        signup && !result.data.session
          ? "Check your email to confirm your account, then return here to sign in."
          : "Signed in. Loading your saved progress…",
      );
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="card auth-card" aria-label="Account sign-in">
      <div>
        <span className="eyebrow">YOUR SPROUT ACCOUNT</span>
        <h2>{user ? "Your Sprout account" : "Save your progress"}</h2>
        <p>
          {user
            ? `Signed in as ${user.email}`
            : "Save your portfolio and learning across devices. Sign in or create your account to continue."}
        </p>
      </div>
      {user ? (
        <button
          className="secondary"
          disabled={busy || pending}
          onClick={async () => {
            setBusy(true);
            const { error } = await supabase.auth.signOut();
            setMessage(error ? error.message : "");
            setBusy(false);
          }}
        >
          Sign out
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void authenticate(false);
          }}
        >
          <label>
            First name <small>For new accounts</small>
            <input aria-label="First name" name="firstName" autoComplete="given-name" maxLength={60} value={firstName} onChange={e=>setFirstName(e.target.value)}/>
          </label>
          <label>
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <div className="auth-actions">
            <button
              className="primary"
              disabled={busy || pending}
              type="submit"
            >
              Sign in
            </button>
            <button
              className="secondary"
              disabled={busy || pending}
              type="button"
              onClick={(e) => {
                const form = e.currentTarget.form;
                if (form?.reportValidity()) {
                  e.preventDefault();
                  void authenticate(true);
                }
              }}
            >
              Create account
            </button>
          </div>
        </form>
      )}
      <p role="status" aria-live="polite">
        {pending ? "Saving or loading your progress…" : message}
      </p>
    </section>
  );
}
