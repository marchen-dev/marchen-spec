import type { AgentProvider } from '@marchen-spec/shared'

/**
 * 内置 AI 工具 provider 注册表
 *
 * 后续添加新工具只需在此处新增一条记录
 */
export const AGENT_PROVIDERS: Record<string, AgentProvider> = {
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
}

/** 默认 provider ID 列表 */
export const DEFAULT_PROVIDER_IDS: readonly string[] = ['claude-code']
