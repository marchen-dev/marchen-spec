import * as fs from '@marchen-spec/fs'
import { StateError, ValidationError } from '@marchen-spec/shared'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ChangeManager, Workspace } from '../src/index.js'

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
    readFile: vi.fn().mockResolvedValue(''),
  }
})

describe('changeManager.isValidName 名称校验', () => {
  it('合法的 kebab-case 名称', () => {
    expect(ChangeManager.isValidName('add-dark-mode')).toBe(true)
    expect(ChangeManager.isValidName('fix-bug')).toBe(true)
    expect(ChangeManager.isValidName('feature123')).toBe(true)
    expect(ChangeManager.isValidName('a')).toBe(true)
    expect(ChangeManager.isValidName('add-v2-support')).toBe(true)
  })

  it('不合法的名称', () => {
    expect(ChangeManager.isValidName('Add-Dark-Mode')).toBe(false)
    expect(ChangeManager.isValidName('add_dark_mode')).toBe(false)
    expect(ChangeManager.isValidName('add dark mode')).toBe(false)
    expect(ChangeManager.isValidName('-leading-dash')).toBe(false)
    expect(ChangeManager.isValidName('trailing-dash-')).toBe(false)
    expect(ChangeManager.isValidName('')).toBe(false)
    expect(ChangeManager.isValidName('double--dash')).toBe(false)
  })
})

describe('changeManager.create 创建变更', () => {
  let workspace: Workspace
  let manager: ChangeManager

  beforeEach(() => {
    vi.clearAllMocks()
    workspace = new Workspace('/test/root')
    manager = new ChangeManager(workspace)
    // 默认：已初始化，变更不存在
    vi.mocked(fs.exists).mockResolvedValue(false)
  })

  it('未初始化时应该抛出错误', async () => {
    vi.mocked(fs.exists).mockResolvedValue(false)

    await expect(manager.create('my-feature')).rejects.toThrow(StateError)
    await expect(manager.create('my-feature')).rejects.toThrow('尚未初始化')
  })

  it('名称格式错误时应该抛出错误', async () => {
    // isInitialized → true
    vi.mocked(fs.exists).mockResolvedValueOnce(true)

    await expect(manager.create('Bad_Name')).rejects.toThrow(ValidationError)

    vi.mocked(fs.exists).mockResolvedValueOnce(true)
    await expect(manager.create('Bad_Name')).rejects.toThrow('不合法')
  })

  it('变更已存在时应该抛出错误', async () => {
    // isInitialized → true，变更目录 exists → true
    vi.mocked(fs.exists).mockResolvedValue(true)

    await expect(manager.create('my-feature')).rejects.toThrow(ValidationError)
    await expect(manager.create('my-feature')).rejects.toThrow('已存在')
  })

  it('正常创建变更', async () => {
    // isInitialized → true，变更目录 → false
    vi.mocked(fs.exists)
      .mockResolvedValueOnce(true) // specDir exists
      .mockResolvedValueOnce(false) // changeDir not exists

    await manager.create('my-feature')

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

describe('changeManager.list 列出变更', () => {
  let workspace: Workspace
  let manager: ChangeManager

  beforeEach(() => {
    vi.clearAllMocks()
    workspace = new Workspace('/test/root')
    manager = new ChangeManager(workspace)
  })

  it('未初始化时应该抛出错误', async () => {
    vi.mocked(fs.exists).mockResolvedValue(false)

    await expect(manager.list()).rejects.toThrow(StateError)
    await expect(manager.list()).rejects.toThrow('尚未初始化')
  })

  it('无变更时返回空数组', async () => {
    vi.mocked(fs.exists).mockResolvedValueOnce(true)
    vi.mocked(fs.listDir).mockResolvedValueOnce([])

    const result = await manager.list()
    expect(result).toEqual([])
  })

  it('正常列出变更并按创建时间降序排列', async () => {
    vi.mocked(fs.exists).mockResolvedValueOnce(true)
    vi.mocked(fs.listDir).mockResolvedValueOnce(['old-change', 'new-change'])
    vi.mocked(fs.exists)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
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

    const result = await manager.list()
    expect(result).toHaveLength(2)
    expect(result[0]!.name).toBe('new-change')
    expect(result[1]!.name).toBe('old-change')
  })

  it('应跳过缺失元数据文件的目录', async () => {
    vi.mocked(fs.exists).mockResolvedValueOnce(true)
    vi.mocked(fs.listDir).mockResolvedValueOnce(['valid-change', 'broken-change'])
    vi.mocked(fs.exists)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
    vi.mocked(fs.readYaml).mockResolvedValueOnce({
      name: 'valid-change',
      schema: 'spec-driven',
      createdAt: '2026-03-29T00:00:00.000Z',
      status: 'open',
    })

    const result = await manager.list()
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('valid-change')
  })
})

describe('changeManager.verify 验证变更', () => {
  let workspace: Workspace
  let manager: ChangeManager

  beforeEach(() => {
    vi.clearAllMocks()
    workspace = new Workspace('/test/root')
    manager = new ChangeManager(workspace)
  })

  it('未初始化时应该抛出错误', async () => {
    vi.mocked(fs.exists).mockResolvedValue(false)

    await expect(manager.verify('my-feature')).rejects.toThrow(StateError)
    await expect(manager.verify('my-feature')).rejects.toThrow('尚未初始化')
  })

  it('变更不存在时应该抛出错误', async () => {
    vi.mocked(fs.exists)
      .mockResolvedValueOnce(true) // specDir exists
      .mockResolvedValueOnce(false) // changeDir not exists
      .mockResolvedValueOnce(true) // specDir exists (second call)
      .mockResolvedValueOnce(false) // changeDir not exists (second call)

    await expect(manager.verify('non-existent')).rejects.toThrow(ValidationError)
    await expect(manager.verify('non-existent')).rejects.toThrow('不存在')
  })

  it('正常验证完整变更', async () => {
    vi.mocked(fs.exists)
      .mockResolvedValueOnce(true) // specDir exists (isInitialized)
      .mockResolvedValueOnce(true) // changeDir exists
      // artifact checks (proposal, specs, design, tasks)
      .mockResolvedValueOnce(true) // proposal.md
      .mockResolvedValueOnce(true) // specs/
      .mockResolvedValueOnce(true) // design.md
      .mockResolvedValueOnce(true) // tasks.md
      .mockResolvedValueOnce(true) // tasks.md exists (for readFile)

    vi.mocked(fs.listDir).mockResolvedValueOnce(['auth', 'export'])
    vi.mocked(fs.readFile).mockResolvedValueOnce(
      '## 1. Setup\n\n- [x] 1.1 Create module\n- [ ] 1.2 Add deps\n\n## 2. Core\n\n- [x] 2.1 Implement logic\n',
    )

    const result = await manager.verify('my-feature')

    expect(result.name).toBe('my-feature')
    expect(result.artifacts).toHaveLength(4)
    expect(result.artifacts[0]).toEqual({ id: 'proposal', exists: true })
    expect(result.artifacts[1]).toEqual({ id: 'specs', exists: true, capabilities: ['auth', 'export'] })
    expect(result.artifacts[2]).toEqual({ id: 'design', exists: true })
    expect(result.artifacts[3]).toEqual({ id: 'tasks', exists: true })
    expect(result.tasks).toEqual({
      total: 3,
      completed: 2,
      items: [
        { description: '1.1 Create module', completed: true },
        { description: '1.2 Add deps', completed: false },
        { description: '2.1 Implement logic', completed: true },
      ],
    })
  })

  it('tasks.md 不存在时 tasks 为 null', async () => {
    vi.mocked(fs.exists)
      .mockResolvedValueOnce(true) // specDir exists
      .mockResolvedValueOnce(true) // changeDir exists
      .mockResolvedValueOnce(true) // proposal.md
      .mockResolvedValueOnce(false) // specs/
      .mockResolvedValueOnce(false) // design.md
      .mockResolvedValueOnce(false) // tasks.md
      .mockResolvedValueOnce(false) // tasks.md (for readFile check)

    const result = await manager.verify('my-feature')

    expect(result.tasks).toBeNull()
  })

  it('specs/ 为空目录时 capabilities 为空数组', async () => {
    vi.mocked(fs.exists)
      .mockResolvedValueOnce(true) // specDir exists
      .mockResolvedValueOnce(true) // changeDir exists
      .mockResolvedValueOnce(false) // proposal.md
      .mockResolvedValueOnce(true) // specs/
      .mockResolvedValueOnce(false) // design.md
      .mockResolvedValueOnce(false) // tasks.md
      .mockResolvedValueOnce(false) // tasks.md (for readFile check)

    vi.mocked(fs.listDir).mockResolvedValueOnce([])

    const result = await manager.verify('my-feature')

    expect(result.artifacts[1]).toEqual({ id: 'specs', exists: true, capabilities: [] })
  })
})
