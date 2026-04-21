import { describe, expect, it } from 'vitest'
import { AGENT_PROVIDERS, DEFAULT_PROVIDER_IDS } from '../src/index.js'

describe('providers', () => {
  it('注册表包含 claude-code', () => {
    const provider = AGENT_PROVIDERS['claude-code']
    expect(provider).toBeDefined()
    expect(provider!.id).toBe('claude-code')
    expect(provider!.name).toBe('Claude Code')
    expect(provider!.skillDir).toBe('.claude/skills')
    expect(provider!.commandDir).toBe('.claude/commands/marchen')
  })

  it('注册表包含 codex', () => {
    const provider = AGENT_PROVIDERS.codex
    expect(provider).toBeDefined()
    expect(provider!.id).toBe('codex')
    expect(provider!.name).toBe('Codex')
    expect(provider!.skillDir).toBe('.codex/skills')
    expect(provider!.commandDir).toBeUndefined()
  })

  it('默认 provider 为 claude-code', () => {
    expect(DEFAULT_PROVIDER_IDS).toEqual(['claude-code'])
  })

  it('所有 provider 的 key 与 id 一致', () => {
    for (const [key, provider] of Object.entries(AGENT_PROVIDERS)) {
      expect(key).toBe(provider.id)
    }
  })
})
