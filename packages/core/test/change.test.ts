import * as fs from '@marchen-spec/fs'
import { MarchenSpecError } from '@marchen-spec/shared'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createChange, isValidChangeName, listChanges } from '../src/index.js'

// Mock fs 层，避免真实文件操作
vi.mock('@marchen-spec/fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@marchen-spec/fs')>()
  return {
    ...actual,
    ensureDir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    writeYaml: vi.fn().mockResolvedValue(undefined),
    exists: vi.fn().mockResolvedValue(false),
    listDir: vi.fn().mockResolvedValue([]),
    readYaml: vi.fn().mockResolvedValue({}),
  }
})

describe('isValidChangeName 名称校验', () => {
  it('合法的 kebab-case 名称', () => {
    expect(isValidChangeName('add-dark-mode')).toBe(true)
    expect(isValidChangeName('fix-bug')).toBe(true)
    expect(isValidChangeName('feature123')).toBe(true)
    expect(isValidChangeName('a')).toBe(true)
    expect(isValidChangeName('add-v2-support')).toBe(true)
  })

  it('不合法的名称', () => {
    expect(isValidChangeName('Add-Dark-Mode')).toBe(false)
    expect(isValidChangeName('add_dark_mode')).toBe(false)
    expect(isValidChangeName('add dark mode')).toBe(false)
    expect(isValidChangeName('-leading-dash')).toBe(false)
    expect(isValidChangeName('trailing-dash-')).toBe(false)
    expect(isValidChangeName('')).toBe(false)
    expect(isValidChangeName('double--dash')).toBe(false)
  })
})

describe('createChange 创建变更', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 默认：已初始化，变更不存在
    vi.mocked(fs.exists).mockResolvedValue(false)
  })

  it('未初始化时应该抛出错误', async () => {
    // exists 对所有路径都返回 false（包括 specDir 检查）
    vi.mocked(fs.exists).mockResolvedValue(false)

    await expect(createChange('my-feature')).rejects.toThrow(MarchenSpecError)
    await expect(createChange('my-feature')).rejects.toThrow('尚未初始化')
  })

  it('名称格式错误时应该抛出错误', async () => {
    // checkIfInitialized → true
    vi.mocked(fs.exists).mockResolvedValueOnce(true)

    await expect(createChange('Bad_Name')).rejects.toThrow(MarchenSpecError)

    vi.mocked(fs.exists).mockResolvedValueOnce(true)
    await expect(createChange('Bad_Name')).rejects.toThrow('不合法')
  })

  it('变更已存在时应该抛出错误', async () => {
    // checkIfInitialized → true，变更目录 exists → true
    vi.mocked(fs.exists).mockResolvedValue(true)

    await expect(createChange('my-feature')).rejects.toThrow(MarchenSpecError)
    await expect(createChange('my-feature')).rejects.toThrow('已存在')
  })

  it('正常创建变更', async () => {
    // checkIfInitialized → true，变更目录 → false
    vi.mocked(fs.exists)
      .mockResolvedValueOnce(true) // specDir exists
      .mockResolvedValueOnce(false) // changeDir not exists

    await createChange('my-feature')

    // 创建目录（变更根目录 + specs 子目录）
    expect(fs.ensureDir).toHaveBeenCalledTimes(2)
    expect(fs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('my-feature'))
    expect(fs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('specs'))

    // 写入 .metadata.yaml
    expect(fs.writeYaml).toHaveBeenCalledWith(
      expect.stringContaining('.metadata.yaml'),
      expect.objectContaining({
        name: 'my-feature',
        schema: 'spec-driven',
        status: 'open',
      }),
    )

    // 写入 artifact 文件（proposal.md, design.md, tasks.md）
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('proposal.md'),
      expect.any(String),
    )
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('design.md'),
      expect.any(String),
    )
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('tasks.md'),
      expect.any(String),
    )
  })
})

describe('listChanges 列出变更', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('未初始化时应该抛出错误', async () => {
    vi.mocked(fs.exists).mockResolvedValue(false)

    await expect(listChanges()).rejects.toThrow(MarchenSpecError)
    await expect(listChanges()).rejects.toThrow('尚未初始化')
  })

  it('无变更时返回空数组', async () => {
    // checkIfInitialized → true
    vi.mocked(fs.exists).mockResolvedValueOnce(true)
    // listDir → 空目录
    vi.mocked(fs.listDir).mockResolvedValueOnce([])

    const result = await listChanges()
    expect(result).toEqual([])
  })

  it('正常列出变更并按创建时间降序排列', async () => {
    // checkIfInitialized → true
    vi.mocked(fs.exists).mockResolvedValueOnce(true)
    // listDir → 两个变更目录
    vi.mocked(fs.listDir).mockResolvedValueOnce(['old-change', 'new-change'])
    // 两个目录的 .metadata.yaml 都存在
    vi.mocked(fs.exists)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
    // readYaml → 元数据
    vi.mocked(fs.readYaml)
      .mockResolvedValueOnce({
        name: 'old-change',
        schema: 'spec-driven',
        createdAt: '2026-03-01T00:00:00.000Z',
        status: 'open',
      })
      .mockResolvedValueOnce({
        name: 'new-change',
        schema: 'spec-driven',
        createdAt: '2026-03-29T00:00:00.000Z',
        status: 'open',
      })

    const result = await listChanges()
    expect(result).toHaveLength(2)
    // 最新的在前
    expect(result[0]!.name).toBe('new-change')
    expect(result[1]!.name).toBe('old-change')
  })

  it('应过滤掉 archive 目录', async () => {
    vi.mocked(fs.exists).mockResolvedValueOnce(true)
    vi.mocked(fs.listDir).mockResolvedValueOnce(['my-change', 'archive'])
    // 只有 my-change 的元数据被检查
    vi.mocked(fs.exists).mockResolvedValueOnce(true)
    vi.mocked(fs.readYaml).mockResolvedValueOnce({
      name: 'my-change',
      schema: 'spec-driven',
      createdAt: '2026-03-29T00:00:00.000Z',
      status: 'open',
    })

    const result = await listChanges()
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('my-change')
  })

  it('应跳过缺失元数据文件的目录', async () => {
    vi.mocked(fs.exists).mockResolvedValueOnce(true)
    vi.mocked(fs.listDir).mockResolvedValueOnce(['valid-change', 'broken-change'])
    // valid-change 元数据存在，broken-change 不存在
    vi.mocked(fs.exists)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
    vi.mocked(fs.readYaml).mockResolvedValueOnce({
      name: 'valid-change',
      schema: 'spec-driven',
      createdAt: '2026-03-29T00:00:00.000Z',
      status: 'open',
    })

    const result = await listChanges()
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('valid-change')
  })
})
