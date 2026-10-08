import { useEffect, useRef, useState } from "react";
import { useStudioShell } from "./studio-shell-context.js";
import { setTouchMode, useTouchMode } from "../touch-layout.js";
import { useTouchDownload, dismissTouchDownload } from "../touch-download.js";

const PANELS = [["scene", "Scene"], ["details", "Details"], ["timeline", "Timeline"], ["assets", "Assets"]];
export default function TouchWorkspace({ panel, onPanelChange, onDockTabChange }) {
  const c = useStudioShell();
  const mode = useTouchMode(), download = useTouchDownload();
  const [guide, setGuide] = useState(false);
  const downloadDialog = useRef(null);
  useEffect(() => { if (download && !downloadDialog.current?.open) downloadDialog.current?.showModal(); }, [download]);
  const lastFrame = Math.max(0, c.tlFrameCount - 1);
  const togglePanel = (next) => {
    onPanelChange(panel === next ? "none" : next);
    if (next === "assets" || next === "timeline") onDockTabChange(next === "assets" ? "assets" : "animation");
  };
  const play = () => {
    c.cameraPreviewEndRef.current = null;
    c.manualCameraOverrideRef.current = false;
    if (c.tlFrame >= lastFrame) c.setTlFrame(0);
    c.setTlPlaying(!c.tlPlaying);
  };
  async function shareVideo() {
    try {
      const file = new File([download.blob], download.name, { type: "video/mp4" });
      if (!navigator.canShare?.({ files: [file] })) { c.setToast("Use Save video to keep this clip."); return; }
      await navigator.share({ files: [file], title: download.name });
    } catch (error) { if (error.name !== "AbortError") c.setToast("Sharing is unavailable. Use Save video."); }
  }
  return <>
    <div className="touch-tools">
      <div className="touch-mode" role="group" aria-label="Touch interaction">
        <button type="button" aria-pressed={mode === "navigate"} onClick={() => setTouchMode("navigate")}>Navigate</button>
        <button type="button" aria-pressed={mode === "edit"} onClick={() => setTouchMode("edit")}>Edit</button>
      </div>
      <select aria-label="Editing workspace" value={c.workflowMode} onChange={(event) => { c.selectWorkflowMode(event.target.value); setTouchMode("edit"); }}>
        <option value="scene">Stage</option><option value="camera">Camera</option><option value="pose">Pose</option><option value="motion">Motion</option>
      </select>
      <button type="button" aria-label="Touch controls help" aria-expanded={guide} onClick={() => setGuide(!guide)}>?</button>
    </div>
    <div className="touch-actions" aria-label="Quick actions">
      <button type="button" onClick={() => c.castDomain.undoScene()}>Undo</button>
      <button type="button" onClick={() => c.runStudioAction("project.save")}>Save</button>
      <button type="button" disabled={c.recState === "recording" || !(c.shots.length || c.motion || c.hasCameraKeys)} onClick={() => c.runStudioAction("export.shotVideo")}>Export</button>
      <button type="button" aria-pressed={c.lookThroughShot} onClick={c.lookThroughShot ? c.exitShotLook : c.enterShotLook}>Shot view</button>
    </div>
    {guide && <section className="touch-help" aria-label="Touch controls">
      <h2>Make the final adjustments</h2>
      <p><strong>Navigate:</strong> drag with one finger to orbit. Use two fingers to pan or pinch to zoom.</p>
      <p><strong>Edit:</strong> tap a character or object, then drag its handles. Open Details for exact values. Undo reverses an edit.</p>
      <p><strong>Camera:</strong> turn on Shot view to adjust the recording camera. Use Details and Timeline to refine its motion.</p>
      <p><strong>Save:</strong> keep a project file to open from File on another device.</p>
      {import.meta.env.VITE_COZYCLAY_HOSTED === "1" && <p>AI motion needs a separate motion service. This hosted editor lets you refine existing or imported motion projects.</p>}
      <p><a href="https://github.com/Nerfed-ai/cozyclay/tree/chore/mobile-touch" target="_blank" rel="noreferrer">Source code · AGPL-3.0</a></p>
      <button type="button" onClick={() => setGuide(false)}>Got it</button>
    </section>}
    {panel !== "none" && <header className="touch-sheet-heading"><strong>{PANELS.find(([id]) => id === panel)?.[1]}</strong><button type="button" onClick={() => onPanelChange("none")}>Close</button></header>}
    <div className="touch-transport">
      <div className="touch-playback">
        <button type="button" onClick={play} aria-label={c.tlPlaying ? "Pause animation" : "Play animation"}>{c.tlPlaying ? "Pause" : "Play"}</button>
        <input type="range" aria-label="Animation frame" min="0" max={lastFrame} step="1" value={Math.min(c.tlFrame, lastFrame)} onChange={(event) => { c.setTlPlaying(false); c.setTlFrame(Number(event.target.value)); }} />
        <output>{(c.tlFrame / (c.tlFps || 24)).toFixed(1)}s</output>
      </div>
      <div className="touch-hint">{mode === "navigate" ? "1 finger orbit · 2 fingers pan / pinch" : "Tap to select · Drag handles to adjust"}</div>
    </div>
    <nav className="touch-nav" aria-label="Workspace panels">
      {PANELS.map(([id, label]) => <button type="button" key={id} aria-expanded={panel === id} onClick={() => togglePanel(id)}>{label}</button>)}
    </nav>
    {download && <dialog ref={downloadDialog} className="touch-download" aria-label="Video ready" onCancel={(event) => { event.preventDefault(); dismissTouchDownload(); }}>
      <h2>Video ready</h2><p>{download.name}</p>
      <a href={download.url} download={download.name}>Save video</a>
      {typeof navigator.share === "function" && <button type="button" onClick={shareVideo}>Share video</button>}
      <button type="button" onClick={dismissTouchDownload}>Close</button>
    </dialog>}
  </>;
}
