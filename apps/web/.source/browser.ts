// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"architecture.mdx": () => import("../content/docs/architecture.mdx?collection=docs"), "block.mdx": () => import("../content/docs/block.mdx?collection=docs"), "c4.mdx": () => import("../content/docs/c4.mdx?collection=docs"), "class.mdx": () => import("../content/docs/class.mdx?collection=docs"), "er.mdx": () => import("../content/docs/er.mdx?collection=docs"), "flowchart.mdx": () => import("../content/docs/flowchart.mdx?collection=docs"), "gantt.mdx": () => import("../content/docs/gantt.mdx?collection=docs"), "gitgraph.mdx": () => import("../content/docs/gitgraph.mdx?collection=docs"), "index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "json-schema.mdx": () => import("../content/docs/json-schema.mdx?collection=docs"), "kanban.mdx": () => import("../content/docs/kanban.mdx?collection=docs"), "mindmap.mdx": () => import("../content/docs/mindmap.mdx?collection=docs"), "packet.mdx": () => import("../content/docs/packet.mdx?collection=docs"), "pie.mdx": () => import("../content/docs/pie.mdx?collection=docs"), "quadrant.mdx": () => import("../content/docs/quadrant.mdx?collection=docs"), "render-from-json.mdx": () => import("../content/docs/render-from-json.mdx?collection=docs"), "requirement.mdx": () => import("../content/docs/requirement.mdx?collection=docs"), "sankey.mdx": () => import("../content/docs/sankey.mdx?collection=docs"), "sequence.mdx": () => import("../content/docs/sequence.mdx?collection=docs"), "state.mdx": () => import("../content/docs/state.mdx?collection=docs"), "timeline.mdx": () => import("../content/docs/timeline.mdx?collection=docs"), }),
};
export default browserCollections;