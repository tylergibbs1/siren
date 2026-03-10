"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { themes, type SirenTheme } from "@siren/themes";

// ── Types ───────────────────────────────────────────────────────────

type ThemeId = keyof typeof themes | "custom";

const THEME_OPTIONS: { id: ThemeId; label: string }[] = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
  { id: "github", label: "GitHub" },
  { id: "presentation", label: "Presentation" },
  { id: "neutral", label: "Neutral (Print)" },
  { id: "custom", label: "Custom (tweakcn)" },
];

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

function inferTemplateId(code: string): TemplateId {
  try {
    const parsed = JSON.parse(code) as { type?: string };
    if (parsed.type && parsed.type in TEMPLATES) return parsed.type as TemplateId;
  } catch {}
  return DEFAULT_TEMPLATE;
}

// ── CSS parsing ─────────────────────────────────────────────────────

type TweakcnVar =
  | "--background" | "--foreground" | "--card" | "--secondary" | "--border"
  | "--ring" | "--muted-foreground" | "--primary" | "--accent" | "--destructive"
  | "--chart-2" | "--chart-4" | "--radius" | "--font-sans" | "--font-mono";

type CSSVarMap = Partial<Record<TweakcnVar, string>> & Record<string, string>;

function parseCSSVariables(css: string): CSSVarMap {
  const vars: CSSVarMap = {};
  const blockRegex = /(?::root|\.dark)\s*\{([^}]+)\}/g;
  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(css)) !== null) {
    const varRegex = /--([\w-]+)\s*:\s*([^;]+);/g;
    let varMatch: RegExpExecArray | null;
    while ((varMatch = varRegex.exec(match[1])) !== null) {
      vars[`--${varMatch[1]}`] = varMatch[2].trim();
    }
  }
  return vars;
}

function buildThemeFromCSS(vars: CSSVarMap): SirenTheme | null {
  const get = (name: TweakcnVar): string | undefined => vars[name];
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

// ── Context ─────────────────────────────────────────────────────────

interface PlaygroundState {
  code: string;
  error: string | null;
  template: TemplateId;
  themeId: ThemeId;
  activeTheme: SirenTheme;
  status: string | null;
  showExportMenu: boolean;
  showThemeModal: boolean;
  themeCSS: string;
  themeCSSError: string | null;
  templateInfo: (typeof TEMPLATES)[TemplateId];
}

interface PlaygroundActions {
  setCode: (code: string) => void;
  setError: (error: string | null) => void;
  handleCodeChange: (value: string | undefined) => void;
  handleTemplateChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleThemeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleCopy: () => Promise<void>;
  handleShare: () => Promise<void>;
  handleDownloadJSON: () => void;
  handleExportSVG: () => Promise<void>;
  handleExportPNG: () => Promise<void>;
  handleCopyEmbed: () => Promise<void>;
  handleApplyThemeCSS: () => void;
  setShowExportMenu: React.Dispatch<React.SetStateAction<boolean>>;
  setShowThemeModal: React.Dispatch<React.SetStateAction<boolean>>;
  setThemeCSS: React.Dispatch<React.SetStateAction<string>>;
  setThemeCSSError: React.Dispatch<React.SetStateAction<string | null>>;
}

interface PlaygroundMeta {
  previewRef: React.RefObject<HTMLDivElement | null>;
  exportMenuRef: React.RefObject<HTMLDivElement | null>;
  themeModalRef: React.RefObject<HTMLDivElement | null>;
  themeOptions: typeof THEME_OPTIONS;
  templates: typeof TEMPLATES;
}

interface PlaygroundContextValue {
  state: PlaygroundState;
  actions: PlaygroundActions;
  meta: PlaygroundMeta;
}

const PlaygroundContext = createContext<PlaygroundContextValue | null>(null);

export function usePlayground(): PlaygroundContextValue {
  const ctx = useContext(PlaygroundContext);
  if (!ctx) throw new Error("usePlayground must be used within <PlaygroundProvider>");
  return ctx;
}

// ── Download helpers ────────────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadString(content: string, filename: string, type: string) {
  downloadBlob(new Blob([content], { type }), filename);
}

// ── Provider ────────────────────────────────────────────────────────

export function PlaygroundProvider({ children }: { children: React.ReactNode }) {
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

  // Load from share URL on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith(SHARE_PREFIX)) return;
    try {
      const decoded = decodeURIComponent(hash.slice(SHARE_PREFIX.length));
      setCode(decoded);
      setTemplate(inferTemplateId(decoded));
    } catch {}
  }, []);

  // Cleanup status timeout
  useEffect(() => {
    return () => { if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current); };
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

  const setEphemeralStatus = useCallback((value: string) => {
    setStatus(value);
    if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
    statusTimeoutRef.current = setTimeout(() => setStatus(null), 2000);
  }, []);

  // Cross-origin stylesheet filter for html-to-image
  const exportFilter = useCallback((node: any) => {
    if (node.tagName === "LINK" && node.rel === "stylesheet") {
      try { return !node.sheet || !!node.sheet.cssRules; } catch { return false; }
    }
    return true;
  }, []);

  const actions: PlaygroundActions = useMemo(() => ({
    setCode,
    setError,
    handleCodeChange: (value: string | undefined) => {
      if (value === undefined) return;
      setCode(value);
      setError(null);
    },
    handleTemplateChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
      const next = e.target.value as TemplateId;
      setTemplate(next);
      setCode(TEMPLATES[next].code);
      setError(null);
      window.history.replaceState(null, "", window.location.pathname);
    },
    handleThemeChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
      const next = e.target.value as ThemeId;
      setThemeId(next);
      if (next === "custom") setShowThemeModal(true);
    },
    handleCopy: async () => {
      await navigator.clipboard.writeText(code);
      setEphemeralStatus("Copied JSON");
    },
    handleShare: async () => {
      const url = `${window.location.origin}${window.location.pathname}${SHARE_PREFIX}${encodeURIComponent(code)}`;
      window.history.replaceState(null, "", `${window.location.pathname}${SHARE_PREFIX}${encodeURIComponent(code)}`);
      await navigator.clipboard.writeText(url);
      setEphemeralStatus("Copied share link");
    },
    handleDownloadJSON: () => {
      downloadBlob(new Blob([`${code}\n`], { type: "application/json" }), "siren-diagram.json");
      setEphemeralStatus("Downloaded JSON");
    },
    handleExportSVG: async () => {
      setShowExportMenu(false);
      const container = previewRef.current;
      if (!container) return;
      try {
        const { toSvg } = await import("html-to-image");
        const dataUrl = await toSvg(container, {
          backgroundColor: activeTheme.colors.background,
          style: { margin: "0", padding: "0" },
          skipAutoScale: true,
          filter: exportFilter,
        });
        const svgString = decodeURIComponent(dataUrl.split(",")[1] ?? "");
        downloadString(svgString, "siren-diagram.svg", "image/svg+xml;charset=utf-8");
        setEphemeralStatus("Downloaded SVG");
      } catch (err) {
        console.error("[siren] SVG export failed:", err);
        setEphemeralStatus("SVG export failed");
      }
    },
    handleExportPNG: async () => {
      setShowExportMenu(false);
      const container = previewRef.current;
      if (!container) return;
      try {
        const { toPng } = await import("html-to-image");
        const dataUrl = await toPng(container, {
          pixelRatio: 2,
          backgroundColor: activeTheme.colors.background,
          style: { margin: "0", padding: "0" },
          skipAutoScale: true,
          filter: exportFilter,
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
    },
    handleCopyEmbed: async () => {
      setShowExportMenu(false);
      const shareUrl = `${window.location.origin}${window.location.pathname}${SHARE_PREFIX}${encodeURIComponent(code)}`;
      const snippet = `<iframe src="${shareUrl}" width="800" height="500" style="border:1px solid #333;border-radius:8px;" title="Siren Diagram"></iframe>`;
      await navigator.clipboard.writeText(snippet);
      setEphemeralStatus("Copied embed snippet");
    },
    handleApplyThemeCSS: () => {
      const vars = parseCSSVariables(themeCSS);
      const parsed = buildThemeFromCSS(vars);
      if (!parsed) {
        setThemeCSSError("Could not find --background and --foreground variables. Paste a valid tweakcn index.css.");
        return;
      }
      setCustomTheme(parsed);
      setShowThemeModal(false);
    },
    setShowExportMenu,
    setShowThemeModal,
    setThemeCSS,
    setThemeCSSError,
  }), [code, activeTheme, themeCSS, setEphemeralStatus, exportFilter]);

  const value: PlaygroundContextValue = useMemo(() => ({
    state: {
      code,
      error,
      template,
      themeId,
      activeTheme,
      status,
      showExportMenu,
      showThemeModal,
      themeCSS,
      themeCSSError,
      templateInfo: TEMPLATES[template],
    },
    actions,
    meta: {
      previewRef,
      exportMenuRef,
      themeModalRef,
      themeOptions: THEME_OPTIONS,
      templates: TEMPLATES,
    },
  }), [code, error, template, themeId, activeTheme, status, showExportMenu, showThemeModal, themeCSS, themeCSSError, actions]);

  return (
    <PlaygroundContext.Provider value={value}>
      {children}
    </PlaygroundContext.Provider>
  );
}
