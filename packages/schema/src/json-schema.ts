export const flowchartJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["type", "nodes", "edges"],
  properties: {
    type: { const: "flowchart" },
    direction: { enum: ["TB", "BT", "LR", "RL"] },
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
