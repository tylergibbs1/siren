# Siren PRD

**A JSON-native diagram system for docs, apps, and AI.**

> Mermaid simplicity, without a custom DSL.

## Summary

Siren is a diagram platform built around typed JSON, not a string-based language.

Users define a diagram as structured JSON, validate it against a schema, render it with polished defaults, edit it in a playground, and export or embed it anywhere. React Flow powers the canvas and interactivity under the hood, but it is not the product story. The product story is simple authoring, reliable rendering, and portability across developer, documentation, and AI workflows.

Siren exists to be a better Mermaid:

- More reliable than string parsing
- Easier for LLMs to generate
- Easier to validate and debug
- More interactive and themeable
- Better suited for modern React and MDX ecosystems

## Problem

Teams need diagrams for architecture, flows, systems, data models, and process documentation. Today they usually choose between bad tradeoffs:

- Mermaid is easy to start with, but it is built around a custom DSL with weak errors, limited composability, and brittle layout at scale.
- React Flow is powerful, but low-level. It gives you a canvas, not ready-made diagrams.
- Enterprise tools like GoJS and JointJS+ are expensive and not designed around modern React workflows.
- Archived projects like Reaflow prove demand for higher-level React diagraming, but do not solve portability or authoring for docs and AI.

The gap is a free, open-source, JSON-first diagram system that is:

- easy to author
- easy to validate
- easy to render
- easy to share and embed
- good for both humans and LLMs

## Product Thesis

Siren should not invent a new diagram language.

The canonical Siren format is typed JSON. Everything else is built around it:

- the renderer consumes it
- the playground edits it
- the validator checks it
- AI systems generate it
- exports and embeds derive from it

This avoids the main Mermaid trap: once you invent a DSL, you own a parser, compiler, syntax design, error surface, documentation burden, and endless edge cases.

JSON gives Siren:

- schema validation
- precise errors
- predictable AI generation
- visual editor round-tripping
- portability across runtimes
- no new language to teach

## Positioning

**Positioning statement**

Siren is a modern diagram system for docs, apps, and AI. It gives you Mermaid-like simplicity using typed JSON, with better rendering, better validation, better defaults, and a better authoring experience.

**Category**

Siren is not a charting library and not a React Flow replacement. It is a diagram system built on top of React Flow.

**Core comparison**

- Mermaid: simple authoring, weak structure and limited interactivity
- React Flow: powerful primitives, no diagram abstraction
- Siren: typed diagram format plus polished rendering and tooling

## Goals

### Primary goals

- Make it trivial to go from structured input to a polished diagram
- Make JSON the best format for diagram authoring and generation
- Ship high-quality presets for common diagram types
- Provide a free web playground for authoring, previewing, exporting, and sharing diagrams
- Support LLM workflows with strong schema validation and deterministic rendering

### Non-goals

- Replacing React Flow as a general-purpose node canvas
- Inventing a new DSL
- Competing with charting libraries like Recharts or Chart.js
- Becoming a full enterprise diagram editor in v1

## Users

### Primary

Developers who need to create diagrams quickly for docs, architecture, flows, and system explanations.

### Secondary

Teams collaborating on diagrams in shared documentation or a hosted playground.

### Tertiary

AI agents and toolchains that need a reliable structured output format for diagrams.

## Product

Siren has four layers.

### 1. Canonical schema

`@siren/schema` defines the Siren document format.

Responsibilities:

- JSON schema for each supported diagram type
- runtime validation
- typed errors
- versioning

This is the product core.

### 2. Renderer

The Siren renderer turns validated JSON into diagrams.

Responsibilities:

- layout
- node and edge rendering
- theme support
- exportable rendering surface

React Flow is the canvas implementation. Users benefit from that, but do not need to think about it.

### 3. Playground

The web playground is a core distribution and authoring surface.

Responsibilities:

- JSON editor with validation
- live preview
- template gallery
- export
- sharing

Visual editing can come later, but the initial product must make JSON authoring fast and approachable.

### 4. Framework bindings

React bindings make Siren easy to adopt in product code and MDX.

Responsibilities:

- render Siren documents in React apps
- expose convenience APIs for preset composition
- integrate with existing React and docs workflows

React is an important surface, but not the canonical source of truth.

## Core use cases

### Documentation

A developer writes or generates a Siren JSON document and renders it in docs, MDX, or a hosted embed.

### Application UI

A product team renders Siren diagrams inside an internal tool or customer-facing application.

### AI generation

An LLM produces a Siren JSON document, validates it, and renders it without custom parsing logic.

### Sharing

A user creates a diagram in the playground and shares a live link, embed, SVG, or PNG.

## V1 scope

### Must-have

- JSON schema and validation
- Flowchart preset
- Sequence preset
- Architecture preset
- ER preset
- React renderer
- Next.js playground with JSON editor and live preview
- Theme support
- SVG and PNG export
- Shareable playground URLs

### Nice-to-have after V1

- Visual editing mode
- Timeline
- Mind map
- Git graph
- Static CLI export
- ESLint plugin
- Doctor CLI

### Explicitly deferred

- Custom Siren language
- Full multiplayer collaboration
- Enterprise workflow editor features
- Rebuilding canvas primitives from scratch

## Diagram presets

The initial preset set should focus on the diagrams with the clearest demand and simplest value story.

### Flowchart

Use for process flows, decision trees, and operational runbooks.

### Sequence

Use for API flows, system interactions, and request-response narratives.

### Architecture

Use for service topology, system boundaries, and infrastructure explanations.

### ER

Use for data models, schema communication, and backend documentation.

These four are enough for the initial product to feel real.

## Authoring model

Siren is JSON-first.

Example:

```json
{
  "type": "flowchart",
  "direction": "TB",
  "nodes": [
    { "id": "start", "label": "Start" },
    { "id": "review", "label": "Review request", "shape": "diamond" },
    { "id": "approve", "label": "Approve", "variant": "success" },
    { "id": "reject", "label": "Reject", "variant": "danger" }
  ],
  "edges": [
    { "from": "start", "to": "review" },
    { "from": "review", "to": "approve", "label": "yes" },
    { "from": "review", "to": "reject", "label": "no" }
  ]
}
```

Optional React APIs can exist for developer ergonomics, but they are wrappers around the underlying Siren document model, not the source of truth.

## Why JSON instead of a DSL

### Better for AI

LLMs generate structured JSON more reliably than custom textual syntaxes.

### Better for validation

JSON schema and typed runtime validation produce useful errors without writing a parser.

### Better for tooling

A visual editor can read and write the same structured representation without lossy translation.

### Better for interoperability

JSON works across web apps, backend services, CI pipelines, and static export tools.

## Technical architecture

### Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Runtime | Bun | fast installs and workspace tooling |
| Language | TypeScript strict mode | strong library ergonomics |
| Canvas | React Flow | mature React canvas and interaction layer |
| Layout | ELK.js | strong automatic layout for graph structures |
| Playground | Next.js + Monaco | strong browser authoring environment |
| Styling | Tailwind CSS + CSS variables | themeable defaults |
| Docs | Fumadocs | MDX-native documentation |
| Testing | Bun test + Playwright | unit and visual coverage |

### Key architectural decisions

- React Flow is an implementation dependency, not the headline product
- Siren documents are the canonical representation
- Layout is a renderer concern, not something users configure first
- Validation happens before rendering whenever possible
- Presets define conventions so users do not need to understand graph layout engines

## Playground

The playground is central because Mermaid’s biggest advantage is immediacy.

### V1 playground requirements

- preloaded examples
- JSON editor with validation
- live preview
- copy JSON
- copy embed snippet
- download SVG
- download PNG
- shareable URLs

### V2 playground opportunities

- visual editing mode
- side panel property editor
- server-backed persistence for large diagrams
- forkable public examples

The V1 playground should optimize for a fast `open -> edit -> export -> share` loop.

## React integration

React should be excellent, but it should support the JSON-first strategy instead of replacing it.

### React use cases

- render a Siren JSON document directly
- embed diagrams in product UI
- embed diagrams in MDX and docs
- use convenience preset components where that improves ergonomics

### Important constraint

Do not let the React API become the only serious way to author Siren diagrams. That would narrow the product back down to a React library and lose the Mermaid replacement opportunity.

## LLM strategy

This is one of Siren’s strongest advantages.

### Requirements

- published schema for each preset
- validation with precise error reporting
- deterministic JSON-to-render pipeline
- examples optimized for AI generation

### Why it matters

If AI systems can generate valid Siren diagrams reliably, Siren becomes the default render target for architecture and flow visualizations in AI-assisted workflows.

## Success metrics

- Under 2 minutes from opening the playground to exporting a first diagram
- High schema validity rate for AI-generated diagrams
- Strong adoption of the playground as an acquisition surface
- Strong adoption of `@siren/schema` and renderer packages in React/MDX environments
- Clear preference over Mermaid for teams already using modern docs and React stacks

## Risks

### Scope creep

Trying to ship a library, full visual editor, hosted collaboration product, export platform, CLI, and ecosystem tools all at once will slow the core product down.

### React-first drift

If Siren is framed primarily as a React component library, it will not replace Mermaid broadly. It will only serve React teams.

### Layout expectations

Users will compare layout quality directly against Mermaid. Siren must be noticeably more reliable on non-trivial diagrams.

### Authoring friction

Raw JSON is more structured than Mermaid, but also more verbose. Templates, schema-aware editing, and strong playground UX are mandatory.

## Roadmap

### Phase 1

- `@siren/schema`
- Flowchart and Sequence presets
- React renderer
- playground with JSON editing and live preview
- export to SVG and PNG

### Phase 2

- Architecture and ER presets
- shareable URLs
- theming polish
- embedding support
- stronger AI examples and validation flows

### Phase 3

- visual editing mode
- additional presets
- static export tooling
- diagnostics and linting tools

## Product principle

Siren should win because it makes diagrams easier to author, easier to validate, and easier to ship.

Not because it invents a new syntax.

## One-line definition

Siren is a JSON-native diagram system that makes Mermaid-style authoring more reliable, more interactive, and more useful for modern docs, apps, and AI.
