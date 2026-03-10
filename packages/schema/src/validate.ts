import type { SirenSchema, ValidationResult, ValidationError, ValidationErrorCode } from "./types";

function err(code: ValidationErrorCode, message: string, path?: string): ValidationError {
  return path ? { code, message, path } : { code, message };
}

const VALID_DIRECTIONS = new Set(["TB", "BT", "LR", "RL"]);
function validateDirection(obj: Record<string, unknown>, errors: ValidationError[]) {
  if (obj.direction !== undefined && !VALID_DIRECTIONS.has(obj.direction as string)) {
    errors.push(err("INVALID_ENUM", `Invalid direction: '${obj.direction}'. Must be TB, BT, LR, or RL`, "direction"));
  }
}

const VALID_CLASS_REL_TYPES = new Set(["inheritance", "composition", "aggregation", "association", "dependency", "realization"]);
const VALID_ER_CARDINALITIES = new Set(["1:1", "1:N", "N:1", "M:N"]);
const VALID_REQ_REL_TYPES = new Set(["traces", "derives", "satisfies", "verifies", "refines", "contains"]);
const VALID_C4_ELEMENT_TYPES = new Set(["person", "system", "boundary"]);
const VALID_XY_SERIES_TYPES = new Set(["line", "bar"]);

function validateMindmapNode(node: Record<string, unknown>, errors: ValidationError[], path: string) {
  if (!node.id || typeof node.id !== "string") errors.push(err("MISSING_FIELD", `${path}: missing string 'id'`, `${path}.id`));
  if (!node.label || typeof node.label !== "string") errors.push(err("MISSING_FIELD", `${path}: missing string 'label'`, `${path}.label`));
  if (node.children && Array.isArray(node.children)) {
    for (let i = 0; i < node.children.length; i++) {
      validateMindmapNode(node.children[i] as Record<string, unknown>, errors, `${path}.children[${i}]`);
    }
  }
}

export function validate(input: unknown): ValidationResult {
  if (!input || typeof input !== "object") {
    return { valid: false, errors: [err("INVALID_INPUT", "Input must be an object")] };
  }

  const obj = input as Record<string, unknown>;
  const errors: ValidationError[] = [];

  if (!obj.type || typeof obj.type !== "string") {
    return { valid: false, errors: [err("MISSING_FIELD", "Missing or invalid 'type' field", "type")] };
  }

  if (obj.type === "flowchart") {
    validateDirection(obj, errors);
    if (!Array.isArray(obj.nodes)) errors.push(err("MISSING_FIELD", "'nodes' must be an array", "nodes"));
    if (!Array.isArray(obj.edges)) errors.push(err("MISSING_FIELD", "'edges' must be an array", "edges"));

    if (errors.length === 0) {
      const nodes = obj.nodes as Array<Record<string, unknown>>;
      const nodeIds = new Set<string>();

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]!;
        if (!node.id || typeof node.id !== "string")
          errors.push(err("MISSING_FIELD", "Each node must have a string 'id'", `nodes[${i}].id`));
        if (!node.label || typeof node.label !== "string")
          errors.push(err("MISSING_FIELD", `Node '${node.id}' must have a string 'label'`, `nodes[${i}].label`));
        if (nodeIds.has(node.id as string))
          errors.push(err("DUPLICATE_ID", `Duplicate node id: '${node.id}'`, `nodes[${i}].id`));
        nodeIds.add(node.id as string);
      }

      const edges = obj.edges as Array<Record<string, unknown>>;
      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i]!;
        if (!edge.from || typeof edge.from !== "string")
          errors.push(err("MISSING_FIELD", "Each edge must have a string 'from'", `edges[${i}].from`));
        if (!edge.to || typeof edge.to !== "string")
          errors.push(err("MISSING_FIELD", "Each edge must have a string 'to'", `edges[${i}].to`));
        if (edge.from && !nodeIds.has(edge.from as string))
          errors.push(err("UNKNOWN_REFERENCE", `Edge references unknown node: '${edge.from}'`, `edges[${i}].from`));
        if (edge.to && !nodeIds.has(edge.to as string))
          errors.push(err("UNKNOWN_REFERENCE", `Edge references unknown node: '${edge.to}'`, `edges[${i}].to`));
      }
    }
  } else if (obj.type === "sequence") {
    if (!Array.isArray(obj.actors)) errors.push(err("MISSING_FIELD", "'actors' must be an array", "actors"));
    if (!Array.isArray(obj.messages))
      errors.push(err("MISSING_FIELD", "'messages' must be an array", "messages"));

    if (errors.length === 0) {
      const actors = obj.actors as Array<Record<string, unknown>>;
      const actorIds = new Set<string>();

      for (let i = 0; i < actors.length; i++) {
        const actor = actors[i]!;
        if (!actor.id || typeof actor.id !== "string")
          errors.push(err("MISSING_FIELD", "Each actor must have a string 'id'", `actors[${i}].id`));
        if (!actor.label || typeof actor.label !== "string")
          errors.push(err("MISSING_FIELD", `Actor '${actor.id}' must have a string 'label'`, `actors[${i}].label`));
        actorIds.add(actor.id as string);
      }

      const messages = obj.messages as Array<Record<string, unknown>>;
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i]!;
        if (!msg.from || !actorIds.has(msg.from as string))
          errors.push(err("UNKNOWN_REFERENCE", `Message references unknown actor: '${msg.from}'`, `messages[${i}].from`));
        if (!msg.to || !actorIds.has(msg.to as string))
          errors.push(err("UNKNOWN_REFERENCE", `Message references unknown actor: '${msg.to}'`, `messages[${i}].to`));
      }
    }
  } else if (obj.type === "state") {
    validateDirection(obj, errors);
    if (!Array.isArray(obj.states)) errors.push(err("MISSING_FIELD", "'states' must be an array", "states"));
    if (!Array.isArray(obj.transitions))
      errors.push(err("MISSING_FIELD", "'transitions' must be an array", "transitions"));

    if (errors.length === 0) {
      const states = obj.states as Array<Record<string, unknown>>;
      const stateIds = new Set<string>();

      for (let i = 0; i < states.length; i++) {
        const state = states[i]!;
        if (!state.id || typeof state.id !== "string")
          errors.push(err("MISSING_FIELD", "Each state must have a string 'id'", `states[${i}].id`));
        if (typeof state.label !== "string")
          errors.push(err("MISSING_FIELD", `State '${state.id}' must have a string 'label'`, `states[${i}].label`));
        if (stateIds.has(state.id as string))
          errors.push(err("DUPLICATE_ID", `Duplicate state id: '${state.id}'`, `states[${i}].id`));
        stateIds.add(state.id as string);
      }

      const transitions = obj.transitions as Array<Record<string, unknown>>;
      for (let i = 0; i < transitions.length; i++) {
        const t = transitions[i]!;
        if (!t.from || typeof t.from !== "string")
          errors.push(err("MISSING_FIELD", "Each transition must have a string 'from'", `transitions[${i}].from`));
        if (!t.to || typeof t.to !== "string")
          errors.push(err("MISSING_FIELD", "Each transition must have a string 'to'", `transitions[${i}].to`));
        if (t.from && !stateIds.has(t.from as string))
          errors.push(err("UNKNOWN_REFERENCE", `Transition references unknown state: '${t.from}'`, `transitions[${i}].from`));
        if (t.to && !stateIds.has(t.to as string))
          errors.push(err("UNKNOWN_REFERENCE", `Transition references unknown state: '${t.to}'`, `transitions[${i}].to`));
      }
    }
  } else if (obj.type === "class") {
    validateDirection(obj, errors);
    if (!Array.isArray(obj.classes)) errors.push(err("MISSING_FIELD", "'classes' must be an array", "classes"));
    if (!Array.isArray(obj.relationships))
      errors.push(err("MISSING_FIELD", "'relationships' must be an array", "relationships"));

    if (errors.length === 0) {
      const classes = obj.classes as Array<Record<string, unknown>>;
      const classIds = new Set<string>();

      for (let i = 0; i < classes.length; i++) {
        const cls = classes[i]!;
        if (!cls.id || typeof cls.id !== "string")
          errors.push(err("MISSING_FIELD", "Each class must have a string 'id'", `classes[${i}].id`));
        if (!cls.name || typeof cls.name !== "string")
          errors.push(err("MISSING_FIELD", `Class '${cls.id}' must have a string 'name'`, `classes[${i}].name`));
        if (classIds.has(cls.id as string))
          errors.push(err("DUPLICATE_ID", `Duplicate class id: '${cls.id}'`, `classes[${i}].id`));
        classIds.add(cls.id as string);
      }

      const rels = obj.relationships as Array<Record<string, unknown>>;
      for (let i = 0; i < rels.length; i++) {
        const rel = rels[i]!;
        if (!rel.from || typeof rel.from !== "string")
          errors.push(err("MISSING_FIELD", "Each relationship must have a string 'from'", `relationships[${i}].from`));
        if (!rel.to || typeof rel.to !== "string")
          errors.push(err("MISSING_FIELD", "Each relationship must have a string 'to'", `relationships[${i}].to`));
        if (!rel.type || typeof rel.type !== "string")
          errors.push(err("MISSING_FIELD", "Each relationship must have a string 'type'", `relationships[${i}].type`));
        if (rel.from && !classIds.has(rel.from as string))
          errors.push(err("UNKNOWN_REFERENCE", `Relationship references unknown class: '${rel.from}'`, `relationships[${i}].from`));
        if (rel.to && !classIds.has(rel.to as string))
          errors.push(err("UNKNOWN_REFERENCE", `Relationship references unknown class: '${rel.to}'`, `relationships[${i}].to`));
        if (rel.type && typeof rel.type === "string" && !VALID_CLASS_REL_TYPES.has(rel.type as string))
          errors.push(err("INVALID_ENUM", `Invalid class relationship type: '${rel.type}'. Must be one of: ${[...VALID_CLASS_REL_TYPES].join(", ")}`, `relationships[${i}].type`));
      }
    }
  } else if (obj.type === "er") {
    validateDirection(obj, errors);
    if (!Array.isArray(obj.entities))
      errors.push(err("MISSING_FIELD", "'entities' must be an array", "entities"));
    if (!Array.isArray(obj.relationships))
      errors.push(err("MISSING_FIELD", "'relationships' must be an array", "relationships"));

    if (errors.length === 0) {
      const entities = obj.entities as Array<Record<string, unknown>>;
      const entityIds = new Set<string>();

      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i]!;
        if (!entity.id || typeof entity.id !== "string")
          errors.push(err("MISSING_FIELD", "Each entity must have a string 'id'", `entities[${i}].id`));
        if (!entity.name || typeof entity.name !== "string")
          errors.push(err("MISSING_FIELD", `Entity '${entity.id}' must have a string 'name'`, `entities[${i}].name`));
        if (!Array.isArray(entity.columns))
          errors.push(err("MISSING_FIELD", `Entity '${entity.id}' must have a 'columns' array`, `entities[${i}].columns`));
        if (entityIds.has(entity.id as string))
          errors.push(err("DUPLICATE_ID", `Duplicate entity id: '${entity.id}'`, `entities[${i}].id`));
        entityIds.add(entity.id as string);
      }

      const rels = obj.relationships as Array<Record<string, unknown>>;
      for (let i = 0; i < rels.length; i++) {
        const rel = rels[i]!;
        if (!rel.from || typeof rel.from !== "string")
          errors.push(err("MISSING_FIELD", "Each relationship must have a string 'from'", `relationships[${i}].from`));
        if (!rel.to || typeof rel.to !== "string")
          errors.push(err("MISSING_FIELD", "Each relationship must have a string 'to'", `relationships[${i}].to`));
        if (!rel.cardinality || typeof rel.cardinality !== "string")
          errors.push(err("MISSING_FIELD", "Each relationship must have a string 'cardinality'", `relationships[${i}].cardinality`));
        if (rel.from && !entityIds.has(rel.from as string))
          errors.push(err("UNKNOWN_REFERENCE", `Relationship references unknown entity: '${rel.from}'`, `relationships[${i}].from`));
        if (rel.to && !entityIds.has(rel.to as string))
          errors.push(err("UNKNOWN_REFERENCE", `Relationship references unknown entity: '${rel.to}'`, `relationships[${i}].to`));
        if (rel.cardinality && typeof rel.cardinality === "string" && !VALID_ER_CARDINALITIES.has(rel.cardinality as string))
          errors.push(err("INVALID_ENUM", `Invalid ER cardinality: '${rel.cardinality}'. Must be one of: ${[...VALID_ER_CARDINALITIES].join(", ")}`, `relationships[${i}].cardinality`));
      }
    }
  } else if (obj.type === "timeline") {
    if (!Array.isArray(obj.events)) errors.push(err("MISSING_FIELD", "'events' must be an array", "events"));

    if (errors.length === 0) {
      const events = obj.events as Array<Record<string, unknown>>;
      for (let i = 0; i < events.length; i++) {
        const event = events[i]!;
        if (!event.id || typeof event.id !== "string")
          errors.push(err("MISSING_FIELD", "Each event must have a string 'id'", `events[${i}].id`));
        if (!event.date || typeof event.date !== "string")
          errors.push(err("MISSING_FIELD", `Event '${event.id}' must have a string 'date'`, `events[${i}].date`));
        if (!event.label || typeof event.label !== "string")
          errors.push(err("MISSING_FIELD", `Event '${event.id}' must have a string 'label'`, `events[${i}].label`));
      }
    }
  } else if (obj.type === "kanban") {
    if (!Array.isArray(obj.columns)) errors.push(err("MISSING_FIELD", "'columns' must be an array", "columns"));

    if (errors.length === 0) {
      const columns = obj.columns as Array<Record<string, unknown>>;
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i]!;
        if (!col.id || typeof col.id !== "string")
          errors.push(err("MISSING_FIELD", "Each column must have a string 'id'", `columns[${i}].id`));
        if (!col.label || typeof col.label !== "string")
          errors.push(err("MISSING_FIELD", `Column '${col.id}' must have a string 'label'`, `columns[${i}].label`));
        if (!Array.isArray(col.cards))
          errors.push(err("MISSING_FIELD", `Column '${col.id}' must have a 'cards' array`, `columns[${i}].cards`));
        else {
          const cards = col.cards as Array<Record<string, unknown>>;
          for (let j = 0; j < cards.length; j++) {
            const card = cards[j]!;
            if (!card.id || typeof card.id !== "string")
              errors.push(err("MISSING_FIELD", "Each card must have a string 'id'", `columns[${i}].cards[${j}].id`));
            if (!card.label || typeof card.label !== "string")
              errors.push(err("MISSING_FIELD", `Card '${card.id}' must have a string 'label'`, `columns[${i}].cards[${j}].label`));
          }
        }
      }
    }
  } else if (obj.type === "quadrant") {
    if (!Array.isArray(obj.items)) errors.push(err("MISSING_FIELD", "'items' must be an array", "items"));

    if (errors.length === 0) {
      const items = obj.items as Array<Record<string, unknown>>;
      for (let i = 0; i < items.length; i++) {
        const item = items[i]!;
        if (!item.id || typeof item.id !== "string")
          errors.push(err("MISSING_FIELD", "Each item must have a string 'id'", `items[${i}].id`));
        if (!item.label || typeof item.label !== "string")
          errors.push(err("MISSING_FIELD", `Item '${item.id}' must have a string 'label'`, `items[${i}].label`));
        if (typeof item.x !== "number")
          errors.push(err("MISSING_FIELD", `Item '${item.id}' must have a number 'x'`, `items[${i}].x`));
        if (typeof item.y !== "number")
          errors.push(err("MISSING_FIELD", `Item '${item.id}' must have a number 'y'`, `items[${i}].y`));
      }
    }
  } else if (obj.type === "pie") {
    if (!Array.isArray(obj.segments))
      errors.push(err("MISSING_FIELD", "'segments' must be an array", "segments"));

    if (errors.length === 0) {
      const segments = obj.segments as Array<Record<string, unknown>>;
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i]!;
        if (!seg.label || typeof seg.label !== "string")
          errors.push(err("MISSING_FIELD", "Each segment must have a string 'label'", `segments[${i}].label`));
        if (typeof seg.value !== "number")
          errors.push(err("MISSING_FIELD", `Segment '${seg.label}' must have a number 'value'`, `segments[${i}].value`));
      }
    }
  } else if (obj.type === "c4") {
    validateDirection(obj, errors);
    if (!Array.isArray(obj.elements))
      errors.push(err("MISSING_FIELD", "'elements' must be an array", "elements"));
    if (!Array.isArray(obj.relationships))
      errors.push(err("MISSING_FIELD", "'relationships' must be an array", "relationships"));

    if (errors.length === 0) {
      const elements = obj.elements as Array<Record<string, unknown>>;
      const elementIds = new Set<string>();

      for (let i = 0; i < elements.length; i++) {
        const el = elements[i]!;
        if (!el.id || typeof el.id !== "string")
          errors.push(err("MISSING_FIELD", "Each element must have a string 'id'", `elements[${i}].id`));
        if (!el.label || typeof el.label !== "string")
          errors.push(err("MISSING_FIELD", `Element '${el.id}' must have a string 'label'`, `elements[${i}].label`));
        if (!el.type || typeof el.type !== "string")
          errors.push(err("MISSING_FIELD", `Element '${el.id}' must have a string 'type'`, `elements[${i}].type`));
        if (el.type && typeof el.type === "string" && !VALID_C4_ELEMENT_TYPES.has(el.type as string))
          errors.push(err("INVALID_ENUM", `Invalid C4 element type: '${el.type}'. Must be one of: ${[...VALID_C4_ELEMENT_TYPES].join(", ")}`, `elements[${i}].type`));
        elementIds.add(el.id as string);

        if (Array.isArray(el.children)) {
          const children = el.children as Array<Record<string, unknown>>;
          for (let j = 0; j < children.length; j++) {
            const child = children[j]!;
            if (!child.id || typeof child.id !== "string")
              errors.push(err("MISSING_FIELD", "Each child element must have a string 'id'", `elements[${i}].children[${j}].id`));
            if (!child.label || typeof child.label !== "string")
              errors.push(err("MISSING_FIELD", `Child element '${child.id}' must have a string 'label'`, `elements[${i}].children[${j}].label`));
            elementIds.add(child.id as string);
          }
        }
      }

      const rels = obj.relationships as Array<Record<string, unknown>>;
      for (let i = 0; i < rels.length; i++) {
        const rel = rels[i]!;
        if (!rel.from || typeof rel.from !== "string")
          errors.push(err("MISSING_FIELD", "Each relationship must have a string 'from'", `relationships[${i}].from`));
        if (!rel.to || typeof rel.to !== "string")
          errors.push(err("MISSING_FIELD", "Each relationship must have a string 'to'", `relationships[${i}].to`));
        if (rel.from && !elementIds.has(rel.from as string))
          errors.push(err("UNKNOWN_REFERENCE", `Relationship references unknown element: '${rel.from}'`, `relationships[${i}].from`));
        if (rel.to && !elementIds.has(rel.to as string))
          errors.push(err("UNKNOWN_REFERENCE", `Relationship references unknown element: '${rel.to}'`, `relationships[${i}].to`));
      }
    }
  } else if (obj.type === "architecture") {
    validateDirection(obj, errors);
    if (!Array.isArray(obj.groups)) errors.push(err("MISSING_FIELD", "'groups' must be an array", "groups"));
    if (!Array.isArray(obj.connections))
      errors.push(err("MISSING_FIELD", "'connections' must be an array", "connections"));

    if (errors.length === 0) {
      const serviceIds = new Set<string>();

      const groups = obj.groups as Array<Record<string, unknown>>;
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i]!;
        if (!group.id || typeof group.id !== "string")
          errors.push(err("MISSING_FIELD", "Each group must have a string 'id'", `groups[${i}].id`));
        if (!group.label || typeof group.label !== "string")
          errors.push(err("MISSING_FIELD", `Group '${group.id}' must have a string 'label'`, `groups[${i}].label`));
        if (!Array.isArray(group.services))
          errors.push(err("MISSING_FIELD", `Group '${group.id}' must have a 'services' array`, `groups[${i}].services`));
        else {
          const services = group.services as Array<Record<string, unknown>>;
          for (let j = 0; j < services.length; j++) {
            const svc = services[j]!;
            if (!svc.id || typeof svc.id !== "string")
              errors.push(err("MISSING_FIELD", "Each service must have a string 'id'", `groups[${i}].services[${j}].id`));
            if (!svc.label || typeof svc.label !== "string")
              errors.push(err("MISSING_FIELD", `Service '${svc.id}' must have a string 'label'`, `groups[${i}].services[${j}].label`));
            serviceIds.add(svc.id as string);
          }
        }
      }

      if (Array.isArray(obj.services)) {
        const topServices = obj.services as Array<Record<string, unknown>>;
        for (let i = 0; i < topServices.length; i++) {
          const svc = topServices[i]!;
          if (!svc.id || typeof svc.id !== "string")
            errors.push(err("MISSING_FIELD", "Each service must have a string 'id'", `services[${i}].id`));
          if (!svc.label || typeof svc.label !== "string")
            errors.push(err("MISSING_FIELD", `Service '${svc.id}' must have a string 'label'`, `services[${i}].label`));
          serviceIds.add(svc.id as string);
        }
      }

      const connections = obj.connections as Array<Record<string, unknown>>;
      for (let i = 0; i < connections.length; i++) {
        const conn = connections[i]!;
        if (!conn.from || typeof conn.from !== "string")
          errors.push(err("MISSING_FIELD", "Each connection must have a string 'from'", `connections[${i}].from`));
        if (!conn.to || typeof conn.to !== "string")
          errors.push(err("MISSING_FIELD", "Each connection must have a string 'to'", `connections[${i}].to`));
        if (conn.from && !serviceIds.has(conn.from as string))
          errors.push(err("UNKNOWN_REFERENCE", `Connection references unknown service: '${conn.from}'`, `connections[${i}].from`));
        if (conn.to && !serviceIds.has(conn.to as string))
          errors.push(err("UNKNOWN_REFERENCE", `Connection references unknown service: '${conn.to}'`, `connections[${i}].to`));
      }
    }
  } else if (obj.type === "block") {
    validateDirection(obj, errors);
    if (!Array.isArray(obj.blocks)) errors.push(err("MISSING_FIELD", "'blocks' must be an array", "blocks"));
    if (!Array.isArray(obj.connections))
      errors.push(err("MISSING_FIELD", "'connections' must be an array", "connections"));

    if (errors.length === 0) {
      const blockIds = new Set<string>();

      const blocks = obj.blocks as Array<Record<string, unknown>>;
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i]!;
        if (!block.id || typeof block.id !== "string")
          errors.push(err("MISSING_FIELD", "Each block must have a string 'id'", `blocks[${i}].id`));
        if (!block.label || typeof block.label !== "string")
          errors.push(err("MISSING_FIELD", `Block '${block.id}' must have a string 'label'`, `blocks[${i}].label`));
        blockIds.add(block.id as string);

        if (Array.isArray(block.children)) {
          const children = block.children as Array<Record<string, unknown>>;
          for (let j = 0; j < children.length; j++) {
            const child = children[j]!;
            if (!child.id || typeof child.id !== "string")
              errors.push(err("MISSING_FIELD", "Each child block must have a string 'id'", `blocks[${i}].children[${j}].id`));
            if (!child.label || typeof child.label !== "string")
              errors.push(err("MISSING_FIELD", `Child block '${child.id}' must have a string 'label'`, `blocks[${i}].children[${j}].label`));
            blockIds.add(child.id as string);
          }
        }
      }

      const connections = obj.connections as Array<Record<string, unknown>>;
      for (let i = 0; i < connections.length; i++) {
        const conn = connections[i]!;
        if (!conn.from || typeof conn.from !== "string")
          errors.push(err("MISSING_FIELD", "Each connection must have a string 'from'", `connections[${i}].from`));
        if (!conn.to || typeof conn.to !== "string")
          errors.push(err("MISSING_FIELD", "Each connection must have a string 'to'", `connections[${i}].to`));
        if (conn.from && !blockIds.has(conn.from as string))
          errors.push(err("UNKNOWN_REFERENCE", `Connection references unknown block: '${conn.from}'`, `connections[${i}].from`));
        if (conn.to && !blockIds.has(conn.to as string))
          errors.push(err("UNKNOWN_REFERENCE", `Connection references unknown block: '${conn.to}'`, `connections[${i}].to`));
      }
    }
  } else if (obj.type === "requirement") {
    validateDirection(obj, errors);
    if (!Array.isArray(obj.requirements))
      errors.push(err("MISSING_FIELD", "'requirements' must be an array", "requirements"));
    if (!Array.isArray(obj.relationships))
      errors.push(err("MISSING_FIELD", "'relationships' must be an array", "relationships"));

    if (errors.length === 0) {
      const reqIds = new Set<string>();

      const requirements = obj.requirements as Array<Record<string, unknown>>;
      for (let i = 0; i < requirements.length; i++) {
        const req = requirements[i]!;
        if (!req.id || typeof req.id !== "string")
          errors.push(err("MISSING_FIELD", "Each requirement must have a string 'id'", `requirements[${i}].id`));
        if (!req.label || typeof req.label !== "string")
          errors.push(err("MISSING_FIELD", `Requirement '${req.id}' must have a string 'label'`, `requirements[${i}].label`));
        if (reqIds.has(req.id as string))
          errors.push(err("DUPLICATE_ID", `Duplicate requirement id: '${req.id}'`, `requirements[${i}].id`));
        reqIds.add(req.id as string);
      }

      const rels = obj.relationships as Array<Record<string, unknown>>;
      for (let i = 0; i < rels.length; i++) {
        const rel = rels[i]!;
        if (!rel.from || typeof rel.from !== "string")
          errors.push(err("MISSING_FIELD", "Each relationship must have a string 'from'", `relationships[${i}].from`));
        if (!rel.to || typeof rel.to !== "string")
          errors.push(err("MISSING_FIELD", "Each relationship must have a string 'to'", `relationships[${i}].to`));
        if (!rel.type || typeof rel.type !== "string")
          errors.push(err("MISSING_FIELD", "Each relationship must have a string 'type'", `relationships[${i}].type`));
        if (rel.from && !reqIds.has(rel.from as string))
          errors.push(err("UNKNOWN_REFERENCE", `Relationship references unknown requirement: '${rel.from}'`, `relationships[${i}].from`));
        if (rel.to && !reqIds.has(rel.to as string))
          errors.push(err("UNKNOWN_REFERENCE", `Relationship references unknown requirement: '${rel.to}'`, `relationships[${i}].to`));
        if (rel.type && typeof rel.type === "string" && !VALID_REQ_REL_TYPES.has(rel.type as string))
          errors.push(err("INVALID_ENUM", `Invalid requirement relationship type: '${rel.type}'. Must be one of: ${[...VALID_REQ_REL_TYPES].join(", ")}`, `relationships[${i}].type`));
      }
    }
  } else if (obj.type === "mindmap") {
    if (!obj.root || typeof obj.root !== "object")
      errors.push(err("MISSING_FIELD", "'root' must be an object", "root"));

    if (errors.length === 0) {
      const root = obj.root as Record<string, unknown>;
      validateMindmapNode(root, errors, "root");
    }
  } else if (obj.type === "gitgraph") {
    if (!Array.isArray(obj.commits))
      errors.push(err("MISSING_FIELD", "'commits' must be an array", "commits"));

    if (errors.length === 0) {
      const commits = obj.commits as Array<Record<string, unknown>>;
      const commitIds = new Set<string>();

      for (let i = 0; i < commits.length; i++) {
        const commit = commits[i]!;
        if (!commit.id || typeof commit.id !== "string")
          errors.push(err("MISSING_FIELD", "Each commit must have a string 'id'", `commits[${i}].id`));
        if (!commit.message || typeof commit.message !== "string")
          errors.push(err("MISSING_FIELD", `Commit '${commit.id}' must have a string 'message'`, `commits[${i}].message`));
        if (!commit.branch || typeof commit.branch !== "string")
          errors.push(err("MISSING_FIELD", `Commit '${commit.id}' must have a string 'branch'`, `commits[${i}].branch`));
        if (commit.id && typeof commit.id === "string")
          commitIds.add(commit.id as string);
      }

      for (let i = 0; i < commits.length; i++) {
        const commit = commits[i]!;
        if (commit.parent && typeof commit.parent === "string") {
          if (!commitIds.has(commit.parent as string))
            errors.push(err("UNKNOWN_REFERENCE", `Commit '${commit.id}' references unknown parent: '${commit.parent}'`, `commits[${i}].parent`));
        }
        if (Array.isArray(commit.parents)) {
          for (let j = 0; j < (commit.parents as string[]).length; j++) {
            const parentId = (commit.parents as string[])[j]!;
            if (typeof parentId === "string" && !commitIds.has(parentId))
              errors.push(err("UNKNOWN_REFERENCE", `Commit '${commit.id}' references unknown parent: '${parentId}'`, `commits[${i}].parents[${j}]`));
          }
        }
      }
    }
  } else if (obj.type === "gantt") {
    if (!Array.isArray(obj.sections))
      errors.push(err("MISSING_FIELD", "'sections' must be an array", "sections"));

    if (errors.length === 0) {
      const sections = obj.sections as Array<Record<string, unknown>>;
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i]!;
        if (!section.label || typeof section.label !== "string")
          errors.push(err("MISSING_FIELD", "Each section must have a string 'label'", `sections[${i}].label`));
        if (!Array.isArray(section.tasks))
          errors.push(err("MISSING_FIELD", `Section '${section.label}' must have a 'tasks' array`, `sections[${i}].tasks`));
        else {
          const tasks = section.tasks as Array<Record<string, unknown>>;
          for (let j = 0; j < tasks.length; j++) {
            const task = tasks[j]!;
            if (!task.id || typeof task.id !== "string")
              errors.push(err("MISSING_FIELD", "Each task must have a string 'id'", `sections[${i}].tasks[${j}].id`));
            if (!task.label || typeof task.label !== "string")
              errors.push(err("MISSING_FIELD", `Task '${task.id}' must have a string 'label'`, `sections[${i}].tasks[${j}].label`));
            if (!task.start || typeof task.start !== "string")
              errors.push(err("MISSING_FIELD", `Task '${task.id}' must have a string 'start'`, `sections[${i}].tasks[${j}].start`));
            if (!task.end || typeof task.end !== "string")
              errors.push(err("MISSING_FIELD", `Task '${task.id}' must have a string 'end'`, `sections[${i}].tasks[${j}].end`));
          }
        }
      }
    }
  } else if (obj.type === "sankey") {
    if (!Array.isArray(obj.nodes)) errors.push(err("MISSING_FIELD", "'nodes' must be an array", "nodes"));
    if (!Array.isArray(obj.flows)) errors.push(err("MISSING_FIELD", "'flows' must be an array", "flows"));

    if (errors.length === 0) {
      const nodes = obj.nodes as Array<Record<string, unknown>>;
      const nodeIds = new Set<string>();

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]!;
        if (!node.id || typeof node.id !== "string")
          errors.push(err("MISSING_FIELD", "Each node must have a string 'id'", `nodes[${i}].id`));
        if (!node.label || typeof node.label !== "string")
          errors.push(err("MISSING_FIELD", `Node '${node.id}' must have a string 'label'`, `nodes[${i}].label`));
        nodeIds.add(node.id as string);
      }

      const flows = obj.flows as Array<Record<string, unknown>>;
      for (let i = 0; i < flows.length; i++) {
        const flow = flows[i]!;
        if (!flow.from || typeof flow.from !== "string")
          errors.push(err("MISSING_FIELD", "Each flow must have a string 'from'", `flows[${i}].from`));
        if (!flow.to || typeof flow.to !== "string")
          errors.push(err("MISSING_FIELD", "Each flow must have a string 'to'", `flows[${i}].to`));
        if (typeof flow.value !== "number")
          errors.push(err("MISSING_FIELD", `Flow must have a number 'value'`, `flows[${i}].value`));
        if (flow.from && !nodeIds.has(flow.from as string))
          errors.push(err("UNKNOWN_REFERENCE", `Flow references unknown node: '${flow.from}'`, `flows[${i}].from`));
        if (flow.to && !nodeIds.has(flow.to as string))
          errors.push(err("UNKNOWN_REFERENCE", `Flow references unknown node: '${flow.to}'`, `flows[${i}].to`));
      }
    }
  } else if (obj.type === "packet") {
    if (!Array.isArray(obj.rows)) errors.push(err("MISSING_FIELD", "'rows' must be an array", "rows"));

    if (errors.length === 0) {
      const rows = obj.rows as Array<Record<string, unknown>>;
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]!;
        if (!Array.isArray(row.fields))
          errors.push(err("MISSING_FIELD", "Each row must have a 'fields' array", `rows[${i}].fields`));
        else {
          const fields = row.fields as Array<Record<string, unknown>>;
          for (let j = 0; j < fields.length; j++) {
            const field = fields[j]!;
            if (!field.label || typeof field.label !== "string")
              errors.push(err("MISSING_FIELD", "Each field must have a string 'label'", `rows[${i}].fields[${j}].label`));
            if (typeof field.bits !== "number")
              errors.push(err("MISSING_FIELD", `Field '${field.label}' must have a number 'bits'`, `rows[${i}].fields[${j}].bits`));
          }
        }
      }
    }
  } else if (obj.type === "userjourney") {
    if (!Array.isArray(obj.sections))
      errors.push(err("MISSING_FIELD", "'sections' must be an array", "sections"));

    if (errors.length === 0) {
      const sections = obj.sections as Array<Record<string, unknown>>;
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i]!;
        if (!section.label || typeof section.label !== "string")
          errors.push(err("MISSING_FIELD", "Each section must have a string 'label'", `sections[${i}].label`));
        if (!Array.isArray(section.tasks))
          errors.push(err("MISSING_FIELD", `Section '${section.label}' must have a 'tasks' array`, `sections[${i}].tasks`));
        else {
          const tasks = section.tasks as Array<Record<string, unknown>>;
          for (let j = 0; j < tasks.length; j++) {
            const task = tasks[j]!;
            if (!task.id || typeof task.id !== "string")
              errors.push(err("MISSING_FIELD", "Each task must have a string 'id'", `sections[${i}].tasks[${j}].id`));
            if (!task.label || typeof task.label !== "string")
              errors.push(err("MISSING_FIELD", `Task '${task.id}' must have a string 'label'`, `sections[${i}].tasks[${j}].label`));
            if (typeof task.score !== "number")
              errors.push(err("MISSING_FIELD", `Task '${task.id}' must have a number 'score'`, `sections[${i}].tasks[${j}].score`));
          }
        }
      }
    }
  } else if (obj.type === "xychart") {
    if (!Array.isArray(obj.xAxis))
      errors.push(err("MISSING_FIELD", "'xAxis' must be an array of strings", "xAxis"));
    if (!Array.isArray(obj.series))
      errors.push(err("MISSING_FIELD", "'series' must be an array", "series"));

    if (errors.length === 0) {
      const series = obj.series as Array<Record<string, unknown>>;
      for (let i = 0; i < series.length; i++) {
        const s = series[i]!;
        if (!s.label || typeof s.label !== "string")
          errors.push(err("MISSING_FIELD", "Each series must have a string 'label'", `series[${i}].label`));
        if (!s.type || typeof s.type !== "string")
          errors.push(err("MISSING_FIELD", "Each series must have a string 'type'", `series[${i}].type`));
        if (s.type && typeof s.type === "string" && !VALID_XY_SERIES_TYPES.has(s.type as string))
          errors.push(err("INVALID_ENUM", `Invalid series type: '${s.type}'. Must be 'line' or 'bar'`, `series[${i}].type`));
        if (!Array.isArray(s.data))
          errors.push(err("MISSING_FIELD", `Series '${s.label}' must have a 'data' array of numbers`, `series[${i}].data`));
      }
    }
  } else if (obj.type === "radar") {
    if (!Array.isArray(obj.axes))
      errors.push(err("MISSING_FIELD", "'axes' must be an array of strings", "axes"));
    if (!Array.isArray(obj.series))
      errors.push(err("MISSING_FIELD", "'series' must be an array", "series"));

    if (errors.length === 0) {
      const axes = obj.axes as string[];
      const series = obj.series as Array<Record<string, unknown>>;
      for (let i = 0; i < series.length; i++) {
        const s = series[i]!;
        if (!s.label || typeof s.label !== "string")
          errors.push(err("MISSING_FIELD", "Each series must have a string 'label'", `series[${i}].label`));
        if (!Array.isArray(s.values))
          errors.push(err("MISSING_FIELD", `Series '${s.label}' must have a 'values' array`, `series[${i}].values`));
        else if ((s.values as number[]).length !== axes.length)
          errors.push(err("INVALID_FIELD", `Series '${s.label}' values length must match axes count (${axes.length})`, `series[${i}].values`));
      }
    }
  } else if (obj.type === "treemap") {
    if (!obj.root || typeof obj.root !== "object")
      errors.push(err("MISSING_FIELD", "'root' must be an object", "root"));

    if (errors.length === 0) {
      const root = obj.root as Record<string, unknown>;
      if (!root.label || typeof root.label !== "string")
        errors.push(err("MISSING_FIELD", "root must have a string 'label'", "root.label"));
      if (!Array.isArray(root.children))
        errors.push(err("MISSING_FIELD", "root must have a 'children' array", "root.children"));
    }
  } else if (obj.type === "venn") {
    if (!Array.isArray(obj.sets))
      errors.push(err("MISSING_FIELD", "'sets' must be an array", "sets"));

    if (errors.length === 0) {
      const sets = obj.sets as Array<Record<string, unknown>>;
      const setIds = new Set<string>();

      for (let i = 0; i < sets.length; i++) {
        const s = sets[i]!;
        if (!s.id || typeof s.id !== "string")
          errors.push(err("MISSING_FIELD", "Each set must have a string 'id'", `sets[${i}].id`));
        if (!s.label || typeof s.label !== "string")
          errors.push(err("MISSING_FIELD", `Set '${s.id}' must have a string 'label'`, `sets[${i}].label`));
        if (typeof s.value !== "number")
          errors.push(err("MISSING_FIELD", `Set '${s.id}' must have a number 'value'`, `sets[${i}].value`));
        if (s.id && typeof s.id === "string") {
          if (setIds.has(s.id as string))
            errors.push(err("DUPLICATE_ID", `Duplicate set id: '${s.id}'`, `sets[${i}].id`));
          setIds.add(s.id as string);
        }
      }

      if (Array.isArray(obj.intersections)) {
        const intersections = obj.intersections as Array<Record<string, unknown>>;
        for (let i = 0; i < intersections.length; i++) {
          const inter = intersections[i]!;
          if (!Array.isArray(inter.sets))
            errors.push(err("MISSING_FIELD", "Each intersection must have a 'sets' array", `intersections[${i}].sets`));
          else {
            const interSets = inter.sets as string[];
            for (let j = 0; j < interSets.length; j++) {
              if (!setIds.has(interSets[j]!))
                errors.push(err("UNKNOWN_REFERENCE", `Intersection references unknown set: '${interSets[j]}'`, `intersections[${i}].sets[${j}]`));
            }
          }
          if (typeof inter.value !== "number")
            errors.push(err("MISSING_FIELD", "Each intersection must have a number 'value'", `intersections[${i}].value`));
        }
      }
    }
  } else {
    errors.push(err("UNKNOWN_TYPE", `Unknown diagram type: '${obj.type}'`, "type"));
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data: input as SirenSchema };
}
