"use client";
import { useState } from "react";
import Link from "next/link";
import PasswordField from "./ui/PasswordField";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
export default function AuthPanel({
  user,
  pending,
}: {
  user: User | null;
  pending: boolean;
}) {
  const [referralCode,setReferralCode]=useState("");
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
    if (signup && referralCode.trim() && !/^[A-Za-z0-9_]{3,24}$/.test(referralCode.trim())) {
      setMessage("Use 3–24 letters, numbers, or underscores for a referral code, or leave it blank.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      if(signup&&referralCode.trim()){const {data,error}=await supabase.rpc("sprout_validate_referral",{input_code:referralCode.trim()});if(error)throw Error("Referral codes are awaiting activation. You can leave the code blank to sign up now.");if(data!==true)throw Error("That referral code was not found. Please check it.");}
      const result = signup
        ? await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin, data: { first_name: firstName.trim(), referral_code: referralCode.trim().toUpperCase() } },
          })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      setPassword("");
      setMessage(
        signup && !result.data.session
          ? "Check your email to confirm your account, then return here to sign in. If the confirmation email is in Spam or Junk, mark it as not spam and move it to your main inbox (Primary/General), then click the verification link."
          : "Signed in. Loading your saved progress…",
      );
    } catch (e) {
      const error=e as Error & {code?:string};
      setMessage(error.code==='over_email_send_rate_limit'||/email.*rate limit/i.test(error.message)
        ? 'Email rate limit exceeded. Sprout’s confirmation-email service is temporarily limited. If you already received a confirmation email in Spam or Junk, mark it as not spam and move it to your main inbox (Primary/General), then click its verification link. If no email arrived, try again later or contact sprouttradinghelp@gmail.com. Guest practice is still available.'
        : error.message);
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
          <PasswordField label="Password"
              required
              minLength={8}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          <label>Referral code (optional)<small>Leave blank to create an account without a code. Codes are only used for new accounts, never for signing in. A valid code gives new accounts $5,000 in virtual bonus cash after email confirmation.</small><input aria-label="Signup referral code" maxLength={24} value={referralCode} onChange={e=>setReferralCode(e.target.value.toUpperCase())} placeholder="Optional · your friend’s code"/></label>
          <p className="small">Creating an account? We’ll email you a verification link. If it arrives in Spam or Junk, mark it as not spam and move it to your main inbox (Primary/General), then click the link to confirm your account.</p>
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
          <p className="small">By creating an account, you agree to our <Link href="/terms">Terms of use</Link>. Read our <Link href="/privacy">Privacy notice</Link>.</p>
        </form>
      )}
      <p role="status" aria-live="polite">
        {pending ? "Saving or loading your progress…" : message}
      </p>
    </section>
  );
}
