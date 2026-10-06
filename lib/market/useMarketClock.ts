"use client";
import {useSyncExternalStore} from "react";
import {clockTick} from "./index";
function subscribe(update: () => void) {
  const timer = setInterval(update, 2000);
  document.addEventListener("visibilitychange", update);
  return () => {clearInterval(timer); document.removeEventListener("visibilitychange", update);};
}
export function useMarketClock() { return useSyncExternalStore(subscribe, clockTick, () => 0); }
