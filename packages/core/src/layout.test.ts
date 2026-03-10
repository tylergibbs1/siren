import { describe, it, expect } from "vitest";
import { layoutGraph } from "./layout";

describe("layoutGraph", () => {
  it("positions a single node", async () => {
    const result = await layoutGraph({
      nodes: [{ id: "a", width: 100, height: 40 }],
      edges: [],
    });

    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0]!.id).toBe("a");
    expect(typeof result.nodes[0]!.x).toBe("number");
    expect(typeof result.nodes[0]!.y).toBe("number");
  });

  it("positions two connected nodes", async () => {
    const result = await layoutGraph({
      nodes: [
        { id: "a", width: 100, height: 40 },
        { id: "b", width: 100, height: 40 },
      ],
      edges: [{ id: "e1", source: "a", target: "b" }],
      direction: "TB",
    });

    expect(result.nodes).toHaveLength(2);
    const nodeA = result.nodes.find((n) => n.id === "a")!;
    const nodeB = result.nodes.find((n) => n.id === "b")!;
    // In TB direction, A should be above B
    expect(nodeA.y).toBeLessThan(nodeB.y);
  });

  it("respects LR direction", async () => {
    const result = await layoutGraph({
      nodes: [
        { id: "a", width: 100, height: 40 },
        { id: "b", width: 100, height: 40 },
      ],
      edges: [{ id: "e1", source: "a", target: "b" }],
      direction: "LR",
    });

    const nodeA = result.nodes.find((n) => n.id === "a")!;
    const nodeB = result.nodes.find((n) => n.id === "b")!;
    // In LR direction, A should be left of B
    expect(nodeA.x).toBeLessThan(nodeB.x);
  });

  it("handles custom spacing", async () => {
    const tight = await layoutGraph({
      nodes: [
        { id: "a", width: 100, height: 40 },
        { id: "b", width: 100, height: 40 },
      ],
      edges: [{ id: "e1", source: "a", target: "b" }],
      direction: "TB",
      spacing: { node: 10, layer: 20 },
    });

    const wide = await layoutGraph({
      nodes: [
        { id: "a", width: 100, height: 40 },
        { id: "b", width: 100, height: 40 },
      ],
      edges: [{ id: "e1", source: "a", target: "b" }],
      direction: "TB",
      spacing: { node: 100, layer: 200 },
    });

    const tightA = tight.nodes.find((n) => n.id === "a")!;
    const tightB = tight.nodes.find((n) => n.id === "b")!;
    const wideA = wide.nodes.find((n) => n.id === "a")!;
    const wideB = wide.nodes.find((n) => n.id === "b")!;

    const tightGap = tightB.y - tightA.y;
    const wideGap = wideB.y - wideA.y;
    expect(wideGap).toBeGreaterThan(tightGap);
  });

  it("returns edge layout data", async () => {
    const result = await layoutGraph({
      nodes: [
        { id: "a", width: 100, height: 40 },
        { id: "b", width: 100, height: 40 },
      ],
      edges: [{ id: "e1", source: "a", target: "b" }],
    });

    expect(result.edges).toHaveLength(1);
    expect(result.edges[0]!.id).toBe("e1");
    // ELK should provide sections with start/end points
    expect(result.edges[0]!.sections).toBeDefined();
    expect(result.edges[0]!.sections!.length).toBeGreaterThan(0);
  });

  it("handles compound/grouped layout", async () => {
    const result = await layoutGraph({
      nodes: [
        { id: "group1", width: 0, height: 0 },
        { id: "a", width: 100, height: 40, parentId: "group1" },
        { id: "b", width: 100, height: 40, parentId: "group1" },
        { id: "c", width: 100, height: 40 },
      ],
      edges: [
        { id: "e1", source: "a", target: "b" },
        { id: "e2", source: "b", target: "c" },
      ],
    });

    // All nodes should be positioned
    expect(result.nodes.length).toBeGreaterThanOrEqual(3);
    for (const node of result.nodes) {
      expect(typeof node.x).toBe("number");
      expect(typeof node.y).toBe("number");
    }
  });

  it("accepts custom layoutOptions", async () => {
    // Should not throw
    const result = await layoutGraph({
      nodes: [
        { id: "a", width: 100, height: 40 },
        { id: "b", width: 100, height: 40 },
      ],
      edges: [{ id: "e1", source: "a", target: "b" }],
      layoutOptions: {
        "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      },
    });

    expect(result.nodes).toHaveLength(2);
  });

  it("supports mrtree algorithm", async () => {
    const result = await layoutGraph({
      nodes: [
        { id: "a", width: 100, height: 40 },
        { id: "b", width: 100, height: 40 },
        { id: "c", width: 100, height: 40 },
      ],
      edges: [
        { id: "e1", source: "a", target: "b" },
        { id: "e2", source: "a", target: "c" },
      ],
      algorithm: "mrtree",
    });

    expect(result.nodes).toHaveLength(3);
  });

  it("handles a linear chain of nodes", async () => {
    const nodes = Array.from({ length: 5 }, (_, i) => ({
      id: `n${i}`,
      width: 80,
      height: 30,
    }));
    const edges = Array.from({ length: 4 }, (_, i) => ({
      id: `e${i}`,
      source: `n${i}`,
      target: `n${i + 1}`,
    }));

    const result = await layoutGraph({ nodes, edges, direction: "TB" });
    expect(result.nodes).toHaveLength(5);

    // Verify ordering: each node should be below the previous
    for (let i = 1; i < result.nodes.length; i++) {
      const prev = result.nodes.find((n) => n.id === `n${i - 1}`)!;
      const curr = result.nodes.find((n) => n.id === `n${i}`)!;
      expect(curr.y).toBeGreaterThanOrEqual(prev.y);
    }
  });
});
