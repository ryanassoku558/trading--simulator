"use client";

import ProfileOverview from "../ProfileOverview";
import {useAccount} from "@/lib/storage/useAccount";
import type { State } from "@/types";

import { ShieldCheck } from "lucide-react";
export default function Preferences({
  state,
  page,
  update,
  setReset,
}: {
  state: State;
  page: string;
  update: (s: State) => void | Promise<unknown>;
  setReset: (v: "simulator" | "learning") => void;
}) {
  const {user}=useAccount();
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MAKE THIS SPACE YOURS</span>
          <h1>{page === "profile" ? "Your profile" : "Settings"}</h1>
          <p>
            Guest data stays in this browser. Signed-in progress is saved to
            your Sprout account.
          </p>
        </div>
      </div>
      {page==="profile"?<ProfileOverview state={state} update={update}/>:<section className="card settings-card">
        <h2>
          {page === "profile"
            ? "A little about you"
            : "Your practice preferences"}
        </h2>
        <label>
          Display name
          <input
            maxLength={30}
            value={state.profile.name}
            onChange={(e) =>
              update({
                ...state,
                profile: { ...state.profile, name: e.target.value },
              })
            }
          />
        </label>
        <div className="setting-row">
          <div>
            <strong>Beginner Mode</strong>
            <p>Extra explanations and trade confirmations.</p>
          </div>
          <button
            role="switch"
            aria-checked={state.profile.beginner}
            aria-label="Beginner Mode"
            className={`toggle ${state.profile.beginner ? "on" : ""}`}
            onClick={() =>
              update({
                ...state,
                profile: {
                  ...state.profile,
                  beginner: !state.profile.beginner,
                },
              })
            }
          >
            <span />
          </button>
        </div>
        <div className="setting-row">
          <div>
            <strong>Starting balance</strong>
            <p>$10,000.00 of virtual money. No deposits or withdrawals.</p>
          </div>
          <ShieldCheck size={24} />
        </div>
        <div className="setting-row">
          <div>
            <strong>{user?"Signed-in cloud account":"Local guest account"}</strong>
            <p>
              {user?"Your progress is saved to your Sprout account.":"Guest progress is saved in this browser."}
            </p>
          </div>
          <span className="badge">{user?"CLOUD":"GUEST"}</span>
        </div>
        {page === "settings" && (
          <>
            <div className="setting-row">
              <div>
                <strong>Reset simulator</strong>
                <p>Remove holdings, trades, and orders. Restore $10,000.</p>
              </div>
              <button
                className="secondary danger"
                onClick={() => setReset("simulator")}
              >
                Reset simulator
              </button>
            </div>
            <div className="setting-row">
              <div>
                <strong>Reset learning progress</strong>
                <p>Remove completed lessons, attempts, XP, and streak.</p>
              </div>
              <button
                className="secondary danger"
                onClick={() => setReset("learning")}
              >
                Reset learning
              </button>
            </div>
          </>
        )}
      </section>}
    </>
  );
}
