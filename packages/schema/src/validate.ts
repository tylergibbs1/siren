import type { SirenSchema, ValidationResult } from "./types";

const VALID_DIRECTIONS = new Set(["TB", "BT", "LR", "RL"]);
function validateDirection(obj: Record<string, unknown>, errors: string[]) {
  if (obj.direction !== undefined && !VALID_DIRECTIONS.has(obj.direction as string)) {
    errors.push(`Invalid direction: '${obj.direction}'. Must be TB, BT, LR, or RL`);
  }
}

const VALID_CLASS_REL_TYPES = new Set(["inheritance", "composition", "aggregation", "association", "dependency", "realization"]);
const VALID_ER_CARDINALITIES = new Set(["1:1", "1:N", "N:1", "M:N"]);
const VALID_REQ_REL_TYPES = new Set(["traces", "derives", "satisfies", "verifies", "refines", "contains"]);
const VALID_C4_ELEMENT_TYPES = new Set(["person", "system", "boundary"]);

function validateMindmapNode(node: Record<string, unknown>, errors: string[], path: string) {
  if (!node.id || typeof node.id !== "string") errors.push(`${path}: missing string 'id'`);
  if (!node.label || typeof node.label !== "string") errors.push(`${path}: missing string 'label'`);
  if (node.children && Array.isArray(node.children)) {
    for (let i = 0; i < node.children.length; i++) {
      validateMindmapNode(node.children[i] as Record<string, unknown>, errors, `${path}.children[${i}]`);
    }
  }
}

export function validate(input: unknown): ValidationResult {
  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Input must be an object"] };
  }

  const obj = input as Record<string, unknown>;
  const errors: string[] = [];

  if (!obj.type || typeof obj.type !== "string") {
    return { valid: false, errors: ["Missing or invalid 'type' field"] };
  }

  if (obj.type === "flowchart") {
    validateDirection(obj, errors);
    if (!Array.isArray(obj.nodes)) errors.push("'nodes' must be an array");
    if (!Array.isArray(obj.edges)) errors.push("'edges' must be an array");

    if (errors.length === 0) {
      const nodes = obj.nodes as Array<Record<string, unknown>>;
      const nodeIds = new Set<string>();

      for (const node of nodes) {
        if (!node.id || typeof node.id !== "string")
          errors.push("Each node must have a string 'id'");
        if (!node.label || typeof node.label !== "string")
          errors.push(`Node '${node.id}' must have a string 'label'`);
        if (nodeIds.has(node.id as string))
          errors.push(`Duplicate node id: '${node.id}'`);
        nodeIds.add(node.id as string);
      }

      const edges = obj.edges as Array<Record<string, unknown>>;
      for (const edge of edges) {
        if (!edge.from || typeof edge.from !== "string")
          errors.push("Each edge must have a string 'from'");
        if (!edge.to || typeof edge.to !== "string")
          errors.push("Each edge must have a string 'to'");
        if (edge.from && !nodeIds.has(edge.from as string))
          errors.push(`Edge references unknown node: '${edge.from}'`);
        if (edge.to && !nodeIds.has(edge.to as string))
          errors.push(`Edge references unknown node: '${edge.to}'`);
      }
    }
  } else if (obj.type === "sequence") {
    if (!Array.isArray(obj.actors)) errors.push("'actors' must be an array");
    if (!Array.isArray(obj.messages))
      errors.push("'messages' must be an array");

    if (errors.length === 0) {
      const actors = obj.actors as Array<Record<string, unknown>>;
      const actorIds = new Set<string>();

      for (const actor of actors) {
        if (!actor.id || typeof actor.id !== "string")
          errors.push("Each actor must have a string 'id'");
        if (!actor.label || typeof actor.label !== "string")
          errors.push(`Actor '${actor.id}' must have a string 'label'`);
        actorIds.add(actor.id as string);
      }

      const messages = obj.messages as Array<Record<string, unknown>>;
      for (const msg of messages) {
        if (!msg.from || !actorIds.has(msg.from as string))
          errors.push(`Message references unknown actor: '${msg.from}'`);
        if (!msg.to || !actorIds.has(msg.to as string))
          errors.push(`Message references unknown actor: '${msg.to}'`);
      }
    }
  } else if (obj.type === "state") {
    validateDirection(obj, errors);
    if (!Array.isArray(obj.states)) errors.push("'states' must be an array");
    if (!Array.isArray(obj.transitions))
      errors.push("'transitions' must be an array");

    if (errors.length === 0) {
      const states = obj.states as Array<Record<string, unknown>>;
      const stateIds = new Set<string>();

      for (const state of states) {
        if (!state.id || typeof state.id !== "string")
          errors.push("Each state must have a string 'id'");
        if (typeof state.label !== "string")
          errors.push(`State '${state.id}' must have a string 'label'`);
        if (stateIds.has(state.id as string))
          errors.push(`Duplicate state id: '${state.id}'`);
        stateIds.add(state.id as string);
      }

      const transitions = obj.transitions as Array<Record<string, unknown>>;
      for (const t of transitions) {
        if (!t.from || typeof t.from !== "string")
          errors.push("Each transition must have a string 'from'");
        if (!t.to || typeof t.to !== "string")
          errors.push("Each transition must have a string 'to'");
        if (t.from && !stateIds.has(t.from as string))
          errors.push(`Transition references unknown state: '${t.from}'`);
        if (t.to && !stateIds.has(t.to as string))
          errors.push(`Transition references unknown state: '${t.to}'`);
      }
    }
  } else if (obj.type === "class") {
    validateDirection(obj, errors);
    if (!Array.isArray(obj.classes)) errors.push("'classes' must be an array");
    if (!Array.isArray(obj.relationships))
      errors.push("'relationships' must be an array");

    if (errors.length === 0) {
      const classes = obj.classes as Array<Record<string, unknown>>;
      const classIds = new Set<string>();

      for (const cls of classes) {
        if (!cls.id || typeof cls.id !== "string")
          errors.push("Each class must have a string 'id'");
        if (!cls.name || typeof cls.name !== "string")
          errors.push(`Class '${cls.id}' must have a string 'name'`);
        if (classIds.has(cls.id as string))
          errors.push(`Duplicate class id: '${cls.id}'`);
        classIds.add(cls.id as string);
      }

      const rels = obj.relationships as Array<Record<string, unknown>>;
      for (const rel of rels) {
        if (!rel.from || typeof rel.from !== "string")
          errors.push("Each relationship must have a string 'from'");
        if (!rel.to || typeof rel.to !== "string")
          errors.push("Each relationship must have a string 'to'");
        if (!rel.type || typeof rel.type !== "string")
          errors.push("Each relationship must have a string 'type'");
        if (rel.from && !classIds.has(rel.from as string))
          errors.push(`Relationship references unknown class: '${rel.from}'`);
        if (rel.to && !classIds.has(rel.to as string))
          errors.push(`Relationship references unknown class: '${rel.to}'`);
        if (rel.type && typeof rel.type === "string" && !VALID_CLASS_REL_TYPES.has(rel.type as string))
          errors.push(`Invalid class relationship type: '${rel.type}'. Must be one of: ${[...VALID_CLASS_REL_TYPES].join(", ")}`);
      }
    }
  } else if (obj.type === "er") {
    validateDirection(obj, errors);
    if (!Array.isArray(obj.entities))
      errors.push("'entities' must be an array");
    if (!Array.isArray(obj.relationships))
      errors.push("'relationships' must be an array");

    if (errors.length === 0) {
      const entities = obj.entities as Array<Record<string, unknown>>;
      const entityIds = new Set<string>();

      for (const entity of entities) {
        if (!entity.id || typeof entity.id !== "string")
          errors.push("Each entity must have a string 'id'");
        if (!entity.name || typeof entity.name !== "string")
          errors.push(`Entity '${entity.id}' must have a string 'name'`);
        if (!Array.isArray(entity.columns))
          errors.push(`Entity '${entity.id}' must have a 'columns' array`);
        if (entityIds.has(entity.id as string))
          errors.push(`Duplicate entity id: '${entity.id}'`);
        entityIds.add(entity.id as string);
      }

      const rels = obj.relationships as Array<Record<string, unknown>>;
      for (const rel of rels) {
        if (!rel.from || typeof rel.from !== "string")
          errors.push("Each relationship must have a string 'from'");
        if (!rel.to || typeof rel.to !== "string")
          errors.push("Each relationship must have a string 'to'");
        if (!rel.cardinality || typeof rel.cardinality !== "string")
          errors.push("Each relationship must have a string 'cardinality'");
        if (rel.from && !entityIds.has(rel.from as string))
          errors.push(`Relationship references unknown entity: '${rel.from}'`);
        if (rel.to && !entityIds.has(rel.to as string))
          errors.push(`Relationship references unknown entity: '${rel.to}'`);
        if (rel.cardinality && typeof rel.cardinality === "string" && !VALID_ER_CARDINALITIES.has(rel.cardinality as string))
          errors.push(`Invalid ER cardinality: '${rel.cardinality}'. Must be one of: ${[...VALID_ER_CARDINALITIES].join(", ")}`);
      }
    }
  } else if (obj.type === "timeline") {
    if (!Array.isArray(obj.events)) errors.push("'events' must be an array");

    if (errors.length === 0) {
      const events = obj.events as Array<Record<string, unknown>>;
      for (const event of events) {
        if (!event.id || typeof event.id !== "string")
          errors.push("Each event must have a string 'id'");
        if (!event.date || typeof event.date !== "string")
          errors.push(`Event '${event.id}' must have a string 'date'`);
        if (!event.label || typeof event.label !== "string")
          errors.push(`Event '${event.id}' must have a string 'label'`);
      }
    }
  } else if (obj.type === "kanban") {
    if (!Array.isArray(obj.columns)) errors.push("'columns' must be an array");

    if (errors.length === 0) {
      const columns = obj.columns as Array<Record<string, unknown>>;
      for (const col of columns) {
        if (!col.id || typeof col.id !== "string")
          errors.push("Each column must have a string 'id'");
        if (!col.label || typeof col.label !== "string")
          errors.push(`Column '${col.id}' must have a string 'label'`);
        if (!Array.isArray(col.cards))
          errors.push(`Column '${col.id}' must have a 'cards' array`);
        else {
          const cards = col.cards as Array<Record<string, unknown>>;
          for (const card of cards) {
            if (!card.id || typeof card.id !== "string")
              errors.push("Each card must have a string 'id'");
            if (!card.label || typeof card.label !== "string")
              errors.push(`Card '${card.id}' must have a string 'label'`);
          }
        }
      }
    }
  } else if (obj.type === "quadrant") {
    if (!Array.isArray(obj.items)) errors.push("'items' must be an array");

    if (errors.length === 0) {
      const items = obj.items as Array<Record<string, unknown>>;
      for (const item of items) {
        if (!item.id || typeof item.id !== "string")
          errors.push("Each item must have a string 'id'");
        if (!item.label || typeof item.label !== "string")
          errors.push(`Item '${item.id}' must have a string 'label'`);
        if (typeof item.x !== "number")
          errors.push(`Item '${item.id}' must have a number 'x'`);
        if (typeof item.y !== "number")
          errors.push(`Item '${item.id}' must have a number 'y'`);
      }
    }
  } else if (obj.type === "pie") {
    if (!Array.isArray(obj.segments))
      errors.push("'segments' must be an array");

    if (errors.length === 0) {
      const segments = obj.segments as Array<Record<string, unknown>>;
      for (const seg of segments) {
        if (!seg.label || typeof seg.label !== "string")
          errors.push("Each segment must have a string 'label'");
        if (typeof seg.value !== "number")
          errors.push(`Segment '${seg.label}' must have a number 'value'`);
      }
    }
  } else if (obj.type === "c4") {
    validateDirection(obj, errors);
    if (!Array.isArray(obj.elements))
      errors.push("'elements' must be an array");
    if (!Array.isArray(obj.relationships))
      errors.push("'relationships' must be an array");

    if (errors.length === 0) {
      const elements = obj.elements as Array<Record<string, unknown>>;
      const elementIds = new Set<string>();

      for (const el of elements) {
        if (!el.id || typeof el.id !== "string")
          errors.push("Each element must have a string 'id'");
        if (!el.label || typeof el.label !== "string")
          errors.push(`Element '${el.id}' must have a string 'label'`);
        if (!el.type || typeof el.type !== "string")
          errors.push(`Element '${el.id}' must have a string 'type'`);
        if (el.type && typeof el.type === "string" && !VALID_C4_ELEMENT_TYPES.has(el.type as string))
          errors.push(`Invalid C4 element type: '${el.type}'. Must be one of: ${[...VALID_C4_ELEMENT_TYPES].join(", ")}`);
        elementIds.add(el.id as string);

        if (Array.isArray(el.children)) {
          const children = el.children as Array<Record<string, unknown>>;
          for (const child of children) {
            if (!child.id || typeof child.id !== "string")
              errors.push("Each child element must have a string 'id'");
            if (!child.label || typeof child.label !== "string")
              errors.push(
                `Child element '${child.id}' must have a string 'label'`,
              );
            elementIds.add(child.id as string);
          }
        }
      }

      const rels = obj.relationships as Array<Record<string, unknown>>;
      for (const rel of rels) {
        if (!rel.from || typeof rel.from !== "string")
          errors.push("Each relationship must have a string 'from'");
        if (!rel.to || typeof rel.to !== "string")
          errors.push("Each relationship must have a string 'to'");
        if (rel.from && !elementIds.has(rel.from as string))
          errors.push(
            `Relationship references unknown element: '${rel.from}'`,
          );
        if (rel.to && !elementIds.has(rel.to as string))
          errors.push(`Relationship references unknown element: '${rel.to}'`);
      }
    }
  } else if (obj.type === "architecture") {
    validateDirection(obj, errors);
    if (!Array.isArray(obj.groups)) errors.push("'groups' must be an array");
    if (!Array.isArray(obj.connections))
      errors.push("'connections' must be an array");

    if (errors.length === 0) {
      const serviceIds = new Set<string>();

      const groups = obj.groups as Array<Record<string, unknown>>;
      for (const group of groups) {
        if (!group.id || typeof group.id !== "string")
          errors.push("Each group must have a string 'id'");
        if (!group.label || typeof group.label !== "string")
          errors.push(`Group '${group.id}' must have a string 'label'`);
        if (!Array.isArray(group.services))
          errors.push(`Group '${group.id}' must have a 'services' array`);
        else {
          const services = group.services as Array<Record<string, unknown>>;
          for (const svc of services) {
            if (!svc.id || typeof svc.id !== "string")
              errors.push("Each service must have a string 'id'");
            if (!svc.label || typeof svc.label !== "string")
              errors.push(`Service '${svc.id}' must have a string 'label'`);
            serviceIds.add(svc.id as string);
          }
        }
      }

      if (Array.isArray(obj.services)) {
        const topServices = obj.services as Array<Record<string, unknown>>;
        for (const svc of topServices) {
          if (!svc.id || typeof svc.id !== "string")
            errors.push("Each service must have a string 'id'");
          if (!svc.label || typeof svc.label !== "string")
            errors.push(`Service '${svc.id}' must have a string 'label'`);
          serviceIds.add(svc.id as string);
        }
      }

      const connections = obj.connections as Array<Record<string, unknown>>;
      for (const conn of connections) {
        if (!conn.from || typeof conn.from !== "string")
          errors.push("Each connection must have a string 'from'");
        if (!conn.to || typeof conn.to !== "string")
          errors.push("Each connection must have a string 'to'");
        if (conn.from && !serviceIds.has(conn.from as string))
          errors.push(
            `Connection references unknown service: '${conn.from}'`,
          );
        if (conn.to && !serviceIds.has(conn.to as string))
          errors.push(`Connection references unknown service: '${conn.to}'`);
      }
    }
  } else if (obj.type === "block") {
    validateDirection(obj, errors);
    if (!Array.isArray(obj.blocks)) errors.push("'blocks' must be an array");
    if (!Array.isArray(obj.connections))
      errors.push("'connections' must be an array");

    if (errors.length === 0) {
      const blockIds = new Set<string>();

      const blocks = obj.blocks as Array<Record<string, unknown>>;
      for (const block of blocks) {
        if (!block.id || typeof block.id !== "string")
          errors.push("Each block must have a string 'id'");
        if (!block.label || typeof block.label !== "string")
          errors.push(`Block '${block.id}' must have a string 'label'`);
        blockIds.add(block.id as string);

        if (Array.isArray(block.children)) {
          const children = block.children as Array<Record<string, unknown>>;
          for (const child of children) {
            if (!child.id || typeof child.id !== "string")
              errors.push("Each child block must have a string 'id'");
            if (!child.label || typeof child.label !== "string")
              errors.push(
                `Child block '${child.id}' must have a string 'label'`,
              );
            blockIds.add(child.id as string);
          }
        }
      }

      const connections = obj.connections as Array<Record<string, unknown>>;
      for (const conn of connections) {
        if (!conn.from || typeof conn.from !== "string")
          errors.push("Each connection must have a string 'from'");
        if (!conn.to || typeof conn.to !== "string")
          errors.push("Each connection must have a string 'to'");
        if (conn.from && !blockIds.has(conn.from as string))
          errors.push(`Connection references unknown block: '${conn.from}'`);
        if (conn.to && !blockIds.has(conn.to as string))
          errors.push(`Connection references unknown block: '${conn.to}'`);
      }
    }
  } else if (obj.type === "requirement") {
    validateDirection(obj, errors);
    if (!Array.isArray(obj.requirements))
      errors.push("'requirements' must be an array");
    if (!Array.isArray(obj.relationships))
      errors.push("'relationships' must be an array");

    if (errors.length === 0) {
      const reqIds = new Set<string>();

      const requirements = obj.requirements as Array<Record<string, unknown>>;
      for (const req of requirements) {
        if (!req.id || typeof req.id !== "string")
          errors.push("Each requirement must have a string 'id'");
        if (!req.label || typeof req.label !== "string")
          errors.push(`Requirement '${req.id}' must have a string 'label'`);
        if (reqIds.has(req.id as string))
          errors.push(`Duplicate requirement id: '${req.id}'`);
        reqIds.add(req.id as string);
      }

      const rels = obj.relationships as Array<Record<string, unknown>>;
      for (const rel of rels) {
        if (!rel.from || typeof rel.from !== "string")
          errors.push("Each relationship must have a string 'from'");
        if (!rel.to || typeof rel.to !== "string")
          errors.push("Each relationship must have a string 'to'");
        if (!rel.type || typeof rel.type !== "string")
          errors.push("Each relationship must have a string 'type'");
        if (rel.from && !reqIds.has(rel.from as string))
          errors.push(
            `Relationship references unknown requirement: '${rel.from}'`,
          );
        if (rel.to && !reqIds.has(rel.to as string))
          errors.push(
            `Relationship references unknown requirement: '${rel.to}'`,
          );
        if (rel.type && typeof rel.type === "string" && !VALID_REQ_REL_TYPES.has(rel.type as string))
          errors.push(`Invalid requirement relationship type: '${rel.type}'. Must be one of: ${[...VALID_REQ_REL_TYPES].join(", ")}`);
      }
    }
  } else if (obj.type === "mindmap") {
    if (!obj.root || typeof obj.root !== "object")
      errors.push("'root' must be an object");

    if (errors.length === 0) {
      const root = obj.root as Record<string, unknown>;
      validateMindmapNode(root, errors, "root");
    }
  } else if (obj.type === "gitgraph") {
    if (!Array.isArray(obj.commits))
      errors.push("'commits' must be an array");

    if (errors.length === 0) {
      const commits = obj.commits as Array<Record<string, unknown>>;
      const commitIds = new Set<string>();

      for (const commit of commits) {
        if (!commit.id || typeof commit.id !== "string")
          errors.push("Each commit must have a string 'id'");
        if (!commit.message || typeof commit.message !== "string")
          errors.push(`Commit '${commit.id}' must have a string 'message'`);
        if (!commit.branch || typeof commit.branch !== "string")
          errors.push(`Commit '${commit.id}' must have a string 'branch'`);
        if (commit.id && typeof commit.id === "string")
          commitIds.add(commit.id as string);
      }

      for (const commit of commits) {
        if (commit.parent && typeof commit.parent === "string") {
          if (!commitIds.has(commit.parent as string))
            errors.push(`Commit '${commit.id}' references unknown parent: '${commit.parent}'`);
        }
        if (Array.isArray(commit.parents)) {
          for (const parentId of commit.parents as string[]) {
            if (typeof parentId === "string" && !commitIds.has(parentId))
              errors.push(`Commit '${commit.id}' references unknown parent: '${parentId}'`);
          }
        }
      }
    }
  } else if (obj.type === "gantt") {
    if (!Array.isArray(obj.sections))
      errors.push("'sections' must be an array");

    if (errors.length === 0) {
      const sections = obj.sections as Array<Record<string, unknown>>;
      for (const section of sections) {
        if (!section.label || typeof section.label !== "string")
          errors.push("Each section must have a string 'label'");
        if (!Array.isArray(section.tasks))
          errors.push(`Section '${section.label}' must have a 'tasks' array`);
        else {
          const tasks = section.tasks as Array<Record<string, unknown>>;
          for (const task of tasks) {
            if (!task.id || typeof task.id !== "string")
              errors.push("Each task must have a string 'id'");
            if (!task.label || typeof task.label !== "string")
              errors.push(`Task '${task.id}' must have a string 'label'`);
            if (!task.start || typeof task.start !== "string")
              errors.push(`Task '${task.id}' must have a string 'start'`);
            if (!task.end || typeof task.end !== "string")
              errors.push(`Task '${task.id}' must have a string 'end'`);
          }
        }
      }
    }
  } else if (obj.type === "sankey") {
    if (!Array.isArray(obj.nodes)) errors.push("'nodes' must be an array");
    if (!Array.isArray(obj.flows)) errors.push("'flows' must be an array");

    if (errors.length === 0) {
      const nodes = obj.nodes as Array<Record<string, unknown>>;
      const nodeIds = new Set<string>();

      for (const node of nodes) {
        if (!node.id || typeof node.id !== "string")
          errors.push("Each node must have a string 'id'");
        if (!node.label || typeof node.label !== "string")
          errors.push(`Node '${node.id}' must have a string 'label'`);
        nodeIds.add(node.id as string);
      }

      const flows = obj.flows as Array<Record<string, unknown>>;
      for (const flow of flows) {
        if (!flow.from || typeof flow.from !== "string")
          errors.push("Each flow must have a string 'from'");
        if (!flow.to || typeof flow.to !== "string")
          errors.push("Each flow must have a string 'to'");
        if (typeof flow.value !== "number")
          errors.push(`Flow must have a number 'value'`);
        if (flow.from && !nodeIds.has(flow.from as string))
          errors.push(`Flow references unknown node: '${flow.from}'`);
        if (flow.to && !nodeIds.has(flow.to as string))
          errors.push(`Flow references unknown node: '${flow.to}'`);
      }
    }
  } else if (obj.type === "packet") {
    if (!Array.isArray(obj.rows)) errors.push("'rows' must be an array");

    if (errors.length === 0) {
      const rows = obj.rows as Array<Record<string, unknown>>;
      for (const row of rows) {
        if (!Array.isArray(row.fields))
          errors.push("Each row must have a 'fields' array");
        else {
          const fields = row.fields as Array<Record<string, unknown>>;
          for (const field of fields) {
            if (!field.label || typeof field.label !== "string")
              errors.push("Each field must have a string 'label'");
            if (typeof field.bits !== "number")
              errors.push(`Field '${field.label}' must have a number 'bits'`);
          }
        }
      }
    }
  } else {
    errors.push(`Unknown diagram type: '${obj.type}'`);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data: input as SirenSchema };
}
