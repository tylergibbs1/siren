export type LayoutDirection = "TB" | "BT" | "LR" | "RL";

export interface SirenNode {
  id: string;
  width: number;
  height: number;
  /** Group/parent node ID */
  parentId?: string;
  /** Layout options specific to this node */
  layoutOptions?: Record<string, string | number>;
}

export interface SirenEdge {
  id: string;
  source: string;
  target: string;
}

export interface SirenGraph {
  nodes: SirenNode[];
  edges: SirenEdge[];
  direction?: LayoutDirection;
  algorithm?: "layered" | "mrtree" | "force" | "box";
  spacing?: {
    node?: number;
    layer?: number;
    edge?: number;
    edgeNode?: number;
  };
}

export interface LayoutResult {
  nodes: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  edges: Array<{
    id: string;
    sections?: Array<{
      startPoint: { x: number; y: number };
      endPoint: { x: number; y: number };
      bendPoints?: Array<{ x: number; y: number }>;
    }>;
  }>;
}
