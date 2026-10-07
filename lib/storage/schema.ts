import {avatarIds} from "@/lib/avatars";
import type { State } from "@/types";
import { stocks } from "@/lib/market";
import { lessons } from "@/lib/education";
const record = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === "string";
const number = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);
const nonnegative = (v: unknown): v is number => number(v) && v >= 0;
const integer = (v: unknown): v is number =>
  nonnegative(v) && Number.isSafeInteger(v);
const positive = (v: unknown): v is number => number(v) && v > 0;
const shares = (v: unknown): v is number => integer(v) && v > 0 && v <= 1000000;
const ticker = (v: unknown) => stocks.some((s) => s.ticker === v);
const date = (v: unknown) => text(v) && Number.isFinite(Date.parse(v));
const side = (v: unknown) => v === "buy" || v === "sell";
const lesson = (v: unknown) =>
  integer(v) && lessons.some((item) => item.id === v);
const every = (
  v: unknown,
  validate: (item: unknown) => boolean,
): v is unknown[] => Array.isArray(v) && v.every(validate);
const unique = (items: unknown[]) => new Set(items).size === items.length;

/** Reject malformed persisted data before it can reach financial calculations or UI. */
export function isAccountState(value: unknown): value is State {
  if (!record(value) || !record(value.profile) || !record(value.learning))
    return false;
  if (value.journal !== undefined && (!every(value.journal, j => record(j) && text(j.tradeId) && text(j.note) && j.note.length <= 4000 && text(j.emotion) && j.emotion.length <= 80 && (j.initialRisk === undefined || positive(j.initialRisk))) || !unique((value.journal as Record<string, unknown>[]).map(j=>j.tradeId)))) return false;
  if (value.challenge !== undefined && (!record(value.challenge) || !["plan-3","seven-days"].includes(String(value.challenge.id)) || !date(value.challenge.startedAt) || !positive(value.challenge.startingEquity) || !integer(value.challenge.startTradeCount))) return false;
  if (value.simulatorDeposits !== undefined && !nonnegative(value.simulatorDeposits)) return false;
  if (value.referralDeposits !== undefined && !nonnegative(value.referralDeposits)) return false;
  if (value.moods !== undefined && (!every(value.moods, m=>record(m)&&text(m.id)&&!!m.id&&date(m.date)&&["Calm","Fear","Greed","Tilt","Hesitation"].includes(String(m.mood))) || value.moods.length>90 || !unique(value.moods.map(m=>(m as Record<string,unknown>).id)))) return false;
  if (value.returnGoal !== undefined && (!record(value.returnGoal)||!date(value.returnGoal.startedAt)||!positive(value.returnGoal.startingEquity)||!positive(value.returnGoal.targetPercent)||value.returnGoal.targetPercent>100)) return false;
  if(value.learning.starterModulesCompleted!==undefined&&(!every(value.learning.starterModulesCompleted,text)||!unique(value.learning.starterModulesCompleted)))return false;
  const profile = value.profile,
    learning = value.learning;
  if (
    !text(profile.id) ||
    !profile.id ||
    !text(profile.name) ||
    !text(profile.experience) ||
    !["new", "basics", "experienced"].includes(profile.experience) ||
    typeof profile.beginner !== "boolean" ||
    typeof profile.onboarded !== "boolean"
  )
    return false;
  for(const [key,max] of [['handle',24],['bio',240],['country',80],['timezone',80]] as const){if(profile[key]!==undefined&&(!text(profile[key])||profile[key].length>max))return false;}
  if(profile.learningMode!==undefined&&!["beginner","intermediate","advanced"].includes(String(profile.learningMode)))return false;
  if(profile.avatar!==undefined&&!avatarIds.some(id=>id===profile.avatar))return false;
  if(profile.joinedAt!==undefined&&!date(profile.joinedAt))return false;
  for(const key of ['achievementNotifications','hideProfileInsights'])if(profile[key]!==undefined&&typeof profile[key]!=='boolean')return false;
  if (!nonnegative(value.cash) || !integer(value.tick)) return false;
  if (
    !every(
      value.holdings,
      (h) =>
        record(h) &&
        ticker(h.ticker) &&
        shares(h.shares) &&
        positive(h.averageCost),
    )
  )
    return false;
  if (!unique(value.holdings.map((h) => (h as Record<string, unknown>).ticker)))
    return false;
  if (
    !every(
      value.trades,
      (t) =>
        record(t) &&
        text(t.id) &&
        !!t.id &&
        date(t.date) &&
        ticker(t.ticker) &&
        side(t.side) &&
        shares(t.shares) &&
        positive(t.price) &&
        positive(t.total) &&
        number(t.realized) &&
        positive(t.portfolioValue),
    )
  )
    return false;
  if (
    !every(
      value.orders,
      (o) =>
        record(o) &&
        text(o.id) &&
        !!o.id &&
        date(o.date) &&
        ticker(o.ticker) &&
        side(o.side) &&
        shares(o.shares) &&
        positive(o.limit) &&
        text(o.status) &&
        ["pending", "filled", "cancelled"].includes(o.status),
    )
  )
    return false;
  if (!every(value.watchlist, ticker) || !unique(value.watchlist)) return false;
  if (
    !every(
      value.snapshots,
      (s) => record(s) && text(s.date) && nonnegative(s.value),
    ) ||
    !value.snapshots.length
  )
    return false;
  if(learning.quizPasses!==undefined&&!integer(learning.quizPasses))return false;
  if (!every(learning.completed, lesson) || !unique(learning.completed))
    return false;
  if (
    !every(
      learning.attempts,
      (a) =>
        record(a) &&
        lesson(a.lessonId) &&
        typeof a.correct === "boolean" &&
        date(a.date),
    )
  )
    return false;
  return (
    integer(learning.xp) &&
    integer(learning.streak) &&
    text(learning.lastDay) &&
    (learning.lastDay === "" || /^\d{4}-\d{2}-\d{2}$/.test(learning.lastDay))
  );
}
