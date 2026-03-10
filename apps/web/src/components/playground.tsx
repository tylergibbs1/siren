"use client";

import { PlaygroundProvider, usePlayground } from "./playground-context";
import { CodeEditor } from "./code-editor";
import { DiagramPreview } from "./diagram-preview";

/** Ghost button: subtle shadow instead of hard border */
const ghostBtn =
  "rounded-md px-3 py-1.5 text-xs font-medium text-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_0_rgba(0,0,0,0.04)] transition-[box-shadow,background-color] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_1px_2px_-1px_rgba(0,0,0,0.08),0_2px_4px_0_rgba(0,0,0,0.06)] hover:bg-scale-3";

const ghostBtnSm =
  "rounded-md px-2 py-1 text-xs text-muted-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06)] transition-[box-shadow,color,background-color] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_1px_2px_-1px_rgba(0,0,0,0.08)] hover:bg-scale-3 hover:text-foreground";

const selectStyle =
  "rounded-md bg-scale-2 px-3 py-1 text-sm text-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

// ── Toolbar ─────────────────────────────────────────────────────────

function PlaygroundToolbar() {
  const { state, actions, meta } = usePlayground();

  return (
    <div className="shrink-0 border-b border-border px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <select
            value={state.template}
            onChange={actions.handleTemplateChange}
            aria-label="Diagram template"
            className={selectStyle}
          >
            {Object.entries(meta.templates).map(([id, item]) => (
              <option key={id} value={id}>{item.label}</option>
            ))}
          </select>
          <select
            value={state.themeId}
            onChange={actions.handleThemeChange}
            aria-label="Color theme"
            className={selectStyle}
          >
            {meta.themeOptions.map(({ id, label }) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
          {state.themeId === "custom" && (
            <button
              type="button"
              onClick={() => actions.setShowThemeModal(true)}
              aria-label="Edit custom theme"
              className={ghostBtnSm}
            >
              Edit CSS
            </button>
          )}
          <div className="hidden min-w-0 md:block">
            <p className="text-sm text-foreground text-balance">{state.templateInfo.label}</p>
            <p className="truncate text-xs text-muted-foreground text-balance">{state.templateInfo.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {state.status && (
            <span className="hidden text-xs text-muted-foreground sm:inline">{state.status}</span>
          )}
          {state.error && (
            <span className="hidden max-w-72 truncate text-xs text-destructive lg:inline">{state.error}</span>
          )}
          <button type="button" onClick={actions.handleCopy} className={ghostBtn}>
            Copy JSON
          </button>
          <ExportMenu />
          <button
            type="button"
            onClick={actions.handleShare}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Share
          </button>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground text-balance">
          V1 presets only. Canonical source of truth: Siren JSON.
        </p>
        {state.error && (
          <span className="truncate text-xs text-destructive sm:hidden">{state.error}</span>
        )}
      </div>
    </div>
  );
}

// ── Export menu ──────────────────────────────────────────────────────

function ExportMenu() {
  const { state, actions, meta } = usePlayground();

  return (
    <div className="relative" ref={meta.exportMenuRef}>
      <button
        type="button"
        onClick={() => actions.setShowExportMenu((prev) => !prev)}
        className={ghostBtn}
      >
        Export
      </button>
      {state.showExportMenu && (
        <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-md bg-scale-2 py-1 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.12)]">
          <button type="button" onClick={actions.handleDownloadJSON} className="block w-full rounded-sm px-3 py-1.5 text-left text-xs text-foreground hover:bg-scale-3">Download JSON</button>
          <button type="button" onClick={actions.handleExportSVG} className="block w-full rounded-sm px-3 py-1.5 text-left text-xs text-foreground hover:bg-scale-3">Download SVG</button>
          <button type="button" onClick={actions.handleExportPNG} className="block w-full rounded-sm px-3 py-1.5 text-left text-xs text-foreground hover:bg-scale-3">Download PNG</button>
          <div className="my-1 border-t border-border" />
          <button type="button" onClick={actions.handleCopyEmbed} className="block w-full rounded-sm px-3 py-1.5 text-left text-xs text-foreground hover:bg-scale-3">Copy embed snippet</button>
        </div>
      )}
    </div>
  );
}

// ── Theme import modal ──────────────────────────────────────────────

function ThemeImportModal() {
  const { state, actions, meta } = usePlayground();
  if (!state.showThemeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={meta.themeModalRef}
        className="mx-4 flex w-full max-w-lg flex-col gap-3 rounded-lg bg-scale-2 p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.16)]"
      >
        <div>
          <h3 className="text-sm font-medium text-foreground text-balance">Import tweakcn theme</h3>
          <p className="mt-1 text-xs text-muted-foreground text-balance">
            Paste your tweakcn / shadcn index.css to preview diagrams in your app&apos;s theme.
          </p>
        </div>
        <textarea
          value={state.themeCSS}
          onChange={(e) => { actions.setThemeCSS(e.target.value); actions.setThemeCSSError(null); }}
          placeholder={`:root {\n  --background: oklch(0.98 0 0);\n  --foreground: oklch(0.14 0 0);\n  ...\n}\n\n.dark {\n  --background: oklch(0.13 0 0);\n  ...\n}`}
          spellCheck={false}
          className="h-64 w-full resize-none rounded-sm bg-scale-1 p-3 font-mono text-xs text-foreground shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {state.themeCSSError && <p className="text-xs text-destructive">{state.themeCSSError}</p>}
        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={() => actions.setShowThemeModal(false)} className={ghostBtn}>
            Cancel
          </button>
          <button
            type="button"
            onClick={actions.handleApplyThemeCSS}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Apply theme
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Editor pane ─────────────────────────────────────────────────────

function PlaygroundEditor() {
  const { state, actions } = usePlayground();

  return (
    <div className="flex w-1/2 flex-col border-r border-border">
      <div className="flex h-8 items-center border-b border-border px-4">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">JSON</span>
      </div>
      <div className="min-h-0 flex-1">
        <CodeEditor value={state.code} onChange={actions.handleCodeChange} />
      </div>
    </div>
  );
}

// ── Preview pane ────────────────────────────────────────────────────

function PlaygroundPreview() {
  const { state, actions, meta } = usePlayground();

  return (
    <div className="flex w-1/2 flex-col">
      <div className="flex h-8 items-center border-b border-border px-4">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Preview</span>
      </div>
      <div className="min-h-0 flex-1">
        <DiagramPreview ref={meta.previewRef} code={state.code} onError={actions.setError} theme={state.activeTheme} />
      </div>
    </div>
  );
}

// ── Composed Playground ─────────────────────────────────────────────

function PlaygroundInner() {
  return (
    <div className="flex h-full flex-col">
      <PlaygroundToolbar />
      <div className="flex min-h-0 flex-1">
        <PlaygroundEditor />
        <PlaygroundPreview />
      </div>
      <ThemeImportModal />
    </div>
  );
}

export function Playground() {
  return (
    <PlaygroundProvider>
      <PlaygroundInner />
    </PlaygroundProvider>
  );
}
