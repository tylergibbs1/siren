# Siren

**A React-native diagramming library that doesn't fight you.**

> Mermaid made text-to-diagram possible. Siren makes it good.

---

## Why Siren

Mermaid proved there's massive demand for diagrams-as-code. But it's a string parser that outputs static SVG. Siren is a React component library — nodes are real DOM elements, edges are SVG, and the layout engine actually works.

- **Layout engine that works.** Hierarchical, force-directed, and grid layouts. No overlapping labels, no crossed edges.
- **React-native.** Nodes are real DOM. Put anything inside them — Radix UI, Recharts, images, forms.
- **TypeScript all the way down.** Full type safety on every prop. Your editor catches mistakes before the browser.
- **Interactive by default.** Click handlers, zoom, pan, selection, collapsible groups, animated edges.
- **Composable.** Small, focused components you combine however you want.

```tsx
import { Diagram, Node, Edge } from '@siren/react'

function DeploymentFlow() {
  return (
    <Diagram direction="TB" spacing={24}>
      <Node id="build" label="Build" />
      <Node id="test" label="Test Suite" />
      <Node id="stage" label="Staging" variant="warning" />
      <Node id="prod" label="Production" variant="success" />

      <Edge from="build" to="test" />
      <Edge from="test" to="stage" label="on main" />
      <Edge from="stage" to="prod" animated dashed />
    </Diagram>
  )
}
```

---

## Packages

| Package | Description |
|---------|-------------|
| `@siren/core` | Graph data structures, layout engine, base types |
| `@siren/react` | React components — Diagram, Node, Edge, Group, SirenProvider |
| `@siren/schema` | JSON schema + `validate()` for LLM generation |
| `@siren/layouts` | Layout algorithms — force-directed, grid |
| `@siren/themes` | Pre-built themes — light, dark, github, presentation |
| `@siren/presets` | High-level diagram types — Flowchart, Sequence |

---

## Components

### `<Diagram>`

Root container. Handles layout, zoom, pan, and selection.

```tsx
<Diagram
  layout="dagre"        // "dagre" | "force" | "grid" | "manual"
  direction="TB"        // "TB" | "BT" | "LR" | "RL"
  zoom={{ min: 0.1, max: 4, controls: true }}
  spacing={24}
>
  {children}
</Diagram>
```

### `<Node>`

A single node. Real DOM element — put anything inside it.

```tsx
<Node
  id="api"
  label="API Gateway"
  variant="primary"       // default | primary | success | warning | danger | ghost
  shape="rounded"         // rectangle | rounded | diamond | circle | hexagon | pill | cylinder
  icon={<Server />}
  badge="3"
  selectable
  draggable
>
  <Sparkline data={requests} />
</Node>
```

### `<Edge>`

Connects two nodes.

```tsx
<Edge
  from="api"
  to="database"
  label="queries"
  type="bezier"           // bezier | straight | step | smoothstep
  animated
  dashed
  bidirectional
/>
```

### `<Group>`

Visually groups nodes with a labeled container.

```tsx
<Group id="backend" label="Backend Services" collapsible>
  <Node id="api" label="API" />
  <Node id="auth" label="Auth" />
</Group>
```

---

## Presets

### Flowchart

```tsx
import { Flowchart } from '@siren/presets'
import { Edge } from '@siren/react'

<Flowchart direction="TB">
  <Flowchart.Step id="start" label="User signs up" />
  <Flowchart.Decision id="verify" label="Email verified?" />
  <Flowchart.Step id="onboard" label="Onboarding" />
  <Flowchart.Step id="remind" label="Send reminder" />

  <Edge from="start" to="verify" />
  <Edge from="verify" to="onboard" label="yes" />
  <Edge from="verify" to="remind" label="no" />
</Flowchart>
```

### Sequence

```tsx
import { Sequence } from '@siren/presets'

<Sequence>
  <Sequence.Actor id="user" label="User" />
  <Sequence.Actor id="api" label="API" />
  <Sequence.Actor id="db" label="Database" />

  <Sequence.Message from="user" to="api" label="POST /login" />
  <Sequence.Message from="api" to="db" label="SELECT user" />
  <Sequence.Message from="db" to="api" label="user record" dashed />
  <Sequence.Message from="api" to="user" label="200 OK" dashed />
</Sequence>
```

---

## Themes

Four built-in themes. Pass to `<SirenProvider>` or directly to `<Diagram>`.

```tsx
import { SirenProvider, themes } from '@siren/react'

<SirenProvider theme="dark">
  <Diagram>...</Diagram>
</SirenProvider>

// Or a custom theme
<SirenProvider theme={{
  name: 'custom',
  colors: {
    background: '#0a0a0a',
    node: '#1e1e2e',
    nodeBorder: '#313244',
    edge: '#6c7086',
    text: '#cdd6f4',
    textMuted: '#a6adc8',
    primary: '#89b4fa',
    success: '#a6e3a1',
    warning: '#f9e2af',
    danger: '#f38ba8',
    groupBackground: '#181825',
    groupBorder: '#313244',
    selection: '#89b4fa',
  },
  radius: '8px',
  fontFamily: 'Inter, system-ui, sans-serif',
}}>
```

| Theme | Description |
|-------|-------------|
| `light` | Clean light mode |
| `dark` | Catppuccin-inspired dark mode |
| `github` | Matches GitHub's markdown style |
| `presentation` | High contrast, larger text, good for slides |

---

## LLM Generation

Siren is designed as an LLM target. JSX is more reliable than custom DSLs — models are trained on massive amounts of React code.

```ts
import { validate } from '@siren/schema'
import { fromJSON } from '@siren/react'

const result = validate(llmOutput)
if (result.valid) {
  const diagram = fromJSON(result.data)
  // Returns a valid React element tree
}
```

`@siren/schema` exports a JSON schema for structured output:

```ts
import { diagramJsonSchema } from '@siren/schema'
// Pass to OpenAI/Anthropic function calling or JSON mode
```

---

## Layout Engines

| Algorithm | Best for | Description |
|-----------|----------|-------------|
| `dagre` (default) | Flowcharts, trees, DAGs | Hierarchical layout with layer assignment and crossing minimization |
| `force` | Networks, clusters | Force-directed simulation — connected nodes attract, all nodes repel |
| `grid` | Galleries, icon grids | Arranges nodes in a uniform grid |
| `manual` | Full control | You set positions, engine does nothing |

---

## Project Structure

```
siren/
├── packages/
│   ├── core/          # Graph, layout engine, types
│   ├── react/         # React components
│   ├── schema/        # JSON schema + validation
│   ├── layouts/       # Force, grid algorithms
│   ├── themes/        # Built-in themes
│   └── presets/       # Flowchart, Sequence
├── turbo.json
├── bunfig.toml
└── package.json
```

**Tech stack:** Bun, TypeScript (strict), React 18+, tsup, Turborepo.

---

## Development

```bash
# Install
bun install

# Build all packages
bun run build

# Run tests
bun test --recursive packages/

# Dev mode (watch)
bun run dev
```

---

## License

MIT
