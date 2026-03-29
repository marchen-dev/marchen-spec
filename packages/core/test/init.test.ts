import * as fs from '@marchen-spec/fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { checkIfInitialized, initializeMarchenSpec } from '../src/index.js'

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

describe('initializeMarchenSpec 初始化', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该创建所有必要的目录', async () => {
    await initializeMarchenSpec()

    // 验证 ensureDir 被调用了 4 次（openspec、specs、changes、changes/archive）
    expect(fs.ensureDir).toHaveBeenCalledTimes(4)
    expect(fs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('marchenspec'))
    expect(fs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('specs'))
    expect(fs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('changes'))
    expect(fs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('archive'))
  })

  it('应该写入默认配置文件', async () => {
    await initializeMarchenSpec()

    expect(fs.writeYaml).toHaveBeenCalledWith(
      expect.stringContaining('config.yaml'),
      expect.objectContaining({ schema: 'spec-driven' }),
    )
  })

  it('应该创建 .gitkeep 占位文件', async () => {
    await initializeMarchenSpec()

    // 3 个 .gitkeep 文件：specs、changes、changes/archive
    expect(fs.writeFile).toHaveBeenCalledTimes(3)
    expect(fs.writeFile).toHaveBeenCalledWith(expect.stringContaining('.gitkeep'), '')
  })
})

describe('checkIfInitialized 检查初始化状态', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('目录存在时应该返回 true', async () => {
    vi.mocked(fs.exists).mockResolvedValue(true)
    expect(await checkIfInitialized()).toBe(true)
  })

  it('目录不存在时应该返回 false', async () => {
    vi.mocked(fs.exists).mockResolvedValue(false)
    expect(await checkIfInitialized()).toBe(false)
  })
})
