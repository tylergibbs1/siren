export const flowchartJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["type", "nodes", "edges"],
  properties: {
    type: { const: "flowchart" },
    direction: { enum: ["TB", "BT", "LR", "RL"] },
    edgeType: { type: "string", enum: ["bezier", "smoothstep", "step", "straight"] },
    interactive: { type: "boolean" },
    nodes: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "label"],
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          shape: { enum: ["rounded", "rectangle", "diamond"] },
          variant: {
            enum: ["default", "primary", "success", "warning", "danger"],
          },
        },
      },
    },
    edges: {
      type: "array",
      items: {
        type: "object",
        required: ["from", "to"],
        properties: {
          from: { type: "string" },
          to: { type: "string" },
          label: { type: "string" },
          dashed: { type: "boolean" },
          animated: { type: "boolean" },
          edgeType: { type: "string", enum: ["bezier", "smoothstep", "step", "straight"] },
          bidirectional: { type: "boolean" },
          value: { oneOf: [{ type: "string" }, { type: "number" }] },
        },
      },
    },
  },
} as const;

export const sequenceJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["type", "actors", "messages"],
  properties: {
    type: { const: "sequence" },
    interactive: { type: "boolean" },
    actors: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "label"],
        properties: {
          id: { type: "string" },
          label: { type: "string" },
        },
      },
    },
    messages: {
      type: "array",
      items: {
        type: "object",
        required: ["from", "to"],
        properties: {
          from: { type: "string" },
          to: { type: "string" },
          label: { type: "string" },
          reply: { type: "boolean" },
        },
      },
    },
  },
} as const;

export const stateJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["type", "states", "transitions"],
  properties: {
    type: { const: "state" },
    direction: { enum: ["TB", "BT", "LR", "RL"] },
    edgeType: { type: "string", enum: ["bezier", "smoothstep", "step", "straight"] },
    interactive: { type: "boolean" },
    states: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "label"],
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          variant: {
            enum: ["default", "primary", "success", "warning", "danger"],
          },
          initial: { type: "boolean" },
          final: { type: "boolean" },
        },
      },
    },
    transitions: {
      type: "array",
      items: {
        type: "object",
        required: ["from", "to"],
        properties: {
          from: { type: "string" },
          to: { type: "string" },
          label: { type: "string" },
          guard: { type: "string" },
          edgeType: { type: "string", enum: ["bezier", "smoothstep", "step", "straight"] },
          bidirectional: { type: "boolean" },
        },
      },
    },
  },
} as const;

export const classJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["type", "classes", "relationships"],
  properties: {
    type: { const: "class" },
    direction: { enum: ["TB", "BT", "LR", "RL"] },
    edgeType: { type: "string", enum: ["bezier", "smoothstep", "step", "straight"] },
    interactive: { type: "boolean" },
    classes: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "name"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          attributes: { type: "array", items: { type: "string" } },
          methods: { type: "array", items: { type: "string" } },
        },
      },
    },
    relationships: {
      type: "array",
      items: {
        type: "object",
        required: ["from", "to", "type"],
        properties: {
          from: { type: "string" },
          to: { type: "string" },
          type: {
            enum: [
              "inheritance",
              "composition",
              "aggregation",
              "association",
              "dependency",
              "realization",
            ],
          },
          label: { type: "string" },
          edgeType: { type: "string", enum: ["bezier", "smoothstep", "step", "straight"] },
          bidirectional: { type: "boolean" },
        },
      },
    },
  },
} as const;

export const erJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["type", "entities", "relationships"],
  properties: {
    type: { const: "er" },
    direction: { enum: ["TB", "BT", "LR", "RL"] },
    edgeType: { type: "string", enum: ["bezier", "smoothstep", "step", "straight"] },
    interactive: { type: "boolean" },
    entities: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "name", "columns"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          columns: {
            type: "array",
            items: {
              type: "object",
              required: ["name", "type"],
              properties: {
                name: { type: "string" },
                type: { type: "string" },
                pk: { type: "boolean" },
                fk: { type: "boolean" },
                unique: { type: "boolean" },
              },
            },
          },
        },
      },
    },
    relationships: {
      type: "array",
      items: {
        type: "object",
        required: ["from", "to", "cardinality"],
        properties: {
          from: { type: "string" },
          to: { type: "string" },
          cardinality: { enum: ["1:1", "1:N", "N:1", "M:N"] },
          label: { type: "string" },
          edgeType: { type: "string", enum: ["bezier", "smoothstep", "step", "straight"] },
          bidirectional: { type: "boolean" },
        },
      },
    },
  },
} as const;

export const timelineJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["type", "events"],
  properties: {
    type: { const: "timeline" },
    events: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "date", "label"],
        properties: {
          id: { type: "string" },
          date: { type: "string" },
          label: { type: "string" },
          description: { type: "string" },
          variant: {
            enum: ["default", "primary", "success", "warning", "danger"],
          },
        },
      },
    },
  },
} as const;

export const kanbanJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["type", "columns"],
  properties: {
    type: { const: "kanban" },
    columns: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "label", "cards"],
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          cards: {
            type: "array",
            items: {
              type: "object",
              required: ["id", "label"],
              properties: {
                id: { type: "string" },
                label: { type: "string" },
                tag: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
} as const;

export const quadrantJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["type", "items"],
  properties: {
    type: { const: "quadrant" },
    title: { type: "string" },
    xLabel: { type: "string" },
    yLabel: { type: "string" },
    quadrants: {
      type: "array",
      items: { type: "string" },
      minItems: 4,
      maxItems: 4,
    },
    items: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "label", "x", "y"],
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          x: { type: "number" },
          y: { type: "number" },
        },
      },
    },
  },
} as const;

export const pieJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["type", "segments"],
  properties: {
    type: { const: "pie" },
    title: { type: "string" },
    segments: {
      type: "array",
      items: {
        type: "object",
        required: ["label", "value"],
        properties: {
          label: { type: "string" },
          value: { type: "number" },
          color: { type: "string" },
        },
      },
    },
  },
} as const;

export const c4JsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["type", "elements", "relationships"],
  properties: {
    type: { const: "c4" },
    direction: { enum: ["TB", "BT", "LR", "RL"] },
    edgeType: { type: "string", enum: ["bezier", "smoothstep", "step", "straight"] },
    interactive: { type: "boolean" },
    elements: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "label", "type"],
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          type: { enum: ["person", "system", "boundary"] },
          description: { type: "string" },
          children: {
            type: "array",
            items: {
              type: "object",
              required: ["id", "label", "type"],
              properties: {
                id: { type: "string" },
                label: { type: "string" },
                type: { enum: ["person", "system"] },
                description: { type: "string" },
              },
            },
          },
        },
      },
    },
    relationships: {
      type: "array",
      items: {
        type: "object",
        required: ["from", "to"],
        properties: {
          from: { type: "string" },
          to: { type: "string" },
          label: { type: "string" },
          edgeType: { type: "string", enum: ["bezier", "smoothstep", "step", "straight"] },
          bidirectional: { type: "boolean" },
        },
      },
    },
  },
} as const;

export const architectureJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["type", "groups", "connections"],
  properties: {
    type: { const: "architecture" },
    direction: { enum: ["TB", "BT", "LR", "RL"] },
    edgeType: { type: "string", enum: ["bezier", "smoothstep", "step", "straight"] },
    interactive: { type: "boolean" },
    groups: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "label", "services"],
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          icon: { type: "string" },
          services: {
            type: "array",
            items: {
              type: "object",
              required: ["id", "label"],
              properties: {
                id: { type: "string" },
                label: { type: "string" },
                icon: { type: "string" },
              },
            },
          },
        },
      },
    },
    services: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "label"],
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          icon: { type: "string" },
        },
      },
    },
    connections: {
      type: "array",
      items: {
        type: "object",
        required: ["from", "to"],
        properties: {
          from: { type: "string" },
          to: { type: "string" },
          label: { type: "string" },
          edgeType: { type: "string", enum: ["bezier", "smoothstep", "step", "straight"] },
          bidirectional: { type: "boolean" },
        },
      },
    },
  },
} as const;

export const blockJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["type", "blocks", "connections"],
  properties: {
    type: { const: "block" },
    direction: { enum: ["TB", "BT", "LR", "RL"] },
    edgeType: { type: "string", enum: ["bezier", "smoothstep", "step", "straight"] },
    interactive: { type: "boolean" },
    blocks: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "label"],
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          children: {
            type: "array",
            items: {
              type: "object",
              required: ["id", "label"],
              properties: {
                id: { type: "string" },
                label: { type: "string" },
              },
            },
          },
        },
      },
    },
    connections: {
      type: "array",
      items: {
        type: "object",
        required: ["from", "to"],
        properties: {
          from: { type: "string" },
          to: { type: "string" },
          label: { type: "string" },
          edgeType: { type: "string", enum: ["bezier", "smoothstep", "step", "straight"] },
          bidirectional: { type: "boolean" },
        },
      },
    },
  },
} as const;

export const requirementJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["type", "requirements", "relationships"],
  properties: {
    type: { const: "requirement" },
    direction: { enum: ["TB", "BT", "LR", "RL"] },
    edgeType: { type: "string", enum: ["bezier", "smoothstep", "step", "straight"] },
    interactive: { type: "boolean" },
    requirements: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "label"],
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          kind: { type: "string" },
          risk: { type: "string" },
          status: { type: "string" },
        },
      },
    },
    relationships: {
      type: "array",
      items: {
        type: "object",
        required: ["from", "to", "type"],
        properties: {
          from: { type: "string" },
          to: { type: "string" },
          type: {
            enum: [
              "traces",
              "derives",
              "satisfies",
              "verifies",
              "refines",
              "contains",
            ],
          },
          edgeType: { type: "string", enum: ["bezier", "smoothstep", "step", "straight"] },
          bidirectional: { type: "boolean" },
        },
      },
    },
  },
} as const;

export const mindmapJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["type", "root"],
  properties: {
    type: { const: "mindmap" },
    root: {
      $ref: "#/$defs/mindmapNode",
    },
  },
  $defs: {
    mindmapNode: {
      type: "object",
      required: ["id", "label"],
      properties: {
        id: { type: "string" },
        label: { type: "string" },
        children: {
          type: "array",
          items: { $ref: "#/$defs/mindmapNode" },
        },
      },
    },
  },
} as const;

export const gitgraphJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["type", "commits"],
  properties: {
    type: { const: "gitgraph" },
    commits: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "message", "branch"],
        properties: {
          id: { type: "string" },
          message: { type: "string" },
          branch: { type: "string" },
          parent: { type: "string" },
          parents: { type: "array", items: { type: "string" } },
          merge: { type: "boolean" },
        },
      },
    },
  },
} as const;

export const ganttJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["type", "sections"],
  properties: {
    type: { const: "gantt" },
    title: { type: "string" },
    sections: {
      type: "array",
      items: {
        type: "object",
        required: ["label", "tasks"],
        properties: {
          label: { type: "string" },
          tasks: {
            type: "array",
            items: {
              type: "object",
              required: ["id", "label", "start", "end"],
              properties: {
                id: { type: "string" },
                label: { type: "string" },
                start: { type: "string" },
                end: { type: "string" },
                milestone: { type: "boolean" },
              },
            },
          },
        },
      },
    },
  },
} as const;

export const sankeyJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["type", "nodes", "flows"],
  properties: {
    type: { const: "sankey" },
    nodes: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "label"],
        properties: {
          id: { type: "string" },
          label: { type: "string" },
        },
      },
    },
    flows: {
      type: "array",
      items: {
        type: "object",
        required: ["from", "to", "value"],
        properties: {
          from: { type: "string" },
          to: { type: "string" },
          value: { type: "number" },
        },
      },
    },
  },
} as const;

export const packetJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["type", "rows"],
  properties: {
    type: { const: "packet" },
    title: { type: "string" },
    wordSize: { type: "number" },
    rows: {
      type: "array",
      items: {
        type: "object",
        required: ["fields"],
        properties: {
          fields: {
            type: "array",
            items: {
              type: "object",
              required: ["label", "bits"],
              properties: {
                label: { type: "string" },
                bits: { type: "number" },
              },
            },
          },
        },
      },
    },
  },
} as const;

export const userjourneyJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["type", "sections"],
  properties: {
    type: { const: "userjourney" },
    title: { type: "string" },
    sections: {
      type: "array",
      items: {
        type: "object",
        required: ["label", "tasks"],
        properties: {
          label: { type: "string" },
          tasks: {
            type: "array",
            items: {
              type: "object",
              required: ["id", "label", "score"],
              properties: {
                id: { type: "string" },
                label: { type: "string" },
                score: { type: "number", minimum: 1, maximum: 5 },
                actors: { type: "array", items: { type: "string" } },
              },
            },
          },
        },
      },
    },
  },
} as const;

export const xychartJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["type", "xAxis", "series"],
  properties: {
    type: { const: "xychart" },
    title: { type: "string" },
    xLabel: { type: "string" },
    yLabel: { type: "string" },
    xAxis: { type: "array", items: { type: "string" } },
    series: {
      type: "array",
      items: {
        type: "object",
        required: ["label", "type", "data"],
        properties: {
          label: { type: "string" },
          type: { enum: ["line", "bar"] },
          data: { type: "array", items: { type: "number" } },
          color: { type: "string" },
        },
      },
    },
  },
} as const;

export const radarJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["type", "axes", "series"],
  properties: {
    type: { const: "radar" },
    title: { type: "string" },
    axes: { type: "array", items: { type: "string" } },
    series: {
      type: "array",
      items: {
        type: "object",
        required: ["label", "values"],
        properties: {
          label: { type: "string" },
          values: { type: "array", items: { type: "number" } },
          color: { type: "string" },
        },
      },
    },
    max: { type: "number" },
  },
} as const;

export const treemapJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["type", "root"],
  properties: {
    type: { const: "treemap" },
    title: { type: "string" },
    root: {
      type: "object",
      required: ["label", "children"],
      properties: {
        label: { type: "string" },
        children: {
          type: "array",
          items: { $ref: "#/$defs/treemapNode" },
        },
      },
    },
  },
  $defs: {
    treemapNode: {
      type: "object",
      required: ["label"],
      properties: {
        label: { type: "string" },
        value: { type: "number" },
        color: { type: "string" },
        children: {
          type: "array",
          items: { $ref: "#/$defs/treemapNode" },
        },
      },
    },
  },
} as const;

export const vennJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["type", "sets"],
  properties: {
    type: { const: "venn" },
    title: { type: "string" },
    sets: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "label", "value"],
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          value: { type: "number" },
          color: { type: "string" },
        },
      },
    },
    intersections: {
      type: "array",
      items: {
        type: "object",
        required: ["sets", "value"],
        properties: {
          sets: { type: "array", items: { type: "string" } },
          label: { type: "string" },
          value: { type: "number" },
        },
      },
    },
  },
} as const;

export const sirenJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://siren.dev/schema/v0.1.0",
  title: "Siren Diagram",
  description: "A JSON-native diagram document for Siren. See https://siren.dev/docs/json-schema for details.",
  oneOf: [
  flowchartJsonSchema,
  sequenceJsonSchema,
  stateJsonSchema,
  classJsonSchema,
  erJsonSchema,
  timelineJsonSchema,
  kanbanJsonSchema,
  quadrantJsonSchema,
  pieJsonSchema,
  c4JsonSchema,
  architectureJsonSchema,
  blockJsonSchema,
  requirementJsonSchema,
  mindmapJsonSchema,
  gitgraphJsonSchema,
  ganttJsonSchema,
  sankeyJsonSchema,
  packetJsonSchema,
  userjourneyJsonSchema,
  xychartJsonSchema,
  radarJsonSchema,
  treemapJsonSchema,
  vennJsonSchema,
  ],
} as const;
