export interface FlowchartSchema {
  type: "flowchart";
  direction?: "TB" | "BT" | "LR" | "RL";
  edgeType?: "bezier" | "smoothstep" | "step" | "straight";
  interactive?: boolean;
  nodes: Array<{
    id: string;
    label: string;
    shape?: "rounded" | "rectangle" | "diamond";
    variant?: "default" | "primary" | "success" | "warning" | "danger";
  }>;
  edges: Array<{
    from: string;
    to: string;
    label?: string;
    dashed?: boolean;
    animated?: boolean;
    edgeType?: "bezier" | "smoothstep" | "step" | "straight";
    bidirectional?: boolean;
    value?: string | number;
  }>;
}

export interface SequenceSchema {
  type: "sequence";
  interactive?: boolean;
  actors: Array<{
    id: string;
    label: string;
  }>;
  messages: Array<{
    from: string;
    to: string;
    label?: string;
    reply?: boolean;
  }>;
}

export interface StateSchema {
  type: "state";
  direction?: "TB" | "BT" | "LR" | "RL";
  edgeType?: "bezier" | "smoothstep" | "step" | "straight";
  interactive?: boolean;
  states: Array<{
    id: string;
    label: string;
    variant?: "default" | "primary" | "success" | "warning" | "danger";
    initial?: boolean;
    final?: boolean;
  }>;
  transitions: Array<{
    from: string;
    to: string;
    label?: string;
    guard?: string;
    edgeType?: "bezier" | "smoothstep" | "step" | "straight";
    bidirectional?: boolean;
  }>;
}

export interface ClassSchema {
  type: "class";
  direction?: "TB" | "BT" | "LR" | "RL";
  edgeType?: "bezier" | "smoothstep" | "step" | "straight";
  interactive?: boolean;
  classes: Array<{
    id: string;
    name: string;
    attributes?: string[];
    methods?: string[];
  }>;
  relationships: Array<{
    from: string;
    to: string;
    type:
      | "inheritance"
      | "composition"
      | "aggregation"
      | "association"
      | "dependency"
      | "realization";
    label?: string;
    edgeType?: "bezier" | "smoothstep" | "step" | "straight";
    bidirectional?: boolean;
  }>;
}

export interface ERSchema {
  type: "er";
  direction?: "TB" | "BT" | "LR" | "RL";
  edgeType?: "bezier" | "smoothstep" | "step" | "straight";
  interactive?: boolean;
  entities: Array<{
    id: string;
    name: string;
    columns: Array<{
      name: string;
      type: string;
      pk?: boolean;
      fk?: boolean;
      unique?: boolean;
    }>;
  }>;
  relationships: Array<{
    from: string;
    to: string;
    cardinality: "1:1" | "1:N" | "N:1" | "M:N";
    label?: string;
    edgeType?: "bezier" | "smoothstep" | "step" | "straight";
    bidirectional?: boolean;
  }>;
}

export interface TimelineSchema {
  type: "timeline";
  events: Array<{
    id: string;
    date: string;
    label: string;
    description?: string;
    variant?: "default" | "primary" | "success" | "warning" | "danger";
  }>;
}

export interface KanbanSchema {
  type: "kanban";
  columns: Array<{
    id: string;
    label: string;
    cards: Array<{
      id: string;
      label: string;
      tag?: string;
    }>;
  }>;
}

export interface QuadrantSchema {
  type: "quadrant";
  title?: string;
  xLabel?: string;
  yLabel?: string;
  quadrants?: [string, string, string, string];
  items: Array<{
    id: string;
    label: string;
    x: number;
    y: number;
  }>;
}

export interface PieSchema {
  type: "pie";
  title?: string;
  segments: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
}

export interface C4Schema {
  type: "c4";
  direction?: "TB" | "BT" | "LR" | "RL";
  edgeType?: "bezier" | "smoothstep" | "step" | "straight";
  interactive?: boolean;
  elements: Array<{
    id: string;
    label: string;
    type: "person" | "system" | "boundary";
    description?: string;
    direction?: "TB" | "BT" | "LR" | "RL";
    children?: Array<{
      id: string;
      label: string;
      type: "person" | "system";
      description?: string;
    }>;
  }>;
  relationships: Array<{
    from: string;
    to: string;
    label?: string;
    edgeType?: "bezier" | "smoothstep" | "step" | "straight";
    bidirectional?: boolean;
  }>;
}

export interface ArchitectureSchema {
  type: "architecture";
  direction?: "TB" | "BT" | "LR" | "RL";
  edgeType?: "bezier" | "smoothstep" | "step" | "straight";
  interactive?: boolean;
  groups: Array<{
    id: string;
    label: string;
    icon?: string;
    direction?: "TB" | "BT" | "LR" | "RL";
    services: Array<{
      id: string;
      label: string;
      icon?: string;
    }>;
  }>;
  services?: Array<{
    id: string;
    label: string;
    icon?: string;
  }>;
  connections: Array<{
    from: string;
    to: string;
    label?: string;
    edgeType?: "bezier" | "smoothstep" | "step" | "straight";
    bidirectional?: boolean;
  }>;
}

export interface BlockSchema {
  type: "block";
  direction?: "TB" | "BT" | "LR" | "RL";
  edgeType?: "bezier" | "smoothstep" | "step" | "straight";
  interactive?: boolean;
  blocks: Array<{
    id: string;
    label: string;
    direction?: "TB" | "BT" | "LR" | "RL";
    children?: Array<{
      id: string;
      label: string;
    }>;
  }>;
  connections: Array<{
    from: string;
    to: string;
    label?: string;
    edgeType?: "bezier" | "smoothstep" | "step" | "straight";
    bidirectional?: boolean;
  }>;
}

export interface RequirementSchema {
  type: "requirement";
  direction?: "TB" | "BT" | "LR" | "RL";
  edgeType?: "bezier" | "smoothstep" | "step" | "straight";
  interactive?: boolean;
  requirements: Array<{
    id: string;
    label: string;
    kind?: string;
    risk?: string;
    status?: string;
  }>;
  relationships: Array<{
    from: string;
    to: string;
    type:
      | "traces"
      | "derives"
      | "satisfies"
      | "verifies"
      | "refines"
      | "contains";
    edgeType?: "bezier" | "smoothstep" | "step" | "straight";
    bidirectional?: boolean;
  }>;
}

export interface MindmapNode {
  id: string;
  label: string;
  children?: MindmapNode[];
}

export interface MindmapSchema {
  type: "mindmap";
  root: {
    id: string;
    label: string;
    children?: MindmapNode[];
  };
}

export interface GitGraphSchema {
  type: "gitgraph";
  commits: Array<{
    id: string;
    message: string;
    branch: string;
    parent?: string;
    parents?: string[];
    merge?: boolean;
  }>;
}

export interface GanttSchema {
  type: "gantt";
  title?: string;
  sections: Array<{
    label: string;
    tasks: Array<{
      id: string;
      label: string;
      start: string;
      end: string;
      milestone?: boolean;
    }>;
  }>;
}

export interface SankeySchema {
  type: "sankey";
  nodes: Array<{
    id: string;
    label: string;
  }>;
  flows: Array<{
    from: string;
    to: string;
    value: number;
  }>;
}

export interface PacketSchema {
  type: "packet";
  title?: string;
  wordSize?: number;
  rows: Array<{
    fields: Array<{
      label: string;
      bits: number;
    }>;
  }>;
}

export interface UserJourneySchema {
  type: "userjourney";
  title?: string;
  sections: Array<{
    label: string;
    tasks: Array<{
      id: string;
      label: string;
      score: number;
      actors?: string[];
    }>;
  }>;
}

export interface XYChartSchema {
  type: "xychart";
  title?: string;
  xLabel?: string;
  yLabel?: string;
  xAxis: string[];
  series: Array<{
    label: string;
    type: "line" | "bar";
    data: number[];
    color?: string;
  }>;
}

export interface RadarSchema {
  type: "radar";
  title?: string;
  axes: string[];
  series: Array<{
    label: string;
    values: number[];
    color?: string;
  }>;
  max?: number;
}

export interface TreemapSchema {
  type: "treemap";
  title?: string;
  root: {
    label: string;
    children: TreemapNode[];
  };
}

export interface TreemapNode {
  label: string;
  value?: number;
  color?: string;
  children?: TreemapNode[];
}

export interface VennSchema {
  type: "venn";
  title?: string;
  sets: Array<{
    id: string;
    label: string;
    value: number;
    color?: string;
  }>;
  intersections?: Array<{
    sets: string[];
    label?: string;
    value: number;
  }>;
}

export type SirenSchema =
  | FlowchartSchema
  | SequenceSchema
  | StateSchema
  | ClassSchema
  | ERSchema
  | TimelineSchema
  | KanbanSchema
  | QuadrantSchema
  | PieSchema
  | C4Schema
  | ArchitectureSchema
  | BlockSchema
  | RequirementSchema
  | MindmapSchema
  | GitGraphSchema
  | GanttSchema
  | SankeySchema
  | PacketSchema
  | UserJourneySchema
  | XYChartSchema
  | RadarSchema
  | TreemapSchema
  | VennSchema;

/** Current schema version. Bump on breaking changes to the document format. */
export const SCHEMA_VERSION = "0.1.0";

export type ValidationErrorCode =
  | "INVALID_INPUT"
  | "MISSING_FIELD"
  | "INVALID_FIELD"
  | "UNKNOWN_TYPE"
  | "DUPLICATE_ID"
  | "UNKNOWN_REFERENCE"
  | "INVALID_ENUM";

export interface ValidationError {
  /** Machine-readable error code */
  code: ValidationErrorCode;
  /** Human-readable error message */
  message: string;
  /** JSON-pointer-style path to the error location (e.g. "edges[0].from") */
  path?: string;
}

export interface ValidationResult {
  valid: boolean;
  data?: SirenSchema;
  errors?: ValidationError[];
}
