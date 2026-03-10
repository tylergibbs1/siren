import { describe, it, expect } from "vitest";
import { validate } from "./validate";

describe("validate", () => {
  // ── General ──────────────────────────────────────────────────────────

  it("rejects non-object input", () => {
    expect(validate(null).valid).toBe(false);
    expect(validate(undefined).valid).toBe(false);
    expect(validate("string").valid).toBe(false);
    expect(validate(42).valid).toBe(false);
  });

  it("rejects missing type field", () => {
    const result = validate({ nodes: [] });
    expect(result.valid).toBe(false);
    expect(result.errors![0]!.code).toBe("MISSING_FIELD");
  });

  it("rejects unknown diagram type", () => {
    const result = validate({ type: "unknown" });
    expect(result.valid).toBe(false);
    expect(result.errors![0]!.code).toBe("UNKNOWN_TYPE");
  });

  // ── Flowchart ────────────────────────────────────────────────────────

  describe("flowchart", () => {
    const minimal = {
      type: "flowchart",
      nodes: [{ id: "a", label: "A" }],
      edges: [],
    };

    it("validates minimal flowchart", () => {
      expect(validate(minimal).valid).toBe(true);
    });

    it("validates flowchart with edges", () => {
      const result = validate({
        type: "flowchart",
        direction: "LR",
        nodes: [
          { id: "a", label: "A" },
          { id: "b", label: "B" },
        ],
        edges: [{ from: "a", to: "b", label: "go" }],
      });
      expect(result.valid).toBe(true);
    });

    it("rejects missing nodes array", () => {
      const result = validate({ type: "flowchart", edges: [] });
      expect(result.valid).toBe(false);
    });

    it("rejects missing edges array", () => {
      const result = validate({ type: "flowchart", nodes: [] });
      expect(result.valid).toBe(false);
    });

    it("rejects node without id", () => {
      const result = validate({
        type: "flowchart",
        nodes: [{ label: "A" }],
        edges: [],
      });
      expect(result.valid).toBe(false);
      expect(result.errors![0]!.path).toBe("nodes[0].id");
    });

    it("rejects node without label", () => {
      const result = validate({
        type: "flowchart",
        nodes: [{ id: "a" }],
        edges: [],
      });
      expect(result.valid).toBe(false);
      expect(result.errors![0]!.path).toBe("nodes[0].label");
    });

    it("rejects duplicate node ids", () => {
      const result = validate({
        type: "flowchart",
        nodes: [
          { id: "a", label: "A" },
          { id: "a", label: "B" },
        ],
        edges: [],
      });
      expect(result.valid).toBe(false);
      expect(result.errors!.some((e) => e.code === "DUPLICATE_ID")).toBe(true);
    });

    it("rejects edge referencing unknown node", () => {
      const result = validate({
        type: "flowchart",
        nodes: [{ id: "a", label: "A" }],
        edges: [{ from: "a", to: "missing" }],
      });
      expect(result.valid).toBe(false);
      expect(result.errors![0]!.code).toBe("UNKNOWN_REFERENCE");
    });

    it("rejects invalid direction", () => {
      const result = validate({
        type: "flowchart",
        direction: "DIAGONAL",
        nodes: [{ id: "a", label: "A" }],
        edges: [],
      });
      expect(result.valid).toBe(false);
      expect(result.errors![0]!.code).toBe("INVALID_ENUM");
    });
  });

  // ── Sequence ─────────────────────────────────────────────────────────

  describe("sequence", () => {
    it("validates minimal sequence", () => {
      const result = validate({
        type: "sequence",
        actors: [
          { id: "a", label: "Alice" },
          { id: "b", label: "Bob" },
        ],
        messages: [{ from: "a", to: "b", label: "Hello" }],
      });
      expect(result.valid).toBe(true);
    });

    it("rejects missing actors", () => {
      const result = validate({ type: "sequence", messages: [] });
      expect(result.valid).toBe(false);
    });

    it("rejects message referencing unknown actor", () => {
      const result = validate({
        type: "sequence",
        actors: [{ id: "a", label: "Alice" }],
        messages: [{ from: "a", to: "unknown" }],
      });
      expect(result.valid).toBe(false);
      expect(result.errors![0]!.code).toBe("UNKNOWN_REFERENCE");
    });
  });

  // ── State ────────────────────────────────────────────────────────────

  describe("state", () => {
    it("validates minimal state diagram", () => {
      const result = validate({
        type: "state",
        states: [
          { id: "idle", label: "Idle" },
          { id: "run", label: "Running" },
        ],
        transitions: [{ from: "idle", to: "run", label: "start" }],
      });
      expect(result.valid).toBe(true);
    });

    it("rejects duplicate state ids", () => {
      const result = validate({
        type: "state",
        states: [
          { id: "s", label: "A" },
          { id: "s", label: "B" },
        ],
        transitions: [],
      });
      expect(result.valid).toBe(false);
      expect(result.errors!.some((e) => e.code === "DUPLICATE_ID")).toBe(true);
    });

    it("rejects transition referencing unknown state", () => {
      const result = validate({
        type: "state",
        states: [{ id: "a", label: "A" }],
        transitions: [{ from: "a", to: "missing" }],
      });
      expect(result.valid).toBe(false);
    });
  });

  // ── Class ────────────────────────────────────────────────────────────

  describe("class", () => {
    it("validates minimal class diagram", () => {
      const result = validate({
        type: "class",
        classes: [{ id: "User", name: "User" }],
        relationships: [],
      });
      expect(result.valid).toBe(true);
    });

    it("rejects invalid relationship type", () => {
      const result = validate({
        type: "class",
        classes: [
          { id: "A", name: "A" },
          { id: "B", name: "B" },
        ],
        relationships: [{ from: "A", to: "B", type: "invalid" }],
      });
      expect(result.valid).toBe(false);
      expect(result.errors![0]!.code).toBe("INVALID_ENUM");
    });

    it("validates all valid relationship types", () => {
      const types = ["inheritance", "composition", "aggregation", "association", "dependency", "realization"];
      for (const type of types) {
        const result = validate({
          type: "class",
          classes: [
            { id: "A", name: "A" },
            { id: "B", name: "B" },
          ],
          relationships: [{ from: "A", to: "B", type }],
        });
        expect(result.valid).toBe(true);
      }
    });
  });

  // ── ER ───────────────────────────────────────────────────────────────

  describe("er", () => {
    it("validates minimal ER diagram", () => {
      const result = validate({
        type: "er",
        entities: [
          { id: "users", name: "Users", columns: [{ name: "id", type: "int" }] },
        ],
        relationships: [],
      });
      expect(result.valid).toBe(true);
    });

    it("rejects invalid cardinality", () => {
      const result = validate({
        type: "er",
        entities: [
          { id: "a", name: "A", columns: [] },
          { id: "b", name: "B", columns: [] },
        ],
        relationships: [{ from: "a", to: "b", cardinality: "many" }],
      });
      expect(result.valid).toBe(false);
      expect(result.errors![0]!.code).toBe("INVALID_ENUM");
    });

    it("validates all valid cardinalities", () => {
      for (const cardinality of ["1:1", "1:N", "N:1", "M:N"]) {
        const result = validate({
          type: "er",
          entities: [
            { id: "a", name: "A", columns: [] },
            { id: "b", name: "B", columns: [] },
          ],
          relationships: [{ from: "a", to: "b", cardinality }],
        });
        expect(result.valid).toBe(true);
      }
    });
  });

  // ── C4 ───────────────────────────────────────────────────────────────

  describe("c4", () => {
    it("validates minimal C4 diagram", () => {
      const result = validate({
        type: "c4",
        elements: [
          { id: "user", label: "User", type: "person" },
          { id: "sys", label: "System", type: "system" },
        ],
        relationships: [{ from: "user", to: "sys", label: "Uses" }],
      });
      expect(result.valid).toBe(true);
    });

    it("validates C4 with boundary and children", () => {
      const result = validate({
        type: "c4",
        elements: [
          { id: "user", label: "Customer", type: "person" },
          {
            id: "boundary", type: "boundary", label: "System",
            children: [
              { id: "web", label: "Web App" },
              { id: "api", label: "API" },
            ],
          },
        ],
        relationships: [{ from: "user", to: "web", label: "Visits" }],
      });
      expect(result.valid).toBe(true);
    });

    it("rejects element without type", () => {
      const result = validate({
        type: "c4",
        elements: [{ id: "sys", label: "System" }],
        relationships: [],
      });
      expect(result.valid).toBe(false);
      expect(result.errors!.some((e) => e.path?.includes("type"))).toBe(true);
    });

    it("rejects invalid element type", () => {
      const result = validate({
        type: "c4",
        elements: [{ id: "x", label: "X", type: "container" }],
        relationships: [],
      });
      expect(result.valid).toBe(false);
      expect(result.errors![0]!.code).toBe("INVALID_ENUM");
    });

    it("rejects relationship referencing unknown element", () => {
      const result = validate({
        type: "c4",
        elements: [{ id: "a", label: "A", type: "system" }],
        relationships: [{ from: "a", to: "missing" }],
      });
      expect(result.valid).toBe(false);
      expect(result.errors![0]!.code).toBe("UNKNOWN_REFERENCE");
    });
  });

  // ── Architecture ─────────────────────────────────────────────────────

  describe("architecture", () => {
    it("validates minimal architecture diagram", () => {
      const result = validate({
        type: "architecture",
        groups: [
          {
            id: "frontend",
            label: "Frontend",
            services: [{ id: "web", label: "Web App" }],
          },
        ],
        connections: [],
      });
      expect(result.valid).toBe(true);
    });

    it("rejects connection referencing unknown service", () => {
      const result = validate({
        type: "architecture",
        groups: [
          {
            id: "g",
            label: "Group",
            services: [{ id: "svc", label: "Service" }],
          },
        ],
        connections: [{ from: "svc", to: "missing" }],
      });
      expect(result.valid).toBe(false);
      expect(result.errors![0]!.code).toBe("UNKNOWN_REFERENCE");
    });
  });

  // ── Block ────────────────────────────────────────────────────────────

  describe("block", () => {
    it("validates minimal block diagram", () => {
      const result = validate({
        type: "block",
        blocks: [{ id: "a", label: "Block A" }],
        connections: [],
      });
      expect(result.valid).toBe(true);
    });

    it("validates blocks with children", () => {
      const result = validate({
        type: "block",
        blocks: [
          {
            id: "parent",
            label: "Parent",
            children: [{ id: "child", label: "Child" }],
          },
        ],
        connections: [{ from: "parent", to: "child" }],
      });
      expect(result.valid).toBe(true);
    });
  });

  // ── Requirement ──────────────────────────────────────────────────────

  describe("requirement", () => {
    it("validates minimal requirement diagram", () => {
      const result = validate({
        type: "requirement",
        requirements: [{ id: "r1", label: "Req 1" }],
        relationships: [],
      });
      expect(result.valid).toBe(true);
    });

    it("rejects invalid relationship type", () => {
      const result = validate({
        type: "requirement",
        requirements: [
          { id: "r1", label: "Req 1" },
          { id: "r2", label: "Req 2" },
        ],
        relationships: [{ from: "r1", to: "r2", type: "invalid" }],
      });
      expect(result.valid).toBe(false);
      expect(result.errors![0]!.code).toBe("INVALID_ENUM");
    });

    it("validates all valid relationship types", () => {
      const types = ["traces", "derives", "satisfies", "verifies", "refines", "contains"];
      for (const type of types) {
        const result = validate({
          type: "requirement",
          requirements: [
            { id: "a", label: "A" },
            { id: "b", label: "B" },
          ],
          relationships: [{ from: "a", to: "b", type }],
        });
        expect(result.valid).toBe(true);
      }
    });
  });

  // ── Timeline ─────────────────────────────────────────────────────────

  describe("timeline", () => {
    it("validates minimal timeline", () => {
      const result = validate({
        type: "timeline",
        events: [{ id: "e1", date: "2024-01-01", label: "Launch" }],
      });
      expect(result.valid).toBe(true);
    });

    it("rejects event without date", () => {
      const result = validate({
        type: "timeline",
        events: [{ id: "e1", label: "Launch" }],
      });
      expect(result.valid).toBe(false);
    });
  });

  // ── Mindmap ──────────────────────────────────────────────────────────

  describe("mindmap", () => {
    it("validates minimal mindmap", () => {
      const result = validate({
        type: "mindmap",
        root: {
          id: "root",
          label: "Central",
          children: [{ id: "a", label: "A" }],
        },
      });
      expect(result.valid).toBe(true);
    });

    it("validates deeply nested mindmap", () => {
      const result = validate({
        type: "mindmap",
        root: {
          id: "root",
          label: "Root",
          children: [
            {
              id: "a",
              label: "A",
              children: [{ id: "a1", label: "A1" }],
            },
          ],
        },
      });
      expect(result.valid).toBe(true);
    });

    it("rejects missing root", () => {
      const result = validate({ type: "mindmap" });
      expect(result.valid).toBe(false);
    });
  });

  // ── Git Graph ────────────────────────────────────────────────────────

  describe("gitgraph", () => {
    it("validates minimal git graph", () => {
      const result = validate({
        type: "gitgraph",
        commits: [{ id: "c1", message: "Initial commit", branch: "main" }],
      });
      expect(result.valid).toBe(true);
    });

    it("validates commits with parent references", () => {
      const result = validate({
        type: "gitgraph",
        commits: [
          { id: "c1", message: "Initial", branch: "main" },
          { id: "c2", message: "Feature", branch: "main", parent: "c1" },
        ],
      });
      expect(result.valid).toBe(true);
    });

    it("rejects commit referencing unknown parent", () => {
      const result = validate({
        type: "gitgraph",
        commits: [
          { id: "c1", message: "Commit", branch: "main", parent: "missing" },
        ],
      });
      expect(result.valid).toBe(false);
      expect(result.errors![0]!.code).toBe("UNKNOWN_REFERENCE");
    });
  });

  // ── Gantt ────────────────────────────────────────────────────────────

  describe("gantt", () => {
    it("validates minimal gantt chart", () => {
      const result = validate({
        type: "gantt",
        sections: [
          {
            label: "Phase 1",
            tasks: [
              { id: "t1", label: "Task 1", start: "2024-01-01", end: "2024-01-15" },
            ],
          },
        ],
      });
      expect(result.valid).toBe(true);
    });

    it("rejects task without start date", () => {
      const result = validate({
        type: "gantt",
        sections: [
          {
            label: "Phase 1",
            tasks: [{ id: "t1", label: "Task", end: "2024-01-15" }],
          },
        ],
      });
      expect(result.valid).toBe(false);
    });
  });

  // ── Sankey ───────────────────────────────────────────────────────────

  describe("sankey", () => {
    it("validates minimal sankey diagram", () => {
      const result = validate({
        type: "sankey",
        nodes: [
          { id: "a", label: "Source" },
          { id: "b", label: "Target" },
        ],
        flows: [{ from: "a", to: "b", value: 100 }],
      });
      expect(result.valid).toBe(true);
    });

    it("rejects flow without numeric value", () => {
      const result = validate({
        type: "sankey",
        nodes: [
          { id: "a", label: "A" },
          { id: "b", label: "B" },
        ],
        flows: [{ from: "a", to: "b", value: "lots" }],
      });
      expect(result.valid).toBe(false);
    });

    it("rejects flow referencing unknown node", () => {
      const result = validate({
        type: "sankey",
        nodes: [{ id: "a", label: "A" }],
        flows: [{ from: "a", to: "missing", value: 50 }],
      });
      expect(result.valid).toBe(false);
      expect(result.errors![0]!.code).toBe("UNKNOWN_REFERENCE");
    });
  });

  // ── Kanban ───────────────────────────────────────────────────────────

  describe("kanban", () => {
    it("validates minimal kanban board", () => {
      const result = validate({
        type: "kanban",
        columns: [
          {
            id: "todo",
            label: "To Do",
            cards: [{ id: "c1", label: "Task 1" }],
          },
        ],
      });
      expect(result.valid).toBe(true);
    });

    it("rejects column without cards array", () => {
      const result = validate({
        type: "kanban",
        columns: [{ id: "todo", label: "To Do" }],
      });
      expect(result.valid).toBe(false);
    });
  });

  // ── Quadrant ─────────────────────────────────────────────────────────

  describe("quadrant", () => {
    it("validates minimal quadrant chart", () => {
      const result = validate({
        type: "quadrant",
        items: [{ id: "a", label: "Feature", x: 0.5, y: 0.5 }],
      });
      expect(result.valid).toBe(true);
    });

    it("rejects item without x coordinate", () => {
      const result = validate({
        type: "quadrant",
        items: [{ id: "a", label: "Feature", y: 0.5 }],
      });
      expect(result.valid).toBe(false);
    });

    it("rejects item without y coordinate", () => {
      const result = validate({
        type: "quadrant",
        items: [{ id: "a", label: "Feature", x: 0.5 }],
      });
      expect(result.valid).toBe(false);
    });

    it("rejects non-numeric coordinates", () => {
      const result = validate({
        type: "quadrant",
        items: [{ id: "a", label: "Feature", x: "high", y: "low" }],
      });
      expect(result.valid).toBe(false);
    });
  });

  // ── Pie ──────────────────────────────────────────────────────────────

  describe("pie", () => {
    it("validates minimal pie chart", () => {
      const result = validate({
        type: "pie",
        segments: [
          { label: "A", value: 60 },
          { label: "B", value: 40 },
        ],
      });
      expect(result.valid).toBe(true);
    });

    it("rejects segment without numeric value", () => {
      const result = validate({
        type: "pie",
        segments: [{ label: "A", value: "large" }],
      });
      expect(result.valid).toBe(false);
    });
  });

  // ── Packet ───────────────────────────────────────────────────────────

  describe("packet", () => {
    it("validates minimal packet diagram", () => {
      const result = validate({
        type: "packet",
        rows: [
          {
            fields: [
              { label: "Source Port", bits: 16 },
              { label: "Dest Port", bits: 16 },
            ],
          },
        ],
      });
      expect(result.valid).toBe(true);
    });

    it("rejects field without bits", () => {
      const result = validate({
        type: "packet",
        rows: [{ fields: [{ label: "Port" }] }],
      });
      expect(result.valid).toBe(false);
    });
  });

  // ── Venn ─────────────────────────────────────────────────────────────

  describe("venn", () => {
    it("validates minimal venn diagram", () => {
      const result = validate({
        type: "venn",
        sets: [
          { id: "a", label: "Set A", value: 100 },
          { id: "b", label: "Set B", value: 80 },
        ],
        intersections: [{ sets: ["a", "b"], value: 30 }],
      });
      expect(result.valid).toBe(true);
    });

    it("rejects intersection referencing unknown set", () => {
      const result = validate({
        type: "venn",
        sets: [{ id: "a", label: "A", value: 100 }],
        intersections: [{ sets: ["a", "missing"], value: 30 }],
      });
      expect(result.valid).toBe(false);
      expect(result.errors![0]!.code).toBe("UNKNOWN_REFERENCE");
    });

    it("rejects duplicate set ids", () => {
      const result = validate({
        type: "venn",
        sets: [
          { id: "a", label: "A", value: 100 },
          { id: "a", label: "B", value: 80 },
        ],
      });
      expect(result.valid).toBe(false);
      expect(result.errors!.some((e) => e.code === "DUPLICATE_ID")).toBe(true);
    });
  });

  // ── Radar ────────────────────────────────────────────────────────────

  describe("radar", () => {
    it("validates minimal radar chart", () => {
      const result = validate({
        type: "radar",
        axes: ["Speed", "Power", "Range"],
        series: [{ label: "Model A", values: [8, 6, 7] }],
      });
      expect(result.valid).toBe(true);
    });

    it("rejects mismatched values length", () => {
      const result = validate({
        type: "radar",
        axes: ["A", "B", "C"],
        series: [{ label: "X", values: [1, 2] }],
      });
      expect(result.valid).toBe(false);
      expect(result.errors![0]!.code).toBe("INVALID_FIELD");
    });
  });

  // ── XY Chart ─────────────────────────────────────────────────────────

  describe("xychart", () => {
    it("validates minimal xy chart", () => {
      const result = validate({
        type: "xychart",
        xAxis: ["Jan", "Feb", "Mar"],
        series: [{ label: "Revenue", type: "bar", data: [100, 200, 300] }],
      });
      expect(result.valid).toBe(true);
    });

    it("rejects invalid series type", () => {
      const result = validate({
        type: "xychart",
        xAxis: ["A"],
        series: [{ label: "X", type: "scatter", data: [1] }],
      });
      expect(result.valid).toBe(false);
      expect(result.errors![0]!.code).toBe("INVALID_ENUM");
    });
  });

  // ── Treemap ──────────────────────────────────────────────────────────

  describe("treemap", () => {
    it("validates minimal treemap", () => {
      const result = validate({
        type: "treemap",
        root: {
          label: "Root",
          children: [{ label: "Child", value: 100 }],
        },
      });
      expect(result.valid).toBe(true);
    });

    it("rejects missing root", () => {
      const result = validate({ type: "treemap" });
      expect(result.valid).toBe(false);
    });
  });
});
