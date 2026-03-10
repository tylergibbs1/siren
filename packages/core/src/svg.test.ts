import { describe, it, expect } from "vitest";
import { renderToSVG } from "./svg";

describe("renderToSVG", () => {
  it("renders a simple flowchart", async () => {
    const svg = await renderToSVG({
      type: "flowchart",
      direction: "TB",
      nodes: [
        { id: "a", label: "Start" },
        { id: "b", label: "End" },
      ],
      edges: [{ from: "a", to: "b" }],
    });

    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain("Start");
    expect(svg).toContain("End");
  });

  it("escapes XSS in node labels", async () => {
    const svg = await renderToSVG({
      type: "flowchart",
      nodes: [{ id: "a", label: '<script>alert("xss")</script>' }],
      edges: [],
    });

    // esc() XML-escapes angle brackets so raw <script> never appears
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&lt;script&gt;");
  });

  it("escapes XSS in edge labels", async () => {
    const svg = await renderToSVG({
      type: "flowchart",
      nodes: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
      edges: [{ from: "a", to: "b", label: '<img onerror="alert(1)">' }],
    });

    // esc() XML-escapes the label so raw HTML never executes
    expect(svg).not.toContain("<img");
    expect(svg).toContain("&lt;img");
  });

  it("renders sequence diagrams with custom layout", async () => {
    const svg = await renderToSVG({
      type: "sequence",
      actors: [
        { id: "alice", label: "Alice" },
        { id: "bob", label: "Bob" },
      ],
      messages: [{ from: "alice", to: "bob", label: "Hello" }],
    });

    expect(svg).toContain("Alice");
    expect(svg).toContain("Bob");
    expect(svg).toContain("Hello");
  });

  it("renders ER diagrams with entity nodes", async () => {
    const svg = await renderToSVG({
      type: "er",
      entities: [
        {
          id: "users",
          name: "Users",
          columns: [
            { name: "id", type: "int", pk: true },
            { name: "name", type: "varchar" },
          ],
        },
      ],
      relationships: [],
    });

    expect(svg).toContain("Users");
    expect(svg).toContain("id");
    expect(svg).toContain("name");
  });

  it("renders with transparent background", async () => {
    const svg = await renderToSVG(
      {
        type: "flowchart",
        nodes: [{ id: "a", label: "Node" }],
        edges: [],
      },
      { background: "transparent" }
    );

    // Should not have the background rect when transparent
    const bgRects = svg.match(/<rect width="\d+\.?\d*" height="\d+\.?\d*" fill="/g);
    expect(bgRects).toBeNull();
  });

  it("renders diamond-shaped nodes", async () => {
    const svg = await renderToSVG({
      type: "flowchart",
      nodes: [{ id: "a", label: "Decision", shape: "diamond" }],
      edges: [],
    });

    expect(svg).toContain("<polygon");
    expect(svg).toContain("Decision");
  });

  it("renders class diagrams", async () => {
    const svg = await renderToSVG({
      type: "class",
      classes: [
        {
          id: "User",
          name: "User",
          attributes: ["+name: string", "+email: string"],
          methods: ["+save(): void"],
        },
      ],
      relationships: [],
    });

    expect(svg).toContain("User");
    expect(svg).toContain("+name: string");
    expect(svg).toContain("+save(): void");
  });

  it("renders state diagrams", async () => {
    const svg = await renderToSVG({
      type: "state",
      states: [
        { id: "idle", label: "Idle", initial: true },
        { id: "running", label: "Running" },
      ],
      transitions: [{ from: "idle", to: "running", label: "start" }],
    });

    expect(svg).toContain("Idle");
    expect(svg).toContain("Running");
    expect(svg).toContain("start");
  });

  it("renders mindmap diagrams", async () => {
    const svg = await renderToSVG({
      type: "mindmap",
      root: {
        id: "root",
        label: "Central",
        children: [
          { id: "a", label: "Branch A" },
          { id: "b", label: "Branch B" },
        ],
      },
    });

    expect(svg).toContain("Central");
    expect(svg).toContain("Branch A");
    expect(svg).toContain("Branch B");
  });

  it("renders stadium (pill) shaped nodes", async () => {
    const svg = await renderToSVG({
      type: "flowchart",
      nodes: [{ id: "a", label: "Terminal", shape: "stadium" }],
      edges: [],
    });

    expect(svg).toContain("Terminal");
    // Stadium uses rx equal to half the height for full pill shape
    expect(svg).toContain("<rect");
  });

  it("renders cylinder shaped nodes", async () => {
    const svg = await renderToSVG({
      type: "flowchart",
      nodes: [{ id: "db", label: "Database", shape: "cylinder" }],
      edges: [],
    });

    expect(svg).toContain("Database");
    expect(svg).toContain("<ellipse");
    expect(svg).toContain("<path");
  });

  it("renders hexagon shaped nodes", async () => {
    const svg = await renderToSVG({
      type: "flowchart",
      nodes: [{ id: "a", label: "Prepare", shape: "hexagon" }],
      edges: [],
    });

    expect(svg).toContain("Prepare");
    expect(svg).toContain("<polygon");
  });

  it("renders cloud shaped nodes", async () => {
    const svg = await renderToSVG({
      type: "flowchart",
      nodes: [{ id: "a", label: "AWS", shape: "cloud" }],
      edges: [],
    });

    expect(svg).toContain("AWS");
    expect(svg).toContain("<path");
  });

  it("renders document shaped nodes", async () => {
    const svg = await renderToSVG({
      type: "flowchart",
      nodes: [{ id: "a", label: "Report", shape: "document" }],
      edges: [],
    });

    expect(svg).toContain("Report");
    expect(svg).toContain("<path");
  });

  it("renders note shaped nodes with folded corner", async () => {
    const svg = await renderToSVG({
      type: "flowchart",
      nodes: [{ id: "a", label: "Note", shape: "note" }],
      edges: [],
    });

    expect(svg).toContain("Note");
    // Note has two path elements (body + fold)
    const paths = svg.match(/<path /g);
    expect(paths!.length).toBeGreaterThanOrEqual(2);
  });

  it("renders subroutine shaped nodes", async () => {
    const svg = await renderToSVG({
      type: "flowchart",
      nodes: [{ id: "a", label: "Process", shape: "subroutine" }],
      edges: [],
    });

    expect(svg).toContain("Process");
    // Subroutine has a rect + two inner vertical lines
    const lines = svg.match(/<line /g);
    expect(lines!.length).toBeGreaterThanOrEqual(2);
  });

  it("renders trapezoid shaped nodes", async () => {
    const svg = await renderToSVG({
      type: "flowchart",
      nodes: [{ id: "a", label: "Manual", shape: "trapezoid" }],
      edges: [],
    });

    expect(svg).toContain("Manual");
    expect(svg).toContain("<polygon");
  });

  it("renders C4 diagrams", async () => {
    const svg = await renderToSVG({
      type: "c4",
      elements: [
        { id: "user", label: "Customer", type: "person", description: "A customer" },
        {
          id: "system", type: "boundary", label: "Banking System",
          children: [
            { id: "web", label: "Web App", description: "Serves the SPA" },
            { id: "api", label: "API", description: "JSON API" },
          ],
        },
        { id: "db", label: "Database", type: "system", description: "Stores data" },
      ],
      relationships: [
        { from: "user", to: "web", label: "Visits" },
        { from: "web", to: "api", label: "Calls" },
        { from: "api", to: "db", label: "Reads/writes" },
      ],
    });

    expect(svg).toContain("<svg");
    expect(svg).toContain("Customer");
    expect(svg).toContain("Web App");
    expect(svg).toContain("Database");
  });

  it("renders architecture diagrams", async () => {
    const svg = await renderToSVG({
      type: "architecture",
      groups: [
        {
          id: "frontend",
          label: "Frontend",
          services: [
            { id: "web", label: "React App" },
            { id: "mobile", label: "Mobile App" },
          ],
        },
      ],
      connections: [{ from: "web", to: "mobile", label: "shared API" }],
    });

    expect(svg).toContain("React App");
    expect(svg).toContain("Mobile App");
    // Group labels are uppercased in the SVG renderer
    expect(svg).toContain("FRONTEND");
  });

  it("renders gantt charts", async () => {
    const svg = await renderToSVG({
      type: "gantt",
      sections: [
        {
          label: "Development",
          tasks: [
            { id: "t1", label: "Design", start: "2024-01-01", end: "2024-01-15" },
            { id: "t2", label: "Build", start: "2024-01-10", end: "2024-02-01" },
          ],
        },
      ],
    });

    expect(svg).toContain("<svg");
    expect(svg).toContain("Design");
    expect(svg).toContain("Build");
  });

  it("renders timeline diagrams", async () => {
    const svg = await renderToSVG({
      type: "timeline",
      events: [
        { id: "e1", date: "2024-01", label: "Alpha" },
        { id: "e2", date: "2024-06", label: "Beta" },
      ],
    });

    expect(svg).toContain("Alpha");
    expect(svg).toContain("Beta");
    expect(svg).toContain("2024-01");
  });

  it("renders kanban boards", async () => {
    const svg = await renderToSVG({
      type: "kanban",
      columns: [
        {
          id: "todo",
          label: "To Do",
          cards: [{ id: "c1", label: "Fix bug" }],
        },
        {
          id: "done",
          label: "Done",
          cards: [{ id: "c2", label: "Ship feature" }],
        },
      ],
    });

    expect(svg).toContain("<svg");
    expect(svg).toContain("Fix bug");
  });

  it("renders pie charts", async () => {
    const svg = await renderToSVG({
      type: "pie",
      title: "Market Share",
      segments: [
        { label: "Chrome", value: 65 },
        { label: "Firefox", value: 20 },
        { label: "Safari", value: 15 },
      ],
    });

    expect(svg).toContain("<svg");
    expect(svg).toContain("Chrome");
    expect(svg).toContain("Market Share");
  });

  it("renders sankey diagrams", async () => {
    const svg = await renderToSVG({
      type: "sankey",
      nodes: [
        { id: "a", label: "Source" },
        { id: "b", label: "Target" },
      ],
      flows: [{ from: "a", to: "b", value: 100 }],
    });

    expect(svg).toContain("Source");
    expect(svg).toContain("Target");
  });

  it("renders git graph diagrams", async () => {
    const svg = await renderToSVG({
      type: "gitgraph",
      commits: [
        { id: "c1", message: "Initial commit", branch: "main" },
        { id: "c2", message: "Add feature", branch: "main", parent: "c1" },
        { id: "c3", message: "Feature work", branch: "feature", parent: "c1" },
      ],
    });

    // Git graph renders commit IDs, not messages
    expect(svg).toContain("<svg");
    expect(svg).toContain("c1");
    expect(svg).toContain("c2");
  });

  it("renders block diagrams", async () => {
    const svg = await renderToSVG({
      type: "block",
      blocks: [
        {
          id: "platform",
          label: "Platform",
          children: [
            { id: "auth", label: "Auth Service" },
            { id: "billing", label: "Billing" },
          ],
        },
      ],
      connections: [{ from: "auth", to: "billing" }],
    });

    // Block group labels are uppercased
    expect(svg).toContain("PLATFORM");
    expect(svg).toContain("Auth Service");
  });

  it("renders requirement diagrams", async () => {
    const svg = await renderToSVG({
      type: "requirement",
      requirements: [
        { id: "r1", label: "User Login" },
        { id: "r2", label: "OAuth Support" },
      ],
      relationships: [{ from: "r1", to: "r2", type: "derives" }],
    });

    expect(svg).toContain("User Login");
    expect(svg).toContain("OAuth Support");
  });

  it("renders quadrant charts", async () => {
    const svg = await renderToSVG({
      type: "quadrant",
      title: "Priority Matrix",
      items: [
        { id: "a", label: "Feature A", x: 0.8, y: 0.9 },
        { id: "b", label: "Feature B", x: 0.2, y: 0.3 },
      ],
    });

    expect(svg).toContain("Feature A");
    expect(svg).toContain("Feature B");
    expect(svg).toContain("Priority Matrix");
  });

  it("renders packet diagrams", async () => {
    const svg = await renderToSVG({
      type: "packet",
      title: "TCP Header",
      rows: [
        {
          fields: [
            { label: "Source Port", bits: 16 },
            { label: "Dest Port", bits: 16 },
          ],
        },
      ],
    });

    expect(svg).toContain("Source Port");
    expect(svg).toContain("Dest Port");
    expect(svg).toContain("TCP Header");
  });

  it("renders flowchart with multiple shapes and variants", async () => {
    const svg = await renderToSVG({
      type: "flowchart",
      direction: "LR",
      nodes: [
        { id: "a", label: "Start", shape: "stadium", variant: "primary" },
        { id: "b", label: "Check?", shape: "diamond" },
        { id: "c", label: "DB", shape: "cylinder", variant: "success" },
        { id: "d", label: "Cloud", shape: "cloud" },
        { id: "e", label: "Doc", shape: "document", variant: "warning" },
        { id: "f", label: "Note", shape: "note" },
        { id: "g", label: "Sub", shape: "subroutine" },
        { id: "h", label: "Manual", shape: "trapezoid", variant: "danger" },
        { id: "i", label: "Prep", shape: "hexagon" },
      ],
      edges: [
        { from: "a", to: "b" },
        { from: "b", to: "c", label: "yes" },
        { from: "b", to: "d", label: "no", dashed: true },
      ],
    });

    expect(svg).toContain("Start");
    expect(svg).toContain("Check?");
    expect(svg).toContain("DB");
    expect(svg).toContain("Cloud");
    expect(svg).toContain("Doc");
    expect(svg).toContain("Note");
    expect(svg).toContain("Sub");
    expect(svg).toContain("Manual");
    expect(svg).toContain("Prep");
  });

  it("throws for unknown diagram type", async () => {
    await expect(
      renderToSVG({ type: "nonexistent", nodes: [], edges: [] })
    ).rejects.toThrow("Unknown diagram type");
  });

  it("applies custom theme", async () => {
    const svg = await renderToSVG(
      {
        type: "flowchart",
        nodes: [{ id: "a", label: "Themed" }],
        edges: [],
      },
      {
        theme: {
          colors: {
            background: "#1e1e1e",
            surface: "#252525",
            surfaceRaised: "#2d2d2d",
            node: "#2d2d2d",
            nodeBorder: "#404040",
            borderStrong: "#555555",
            edge: "#808080",
            text: "#ffffff",
            textMuted: "#bbbbbb",
            textSubtle: "#888888",
            primary: "#ff6600",
            primaryMuted: "#331400",
            success: "#00cc66",
            warning: "#ffcc00",
            danger: "#ff3333",
          },
          radius: "12px",
          fontFamily: "Roboto, sans-serif",
          fontMono: "Fira Code, monospace",
        },
      }
    );

    expect(svg).toContain("Roboto");
    expect(svg).toContain("#2d2d2d"); // node fill
    expect(svg).toContain("#1e1e1e"); // background
  });
});
