# Siren

JSON-to-diagram renderer. Define diagrams as structured JSON, get SVG or interactive React components. No DSL to learn — just JSON.

## Packages

| Package | Description |
|---------|-------------|
| `@siren/core` | Headless SVG renderer + ELK layout engine. Zero dependencies on React or DOM. |
| `@siren/react` | React Flow-based interactive diagram component with auto-layout. |
| `@siren/presets` | Ready-to-use React components for all 18 diagram types. |
| `@siren/themes` | Theme definitions and color derivation utilities. |
| `@siren/schema` | Zod schemas for validating Siren JSON documents. |

## Diagram Types

Flowchart, Sequence, ER, Architecture, State, Class, C4, Block, Requirement, Timeline, Mindmap, Git Graph, Gantt, Sankey, Kanban, Pie, Quadrant, Packet.

## Quick Start

### Headless SVG (Node.js / Bun / Deno)

```ts
import { renderToSVG } from "@siren/core";

const svg = await renderToSVG({
  type: "flowchart",
  direction: "TB",
  nodes: [
    { id: "a", label: "Start", variant: "primary" },
    { id: "b", label: "End", variant: "success" },
  ],
  edges: [{ from: "a", to: "b" }],
});
```

### React Component

```tsx
import { Flowchart, Step, Decision, FlowEdge } from "@siren/presets";

function MyDiagram() {
  return (
    <Flowchart direction="TB">
      <Step id="start" label="User signs up" variant="primary" />
      <Decision id="verify" label="Email verified?" />
      <Step id="done" label="Active user" variant="success" />
      <FlowEdge from="start" to="verify" />
      <FlowEdge from="verify" to="done" label="yes" />
    </Flowchart>
  );
}
```

## Node Shapes

10 built-in shapes for flowcharts and architecture diagrams:

| Shape | Description | Use case |
|-------|-------------|----------|
| `rounded` | Rounded rectangle (default) | General steps |
| `diamond` | Diamond | Yes/no decisions |
| `stadium` | Pill/capsule | Terminal, I/O |
| `cylinder` | Database drum | Databases, storage |
| `hexagon` | Six-sided polygon | Preparation steps |
| `cloud` | Cloud outline | Cloud services, external systems |
| `document` | Wavy bottom rectangle | Reports, files |
| `note` | Folded corner rectangle | Annotations, comments |
| `subroutine` | Double-bordered rectangle | Sub-processes |
| `trapezoid` | Narrow top, wide bottom | Manual operations |

## Features

- **Auto-layout** via ELK.js (layered, mrtree, force, box algorithms)
- **Theming** with 5 built-in themes (dark, light, GitHub, presentation, neutral)
- **Interactive mode** with drag, zoom, pan, collision detection
- **MiniMap** for navigating large diagrams
- **Export** to SVG, PNG, and JSON
- **Accessible** with ARIA attributes on all diagram types
- **Headless SVG** rendering — no browser or DOM required

## Development

```bash
bun install
bun run dev      # Start dev server
bun run build    # Build all packages
bun run test     # Run tests
```

## Architecture

```
siren/
  packages/
    core/       # Layout engine + SVG renderer (no React)
    react/      # Base Diagram component + hooks (React Flow)
    presets/    # All 18 diagram type components
    themes/     # Theme system + color derivation
    schema/     # Zod validation schemas
  apps/
    web/        # Next.js documentation + playground
```
