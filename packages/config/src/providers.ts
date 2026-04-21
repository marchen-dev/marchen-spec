import type { AgentProvider } from '@marchen-spec/shared'

export const AGENT_PROVIDERS: Record<string, AgentProvider> = {
  antigravity: {
    id: 'antigravity',
    name: 'Antigravity',
    skillDir: '.agent/skills',
  },
  'claude-code': {
    id: 'claude-code',
    name: 'Claude Code',
    skillDir: '.claude/skills',
    commandDir: '.claude/commands/marchen',
  },
  codex: {
    id: 'codex',
    name: 'Codex',
    skillDir: '.codex/skills',
  },
  copilot: {
    id: 'copilot',
    name: 'GitHub Copilot',
    skillDir: '.github/skills',
  },
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    skillDir: '.cursor/skills',
  },
  'gemini-cli': {
    id: 'gemini-cli',
    name: 'Gemini CLI',
    skillDir: '.gemini/skills',
  },
  kilocode: {
    id: 'kilocode',
    name: 'Kilo Code',
    skillDir: '.kilocode/skills',
  },
  kiro: {
    id: 'kiro',
    name: 'Kiro',
    skillDir: '.kiro/skills',
  },
  opencode: {
    id: 'opencode',
    name: 'OpenCode',
    skillDir: '.opencode/skills',
  },
  windsurf: {
    id: 'windsurf',
    name: 'Windsurf',
    skillDir: '.windsurf/skills',
  },
}

export const DEFAULT_PROVIDER_IDS: readonly string[] = ['claude-code']
