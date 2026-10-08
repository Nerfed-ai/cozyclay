import assert from "node:assert/strict";
import * as THREE from "three";
import { bindTouchNavigation } from "../src/touch-navigation.js";
import { setTouchMode } from "../src/touch-layout.js";
globalThis.matchMedia = () => ({ matches: true });
const target = new EventTarget(), canvas = new EventTarget(), captures = new Set();
canvas.closest = () => null;
canvas.setPointerCapture = (id) => captures.add(id);
canvas.hasPointerCapture = (id) => captures.has(id);
canvas.releasePointerCapture = (id) => captures.delete(id);
const cam = new THREE.PerspectiveCamera(); cam.position.set(0, 2, 5); cam.lookAt(0, 1, 0);
const camRef = { current: cam }, look = { current: { yaw: 0, pitch: 0 } };
let flying = false, starts = 0, ends = 0;
const setup = (cameraLocked = false) => bindTouchNavigation({
 canvas, cameraLocked, camRef, look, eventTarget: target,
 getPivot: () => ({ x: 0, y: 1, z: 0 }),
 onFlyStateChange: (v) => { flying = v; },
 onGestureStart: () => starts++, onGestureEnd: () => ends++,
});
function send(name, id, x, y, pointerType = "touch") {
 const event = new Event(name, { cancelable: true });
 Object.defineProperties(event, Object.fromEntries(Object.entries({
   target: canvas, pointerId: id, clientX: x, clientY: y, pointerType,
 }).map(([key, value]) => [key, { value }])));
 target.dispatchEvent(event); return event;
}
const dispose = setup();
const initial = cam.position.clone();
assert(send("pointerdown", 1, 100, 100).defaultPrevented);
send("pointermove", 1, 140, 120);
assert(initial.distanceTo(cam.position) > .1, "one finger orbits camera");
send("pointerdown", 2, 240, 120);
const beforePinch = cam.position.distanceTo(new THREE.Vector3(0, 1, 0));
send("pointermove", 2, 290, 120);
assert(cam.position.distanceTo(new THREE.Vector3(0, 1, 0)) < beforePinch, "spread fingers moves camera closer");
send("pointerup", 2, 290, 120);
assert(flying && starts === 1 && ends === 0, "two fingers share one undo gesture");
send("pointercancel", 1, 140, 120);
assert(!flying && ends === 1 && captures.size === 0, "cancellation finishes and releases capture");
const final = cam.position.clone();
send("pointermove", 1, 180, 120);
assert(final.equals(cam.position), "released pointer cannot move camera");
send("pointerdown", 3, 100, 100);
const lost = new Event("lostpointercapture"); Object.defineProperty(lost, "pointerId", { value: 3 });
canvas.dispatchEvent(lost); assert(!flying && ends === 2, "lost capture finishes gesture");
setTouchMode("edit");
assert(!send("pointerdown", 4, 10, 10).defaultPrevented, "edit mode leaves object interaction untouched");
setTouchMode("navigate");
assert(!send("pointerdown", 4, 10, 10, "mouse").defaultPrevented, "mouse behavior is preserved");
send("pointerdown", 5, 10, 10);
target.dispatchEvent(new Event("blur"));
assert(!flying && !target.__cozyclayCameraGesture, "blur releases camera ownership");
dispose();
const lockedDispose = setup(true);
const lockedPosition = cam.position.clone();
send("pointerdown", 6, 10, 10); send("pointermove", 6, 100, 100);
assert(lockedPosition.equals(cam.position) && !flying, "locked camera cannot move");
lockedDispose();
console.log("Touch navigation: orbit, pinch, cancellation, undo boundaries, edit, mouse, blur and lock passed.");
