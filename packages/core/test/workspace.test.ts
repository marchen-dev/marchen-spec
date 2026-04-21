import * as fs from '@marchen-spec/fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Workspace } from '../src/index.js'

// Mock fs 层，避免真实文件操作
vi.mock('@marchen-spec/fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@marchen-spec/fs')>()
  return {
    ...actual,
    ensureDir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    writeYaml: vi.fn().mockResolvedValue(undefined),
    exists: vi.fn().mockResolvedValue(false),
  }
})

describe('workspace', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('构造时计算路径', () => {
    const workspace = new Workspace('/test/root')
    expect(workspace.root).toBe('/test/root')
    expect(workspace.specDir).toContain('marchen')
    expect(workspace.changeDir).toContain('changes')
  })

  it('提供包边界信息', () => {
    const workspace = new Workspace('/test/root')
    expect(workspace.packageBoundaries).toHaveLength(4)
    expect(workspace.packageBoundaries[0]!.name).toBe('@marchen-spec/shared')
  })

  describe('isInitialized', () => {
    it('目录存在时返回 true', async () => {
      vi.mocked(fs.exists).mockResolvedValueOnce(true)
      const workspace = new Workspace('/test/root')
      expect(await workspace.isInitialized()).toBe(true)
    })

    it('目录不存在时返回 false', async () => {
      vi.mocked(fs.exists).mockResolvedValueOnce(false)
      const workspace = new Workspace('/test/root')
      expect(await workspace.isInitialized()).toBe(false)
    })
  })

  describe('initialize', () => {
    it('创建目录结构和配置文件', async () => {
      const workspace = new Workspace('/test/root')
      await workspace.initialize()

      expect(fs.ensureDir).toHaveBeenCalledWith(
        expect.stringContaining('marchen'),
      )
      expect(fs.ensureDir).toHaveBeenCalledWith(
        expect.stringContaining('changes'),
      )
      expect(fs.ensureDir).toHaveBeenCalledWith(
        expect.stringContaining('archive'),
      )
      expect(fs.writeYaml).toHaveBeenCalledWith(
        expect.stringContaining('config.yaml'),
        expect.objectContaining({ schema: 'full' }),
      )
    })

    it('默认只生成 Claude Code 的文件', async () => {
      const workspace = new Workspace('/test/root')
      await workspace.initialize()

      expect(fs.ensureDir).toHaveBeenCalledWith(
        expect.stringContaining('.claude/skills/marchen-propose'),
      )
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.claude/skills/marchen-propose/SKILL.md'),
        expect.stringContaining('marchen-propose'),
      )
      expect(fs.ensureDir).toHaveBeenCalledWith(
        expect.stringContaining('.claude/commands/marchen'),
      )
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.claude/commands/marchen/propose.md'),
        expect.stringContaining('marchen:propose'),
      )
    })

    it('默认不生成 Codex 的文件', async () => {
      const workspace = new Workspace('/test/root')
      await workspace.initialize()

      const ensureDirCalls = vi.mocked(fs.ensureDir).mock.calls.map(([p]) => p)
      expect(ensureDirCalls.some((p) => p.includes('.codex'))).toBe(false)
    })

    it('config.yaml 包含 providers 字段', async () => {
      const workspace = new Workspace('/test/root')
      await workspace.initialize()

      expect(fs.writeYaml).toHaveBeenCalledWith(
        expect.stringContaining('config.yaml'),
        expect.objectContaining({ providers: ['claude-code'] }),
      )
    })

    it('指定多个 provider 时为每个生成 skill 文件', async () => {
      const workspace = new Workspace('/test/root')
      await workspace.initialize({ providers: ['claude-code', 'codex'] })

      expect(fs.ensureDir).toHaveBeenCalledWith(
        expect.stringContaining('.claude/skills/marchen-propose'),
      )
      expect(fs.ensureDir).toHaveBeenCalledWith(
        expect.stringContaining('.codex/skills/marchen-propose'),
      )
    })

    it('codex provider 不生成 command 文件', async () => {
      const workspace = new Workspace('/test/root')
      await workspace.initialize({ providers: ['codex'] })

      const ensureDirCalls = vi.mocked(fs.ensureDir).mock.calls.map(([p]) => p)
      expect(ensureDirCalls.some((p) => p.includes('commands'))).toBe(false)
    })

    it('skill.md 内容跨 provider 一致', async () => {
      const workspace = new Workspace('/test/root')
      await workspace.initialize({ providers: ['claude-code', 'codex'] })

      const writeFileCalls = vi.mocked(fs.writeFile).mock.calls
      const claudeSkill = writeFileCalls.find(
        ([p]) =>
          typeof p === 'string' &&
          p.includes('.claude/skills/marchen-apply/SKILL.md'),
      )
      const codexSkill = writeFileCalls.find(
        ([p]) =>
          typeof p === 'string' &&
          p.includes('.codex/skills/marchen-apply/SKILL.md'),
      )
      expect(claudeSkill).toBeDefined()
      expect(codexSkill).toBeDefined()
      expect(claudeSkill![1]).toBe(codexSkill![1])
    })

    it('config.yaml 持久化多个 provider', async () => {
      const workspace = new Workspace('/test/root')
      await workspace.initialize({ providers: ['claude-code', 'codex'] })

      expect(fs.writeYaml).toHaveBeenCalledWith(
        expect.stringContaining('config.yaml'),
        expect.objectContaining({ providers: ['claude-code', 'codex'] }),
      )
    })

    it('忽略无效的 provider id', async () => {
      const workspace = new Workspace('/test/root')
      await workspace.initialize({ providers: ['invalid-provider'] })

      const ensureDirCalls = vi.mocked(fs.ensureDir).mock.calls.map(([p]) => p)
      expect(ensureDirCalls.some((p) => p.includes('skills'))).toBe(false)
    })
  })
})
