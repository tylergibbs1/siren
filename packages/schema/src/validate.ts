import type { DiagramDefinition, NodeDefinition, EdgeDefinition } from '@siren/core'

export interface ValidationError {
  path: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  data?: DiagramDefinition
  errors: ValidationError[]
}

const VALID_SHAPES = ['rectangle', 'rounded', 'diamond', 'circle', 'hexagon', 'pill', 'cylinder', 'parallelogram', 'trapezoid']
const VALID_VARIANTS = ['default', 'primary', 'success', 'warning', 'danger', 'ghost']
const VALID_EDGE_TYPES = ['bezier', 'straight', 'step', 'smoothstep']
const VALID_PORTS = ['top', 'right', 'bottom', 'left']
const VALID_DIRECTIONS = ['TB', 'BT', 'LR', 'RL']
const VALID_ALGORITHMS = ['dagre', 'elk', 'force', 'manual', 'grid']

function validateNode(node: unknown, index: number): ValidationError[] {
  const errors: ValidationError[] = []
  const prefix = `nodes[${index}]`

  if (typeof node !== 'object' || node === null) {
    return [{ path: prefix, message: 'Node must be an object' }]
  }

  const n = node as Record<string, unknown>

  if (typeof n.id !== 'string' || n.id.length === 0) {
    errors.push({ path: `${prefix}.id`, message: 'Node id must be a non-empty string' })
  }

  if (n.label !== undefined && typeof n.label !== 'string') {
    errors.push({ path: `${prefix}.label`, message: 'Node label must be a string' })
  }

  if (n.shape !== undefined && !VALID_SHAPES.includes(n.shape as string)) {
    errors.push({ path: `${prefix}.shape`, message: `Invalid shape. Must be one of: ${VALID_SHAPES.join(', ')}` })
  }

  if (n.variant !== undefined && !VALID_VARIANTS.includes(n.variant as string)) {
    errors.push({ path: `${prefix}.variant`, message: `Invalid variant. Must be one of: ${VALID_VARIANTS.join(', ')}` })
  }

  if (n.ports !== undefined) {
    if (!Array.isArray(n.ports)) {
      errors.push({ path: `${prefix}.ports`, message: 'Ports must be an array' })
    } else {
      for (const port of n.ports) {
        if (!VALID_PORTS.includes(port as string)) {
          errors.push({ path: `${prefix}.ports`, message: `Invalid port "${port}". Must be one of: ${VALID_PORTS.join(', ')}` })
        }
      }
    }
  }

  if (n.width !== undefined && (typeof n.width !== 'number' || n.width <= 0)) {
    errors.push({ path: `${prefix}.width`, message: 'Width must be a positive number' })
  }

  if (n.height !== undefined && (typeof n.height !== 'number' || n.height <= 0)) {
    errors.push({ path: `${prefix}.height`, message: 'Height must be a positive number' })
  }

  return errors
}

function validateEdge(edge: unknown, index: number, nodeIds: Set<string>): ValidationError[] {
  const errors: ValidationError[] = []
  const prefix = `edges[${index}]`

  if (typeof edge !== 'object' || edge === null) {
    return [{ path: prefix, message: 'Edge must be an object' }]
  }

  const e = edge as Record<string, unknown>

  if (typeof e.id !== 'string' || e.id.length === 0) {
    errors.push({ path: `${prefix}.id`, message: 'Edge id must be a non-empty string' })
  }

  if (typeof e.from !== 'string' || e.from.length === 0) {
    errors.push({ path: `${prefix}.from`, message: 'Edge from must be a non-empty string' })
  } else if (!nodeIds.has(e.from)) {
    errors.push({ path: `${prefix}.from`, message: `Source node "${e.from}" does not exist` })
  }

  if (typeof e.to !== 'string' || e.to.length === 0) {
    errors.push({ path: `${prefix}.to`, message: 'Edge to must be a non-empty string' })
  } else if (!nodeIds.has(e.to)) {
    errors.push({ path: `${prefix}.to`, message: `Target node "${e.to}" does not exist` })
  }

  if (e.fromPort !== undefined && !VALID_PORTS.includes(e.fromPort as string)) {
    errors.push({ path: `${prefix}.fromPort`, message: `Invalid port. Must be one of: ${VALID_PORTS.join(', ')}` })
  }

  if (e.toPort !== undefined && !VALID_PORTS.includes(e.toPort as string)) {
    errors.push({ path: `${prefix}.toPort`, message: `Invalid port. Must be one of: ${VALID_PORTS.join(', ')}` })
  }

  if (e.type !== undefined && !VALID_EDGE_TYPES.includes(e.type as string)) {
    errors.push({ path: `${prefix}.type`, message: `Invalid edge type. Must be one of: ${VALID_EDGE_TYPES.join(', ')}` })
  }

  if (e.thickness !== undefined && (typeof e.thickness !== 'number' || e.thickness <= 0)) {
    errors.push({ path: `${prefix}.thickness`, message: 'Thickness must be a positive number' })
  }

  return errors
}

/** Validate a diagram definition (e.g. from LLM output) */
export function validate(input: unknown): ValidationResult {
  const errors: ValidationError[] = []

  if (typeof input !== 'object' || input === null) {
    return { valid: false, errors: [{ path: '', message: 'Input must be an object' }] }
  }

  const def = input as Record<string, unknown>

  // Validate nodes
  if (!Array.isArray(def.nodes)) {
    errors.push({ path: 'nodes', message: 'nodes must be an array' })
  } else {
    const nodeIds = new Set<string>()
    for (let i = 0; i < def.nodes.length; i++) {
      const nodeErrors = validateNode(def.nodes[i], i)
      errors.push(...nodeErrors)
      const n = def.nodes[i] as Record<string, unknown>
      if (typeof n?.id === 'string') {
        if (nodeIds.has(n.id)) {
          errors.push({ path: `nodes[${i}].id`, message: `Duplicate node id "${n.id}"` })
        }
        nodeIds.add(n.id)
      }
    }

    // Validate edges
    if (!Array.isArray(def.edges)) {
      errors.push({ path: 'edges', message: 'edges must be an array' })
    } else {
      const edgeIds = new Set<string>()
      for (let i = 0; i < def.edges.length; i++) {
        const edgeErrors = validateEdge(def.edges[i], i, nodeIds)
        errors.push(...edgeErrors)
        const e = def.edges[i] as Record<string, unknown>
        if (typeof e?.id === 'string') {
          if (edgeIds.has(e.id)) {
            errors.push({ path: `edges[${i}].id`, message: `Duplicate edge id "${e.id}"` })
          }
          edgeIds.add(e.id)
        }
      }
    }
  }

  // Validate layout options if present
  if (def.layout !== undefined) {
    const layout = def.layout as Record<string, unknown>
    if (layout.direction !== undefined && !VALID_DIRECTIONS.includes(layout.direction as string)) {
      errors.push({ path: 'layout.direction', message: `Invalid direction. Must be one of: ${VALID_DIRECTIONS.join(', ')}` })
    }
    if (layout.algorithm !== undefined && !VALID_ALGORITHMS.includes(layout.algorithm as string)) {
      errors.push({ path: 'layout.algorithm', message: `Invalid algorithm. Must be one of: ${VALID_ALGORITHMS.join(', ')}` })
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return { valid: true, data: input as DiagramDefinition, errors: [] }
}
