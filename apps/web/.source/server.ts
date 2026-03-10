// @ts-nocheck
import * as __fd_glob_22 from "../content/docs/timeline.mdx?collection=docs"
import * as __fd_glob_21 from "../content/docs/theming.mdx?collection=docs"
import * as __fd_glob_20 from "../content/docs/state.mdx?collection=docs"
import * as __fd_glob_19 from "../content/docs/sequence.mdx?collection=docs"
import * as __fd_glob_18 from "../content/docs/sankey.mdx?collection=docs"
import * as __fd_glob_17 from "../content/docs/requirement.mdx?collection=docs"
import * as __fd_glob_16 from "../content/docs/render-from-json.mdx?collection=docs"
import * as __fd_glob_15 from "../content/docs/quadrant.mdx?collection=docs"
import * as __fd_glob_14 from "../content/docs/pie.mdx?collection=docs"
import * as __fd_glob_13 from "../content/docs/packet.mdx?collection=docs"
import * as __fd_glob_12 from "../content/docs/mindmap.mdx?collection=docs"
import * as __fd_glob_11 from "../content/docs/kanban.mdx?collection=docs"
import * as __fd_glob_10 from "../content/docs/json-schema.mdx?collection=docs"
import * as __fd_glob_9 from "../content/docs/index.mdx?collection=docs"
import * as __fd_glob_8 from "../content/docs/gitgraph.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/gantt.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/flowchart.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/er.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/class.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/c4.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/block.mdx?collection=docs"
import * as __fd_glob_1 from "../content/docs/architecture.mdx?collection=docs"
import { default as __fd_glob_0 } from "../content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {"meta.json": __fd_glob_0, }, {"architecture.mdx": __fd_glob_1, "block.mdx": __fd_glob_2, "c4.mdx": __fd_glob_3, "class.mdx": __fd_glob_4, "er.mdx": __fd_glob_5, "flowchart.mdx": __fd_glob_6, "gantt.mdx": __fd_glob_7, "gitgraph.mdx": __fd_glob_8, "index.mdx": __fd_glob_9, "json-schema.mdx": __fd_glob_10, "kanban.mdx": __fd_glob_11, "mindmap.mdx": __fd_glob_12, "packet.mdx": __fd_glob_13, "pie.mdx": __fd_glob_14, "quadrant.mdx": __fd_glob_15, "render-from-json.mdx": __fd_glob_16, "requirement.mdx": __fd_glob_17, "sankey.mdx": __fd_glob_18, "sequence.mdx": __fd_glob_19, "state.mdx": __fd_glob_20, "theming.mdx": __fd_glob_21, "timeline.mdx": __fd_glob_22, });