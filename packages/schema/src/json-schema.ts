/** JSON Schema for Siren diagram definitions - usable with LLM structured output */
export const diagramJsonSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'SirenDiagram',
  description: 'A Siren diagram definition for rendering interactive diagrams',
  type: 'object' as const,
  required: ['nodes', 'edges'],
  properties: {
    version: {
      type: 'string' as const,
      description: 'Schema version',
      default: '0.1.0',
    },
    nodes: {
      type: 'array' as const,
      description: 'Diagram nodes',
      items: {
        type: 'object' as const,
        required: ['id'],
        properties: {
          id: { type: 'string' as const, description: 'Unique node identifier' },
          label: { type: 'string' as const, description: 'Display label' },
          shape: {
            type: 'string' as const,
            enum: ['rectangle', 'rounded', 'diamond', 'circle', 'hexagon', 'pill', 'cylinder', 'parallelogram', 'trapezoid'],
            default: 'rounded',
          },
          variant: {
            type: 'string' as const,
            enum: ['default', 'primary', 'success', 'warning', 'danger', 'ghost'],
            default: 'default',
          },
          ports: {
            type: 'array' as const,
            items: { type: 'string' as const, enum: ['top', 'right', 'bottom', 'left'] },
          },
          width: { type: 'number' as const, minimum: 1 },
          height: { type: 'number' as const, minimum: 1 },
        },
      },
    },
    edges: {
      type: 'array' as const,
      description: 'Connections between nodes',
      items: {
        type: 'object' as const,
        required: ['id', 'from', 'to'],
        properties: {
          id: { type: 'string' as const, description: 'Unique edge identifier' },
          from: { type: 'string' as const, description: 'Source node id' },
          to: { type: 'string' as const, description: 'Target node id' },
          fromPort: { type: 'string' as const, enum: ['top', 'right', 'bottom', 'left'] },
          toPort: { type: 'string' as const, enum: ['top', 'right', 'bottom', 'left'] },
          label: { type: 'string' as const, description: 'Edge label text' },
          type: {
            type: 'string' as const,
            enum: ['bezier', 'straight', 'step', 'smoothstep'],
            default: 'bezier',
          },
          animated: { type: 'boolean' as const, default: false },
          dashed: { type: 'boolean' as const, default: false },
          bidirectional: { type: 'boolean' as const, default: false },
          thickness: { type: 'number' as const, minimum: 0.5 },
        },
      },
    },
    groups: {
      type: 'array' as const,
      description: 'Node groupings',
      items: {
        type: 'object' as const,
        required: ['id', 'children'],
        properties: {
          id: { type: 'string' as const },
          label: { type: 'string' as const },
          children: { type: 'array' as const, items: { type: 'string' as const } },
          collapsible: { type: 'boolean' as const, default: false },
          defaultCollapsed: { type: 'boolean' as const, default: false },
        },
      },
    },
    layout: {
      type: 'object' as const,
      properties: {
        algorithm: { type: 'string' as const, enum: ['dagre', 'elk', 'force', 'manual', 'grid'] },
        direction: { type: 'string' as const, enum: ['TB', 'BT', 'LR', 'RL'] },
      },
    },
    theme: { type: 'string' as const, description: 'Theme name (light, dark, github, presentation)' },
  },
} as const
