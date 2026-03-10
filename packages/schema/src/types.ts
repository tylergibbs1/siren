export interface FlowchartSchema {
  type: "flowchart";
  direction?: "TB" | "BT" | "LR" | "RL";
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
  }>;
}

export interface SequenceSchema {
  type: "sequence";
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
  }>;
}

export interface ClassSchema {
  type: "class";
  direction?: "TB" | "BT" | "LR" | "RL";
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
  }>;
}

export interface ERSchema {
  type: "er";
  direction?: "TB" | "BT" | "LR" | "RL";
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
  elements: Array<{
    id: string;
    label: string;
    type: "person" | "system" | "boundary";
    description?: string;
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
  }>;
}

export interface ArchitectureSchema {
  type: "architecture";
  direction?: "TB" | "BT" | "LR" | "RL";
  groups: Array<{
    id: string;
    label: string;
    icon?: string;
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
  }>;
}

export interface BlockSchema {
  type: "block";
  direction?: "TB" | "BT" | "LR" | "RL";
  blocks: Array<{
    id: string;
    label: string;
    children?: Array<{
      id: string;
      label: string;
    }>;
  }>;
  connections: Array<{
    from: string;
    to: string;
    label?: string;
  }>;
}

export interface RequirementSchema {
  type: "requirement";
  direction?: "TB" | "BT" | "LR" | "RL";
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
  | PacketSchema;

export interface ValidationResult {
  valid: boolean;
  data?: SirenSchema;
  errors?: string[];
}
