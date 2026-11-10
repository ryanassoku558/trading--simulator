"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Sprout, Check } from "lucide-react";
import { quote } from "@/lib/market";
import { validAssetQuantity } from "@/lib/market/quantity";
import type { State } from "@/types";
const steps = [
  [
    "Choose a timeframe",
    "Use the actual Interval control and choose 5m. Each candle will represent five simulated minutes.",
    '[aria-label="Candle interval"]',
  ],
  [
    "Inspect the chart",
    "Click a candle on the chart. Read its open, high, low, and close before you make a decision.",
    ".trading-chart-workspace",
  ],
  [
    "Check your reasoning",
    "A rising candle describes what happened. Does it guarantee that the next candle will rise?",
    "",
  ],
  [
    "Choose Buy",
    "Click Buy on the real order ticket. This walkthrough uses a market order.",
    ".trade-panel .segmented",
  ],
  [
    "Enter a quantity",
    "Type an affordable positive quantity in Number of shares. Check the estimated cost before continuing.",
    ".trade-panel input",
  ],
  [
    "Review the purchase",
    "Click Review buy. Read the quantity, estimated cost, and cash remaining in the confirmation window.",
    '.trade-panel button[type="submit"]',
  ],
  [
    "Confirm the buy",
    "Click Confirm buy in the order confirmation. The guide waits for an actual virtual trade execution.",
    "",
  ],
  [
    "Read the trade breakdown",
    "Read the explanation, then click Got it · keep exploring. Your purchase should appear as a position.",
    "",
  ],
  [
    "Choose Sell",
    "Click Sell on the order ticket. You can only sell a quantity you own.",
    ".trade-panel .segmented",
  ],
  [
    "Enter the sale quantity",
    "Type a positive quantity no larger than the position you own. Review the current generated price.",
    ".trade-panel input",
  ],
  [
    "Review the sale",
    "Click Review sell to inspect the sale before you confirm.",
    '.trade-panel button[type="submit"]',
  ],
  [
    "Confirm the sale",
    "Click Confirm sell in the confirmation window. The guide waits for a completed virtual sale.",
    "",
  ],
];
export default function HandsOnTrading({
  state,
  ticker,
  start = false,
}: {
  state: State;
  ticker: string;
  start?: boolean;
}) {
  const [step, setStep] = useState(start ? 0 : -1),
    [feedback, setFeedback] = useState("");
  useEffect(() => {
    if (step < 0 || step >= steps.length) return;
    const target = steps[step][2]
      ? document.querySelector(steps[step][2])
      : null;
    target?.classList.add("hands-on-target");
    target?.scrollIntoView({
      block: "center",
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
    return () => target?.classList.remove("hands-on-target");
  }, [step]);
  useEffect(() => {
    if (step < 0 || step >= steps.length) return;

    function event(e: Event) {
      const el = e.target as HTMLElement;
      const text = el.closest("button")?.textContent?.trim() || "";
      const inTicket = !!el.closest(".trade-panel");
      if (
        step === 0 &&
        e.type === "change" &&
        el.getAttribute("aria-label") === "Candle interval" &&
        (el as HTMLSelectElement).value === "5m"
      )
        setStep(1);
      if (
        step === 1 &&
        e.type === "pointerdown" &&
        el.closest(".trading-chart-workspace") &&
        el.tagName === "CANVAS"
      )
        setStep(2);
      if (step === 3 && e.type === "click" && inTicket && text === "Buy")
        setStep(4);
      if (
        (step === 4 || step === 9) &&
        e.type === "input" &&
        inTicket &&
        el instanceof HTMLInputElement &&
        el.type === "number"
      ) {
        const qty = Number(el.value),
          owned = state.holdings.find((h) => h.ticker === ticker)?.shares || 0;
        if (
          validAssetQuantity(ticker, qty) &&
          (step === 4
            ? qty * quote(ticker, state.tick).price <= state.cash
            : qty <= owned)
        )
          setStep(step + 1);
      }
      if (
        (step === 5 || step === 10) &&
        e.type === "click" &&
        inTicket &&
        text.startsWith(step === 5 ? "Review buy" : "Review sell")
      ) {
        const type = document.querySelector(
          ".trade-panel select",
        ) as HTMLSelectElement | null;
        if (type?.value !== "market") {
          setFeedback("Choose Market order for this walkthrough.");
          return;
        }
        setFeedback("");
        setStep(step + 1);
      }
      if (
        step === 7 &&
        e.type === "click" &&
        text === "Got it · keep exploring"
      )
        setStep(8);
    }
    function executed(e: Event) {
      const trade = (e as CustomEvent).detail;
      if (trade?.ticker !== ticker) return;
      if (step === 6 && trade.side === "buy") setStep(7);
      if (step === 11 && trade.side === "sell") setStep(12);
    }
    for (const name of ["click", "input", "change", "pointerdown"])
      document.addEventListener(name, event);
    window.addEventListener("sprout-trade-executed", executed);
    return () => {
      for (const name of ["click", "input", "change", "pointerdown"])
        document.removeEventListener(name, event);
      window.removeEventListener("sprout-trade-executed", executed);
    };
  }, [step, state.holdings, state.cash, state.tick, ticker]);
  if (step < 0)
    return (
      <div className="hands-on-launch">
        <button
          className="secondary"
          disabled={state.cash <= 0}
          onClick={() => {
            setFeedback("");
            setStep(0);
          }}
        >
          Start hands-on buy & sell tutorial
        </button>
        <small>
          Use real controls and virtual money. Every step requires an action.
        </small>
      </div>
    );
  return (
    <aside className="hands-on-coach" aria-label="Hands-on trading tutorial">
      <div className="hands-on-heading">
        <Sprout size={23} />
        <strong>
          {step === 12
            ? "Walkthrough complete"
            : `Step ${step + 1} of ${steps.length}`}
        </strong>
        <button onClick={() => setStep(-1)} aria-label="Exit hands-on tutorial">
          Exit
        </button>
      </div>
      <progress
        aria-label="Hands-on tutorial progress"
        value={Math.min(step, 12)}
        max={12}
      />
      {step === 12 ? (
        <>
          <h3>
            <Check size={18} />
            You completed a real practice buy and sell.
          </h3>
          <p>
            Reflect on the entry, possible loss, and outcome before your next
            decision. The trades use virtual funds.
          </p>
          <Link href="/practice#journal">Write a trade reflection →</Link>
        </>
      ) : (
        <>
          <h3>{steps[step][0]}</h3>
          <p>{steps[step][1]}</p>
          {step === 2 && (
            <div className="hands-on-answers">
              <button
                className="secondary"
                onClick={() =>
                  setFeedback("A candle describes past prices. Try again.")
                }
              >
                Yes, it guarantees a gain
              </button>
              <button
                className="primary"
                onClick={() => {
                  setFeedback("");
                  setStep(3);
                }}
              >
                No, future movement is uncertain
              </button>
            </div>
          )}
          <p className="small" role="status">
            {feedback || "Complete the action on the interface to continue."}
          </p>
        </>
      )}
    </aside>
  );
}
