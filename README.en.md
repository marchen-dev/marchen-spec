[中文](./README.md)

# MarchenSpec

Spec-driven workflow CLI for AI coding agents.

[![npm version](https://img.shields.io/npm/v/marchen-spec)](https://www.npmjs.com/package/marchen-spec)

## Why

AI writes code fast, but tends to jump straight into implementation. MarchenSpec adds a thinking layer:

- Write a **proposal** to clarify motivation and scope
- Define **specs** with requirements and acceptance criteria
- Create a **design** for the technical approach
- Break it into **tasks** for step-by-step implementation

Every step produces an artifact — traceable, reviewable, and reusable.

## Quick Start

```bash
npm install -g marchen-spec

# Initialize in your project root, pick your AI tools
marchen init
```

`marchen init` lets you choose which AI coding tools to integrate, then generates the corresponding skill files. After initialization, use the skills directly in your tool:

```bash
# Explore ideas, clarify your thinking
marchen:explore I want to add dark mode

# Lightweight — all-in-one: create → implement → archive
marchen:lite

# Full mode — for complex features, step by step
marchen:propose          # Generate proposal → specs → design → tasks
marchen:apply            # Implement tasks one by one
marchen:archive          # Archive when done
```

## Supported AI Tools

* Claude Code
* Codex
* Cursor
* Windsurf
* GitHub Copilot
* Gemini CLI
* Kiro
* OpenCode
* Kilo Code
* Antigravity

You can select multiple tools during `marchen init`. All tools share the same SKILL.md content.

## Two Schemas

| Schema | Flow | Use Case |
|--------|------|----------|
| `full` (default) | proposal → specs → design → tasks | New features, architecture changes |
| `lite` | tasks (with context section) | Bug fixes, small changes, quick iterations |

```bash
marchen new add-dark-mode              # full schema
marchen new fix-typo --schema lite     # lite schema
```

## CLI Commands

```bash
marchen init                              # Initialize workspace, choose AI tool integrations
marchen new <name> [--schema full|lite]   # Create a change
marchen list [--json]                     # List all open changes
marchen status <name> [--json]            # View artifact status and workflow suggestions
marchen instructions <name> <artifact>    # Get artifact creation instructions (JSON)
marchen archive <name> [--summary <text>] # Archive change and write to changelog
marchen update                            # Update skill/command files to latest version
marchen search <query> [--rebuild]        # Search archived change history
```

## Search

MarchenSpec includes Hybrid Search (BM25 + vector retrieval + reranking) for retrieving relevant design decisions and change records from your archive history.

```bash
marchen search "user auth"                # Search across archives
marchen search "refactor" -n 10           # Specify result count
marchen search "auth" --min-score 0.5     # Set minimum score threshold
marchen search "auth" --rebuild           # Rebuild index before searching
```

You can enable search during `marchen init`, which downloads the required models (~2GB). When search is not enabled, AI skills automatically fall back to reading changelog.md for historical context.

The explore and apply skills also leverage search to automatically retrieve relevant history as context during workflows.

## Updating

After upgrading marchen-spec, run update to sync skill files:

```bash
npm install -g marchen-spec@latest
marchen update
```

## Workspace Layout

```
marchen/
├── changes/          # Active changes
│   └── add-user-auth/
│       ├── .metadata.yaml
│       ├── proposal.md
│       ├── specs/
│       ├── design.md
│       └── tasks.md
├── archive/          # Archived changes
├── changelog.md      # Change history index
└── config.yaml       # Configuration (includes provider selection)
```

Archiving a change automatically appends an entry to `changelog.md`, providing a structured change history for the project.

## Development

pnpm monorepo with Turborepo orchestration:

```
apps/cli          CLI entry (commander + @clack/prompts)
packages/core     Business logic (Workspace + ChangeManager)
packages/config   Schema definitions, templates, provider registry
packages/fs       File system operations
packages/shared   Shared types, constants
```

```bash
pnpm install      # Install dependencies
pnpm build        # Build all packages
pnpm dev          # Watch mode
pnpm test         # Run tests
pnpm check        # lint + typecheck + test
```

## Acknowledgments

The spec-driven workflow design is inspired by [OpenSpec](https://github.com/Fission-AI/OpenSpec).

## License

MIT
