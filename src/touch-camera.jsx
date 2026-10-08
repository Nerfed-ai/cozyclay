import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { bindTouchNavigation } from "./touch-navigation.js";
export default function TouchCamera({ enabled, cameraLocked, camRef, look, ...callbacks }) {
  const { gl, invalidate } = useThree();
  const latest = useRef(callbacks); latest.current = callbacks;
  useEffect(() => {
    if (!enabled) return undefined;
    return bindTouchNavigation({
      canvas: gl.domElement, cameraLocked, camRef, look, invalidate,
      getPivot: () => latest.current.getPivot?.(),
      onCameraChange: () => latest.current.onCameraChange?.(),
      onFlyStateChange: (value) => latest.current.onFlyStateChange?.(value),
      onGestureStart: () => latest.current.onTouchStart?.(),
      onGestureEnd: () => latest.current.onTouchEnd?.(),
    });
  }, [enabled, cameraLocked, gl, camRef, look, invalidate]);
  return null;
}
