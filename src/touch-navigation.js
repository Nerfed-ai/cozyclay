import * as THREE from "three";
import { touchNavigationClaims, touchPair } from "./touch-layout.js";

// One gesture owns its pointers until cancellation, including when the browser
// takes capture or the user changes tools. Desktop events are never claimed.
export function bindTouchNavigation({ canvas, cameraLocked = false, camRef, look, getPivot,
  onCameraChange, onFlyStateChange, onGestureStart, onGestureEnd, invalidate, eventTarget = window }) {
  const points = new Map();
  let pivot = null, changed = false, active = false;
  const own = (event) => { event.preventDefault(); event.stopImmediatePropagation(); };
  const finish = () => {
    const wasActive = active; active = false;
    const ids = [...points.keys()]; points.clear();
    ids.forEach((id) => { if (canvas.hasPointerCapture?.(id)) canvas.releasePointerCapture(id); });
    eventTarget.__cozyclayCameraGesture = false;
    onFlyStateChange?.(false);
    if (changed) onCameraChange?.();
    changed = false;
    if (wasActive) onGestureEnd?.();
    invalidate?.();
  };
  const down = (event) => {
    if (event.target !== canvas || !touchNavigationClaims(event)) return;
    own(event);
    if (cameraLocked || !camRef.current || points.size >= 2) return;
    if (!points.size) {
      active = true; onGestureStart?.();
      eventTarget.dispatchEvent(new Event("cozyclay:touch-navigation-start"));
      const target = getPivot?.();
      pivot = target ? new THREE.Vector3(target.x, target.y, target.z)
        : camRef.current.position.clone().add(new THREE.Vector3(0, 0, -3).applyQuaternion(camRef.current.quaternion));
    }
    points.set(event.pointerId, { x: event.clientX, y: event.clientY });
    canvas.setPointerCapture?.(event.pointerId);
    eventTarget.__cozyclayCameraGesture = true;
    onFlyStateChange?.(true);
  };
  const move = (event) => {
    const old = points.get(event.pointerId), cam = camRef.current;
    if (!old || !cam) return;
    own(event);
    const before = touchPair(points);
    const dx = event.clientX - old.x, dy = event.clientY - old.y;
    points.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (!before) {
      const spherical = new THREE.Spherical().setFromVector3(cam.position.clone().sub(pivot));
      spherical.radius = Math.max(0.6, spherical.radius);
      spherical.theta -= dx * 0.006;
      spherical.phi = THREE.MathUtils.clamp(spherical.phi + dy * 0.006, 0.08, Math.PI - 0.08);
      cam.position.copy(pivot).add(new THREE.Vector3().setFromSpherical(spherical));
    } else {
      const after = touchPair(points);
      const distance = Math.max(0.6, cam.position.distanceTo(pivot));
      const offset = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion).multiplyScalar(-(after.x - before.x) * distance * 0.0022)
        .add(new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion).multiplyScalar((after.y - before.y) * distance * 0.0022));
      pivot.add(offset); cam.position.add(offset);
      const radius = THREE.MathUtils.clamp(distance * before.distance / after.distance, 0.6, 120);
      const radial = cam.position.clone().sub(pivot).normalize().multiplyScalar(radius);
      cam.position.copy(pivot).add(radial);
    }
    cam.position.y = Math.max(0.12, cam.position.y);
    const direction = pivot.clone().sub(cam.position);
    look.current.yaw = Math.atan2(-direction.x, -direction.z);
    look.current.pitch = Math.atan2(direction.y, Math.hypot(direction.x, direction.z));
    cam.rotation.set(look.current.pitch, look.current.yaw, 0, "YXZ");
    changed = true; onCameraChange?.(); invalidate?.();
  };
  const up = (event) => {
    if (!points.has(event.pointerId)) return;
    own(event); points.delete(event.pointerId);
    if (canvas.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    if (!points.size) finish();
  };
  const lost = (event) => { if (points.delete(event.pointerId) && !points.size) finish(); };
  const capture = { capture: true };
  const events = [["pointerdown", down], ["pointermove", move], ["pointerup", up], ["pointercancel", up]];
  events.forEach(([name, handler]) => eventTarget.addEventListener(name, handler, capture));
  canvas.addEventListener("lostpointercapture", lost);
  eventTarget.addEventListener("blur", finish);
  eventTarget.addEventListener("cozyclay:touch-mode", finish);
  return () => {
    finish();
    events.forEach(([name, handler]) => eventTarget.removeEventListener(name, handler, capture));
    canvas.removeEventListener("lostpointercapture", lost);
    eventTarget.removeEventListener("blur", finish);
    eventTarget.removeEventListener("cozyclay:touch-mode", finish);
  };
}
