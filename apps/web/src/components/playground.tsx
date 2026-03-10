"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toSvg, toPng } from "html-to-image";
import { themes, type SirenTheme } from "@siren/themes";
import { CodeEditor } from "./code-editor";
import { DiagramPreview } from "./diagram-preview";

type ThemeId = keyof typeof themes | "custom";

const THEME_OPTIONS: { id: ThemeId; label: string }[] = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
  { id: "github", label: "GitHub" },
  { id: "presentation", label: "Presentation" },
  { id: "custom", label: "Custom (tweakcn)" },
];

/** Known tweakcn CSS variable names used by the theme bridge */
type TweakcnVar =
  | "--background"
  | "--foreground"
  | "--card"
  | "--secondary"
  | "--border"
  | "--ring"
  | "--muted-foreground"
  | "--primary"
  | "--accent"
  | "--destructive"
  | "--chart-2"
  | "--chart-4"
  | "--radius"
  | "--font-sans"
  | "--font-mono";

type CSSVarMap = Partial<Record<TweakcnVar, string>> & Record<string, string>;

/**
 * Parse CSS variable declarations from a tweakcn/shadcn index.css string.
 * Extracts vars from both `:root` and `.dark` blocks, with `.dark` taking precedence.
 */
function parseCSSVariables(css: string): CSSVarMap {
  const vars: CSSVarMap = {};

  // Match all CSS blocks and extract variable declarations
  const blockRegex = /(?::root|\.dark)\s*\{([^}]+)\}/g;
  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(css)) !== null) {
    const declarations = match[1];
    const varRegex = /--([\w-]+)\s*:\s*([^;]+);/g;
    let varMatch: RegExpExecArray | null;
    while ((varMatch = varRegex.exec(declarations)) !== null) {
      vars[`--${varMatch[1]}`] = varMatch[2].trim();
    }
  }

  return vars;
}

/** Build a SirenTheme from parsed tweakcn CSS variables */
function buildThemeFromCSS(vars: CSSVarMap): SirenTheme | null {
  const get = (name: TweakcnVar): string | undefined => vars[name];

  // Need at least background + foreground to be useful
  if (!get("--background") || !get("--foreground")) return null;

  return {
    colors: {
      background: get("--background") ?? themes.dark.colors.background,
      surface: get("--secondary") ?? get("--card") ?? themes.dark.colors.surface,
      surfaceRaised: get("--card") ?? themes.dark.colors.surfaceRaised,
      node: get("--card") ?? themes.dark.colors.node,
      nodeBorder: get("--border") ?? themes.dark.colors.nodeBorder,
      borderStrong: get("--ring") ?? themes.dark.colors.borderStrong,
      edge: get("--muted-foreground") ?? themes.dark.colors.edge,
      text: get("--foreground") ?? themes.dark.colors.text,
      textMuted: get("--muted-foreground") ?? themes.dark.colors.textMuted,
      textSubtle: get("--muted-foreground") ?? themes.dark.colors.textSubtle,
      primary: get("--primary") ?? themes.dark.colors.primary,
      primaryMuted: get("--accent") ?? themes.dark.colors.primaryMuted,
      success: get("--chart-2") ?? themes.dark.colors.success,
      warning: get("--chart-4") ?? themes.dark.colors.warning,
      danger: get("--destructive") ?? themes.dark.colors.danger,
    },
    radius: get("--radius") ?? themes.dark.radius,
    fontFamily: get("--font-sans") ?? themes.dark.fontFamily,
    fontMono: get("--font-mono") ?? themes.dark.fontMono,
  };
}

const FLOWCHART_TEMPLATE = `{
  "type": "flowchart",
  "direction": "TB",
  "nodes": [
    { "id": "start", "label": "User signs up", "variant": "primary" },
    { "id": "verify", "label": "Email verified?", "shape": "diamond" },
    { "id": "onboard", "label": "Onboarding", "variant": "success" },
    { "id": "remind", "label": "Send reminder", "variant": "warning" },
    { "id": "active", "label": "Active user", "variant": "success" }
  ],
  "edges": [
    { "from": "start", "to": "verify" },
    { "from": "verify", "to": "onboard", "label": "yes" },
    { "from": "verify", "to": "remind", "label": "no" },
    { "from": "remind", "to": "verify", "dashed": true },
    { "from": "onboard", "to": "active" }
  ]
}`;

const SEQUENCE_TEMPLATE = `{
  "type": "sequence",
  "actors": [
    { "id": "user", "label": "User" },
    { "id": "api", "label": "API" },
    { "id": "db", "label": "Database" }
  ],
  "messages": [
    { "from": "user", "to": "api", "label": "POST /login" },
    { "from": "api", "to": "db", "label": "SELECT user" },
    { "from": "db", "to": "api", "label": "user record", "reply": true },
    { "from": "api", "to": "user", "label": "200 OK + token", "reply": true }
  ]
}`;

const ARCHITECTURE_TEMPLATE = `{
  "type": "architecture",
  "direction": "TB",
  "groups": [
    {
      "id": "frontend", "label": "Frontend", "icon": "globe",
      "services": [
        { "id": "web", "label": "Web App", "icon": "monitor" },
        { "id": "mobile", "label": "Mobile App", "icon": "mobile" }
      ]
    },
    {
      "id": "backend", "label": "Backend", "icon": "server",
      "services": [
        { "id": "api", "label": "API Gateway", "icon": "server" },
        { "id": "auth", "label": "Auth Service", "icon": "lock" }
      ]
    },
    {
      "id": "data", "label": "Data", "icon": "database",
      "services": [
        { "id": "db", "label": "PostgreSQL", "icon": "database" },
        { "id": "cache", "label": "Redis", "icon": "storage" }
      ]
    }
  ],
  "connections": [
    { "from": "web", "to": "api", "label": "HTTPS" },
    { "from": "mobile", "to": "api", "label": "HTTPS" },
    { "from": "api", "to": "auth", "label": "JWT" },
    { "from": "api", "to": "db", "label": "SQL" },
    { "from": "api", "to": "cache", "label": "TCP" }
  ]
}`;

const ER_TEMPLATE = `{
  "type": "er",
  "direction": "LR",
  "entities": [
    {
      "id": "users",
      "name": "Users",
      "columns": [
        { "name": "id", "type": "uuid", "pk": true },
        { "name": "email", "type": "varchar", "unique": true },
        { "name": "name", "type": "varchar" }
      ]
    },
    {
      "id": "posts",
      "name": "Posts",
      "columns": [
        { "name": "id", "type": "uuid", "pk": true },
        { "name": "author_id", "type": "uuid", "fk": true },
        { "name": "title", "type": "varchar" }
      ]
    },
    {
      "id": "comments",
      "name": "Comments",
      "columns": [
        { "name": "id", "type": "uuid", "pk": true },
        { "name": "post_id", "type": "uuid", "fk": true },
        { "name": "user_id", "type": "uuid", "fk": true }
      ]
    }
  ],
  "relationships": [
    { "from": "users", "to": "posts", "cardinality": "1:N", "label": "writes" },
    { "from": "posts", "to": "comments", "cardinality": "1:N", "label": "has" },
    { "from": "users", "to": "comments", "cardinality": "1:N", "label": "authors" }
  ]
}`;

const TEMPLATES = {
  flowchart: {
    label: "Flowchart",
    description: "Processes, branches, and decision trees",
    code: FLOWCHART_TEMPLATE,
  },
  sequence: {
    label: "Sequence",
    description: "API calls and request-response flows",
    code: SEQUENCE_TEMPLATE,
  },
  architecture: {
    label: "Architecture",
    description: "Services, boundaries, and infrastructure",
    code: ARCHITECTURE_TEMPLATE,
  },
  er: {
    label: "ER",
    description: "Entities, relationships, and schema communication",
    code: ER_TEMPLATE,
  },
} as const;

type TemplateId = keyof typeof TEMPLATES;

const DEFAULT_TEMPLATE: TemplateId = "flowchart";
const SHARE_PREFIX = "#code=";

function makeDownload(code: string) {
  const blob = new Blob([`${code}\n`], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "siren-diagram.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadString(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  downloadBlob(blob, filename);
}

function inferTemplateId(code: string): TemplateId {
  try {
    const parsed = JSON.parse(code) as { type?: string };
    if (parsed.type && parsed.type in TEMPLATES) {
      return parsed.type as TemplateId;
    }
  } catch {
    // ignore parse errors during inference
  }

  return DEFAULT_TEMPLATE;
}

export function Playground() {
  const [code, setCode] = useState<string>(TEMPLATES[DEFAULT_TEMPLATE].code);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState<TemplateId>(DEFAULT_TEMPLATE);
  const [themeId, setThemeId] = useState<ThemeId>("dark");
  const [customTheme, setCustomTheme] = useState<SirenTheme | null>(null);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [themeCSS, setThemeCSS] = useState("");
  const [themeCSSError, setThemeCSSError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const themeModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith(SHARE_PREFIX)) return;

    try {
      const decoded = decodeURIComponent(hash.slice(SHARE_PREFIX.length));
      setCode(decoded);
      setTemplate(inferTemplateId(decoded));
    } catch {
      // Ignore malformed share links and keep the default template loaded.
    }
  }, []);

  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
    };
  }, []);

  // Close export menu on outside click
  useEffect(() => {
    if (!showExportMenu) return;
    function handleClick(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showExportMenu]);

  // Close theme modal on outside click
  useEffect(() => {
    if (!showThemeModal) return;
    function handleClick(e: MouseEvent) {
      if (themeModalRef.current && !themeModalRef.current.contains(e.target as Node)) {
        setShowThemeModal(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showThemeModal]);

  const activeTheme = useMemo(() => {
    if (themeId === "custom") return customTheme ?? themes.dark;
    return themes[themeId];
  }, [themeId, customTheme]);

  const templateInfo = TEMPLATES[template];

  const setEphemeralStatus = useCallback((value: string) => {
    setStatus(value);
    if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
    statusTimeoutRef.current = setTimeout(() => setStatus(null), 2000);
  }, []);

  const handleCodeChange = useCallback((value: string | undefined) => {
    if (value === undefined) return;
    setCode(value);
    setError(null);
  }, []);

  const handleThemeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const next = event.target.value as ThemeId;
      setThemeId(next);
      if (next === "custom") setShowThemeModal(true);
    },
    []
  );

  const handleTemplateChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextTemplate = event.target.value as TemplateId;
      setTemplate(nextTemplate);
      setCode(TEMPLATES[nextTemplate].code);
      setError(null);
      window.history.replaceState(null, "", window.location.pathname);
    },
    []
  );

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setEphemeralStatus("Copied JSON");
  }, [code, setEphemeralStatus]);

  const handleDownloadJSON = useCallback(() => {
    makeDownload(code);
    setEphemeralStatus("Downloaded JSON");
  }, [code, setEphemeralStatus]);

  const handleExportSVG = useCallback(async () => {
    setShowExportMenu(false);
    const container = previewRef.current;
    if (!container) return;
    try {
      const dataUrl = await toSvg(container, {
        backgroundColor: activeTheme.colors.background,
        style: { margin: "0", padding: "0" },
      });
      // Convert data URL to raw SVG string
      const svgString = decodeURIComponent(dataUrl.split(",")[1] ?? "");
      downloadString(svgString, "siren-diagram.svg", "image/svg+xml;charset=utf-8");
      setEphemeralStatus("Downloaded SVG");
    } catch (err) {
      console.error("[siren] SVG export failed:", err);
      setEphemeralStatus("SVG export failed");
    }
  }, [activeTheme, setEphemeralStatus]);

  const handleExportPNG = useCallback(async () => {
    setShowExportMenu(false);
    const container = previewRef.current;
    if (!container) return;
    try {
      const dataUrl = await toPng(container, {
        pixelRatio: 2,
        backgroundColor: activeTheme.colors.background,
        style: { margin: "0", padding: "0" },
      });
      const link = document.createElement("a");
      link.download = "siren-diagram.png";
      link.href = dataUrl;
      link.click();
      setEphemeralStatus("Downloaded PNG");
    } catch (err) {
      console.error("[siren] PNG export failed:", err);
      setEphemeralStatus("PNG export failed");
    }
  }, [activeTheme, setEphemeralStatus]);

  const handleCopyEmbed = useCallback(async () => {
    setShowExportMenu(false);
    const shareUrl = `${window.location.origin}${window.location.pathname}${SHARE_PREFIX}${encodeURIComponent(code)}`;
    const embedSnippet = `<iframe src="${shareUrl}" width="800" height="500" style="border:1px solid #333;border-radius:8px;" title="Siren Diagram"></iframe>`;
    await navigator.clipboard.writeText(embedSnippet);
    setEphemeralStatus("Copied embed snippet");
  }, [code, setEphemeralStatus]);

  const handleApplyThemeCSS = useCallback(() => {
    const vars = parseCSSVariables(themeCSS);
    const parsed = buildThemeFromCSS(vars);
    if (!parsed) {
      setThemeCSSError(
        "Could not find --background and --foreground variables. Paste a valid tweakcn index.css."
      );
      return;
    }
    setCustomTheme(parsed);
    setShowThemeModal(false);
  }, [themeCSS]);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}${SHARE_PREFIX}${encodeURIComponent(code)}`;
    window.history.replaceState(null, "", `${window.location.pathname}${SHARE_PREFIX}${encodeURIComponent(code)}`);
    await navigator.clipboard.writeText(url);
    setEphemeralStatus("Copied share link");
  }, [code, setEphemeralStatus]);

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <select
              value={template}
              onChange={handleTemplateChange}
              aria-label="Diagram template"
              className="rounded-md border border-border bg-scale-2 px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {Object.entries(TEMPLATES).map(([id, item]) => (
                <option key={id} value={id}>
                  {item.label}
                </option>
              ))}
            </select>
            <select
              value={themeId}
              onChange={handleThemeChange}
              aria-label="Color theme"
              className="rounded-md border border-border bg-scale-2 px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {THEME_OPTIONS.map(({ id, label }) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
            {themeId === "custom" && (
              <button
                type="button"
                onClick={() => setShowThemeModal(true)}
                aria-label="Edit custom theme"
                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-[color,background-color] hover:bg-scale-3 hover:text-foreground"
              >
                Edit CSS
              </button>
            )}
            <div className="hidden min-w-0 md:block">
              <p className="text-sm text-foreground">{templateInfo.label}</p>
              <p className="truncate text-xs text-muted-foreground">
                {templateInfo.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {status ? (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {status}
              </span>
            ) : null}
            {error ? (
              <span className="hidden max-w-72 truncate text-xs text-destructive lg:inline">
                {error}
              </span>
            ) : null}
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-[color,background-color] hover:bg-scale-3"
            >
              Copy JSON
            </button>
            <div className="relative" ref={exportMenuRef}>
              <button
                type="button"
                onClick={() => setShowExportMenu((prev) => !prev)}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-[color,background-color] hover:bg-scale-3"
              >
                Export
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-md border border-border bg-scale-2 py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={handleDownloadJSON}
                    className="block w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-scale-3"
                  >
                    Download JSON
                  </button>
                  <button
                    type="button"
                    onClick={handleExportSVG}
                    className="block w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-scale-3"
                  >
                    Download SVG
                  </button>
                  <button
                    type="button"
                    onClick={handleExportPNG}
                    className="block w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-scale-3"
                  >
                    Download PNG
                  </button>
                  <div className="my-1 border-t border-border" />
                  <button
                    type="button"
                    onClick={handleCopyEmbed}
                    className="block w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-scale-3"
                  >
                    Copy embed snippet
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleShare}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Share
            </button>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            V1 presets only. Canonical source of truth: Siren JSON.
          </p>
          {error ? (
            <span className="truncate text-xs text-destructive sm:hidden">
              {error}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="flex w-1/2 flex-col border-r border-border">
          <div className="flex h-8 items-center border-b border-border px-4">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              JSON
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <CodeEditor value={code} onChange={handleCodeChange} />
          </div>
        </div>
        <div className="flex w-1/2 flex-col">
          <div className="flex h-8 items-center border-b border-border px-4">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Preview
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <DiagramPreview ref={previewRef} code={code} onError={setError} theme={activeTheme} />
          </div>
        </div>
      </div>

      {/* tweakcn CSS paste modal */}
      {showThemeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            ref={themeModalRef}
            className="mx-4 flex w-full max-w-lg flex-col gap-3 rounded-lg border border-border bg-scale-2 p-5 shadow-xl"
          >
            <div>
              <h3 className="text-sm font-medium text-foreground">
                Import tweakcn theme
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Paste your tweakcn / shadcn index.css to preview diagrams in your app&apos;s theme.
              </p>
            </div>
            <textarea
              value={themeCSS}
              onChange={(e) => {
                setThemeCSS(e.target.value);
                setThemeCSSError(null);
              }}
              placeholder={`:root {\n  --background: oklch(0.98 0 0);\n  --foreground: oklch(0.14 0 0);\n  ...\n}\n\n.dark {\n  --background: oklch(0.13 0 0);\n  ...\n}`}
              spellCheck={false}
              className="h-64 w-full resize-none rounded-md border border-border bg-scale-1 p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {themeCSSError && (
              <p className="text-xs text-destructive">{themeCSSError}</p>
            )}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowThemeModal(false)}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-[color,background-color] hover:bg-scale-3"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyThemeCSS}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Apply theme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
