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
    expect(workspace.specDir).toContain('marchenspec')
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

      // 创建 4 个目录
      expect(fs.ensureDir).toHaveBeenCalledTimes(4)
      // 写入 config.yaml
      expect(fs.writeYaml).toHaveBeenCalledWith(
        expect.stringContaining('config.yaml'),
        expect.objectContaining({ schema: 'spec-driven' }),
      )
      // 创建 3 个 .gitkeep 文件
      expect(fs.writeFile).toHaveBeenCalledTimes(3)
    })
  })
})
