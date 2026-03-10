"use client";

import { useState, useCallback } from "react";
import { CodeEditor } from "./code-editor";
import { DiagramPreview } from "./diagram-preview";

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

const STATE_TEMPLATE = `{
  "type": "state",
  "direction": "LR",
  "states": [
    { "id": "init", "label": "", "initial": true },
    { "id": "red", "label": "Red", "variant": "danger" },
    { "id": "yellow", "label": "Yellow", "variant": "warning" },
    { "id": "green", "label": "Green", "variant": "success" },
    { "id": "end", "label": "", "final": true }
  ],
  "transitions": [
    { "from": "init", "to": "red" },
    { "from": "red", "to": "green", "label": "timer", "guard": "45s" },
    { "from": "green", "to": "yellow", "label": "timer", "guard": "30s" },
    { "from": "yellow", "to": "red", "label": "timer", "guard": "5s" },
    { "from": "red", "to": "end", "label": "shutdown" }
  ]
}`;

const CLASS_TEMPLATE = `{
  "type": "class",
  "direction": "TB",
  "classes": [
    { "id": "animal", "name": "Animal", "attributes": ["name: string", "age: int"], "methods": ["speak(): void", "move(): void"] },
    { "id": "dog", "name": "Dog", "attributes": ["breed: string"], "methods": ["fetch(): void", "bark(): void"] },
    { "id": "cat", "name": "Cat", "attributes": ["indoor: bool"], "methods": ["purr(): void", "scratch(): void"] }
  ],
  "relationships": [
    { "from": "dog", "to": "animal", "type": "inheritance" },
    { "from": "cat", "to": "animal", "type": "inheritance" }
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
        { "name": "name", "type": "varchar" },
        { "name": "created_at", "type": "timestamp" }
      ]
    },
    {
      "id": "posts",
      "name": "Posts",
      "columns": [
        { "name": "id", "type": "uuid", "pk": true },
        { "name": "author_id", "type": "uuid", "fk": true },
        { "name": "title", "type": "varchar" },
        { "name": "body", "type": "text" }
      ]
    },
    {
      "id": "comments",
      "name": "Comments",
      "columns": [
        { "name": "id", "type": "uuid", "pk": true },
        { "name": "post_id", "type": "uuid", "fk": true },
        { "name": "user_id", "type": "uuid", "fk": true },
        { "name": "content", "type": "text" }
      ]
    }
  ],
  "relationships": [
    { "from": "users", "to": "posts", "cardinality": "1:N", "label": "writes" },
    { "from": "posts", "to": "comments", "cardinality": "1:N", "label": "has" },
    { "from": "users", "to": "comments", "cardinality": "1:N", "label": "authors" }
  ]
}`;

const TIMELINE_TEMPLATE = `{
  "type": "timeline",
  "events": [
    { "id": "e1", "date": "Jan 2024", "label": "Ideation", "description": "Market research and concept validation", "variant": "primary" },
    { "id": "e2", "date": "Apr 2024", "label": "Prototype", "description": "MVP built and tested internally", "variant": "warning" },
    { "id": "e3", "date": "Jul 2024", "label": "Beta Launch", "description": "500 beta users onboarded", "variant": "success" },
    { "id": "e4", "date": "Oct 2024", "label": "GA Release", "description": "Public launch with full feature set", "variant": "success" },
    { "id": "e5", "date": "Jan 2025", "label": "Series A", "description": "Funding round closed", "variant": "primary" }
  ]
}`;

const KANBAN_TEMPLATE = `{
  "type": "kanban",
  "columns": [
    {
      "id": "todo",
      "label": "To Do",
      "cards": [
        { "id": "c1", "label": "Design login page", "tag": "Design" },
        { "id": "c2", "label": "Write API docs", "tag": "Docs" },
        { "id": "c3", "label": "Set up CI pipeline", "tag": "DevOps" }
      ]
    },
    {
      "id": "progress",
      "label": "In Progress",
      "cards": [
        { "id": "c4", "label": "Implement auth service", "tag": "Backend" },
        { "id": "c5", "label": "Dashboard components", "tag": "Frontend" }
      ]
    },
    {
      "id": "done",
      "label": "Done",
      "cards": [
        { "id": "c6", "label": "Database schema", "tag": "Backend" },
        { "id": "c7", "label": "Project scaffolding", "tag": "Setup" }
      ]
    }
  ]
}`;

const QUADRANT_TEMPLATE = `{
  "type": "quadrant",
  "xLabel": "Effort",
  "yLabel": "Impact",
  "quadrants": ["High Impact / High Effort", "High Impact / Low Effort", "Low Impact / Low Effort", "Low Impact / High Effort"],
  "items": [
    { "id": "q1", "label": "Rewrite core API", "x": 0.85, "y": 0.9 },
    { "id": "q2", "label": "Add dark mode", "x": 0.2, "y": 0.75 },
    { "id": "q3", "label": "Fix typos", "x": 0.15, "y": 0.15 },
    { "id": "q4", "label": "Migrate to TypeScript", "x": 0.8, "y": 0.6 },
    { "id": "q5", "label": "Cache layer", "x": 0.45, "y": 0.8 },
    { "id": "q6", "label": "Update dependencies", "x": 0.3, "y": 0.3 },
    { "id": "q7", "label": "SSO integration", "x": 0.7, "y": 0.85 }
  ]
}`;

const PIE_TEMPLATE = `{
  "type": "pie",
  "title": "Browser Market Share (2024)",
  "segments": [
    { "label": "Chrome", "value": 65 },
    { "label": "Safari", "value": 18 },
    { "label": "Firefox", "value": 7 },
    { "label": "Edge", "value": 5 },
    { "label": "Other", "value": 5 }
  ]
}`;

const C4_TEMPLATE = `{
  "type": "c4",
  "direction": "TB",
  "elements": [
    { "id": "customer", "label": "Customer", "type": "person", "description": "Shops online" },
    {
      "id": "ecommerce", "label": "E-Commerce System", "type": "boundary",
      "children": [
        { "id": "webapp", "label": "Web App", "type": "system", "description": "Next.js storefront" },
        { "id": "api", "label": "API Gateway", "type": "system", "description": "REST + GraphQL" }
      ]
    },
    { "id": "payment", "label": "Payment Provider", "type": "system", "description": "Stripe" },
    { "id": "warehouse", "label": "Warehouse System", "type": "system", "description": "Inventory & shipping" }
  ],
  "relationships": [
    { "from": "customer", "to": "webapp", "label": "Browses products" },
    { "from": "webapp", "to": "api", "label": "API calls" },
    { "from": "api", "to": "payment", "label": "Process payment" },
    { "from": "api", "to": "warehouse", "label": "Place order" }
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
      "id": "backend", "label": "Backend Services", "icon": "server",
      "services": [
        { "id": "api", "label": "API Server", "icon": "server" },
        { "id": "auth", "label": "Auth Service", "icon": "lock" }
      ]
    },
    {
      "id": "data", "label": "Data Layer", "icon": "database",
      "services": [
        { "id": "db", "label": "PostgreSQL", "icon": "database" },
        { "id": "cache", "label": "Redis Cache", "icon": "storage" }
      ]
    }
  ],
  "connections": [
    { "from": "web", "to": "api", "label": "HTTPS" },
    { "from": "mobile", "to": "api", "label": "HTTPS" },
    { "from": "api", "to": "auth", "label": "gRPC" },
    { "from": "api", "to": "db", "label": "SQL" },
    { "from": "api", "to": "cache", "label": "TCP" }
  ]
}`;

const BLOCK_TEMPLATE = `{
  "type": "block",
  "direction": "TB",
  "blocks": [
    {
      "id": "presentation", "label": "Presentation Layer",
      "children": [
        { "id": "ui", "label": "UI Components" },
        { "id": "routing", "label": "Router" }
      ]
    },
    {
      "id": "business", "label": "Business Logic",
      "children": [
        { "id": "services", "label": "Services" },
        { "id": "validators", "label": "Validators" }
      ]
    },
    {
      "id": "data", "label": "Data Access",
      "children": [
        { "id": "orm", "label": "ORM" },
        { "id": "migrations", "label": "Migrations" }
      ]
    }
  ],
  "connections": [
    { "from": "ui", "to": "services", "label": "calls" },
    { "from": "routing", "to": "services" },
    { "from": "services", "to": "validators" },
    { "from": "services", "to": "orm", "label": "queries" },
    { "from": "orm", "to": "migrations" }
  ]
}`;

const REQUIREMENT_TEMPLATE = `{
  "type": "requirement",
  "direction": "TB",
  "requirements": [
    { "id": "r1", "label": "User Authentication", "kind": "functional", "risk": "high", "status": "approved" },
    { "id": "r2", "label": "OAuth2 Support", "kind": "interface", "risk": "medium", "status": "implemented" },
    { "id": "r3", "label": "MFA Enabled", "kind": "functional", "risk": "high", "status": "draft" },
    { "id": "r4", "label": "Login < 2s", "kind": "performance", "risk": "low", "status": "verified" },
    { "id": "r5", "label": "Session Management", "kind": "design", "risk": "medium", "status": "approved" }
  ],
  "relationships": [
    { "from": "r2", "to": "r1", "type": "derives" },
    { "from": "r3", "to": "r1", "type": "derives" },
    { "from": "r4", "to": "r2", "type": "traces" },
    { "from": "r5", "to": "r1", "type": "satisfies" }
  ]
}`;

const MINDMAP_TEMPLATE = `{
  "type": "mindmap",
  "root": {
    "id": "root",
    "label": "Project Plan",
    "children": [
      {
        "id": "research",
        "label": "Research",
        "children": [
          { "id": "interviews", "label": "User Interviews" },
          { "id": "competitors", "label": "Competitor Analysis" },
          { "id": "surveys", "label": "Surveys" }
        ]
      },
      {
        "id": "design",
        "label": "Design",
        "children": [
          { "id": "wireframes", "label": "Wireframes" },
          { "id": "prototype", "label": "Prototype" },
          { "id": "testing", "label": "Usability Testing" }
        ]
      },
      {
        "id": "dev",
        "label": "Development",
        "children": [
          { "id": "frontend", "label": "Frontend" },
          { "id": "backend", "label": "Backend" },
          { "id": "infra", "label": "Infrastructure" }
        ]
      },
      {
        "id": "launch",
        "label": "Launch",
        "children": [
          { "id": "marketing", "label": "Marketing" },
          { "id": "docs", "label": "Documentation" }
        ]
      }
    ]
  }
}`;

const GITGRAPH_TEMPLATE = `{
  "type": "gitgraph",
  "commits": [
    { "id": "c1", "message": "Initial commit", "branch": "main" },
    { "id": "c2", "message": "Add project structure", "branch": "main", "parent": "c1" },
    { "id": "c3", "message": "Start feature work", "branch": "feature/auth", "parent": "c2" },
    { "id": "c4", "message": "Add login endpoint", "branch": "feature/auth", "parent": "c3" },
    { "id": "c5", "message": "Fix typo in README", "branch": "main", "parent": "c2" },
    { "id": "c6", "message": "Add OAuth support", "branch": "feature/auth", "parent": "c4" },
    { "id": "c7", "message": "Merge feature/auth", "branch": "main", "parents": ["c5", "c6"], "merge": true },
    { "id": "c8", "message": "Release v1.0", "branch": "main", "parent": "c7" }
  ]
}`;

const GANTT_TEMPLATE = `{
  "type": "gantt",
  "title": "Website Redesign",
  "sections": [
    {
      "label": "Planning",
      "tasks": [
        { "id": "t1", "label": "Requirements gathering", "start": "2024-01-01", "end": "2024-01-14" },
        { "id": "t2", "label": "Technical spec", "start": "2024-01-15", "end": "2024-01-28" }
      ]
    },
    {
      "label": "Design",
      "tasks": [
        { "id": "t3", "label": "Wireframes", "start": "2024-01-29", "end": "2024-02-11" },
        { "id": "t4", "label": "Visual design", "start": "2024-02-12", "end": "2024-03-03" }
      ]
    },
    {
      "label": "Development",
      "tasks": [
        { "id": "t5", "label": "Frontend build", "start": "2024-03-04", "end": "2024-04-07" },
        { "id": "t6", "label": "Backend integration", "start": "2024-03-18", "end": "2024-04-14" },
        { "id": "t7", "label": "QA & Launch", "start": "2024-04-15", "end": "2024-04-28" }
      ]
    }
  ]
}`;

const SANKEY_TEMPLATE = `{
  "type": "sankey",
  "nodes": [
    { "id": "solar", "label": "Solar" },
    { "id": "wind", "label": "Wind" },
    { "id": "gas", "label": "Natural Gas" },
    { "id": "grid", "label": "Power Grid" },
    { "id": "homes", "label": "Residential" },
    { "id": "commercial", "label": "Commercial" },
    { "id": "industry", "label": "Industrial" },
    { "id": "loss", "label": "Transmission Loss" }
  ],
  "flows": [
    { "from": "solar", "to": "grid", "value": 30 },
    { "from": "wind", "to": "grid", "value": 25 },
    { "from": "gas", "to": "grid", "value": 45 },
    { "from": "grid", "to": "homes", "value": 35 },
    { "from": "grid", "to": "commercial", "value": 30 },
    { "from": "grid", "to": "industry", "value": 28 },
    { "from": "grid", "to": "loss", "value": 7 }
  ]
}`;

const PACKET_TEMPLATE = `{
  "type": "packet",
  "title": "TCP Header",
  "wordSize": 32,
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
        { "label": "Acknowledgment Number", "bits": 32 }
      ]
    },
    {
      "fields": [
        { "label": "Offset", "bits": 4 },
        { "label": "Reserved", "bits": 3 },
        { "label": "Flags", "bits": 9 },
        { "label": "Window Size", "bits": 16 }
      ]
    },
    {
      "fields": [
        { "label": "Checksum", "bits": 16 },
        { "label": "Urgent Pointer", "bits": 16 }
      ]
    }
  ]
}`;

const TEMPLATES: Record<string, string> = {
  flowchart: FLOWCHART_TEMPLATE,
  sequence: SEQUENCE_TEMPLATE,
  state: STATE_TEMPLATE,
  class: CLASS_TEMPLATE,
  er: ER_TEMPLATE,
  timeline: TIMELINE_TEMPLATE,
  kanban: KANBAN_TEMPLATE,
  quadrant: QUADRANT_TEMPLATE,
  pie: PIE_TEMPLATE,
  c4: C4_TEMPLATE,
  architecture: ARCHITECTURE_TEMPLATE,
  block: BLOCK_TEMPLATE,
  requirement: REQUIREMENT_TEMPLATE,
  mindmap: MINDMAP_TEMPLATE,
  gitgraph: GITGRAPH_TEMPLATE,
  gantt: GANTT_TEMPLATE,
  sankey: SANKEY_TEMPLATE,
  packet: PACKET_TEMPLATE,
};

export function Playground() {
  const [code, setCode] = useState(FLOWCHART_TEMPLATE);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState("flowchart");

  const handleCodeChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      setError(null);
    }
  }, []);

  const handleTemplateChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      setTemplate(val);
      const tmpl = TEMPLATES[val];
      if (tmpl) setCode(tmpl);
    },
    []
  );

  return (
    <div className="flex flex-col h-full">
      <div className="h-10 border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <select
            value={template}
            onChange={handleTemplateChange}
            aria-label="Diagram template"
            className="text-sm bg-scale-2 text-foreground border border-border rounded-md px-3 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="flowchart">Flowchart</option>
            <option value="sequence">Sequence</option>
            <option value="state">State</option>
            <option value="class">Class</option>
            <option value="er">ER Diagram</option>
            <option value="timeline">Timeline</option>
            <option value="kanban">Kanban</option>
            <option value="quadrant">Quadrant</option>
            <option value="pie">Pie Chart</option>
            <option value="c4">C4</option>
            <option value="architecture">Architecture</option>
            <option value="block">Block</option>
            <option value="requirement">Requirement</option>
            <option value="mindmap">Mindmap</option>
            <option value="gitgraph">Git Graph</option>
            <option value="gantt">Gantt</option>
            <option value="sankey">Sankey</option>
            <option value="packet">Packet</option>
          </select>
        </div>
        {error && (
          <span className="text-xs text-destructive truncate ml-4">{error}</span>
        )}
      </div>
      <div className="flex flex-1 min-h-0">
        <div className="w-1/2 border-r border-border flex flex-col">
          <div className="h-8 border-b border-border flex items-center px-4">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              JSON
            </span>
          </div>
          <div className="flex-1 min-h-0">
            <CodeEditor value={code} onChange={handleCodeChange} />
          </div>
        </div>
        <div className="w-1/2 flex flex-col">
          <div className="h-8 border-b border-border flex items-center px-4">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Preview
            </span>
          </div>
          <div className="flex-1 min-h-0">
            <DiagramPreview code={code} onError={setError} />
          </div>
        </div>
      </div>
    </div>
  );
}
