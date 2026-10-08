import { useSyncExternalStore } from "react";
export const TOUCH_QUERY = "(max-width: 900px), (pointer: coarse) and (max-width: 1200px)";
export const isTouchLayout = () => globalThis.matchMedia?.(TOUCH_QUERY).matches ?? false;
function subscribeLayout(listener) {
  const media = globalThis.matchMedia?.(TOUCH_QUERY);
  media?.addEventListener("change", listener);
  return () => media?.removeEventListener("change", listener);
}
export const useTouchLayout = () => useSyncExternalStore(subscribeLayout, isTouchLayout, () => false);
let mode = "navigate";
const listeners = new Set();
export const getTouchMode = () => mode;
export function setTouchMode(next) {
  if (!["navigate", "edit"].includes(next) || next === mode) return;
  mode = next;
  listeners.forEach((listener) => listener());
  globalThis.dispatchEvent?.(new Event("cozyclay:touch-mode"));
}
export const useTouchMode = () => useSyncExternalStore(
  (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
  getTouchMode, () => "navigate",
);
export const touchNavigationClaims = (event) => event.pointerType === "touch"
  && !event.target?.closest?.(".app[data-embed-mode]") && isTouchLayout() && mode === "navigate";
export function touchPair(points) {
  const [a, b] = [...points.values()];
  return b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)) } : null;
}
