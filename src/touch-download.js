import { useSyncExternalStore } from "react";
let pending = null;
const listeners = new Set();
export function offerTouchDownload(blob, name) {
  if (pending) URL.revokeObjectURL(pending.url);
  pending = { blob, name, url: URL.createObjectURL(blob) };
  listeners.forEach((listener) => listener());
}
export function dismissTouchDownload() {
  if (pending) URL.revokeObjectURL(pending.url);
  pending = null;
  listeners.forEach((listener) => listener());
}
const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
export const useTouchDownload = () => useSyncExternalStore(subscribe, () => pending, () => null);
