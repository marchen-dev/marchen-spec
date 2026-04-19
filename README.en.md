[中文](./README.md)

# MarchenSpec

Spec-driven development CLI — make AI think before it codes, following a structured workflow.

[![npm version](https://img.shields.io/npm/v/marchen-spec)](https://www.npmjs.com/package/marchen-spec)
[![license](https://img.shields.io/npm/l/marchen-spec)](./LICENSE)

## Why

AI writes code fast, but tends to jump straight into implementation. MarchenSpec adds a thinking layer:

- Write a **proposal** to clarify motivation and scope
- Define **specs** with requirements and acceptance criteria
- Create a **design** for the technical approach
- Break it into **tasks** for step-by-step implementation

Every step produces an artifact — traceable, reviewable, and reusable.

## Quick Start

```bash
# Install
npm install -g marchen-spec

# Initialize in your project root
marchen init
```

Use in Claude Code:

```bash
# Explore ideas, clarify your thinking
/marchen:explore I want to add dark mode

# When ready, pick the right mode:

# Lightweight — all-in-one: create → implement → archive
/marchen:lite

# Full mode — for complex features, step by step
/marchen:propose                              # Generate proposal → specs → design → tasks
/marchen:apply                            # Implement tasks one by one
/marchen:archive                          # Archive when done
```

`marchen init` generates `.claude/skills/` and `.claude/commands/` files for Claude Code integration.

## Two Schemas

| Schema | Flow | Use Case |
|--------|------|----------|
| `full` (default) | proposal → specs → design → tasks | New features, architecture changes |
| `lite` | tasks (with context section) | Bug fixes, small changes, quick iterations |

```bash
marchen new add-dark-mode              # full schema
marchen new fix-typo --schema lite     # lite schema
```

Lite mode skips proposal/specs/design and generates a tasks.md with embedded context — ideal for changes that don't need the full spec workflow.

## Changelog

When archiving a change, MarchenSpec automatically appends an entry to `marchen/changelog.md`:

```markdown
- 2026-04-19: [add-user-auth](./archive/2026-04-19-add-user-auth/) — Implement user authentication
```

This provides a structured change history index. AI can read it in explore mode to understand project evolution.

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
└── config.yaml       # Configuration
```

## CLI Commands

```bash
marchen init                              # Initialize workspace + generate AI skill files
marchen new <name> [--schema full|lite]   # Create a change
marchen list [--json]                     # List all open changes
marchen status <name> [--json]            # View artifact status and workflow suggestions
marchen instructions <name> <artifact>    # Get artifact creation instructions (JSON)
marchen archive <name> [--summary <text>] # Archive change and write to changelog
```

## AI Skills

| Skill | Purpose |
|-------|---------|
| `/marchen:propose` | Create a change, fill all artifacts |
| `/marchen:lite` | One-shot lightweight change (create → implement → archive) |
| `/marchen:apply` | Implement tasks one by one |
| `/marchen:explore` | Thinking partner, explore problem space |
| `/marchen:archive` | Check completion and archive |

## Project Structure

pnpm monorepo with Turborepo orchestration:

```
apps/cli          CLI entry (commander + @clack/prompts)
packages/core     Business logic (Workspace + ChangeManager)
packages/config   Schema definitions, templates, configuration
packages/fs       File system operations
packages/shared   Shared types, constants, errors
```

Dependency direction: `cli → core → config / fs → shared`

## Development

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
