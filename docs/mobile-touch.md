# CozyClay Touch

Mobile adaptation of the existing editor, on `chore/mobile-touch`.

- Navigate: one finger orbits, two fingers pan/pinch. Edit keeps selection and handles available.
- Scene, Details, Timeline and Assets open as sheets; a compact transport stays available.
- Shot view adjusts the actual recording camera. Camera gestures participate in undo.
- Save writes a portable project file. MP4 export offers an explicit Save/Share step on touch layouts.
- Portrait and landscape layouts respect screen safe areas. Preview pixel density is capped; export dimensions are unchanged.

## Hosted version

`npm run build` (also `npm run build:touch`) builds the static editor and opens /app/ from the site root. The corresponding source is linked from Help and /source/ under AGPL-3.0. The existing project/editor architecture is preserved. `npm run build:editor` retains the upstream editor build for use with locally configured services; `npm run dev` is unchanged.

The static site does not host the upstream AI motion, agent or OAuth sidecar services. Import an existing/generated motion project for touch refinement. AI generation still needs the separately configured upstream motion service. MP4 support depends on the device providing a compatible WebCodecs H.264 encoder; the editor retains its existing explicit codec errors and PNG/project exports.

## Review

This fork has Issues disabled, so the work is tracked directly in its draft PR. No changes are made to upstream.

Touch controller behavioral checks cover orbit, pinch, cancellation, capture loss, undo boundaries, Edit mode, desktop mouse and camera lock. Browser/device QA is still required before treating this as production mobile support. In this session the supervised preview service was unavailable; no real-device or screenshot evidence is claimed.
