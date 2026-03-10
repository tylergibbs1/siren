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
