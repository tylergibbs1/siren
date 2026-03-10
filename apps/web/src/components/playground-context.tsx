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

const STATE_TEMPLATE = `{
  "type": "state",
  "direction": "TB",
  "states": [
    { "id": "idle", "label": "Idle", "initial": true },
    { "id": "fetching", "label": "Fetching Data" },
    { "id": "success", "label": "Success", "variant": "success" },
    { "id": "error", "label": "Error", "variant": "danger" },
    { "id": "retry", "label": "Retry", "variant": "warning" }
  ],
  "transitions": [
    { "from": "idle", "to": "fetching", "label": "fetch()" },
    { "from": "fetching", "to": "success", "label": "200 OK" },
    { "from": "fetching", "to": "error", "label": "500 / timeout" },
    { "from": "error", "to": "retry", "guard": "retries < 3" },
    { "from": "retry", "to": "fetching", "label": "backoff" },
    { "from": "success", "to": "idle", "label": "reset" }
  ]
}`;

const CLASS_TEMPLATE = `{
  "type": "class",
  "direction": "TB",
  "classes": [
    {
      "id": "Animal",
      "name": "Animal",
      "attributes": ["+name: string", "+age: number"],
      "methods": ["+speak(): string", "+move(distance: number): void"]
    },
    {
      "id": "Dog",
      "name": "Dog",
      "attributes": ["+breed: string"],
      "methods": ["+speak(): string", "+fetch(item: string): void"]
    },
    {
      "id": "Cat",
      "name": "Cat",
      "attributes": ["+indoor: boolean"],
      "methods": ["+speak(): string", "+purr(): void"]
    }
  ],
  "relationships": [
    { "from": "Dog", "to": "Animal", "label": "extends", "type": "inheritance" },
    { "from": "Cat", "to": "Animal", "label": "extends", "type": "inheritance" }
  ]
}`;

const C4_TEMPLATE = `{
  "type": "c4",
  "direction": "TB",
  "elements": [
    { "id": "user", "label": "Customer", "type": "person", "description": "A customer of the bank" },
    {
      "id": "banking", "type": "boundary", "label": "Internet Banking System",
      "children": [
        { "id": "webapp", "label": "Web Application", "description": "Delivers the banking SPA" },
        { "id": "api", "label": "API Application", "description": "Provides banking via JSON/HTTPS" }
      ]
    },
    { "id": "email", "label": "Email System", "type": "system", "description": "Sends emails to customers" },
    { "id": "mainframe", "label": "Mainframe", "type": "system", "description": "Stores core banking data" }
  ],
  "relationships": [
    { "from": "user", "to": "webapp", "label": "Visits" },
    { "from": "webapp", "to": "api", "label": "Makes API calls" },
    { "from": "api", "to": "mainframe", "label": "Reads/writes" },
    { "from": "api", "to": "email", "label": "Sends emails using" }
  ]
}`;

const BLOCK_TEMPLATE = `{
  "type": "block",
  "direction": "TB",
  "blocks": [
    {
      "id": "platform", "label": "Platform Layer",
      "children": [
        { "id": "auth", "label": "Auth" },
        { "id": "billing", "label": "Billing" },
        { "id": "notifications", "label": "Notifications" }
      ]
    },
    {
      "id": "infra", "label": "Infrastructure",
      "children": [
        { "id": "k8s", "label": "Kubernetes" },
        { "id": "monitoring", "label": "Monitoring" }
      ]
    }
  ],
  "connections": [
    { "from": "auth", "to": "billing", "label": "validates" },
    { "from": "billing", "to": "notifications", "label": "triggers" },
    { "from": "k8s", "to": "monitoring", "label": "exports metrics" }
  ]
}`;

const REQUIREMENT_TEMPLATE = `{
  "type": "requirement",
  "direction": "TB",
  "requirements": [
    { "id": "r1", "label": "User Authentication", "kind": "functional", "risk": "high", "status": "approved" },
    { "id": "r2", "label": "Password Hashing", "kind": "security", "risk": "critical", "status": "approved" },
    { "id": "r3", "label": "Session Management", "kind": "functional", "risk": "medium", "status": "in-progress" },
    { "id": "r4", "label": "Login UI", "kind": "interface", "risk": "low", "status": "proposed" }
  ],
  "relationships": [
    { "from": "r1", "to": "r2", "type": "derives" },
    { "from": "r1", "to": "r3", "type": "derives" },
    { "from": "r3", "to": "r4", "type": "refines" }
  ]
}`;

const TIMELINE_TEMPLATE = `{
  "type": "timeline",
  "events": [
    { "id": "e1", "date": "Q1 2024", "label": "Research", "description": "Market analysis", "variant": "primary" },
    { "id": "e2", "date": "Q2 2024", "label": "Prototype", "description": "MVP development" },
    { "id": "e3", "date": "Q3 2024", "label": "Beta", "description": "Closed beta launch", "variant": "warning" },
    { "id": "e4", "date": "Q4 2024", "label": "Launch", "description": "Public release", "variant": "success" }
  ]
}`;

const MINDMAP_TEMPLATE = `{
  "type": "mindmap",
  "root": {
    "id": "root", "label": "Product Strategy",
    "children": [
      {
        "id": "growth", "label": "Growth",
        "children": [
          { "id": "seo", "label": "SEO" },
          { "id": "content", "label": "Content Marketing" },
          { "id": "referrals", "label": "Referral Program" }
        ]
      },
      {
        "id": "product", "label": "Product",
        "children": [
          { "id": "features", "label": "Feature Roadmap" },
          { "id": "ux", "label": "UX Improvements" }
        ]
      },
      {
        "id": "eng", "label": "Engineering",
        "children": [
          { "id": "perf", "label": "Performance" },
          { "id": "infra", "label": "Infrastructure" }
        ]
      }
    ]
  }
}`;

const GITGRAPH_TEMPLATE = `{
  "type": "gitgraph",
  "commits": [
    { "id": "a1b2c3d", "message": "Initial commit", "branch": "main" },
    { "id": "e4f5g6h", "message": "Add auth module", "branch": "main", "parent": "a1b2c3d" },
    { "id": "i7j8k9l", "message": "Feature: OAuth", "branch": "feature/oauth", "parent": "e4f5g6h" },
    { "id": "m0n1o2p", "message": "Fix login bug", "branch": "main", "parent": "e4f5g6h" },
    { "id": "q3r4s5t", "message": "Merge OAuth", "branch": "main", "parent": "m0n1o2p", "parents": ["i7j8k9l"], "merge": true }
  ]
}`;

const GANTT_TEMPLATE = `{
  "type": "gantt",
  "sections": [
    {
      "label": "Design",
      "tasks": [
        { "id": "t1", "label": "Wireframes", "start": "Jan 1", "end": "Jan 15" },
        { "id": "t2", "label": "UI Mockups", "start": "Jan 10", "end": "Jan 25" }
      ]
    },
    {
      "label": "Development",
      "tasks": [
        { "id": "t3", "label": "Frontend", "start": "Jan 20", "end": "Mar 1" },
        { "id": "t4", "label": "Backend", "start": "Jan 25", "end": "Mar 10" },
        { "id": "t5", "label": "Integration", "start": "Mar 1", "end": "Mar 20" }
      ]
    },
    {
      "label": "Launch",
      "tasks": [
        { "id": "t6", "label": "QA Testing", "start": "Mar 15", "end": "Apr 1" },
        { "id": "t7", "label": "Release", "start": "Apr 1", "end": "Apr 5" }
      ]
    }
  ]
}`;

const SANKEY_TEMPLATE = `{
  "type": "sankey",
  "nodes": [
    { "id": "budget", "label": "Budget ($100k)" },
    { "id": "eng", "label": "Engineering" },
    { "id": "marketing", "label": "Marketing" },
    { "id": "ops", "label": "Operations" },
    { "id": "salaries", "label": "Salaries" },
    { "id": "tools", "label": "Tools" },
    { "id": "ads", "label": "Ads" }
  ],
  "flows": [
    { "from": "budget", "to": "eng", "value": 50 },
    { "from": "budget", "to": "marketing", "value": 30 },
    { "from": "budget", "to": "ops", "value": 20 },
    { "from": "eng", "to": "salaries", "value": 40 },
    { "from": "eng", "to": "tools", "value": 10 },
    { "from": "marketing", "to": "ads", "value": 25 }
  ]
}`;

const KANBAN_TEMPLATE = `{
  "type": "kanban",
  "columns": [
    {
      "id": "backlog", "label": "Backlog",
      "cards": [
        { "id": "k1", "label": "Dark mode support" },
        { "id": "k2", "label": "Export to PDF" }
      ]
    },
    {
      "id": "progress", "label": "In Progress",
      "cards": [
        { "id": "k3", "label": "Auth integration" },
        { "id": "k4", "label": "Dashboard redesign" }
      ]
    },
    {
      "id": "review", "label": "Review",
      "cards": [
        { "id": "k5", "label": "API rate limiting" }
      ]
    },
    {
      "id": "done", "label": "Done",
      "cards": [
        { "id": "k6", "label": "User onboarding flow" }
      ]
    }
  ]
}`;

const PIE_TEMPLATE = `{
  "type": "pie",
  "title": "Tech Stack Usage",
  "segments": [
    { "label": "TypeScript", "value": 45 },
    { "label": "Python", "value": 25 },
    { "label": "Go", "value": 15 },
    { "label": "Rust", "value": 10 },
    { "label": "Other", "value": 5 }
  ]
}`;

const QUADRANT_TEMPLATE = `{
  "type": "quadrant",
  "title": "Feature Prioritization",
  "items": [
    { "id": "q1", "label": "Auth v2", "x": 0.8, "y": 0.9 },
    { "id": "q2", "label": "Dark Mode", "x": 0.3, "y": 0.7 },
    { "id": "q3", "label": "Export PDF", "x": 0.6, "y": 0.4 },
    { "id": "q4", "label": "Mobile App", "x": 0.9, "y": 0.2 },
    { "id": "q5", "label": "Analytics", "x": 0.2, "y": 0.3 },
    { "id": "q6", "label": "Webhooks", "x": 0.5, "y": 0.6 }
  ]
}`;

const PACKET_TEMPLATE = `{
  "type": "packet",
  "title": "TCP Header",
  "rows": [
    {
      "fields": [
        { "label": "Source Port", "bits": 16 },
        { "label": "Destination Port", "bits": 16 }
      ]
    },
    {
      "fields": [
        { "label": "Sequence Number", "bits": 32 }
      ]
    },
    {
      "fields": [
        { "label": "Ack Number", "bits": 32 }
      ]
    },
    {
      "fields": [
        { "label": "Offset", "bits": 4 },
        { "label": "Reserved", "bits": 6 },
        { "label": "Flags", "bits": 6 },
        { "label": "Window Size", "bits": 16 }
      ]
    }
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
    label: "ER Diagram",
    description: "Entities, relationships, and schema design",
    code: ER_TEMPLATE,
  },
  state: {
    label: "State",
    description: "State machines with transitions and guards",
    code: STATE_TEMPLATE,
  },
  class: {
    label: "Class",
    description: "UML class diagrams with attributes and methods",
    code: CLASS_TEMPLATE,
  },
  c4: {
    label: "C4",
    description: "C4 model with people, systems, and boundaries",
    code: C4_TEMPLATE,
  },
  block: {
    label: "Block",
    description: "Block diagrams with nested groups",
    code: BLOCK_TEMPLATE,
  },
  requirement: {
    label: "Requirement",
    description: "Requirements traceability and relationships",
    code: REQUIREMENT_TEMPLATE,
  },
  timeline: {
    label: "Timeline",
    description: "Chronological events and milestones",
    code: TIMELINE_TEMPLATE,
  },
  mindmap: {
    label: "Mindmap",
    description: "Hierarchical brainstorming and idea maps",
    code: MINDMAP_TEMPLATE,
  },
  gitgraph: {
    label: "Git Graph",
    description: "Commits, branches, and merges",
    code: GITGRAPH_TEMPLATE,
  },
  gantt: {
    label: "Gantt",
    description: "Project schedules with tasks and sections",
    code: GANTT_TEMPLATE,
  },
  sankey: {
    label: "Sankey",
    description: "Flow quantities between nodes",
    code: SANKEY_TEMPLATE,
  },
  kanban: {
    label: "Kanban",
    description: "Task boards with columns and cards",
    code: KANBAN_TEMPLATE,
  },
  pie: {
    label: "Pie Chart",
    description: "Proportional data segments",
    code: PIE_TEMPLATE,
  },
  quadrant: {
    label: "Quadrant",
    description: "2x2 prioritization and categorization",
    code: QUADRANT_TEMPLATE,
  },
  packet: {
    label: "Packet",
    description: "Network protocol header bit layouts",
    code: PACKET_TEMPLATE,
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
