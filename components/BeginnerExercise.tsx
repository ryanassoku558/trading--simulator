"use client";
import { useState } from "react";
import { money } from "@/lib/market";
export default function BeginnerExercise({ lessonId }: { lessonId: number }) {
  const [shares, setShares] = useState("10"),
    [choice, setChoice] = useState(""),
    [revealed, setRevealed] = useState(false);
  const [reason, setReason] = useState(""),
    [invalidates, setInvalidates] = useState(""),
    [exit, setExit] = useState("");
  if (lessonId < 50 || lessonId > 54) return null;
  const count = Number(shares),
    valid = Number.isInteger(count) && count >= 1 && count <= 1000;
  return (
    <section
      className="practice-exercise"
      aria-label="Interactive practice exercise"
    >
      <span className="eyebrow">TRY IT YOURSELF · SIMULATED EXAMPLE</span>
      {lessonId === 50 && (
        <>
          <dl className="quote-exercise">
            <div>
              <dt>Ticker</dt>
              <dd>PRACT</dd>
            </div>
            <div>
              <dt>Last</dt>
              <dd>$100.00</dd>
            </div>
            <div>
              <dt>Bid</dt>
              <dd>$99.90</dd>
            </div>
            <div>
              <dt>Ask</dt>
              <dd>$100.10</dd>
            </div>
          </dl>
          <p>
            Example timestamp: 10:00 a.m. Eastern. A recorded last price is not
            a guaranteed fill.
          </p>
          <button className="secondary" onClick={() => setRevealed(!revealed)}>
            {revealed ? "Hide calculation" : "Show spread calculation"}
          </button>
          {revealed && (
            <p role="status">Ask − bid = $100.10 − $99.90 = $0.20 spread.</p>
          )}
        </>
      )}
      {lessonId === 51 && (
        <>
          <label>
            Practice share count
            <input
              type="number"
              min="1"
              max="1000"
              step="1"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
            />
          </label>
          <p>
            Example entry $100 → example later price $95. Starting account:
            $10,000.
          </p>
          <p role="status">
            {valid
              ? `${count} shares × $5 decline = ${money(count * 5)} loss before costs (${(((count * 5) / 10000) * 100).toFixed(2)}% of the example account).`
              : "Enter a whole number from 1 to 1,000."}
          </p>
        </>
      )}
      {lessonId === 52 && (
        <>
          <p>Example ask: $100.10. You are only willing to pay $100.</p>
          <div className="auth-actions">
            <button
              className="secondary"
              aria-pressed={choice === "market"}
              onClick={() => setChoice("market")}
            >
              Compare market order
            </button>
            <button
              className="secondary"
              aria-pressed={choice === "limit"}
              onClick={() => setChoice("limit")}
            >
              Compare $100 buy limit
            </button>
          </div>
          <p role="status">
            {choice === "market"
              ? "A market buy prioritizes execution and could cost more than $100. The last or displayed price is not guaranteed."
              : choice === "limit"
                ? "A $100 buy limit will not pay more than $100 per share, but may not fill while the ask is $100.10."
                : "Choose an order to inspect its tradeoff. This exercise sends no orders."}
          </p>
        </>
      )}
      {lessonId === 53 && (
        <>
          <label>
            Observation and entry condition
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={1000}
              placeholder="What would need to happen before you consider entering?"
            />
          </label>
          <label>
            What would invalidate the idea?
            <textarea
              value={invalidates}
              onChange={(e) => setInvalidates(e.target.value)}
              maxLength={1000}
            />
          </label>
          <label>
            Intended exit conditions
            <textarea
              value={exit}
              onChange={(e) => setExit(e.target.value)}
              maxLength={1000}
            />
          </label>
          <label>
            Virtual shares for the example
            <input
              type="number"
              min="1"
              max="1000"
              step="1"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
            />
          </label>
          <p role="status">
            {valid
              ? `At an example $100 entry and $95 exit, ${count} shares would lose ${money(count * 5)} before costs. A worse fill could lose more.`
              : "Enter a whole number from 1 to 1,000."}
          </p>
          <button className="secondary" onClick={() => setRevealed(true)}>
            Review my practice plan
          </button>
          {revealed && (
            <p role="status">
              {reason.trim() && invalidates.trim() && exit.trim() && valid
                ? "You have described an entry, invalidation, exit, and size. Review the assumptions and consider whether skipping the trade is better. This is a worksheet, not approval of a strategy."
                : "Complete your entry condition, invalidation, exit conditions, and a valid share count before reviewing."}
            </p>
          )}
          <p className="small">
            Temporary worksheet: closing the lesson clears it. It does not place
            a trade or stop order.
          </p>
        </>
      )}
      {lessonId === 54 && (
        <>
          <div className="review-examples">
            <div>
              <strong>Trade A · −$10</strong>
              <p>Kept its planned size and followed its exit condition.</p>
            </div>
            <div>
              <strong>Trade B · +$20</strong>
              <p>Doubled its size impulsively to chase a quick gain.</p>
            </div>
          </div>
          <div className="auth-actions">
            <button
              className="secondary"
              aria-pressed={choice === "result"}
              onClick={() => setChoice("result")}
            >
              Judge only the profit
            </button>
            <button
              className="secondary"
              aria-pressed={choice === "process"}
              onClick={() => setChoice("process")}
            >
              Review the decision process
            </button>
          </div>
          <p role="status">
            {choice === "result"
              ? "Trade B earned more in this example, but that alone does not establish a better process or a repeatable strategy."
              : choice === "process"
                ? "Review what matched the plan, how size affected possible losses, and what changed. Either result can reflect uncertainty; one trade is not proof."
                : "Choose a review approach. Then answer the knowledge check below."}
          </p>
        </>
      )}
    </section>
  );
}
