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
    moveDir: vi.fn().mockResolvedValue(undefined),
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
    vi.mocked(fs.exists).mockResolvedValue(false)
  })

  it('未初始化时应该抛出错误', async () => {
    vi.mocked(fs.exists).mockResolvedValue(false)
    await expect(manager.create('my-feature')).rejects.toThrow(StateError)
    await expect(manager.create('my-feature')).rejects.toThrow('尚未初始化')
  })

  it('名称格式错误时应该抛出错误', async () => {
    vi.mocked(fs.exists).mockResolvedValueOnce(true)
    await expect(manager.create('Bad_Name')).rejects.toThrow(ValidationError)
    vi.mocked(fs.exists).mockResolvedValueOnce(true)
    await expect(manager.create('Bad_Name')).rejects.toThrow('不合法')
  })

  it('变更已存在时应该抛出错误', async () => {
    vi.mocked(fs.exists).mockResolvedValue(true)
    await expect(manager.create('my-feature')).rejects.toThrow(ValidationError)
    await expect(manager.create('my-feature')).rejects.toThrow('已存在')
  })

  it('正常创建变更', async () => {
    // isInitialized → true，变更目录 → false
    vi.mocked(fs.exists)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)

    await manager.create('my-feature')

    // 创建目录
    expect(fs.ensureDir).toHaveBeenCalledTimes(2)
    // 写入元数据
    expect(fs.writeYaml).toHaveBeenCalledTimes(1)
    // 不再预填 artifact 文件（模板通过 instructions API 传递）
    expect(fs.writeFile).not.toHaveBeenCalled()
  })
})

// ============================================================
// detectContentStatus 测试
// ============================================================

describe('detectContentStatus 内容检测', () => {
  let workspace: Workspace
  let manager: ChangeManager

  beforeEach(() => {
    vi.clearAllMocks()
    workspace = new Workspace('/test/root')
    manager = new ChangeManager(workspace)
  })

  // 通过 status() 间接测试 detectContentStatus
  function setupStatusMocks(opts: {
    proposalContent?: string
    designContent?: string
    tasksContent?: string
    specsEntries?: string[]
    specFileContents?: Record<string, string>
  }) {
    const {
      proposalContent = '',
      designContent = '',
      tasksContent = '',
      specsEntries = [],
      specFileContents = {},
    } = opts

    // exists 调用顺序:
    // 1. specDir (isInitialized)
    // 2. changeDir
    // 3-6. artifact paths (proposal.md, specs/, design.md, tasks.md)
    // + spec file checks
    vi.mocked(fs.exists).mockImplementation(async (path: string) => {
      if (path.endsWith('marchen')) return true // specDir
      if (path.endsWith('my-feature')) return true // changeDir
      if (path.endsWith('proposal.md')) return proposalContent !== null
      if (path.endsWith('design.md')) return designContent !== null
      if (path.endsWith('tasks.md')) return tasksContent !== null
      if (path.endsWith('specs/') || path.endsWith('specs')) return true
      // spec files
      for (const entry of specsEntries) {
        if (path.includes(`specs/${entry}/spec.md`))
          return !!specFileContents[entry]
      }
      return false
    })

    vi.mocked(fs.readFile).mockImplementation(async (path: string) => {
      if (path.endsWith('proposal.md')) return proposalContent
      if (path.endsWith('design.md')) return designContent
      if (path.endsWith('tasks.md')) return tasksContent
      for (const entry of specsEntries) {
        if (path.includes(`specs/${entry}/spec.md`))
          return specFileContents[entry] ?? ''
      }
      return ''
    })

    vi.mocked(fs.readYaml).mockResolvedValue({
      name: 'my-feature',
      schema: 'full',
      createdAt: '2026-04-05T00:00:00Z',
      status: 'open',
    })

    vi.mocked(fs.listDir).mockImplementation(async (path: string) => {
      if (path.endsWith('specs') || path.endsWith('specs/')) return specsEntries
      return []
    })
  }

  it('模板骨架 → empty', async () => {
    const template = `## 动机\n\n<!-- 说明这个变更的动机 -->\n\n## 变更内容\n\n<!-- 描述具体变更内容 -->`
    setupStatusMocks({ proposalContent: template })

    const result = await manager.status('my-feature')
    const proposal = result.artifacts.find((a) => a.id === 'proposal')
    expect(proposal?.status).toBe('empty')
  })

  it('有实质内容 → filled', async () => {
    const content = `## 动机\n\n当前应用只有亮色主题，用户在暗光环境下使用体验差。\n\n## 变更内容\n\n新增暗色模式支持。`
    setupStatusMocks({ proposalContent: content })

    const result = await manager.status('my-feature')
    const proposal = result.artifacts.find((a) => a.id === 'proposal')
    expect(proposal?.status).toBe('filled')
  })

  it('文件不存在 → missing', async () => {
    setupStatusMocks({ proposalContent: '' })
    // Override proposal to not exist
    vi.mocked(fs.exists).mockImplementation(async (path: string) => {
      if (path.endsWith('marchen')) return true
      if (path.endsWith('my-feature')) return true
      if (path.endsWith('proposal.md')) return false
      if (path.endsWith('specs') || path.endsWith('specs/')) return true
      return false
    })

    const result = await manager.status('my-feature')
    const proposal = result.artifacts.find((a) => a.id === 'proposal')
    expect(proposal?.status).toBe('missing')
  })
})

// ============================================================
// detectSpecsStatus 测试
// ============================================================

describe('detectSpecsStatus specs 目录检测', () => {
  let workspace: Workspace
  let manager: ChangeManager

  beforeEach(() => {
    vi.clearAllMocks()
    workspace = new Workspace('/test/root')
    manager = new ChangeManager(workspace)
  })

  it('空目录 → no-content', async () => {
    vi.mocked(fs.exists).mockImplementation(async (path: string) => {
      if (path.endsWith('marchen')) return true
      if (path.endsWith('my-feature')) return true
      if (path.endsWith('specs') || path.endsWith('specs/')) return true
      return false
    })
    vi.mocked(fs.listDir).mockResolvedValue([])
    vi.mocked(fs.readYaml).mockResolvedValue({
      name: 'my-feature',
      schema: 'full',
      createdAt: '2026-04-05T00:00:00Z',
      status: 'open',
    })
    vi.mocked(fs.readFile).mockResolvedValue('')

    const result = await manager.status('my-feature')
    const specs = result.artifacts.find((a) => a.id === 'specs')
    expect(specs?.status).toBe('no-content')
    expect(specs?.capabilities).toEqual([])
  })

  it('有 filled spec 文件 → filled', async () => {
    vi.mocked(fs.exists).mockImplementation(async (path: string) => {
      if (path.endsWith('marchen')) return true
      if (path.endsWith('my-feature')) return true
      if (path.endsWith('specs') || path.endsWith('specs/')) return true
      if (path.includes('specs/auth/spec.md')) return true
      return false
    })
    vi.mocked(fs.listDir).mockImplementation(async (path: string) => {
      if (path.endsWith('specs') || path.endsWith('specs/')) return ['auth']
      return []
    })
    vi.mocked(fs.readYaml).mockResolvedValue({
      name: 'my-feature',
      schema: 'full',
      createdAt: '2026-04-05T00:00:00Z',
      status: 'open',
    })
    vi.mocked(fs.readFile).mockImplementation(async (path: string) => {
      if (path.includes('specs/auth/spec.md'))
        return '## ADDED Requirements\n\n### 需求: 用户认证\n系统 SHALL 支持用户通过邮箱和密码进行认证登录。\n\n#### 场景: 成功登录\n- WHEN 用户输入正确的邮箱和密码\n- THEN 系统返回认证令牌'
      return ''
    })

    const result = await manager.status('my-feature')
    const specs = result.artifacts.find((a) => a.id === 'specs')
    expect(specs?.status).toBe('filled')
    expect(specs?.capabilities).toEqual(['auth'])
  })

  it('多个 spec 文件部分填充 → no-content', async () => {
    vi.mocked(fs.exists).mockImplementation(async (path: string) => {
      if (path.endsWith('marchen')) return true
      if (path.endsWith('my-feature')) return true
      if (path.endsWith('specs') || path.endsWith('specs/')) return true
      if (path.includes('specs/auth/spec.md')) return true
      if (path.includes('specs/theme/spec.md')) return true
      return false
    })
    vi.mocked(fs.listDir).mockImplementation(async (path: string) => {
      if (path.endsWith('specs') || path.endsWith('specs/'))
        return ['auth', 'theme']
      return []
    })
    vi.mocked(fs.readYaml).mockResolvedValue({
      name: 'my-feature',
      schema: 'full',
      createdAt: '2026-04-05T00:00:00Z',
      status: 'open',
    })
    vi.mocked(fs.readFile).mockImplementation(async (path: string) => {
      if (path.includes('specs/auth/spec.md'))
        return '## ADDED Requirements\n\n### 需求: 用户认证\n系统 SHALL 支持用户通过邮箱和密码进行认证登录。\n\n#### 场景: 成功登录\n- WHEN 用户输入正确的邮箱和密码\n- THEN 系统返回认证令牌'
      // theme 的 spec.md 只有模板骨架，未填充
      if (path.includes('specs/theme/spec.md'))
        return '## ADDED Requirements\n\n<!-- 需求描述 -->'
      return ''
    })

    const result = await manager.status('my-feature')
    const specs = result.artifacts.find((a) => a.id === 'specs')
    expect(specs?.status).toBe('no-content')
    expect(specs?.capabilities).toEqual(['auth', 'theme'])
  })
})

// ============================================================
// detectTasksStatus 测试
// ============================================================

describe('tasks 进度解析', () => {
  let workspace: Workspace
  let manager: ChangeManager

  beforeEach(() => {
    vi.clearAllMocks()
    workspace = new Workspace('/test/root')
    manager = new ChangeManager(workspace)
  })

  it('tasks.md 有内容时 artifact status 为 filled，tasks 字段有进度', async () => {
    const tasksContent = `## 1. 基础设施\n\n- [x] 1.1 创建模块\n- [ ] 1.2 添加依赖\n- [x] 2.1 实现逻辑`

    vi.mocked(fs.exists).mockImplementation(async (path: string) => {
      if (path.endsWith('marchen')) return true
      if (path.endsWith('my-feature')) return true
      if (path.endsWith('tasks.md')) return true
      if (path.endsWith('specs') || path.endsWith('specs/')) return true
      return false
    })
    vi.mocked(fs.listDir).mockResolvedValue([])
    vi.mocked(fs.readYaml).mockResolvedValue({
      name: 'my-feature',
      schema: 'full',
      createdAt: '2026-04-05T00:00:00Z',
      status: 'open',
    })
    vi.mocked(fs.readFile).mockImplementation(async (path: string) => {
      if (path.endsWith('tasks.md')) return tasksContent
      return ''
    })

    const result = await manager.status('my-feature')
    const tasks = result.artifacts.find((a) => a.id === 'tasks')
    expect(tasks?.status).toBe('filled')
    expect(result.tasks).toEqual({
      total: 3,
      completed: 2,
      items: [
        { description: '1.1 创建模块', completed: true },
        { description: '1.2 添加依赖', completed: false },
        { description: '2.1 实现逻辑', completed: true },
      ],
    })
  })

  it('tasks.md 为模板骨架时 tasks 字段为 null', async () => {
    const template = `## 1. <!-- 任务组名称 -->\n\n- [ ] 1.1 <!-- 任务描述 -->`

    vi.mocked(fs.exists).mockImplementation(async (path: string) => {
      if (path.endsWith('marchen')) return true
      if (path.endsWith('my-feature')) return true
      if (path.endsWith('tasks.md')) return true
      if (path.endsWith('specs') || path.endsWith('specs/')) return true
      return false
    })
    vi.mocked(fs.listDir).mockResolvedValue([])
    vi.mocked(fs.readYaml).mockResolvedValue({
      name: 'my-feature',
      schema: 'full',
      createdAt: '2026-04-05T00:00:00Z',
      status: 'open',
    })
    vi.mocked(fs.readFile).mockImplementation(async (path: string) => {
      if (path.endsWith('tasks.md')) return template
      return ''
    })

    const result = await manager.status('my-feature')
    expect(result.tasks).toBeNull()
  })
})

// ============================================================
// computeWorkflow 测试
// ============================================================

describe('computeWorkflow 工作流计算', () => {
  let workspace: Workspace
  let manager: ChangeManager

  beforeEach(() => {
    vi.clearAllMocks()
    workspace = new Workspace('/test/root')
    manager = new ChangeManager(workspace)
  })

  function setupWithStatuses(statuses: Record<string, string>) {
    const specsHasContent = statuses.specs === 'filled'

    vi.mocked(fs.exists).mockImplementation(async (path: string) => {
      if (path.endsWith('marchen')) return true
      if (path.endsWith('my-feature')) return true
      if (path.endsWith('proposal.md')) return true
      if (path.endsWith('design.md')) return true
      if (path.endsWith('tasks.md')) return true
      if (path.endsWith('specs') || path.endsWith('specs/')) return true
      if (specsHasContent && path.includes('specs/auth/spec.md')) return true
      return false
    })

    vi.mocked(fs.readYaml).mockResolvedValue({
      name: 'my-feature',
      schema: 'full',
      createdAt: '2026-04-05T00:00:00Z',
      status: 'open',
    })

    vi.mocked(fs.readFile).mockImplementation(async (path: string) => {
      if (path.endsWith('proposal.md')) {
        return statuses.proposal === 'filled'
          ? '## 动机\n\n当前应用只有亮色主题，用户在暗光环境下使用体验差。添加暗色模式。'
          : '## 动机\n\n<!-- 说明 -->'
      }
      if (path.endsWith('design.md')) {
        return statuses.design === 'filled'
          ? '## 背景\n\n当前应用使用硬编码的亮色样式，没有主题系统。需要引入主题切换。'
          : '## 背景\n\n<!-- 背景 -->'
      }
      if (path.endsWith('tasks.md')) {
        return statuses.tasks === 'filled'
          ? '## 1. 基础设施\n\n- [ ] 1.1 创建主题模块并添加依赖\n- [ ] 1.2 实现主题切换逻辑'
          : '## 1. <!-- 任务组 -->\n\n- [ ] 1.1 <!-- 描述 -->'
      }
      if (specsHasContent && path.includes('specs/auth/spec.md')) {
        return '## ADDED Requirements\n\n### 需求: 认证\n系统 SHALL 支持用户通过邮箱和密码进行认证登录操作。'
      }
      return ''
    })

    vi.mocked(fs.listDir).mockImplementation(async (path: string) => {
      if (
        (path.endsWith('specs') || path.endsWith('specs/')) &&
        specsHasContent
      )
        return ['auth']
      return []
    })
  }

  it('初始状态: proposal ready, 其余 blocked', async () => {
    setupWithStatuses({
      proposal: 'empty',
      specs: 'empty',
      design: 'empty',
      tasks: 'empty',
    })

    const result = await manager.status('my-feature')
    expect(result.workflow.next).toBe('proposal')
    expect(result.workflow.ready).toEqual(['proposal'])
    expect(result.workflow.blocked).toEqual(['specs', 'design', 'tasks'])
  })

  it('proposal filled: specs + design ready, tasks blocked', async () => {
    setupWithStatuses({
      proposal: 'filled',
      specs: 'empty',
      design: 'empty',
      tasks: 'empty',
    })

    const result = await manager.status('my-feature')
    expect(result.workflow.next).toBe('specs')
    expect(result.workflow.ready).toEqual(['specs', 'design'])
    expect(result.workflow.blocked).toEqual(['tasks'])
  })

  it('proposal + specs + design filled: tasks ready', async () => {
    setupWithStatuses({
      proposal: 'filled',
      specs: 'filled',
      design: 'filled',
      tasks: 'empty',
    })

    const result = await manager.status('my-feature')
    expect(result.workflow.next).toBe('tasks')
    expect(result.workflow.ready).toEqual(['tasks'])
    expect(result.workflow.blocked).toEqual([])
  })

  it('所有 filled: next 为 null', async () => {
    setupWithStatuses({
      proposal: 'filled',
      specs: 'filled',
      design: 'filled',
      tasks: 'filled',
    })

    const result = await manager.status('my-feature')
    expect(result.workflow.next).toBeNull()
    expect(result.workflow.ready).toEqual([])
    expect(result.workflow.blocked).toEqual([])
  })
})

// ============================================================
// status() 集成测试
// ============================================================

describe('changeManager.status 集成', () => {
  let workspace: Workspace
  let manager: ChangeManager

  beforeEach(() => {
    vi.clearAllMocks()
    workspace = new Workspace('/test/root')
    manager = new ChangeManager(workspace)
  })

  it('未初始化时抛出 StateError', async () => {
    vi.mocked(fs.exists).mockResolvedValue(false)
    await expect(manager.status('my-feature')).rejects.toThrow(StateError)
  })

  it('变更不存在时抛出 ValidationError', async () => {
    vi.mocked(fs.exists).mockImplementation(async (path: string) => {
      if (path.endsWith('marchen')) return true
      return false
    })
    await expect(manager.status('non-existent')).rejects.toThrow(
      ValidationError,
    )
    await expect(manager.status('non-existent')).rejects.toThrow('不存在')
  })

  it('返回完整的 StatusResult', async () => {
    vi.mocked(fs.exists).mockImplementation(async (path: string) => {
      if (path.endsWith('marchen')) return true
      if (path.endsWith('my-feature')) return true
      if (path.endsWith('proposal.md')) return true
      if (path.endsWith('design.md')) return true
      if (path.endsWith('tasks.md')) return true
      if (path.endsWith('specs') || path.endsWith('specs/')) return true
      return false
    })
    vi.mocked(fs.readYaml).mockResolvedValue({
      name: 'my-feature',
      schema: 'full',
      createdAt: '2026-04-05T00:00:00Z',
      status: 'open',
    })
    vi.mocked(fs.readFile).mockResolvedValue('## 标题\n\n<!-- 注释 -->')
    vi.mocked(fs.listDir).mockResolvedValue([])

    const result = await manager.status('my-feature')

    expect(result.name).toBe('my-feature')
    expect(result.schema).toBe('full')
    expect(result.artifacts).toHaveLength(4)
    expect(result.workflow).toBeDefined()
    expect(result.workflow.next).toBe('proposal')
  })
})

// ============================================================
// getInstructions() 测试
// ============================================================

describe('changeManager.getInstructions', () => {
  let workspace: Workspace
  let manager: ChangeManager

  beforeEach(() => {
    vi.clearAllMocks()
    workspace = new Workspace('/test/root')
    manager = new ChangeManager(workspace)
  })

  it('未初始化时抛出 StateError', async () => {
    vi.mocked(fs.exists).mockResolvedValue(false)
    await expect(
      manager.getInstructions('my-feature', 'proposal'),
    ).rejects.toThrow(StateError)
  })

  it('变更不存在时抛出 ValidationError', async () => {
    vi.mocked(fs.exists).mockImplementation(async (path: string) => {
      if (path.endsWith('marchen')) return true
      return false
    })
    await expect(
      manager.getInstructions('non-existent', 'proposal'),
    ).rejects.toThrow(ValidationError)
  })

  it('artifact 不存在时抛出 ValidationError', async () => {
    vi.mocked(fs.exists).mockImplementation(async (path: string) => {
      if (path.endsWith('marchen')) return true
      if (path.endsWith('my-feature')) return true
      return false
    })
    await expect(
      manager.getInstructions('my-feature', 'unknown'),
    ).rejects.toThrow(ValidationError)
    await expect(
      manager.getInstructions('my-feature', 'unknown'),
    ).rejects.toThrow('不存在')
  })

  it('proposal 指令: 无依赖, unlocks specs + design', async () => {
    vi.mocked(fs.exists).mockImplementation(async (path: string) => {
      if (path.endsWith('marchen')) return true
      if (path.endsWith('my-feature')) return true
      return false
    })
    vi.mocked(fs.readYaml).mockResolvedValue({ schema: 'full' })

    const result = await manager.getInstructions('my-feature', 'proposal')

    expect(result.changeName).toBe('my-feature')
    expect(result.artifactId).toBe('proposal')
    expect(result.schemaName).toBe('full')
    expect(result.changeDir).toBe('/test/root/marchen/changes/my-feature')
    expect(result.outputPath).toBe('proposal.md')
    expect(result.template).toBeTruthy()
    expect(result.instruction).toBeTruthy()
    expect(result.context).toEqual([])
    expect(result.unlocks).toEqual(['specs', 'design'])
    expect(result.state).toBeNull()
    expect(result.progress).toBeNull()
  })

  it('specs 指令: 依赖 proposal, unlocks tasks', async () => {
    const proposalContent =
      '## 动机\n\n当前应用只有亮色主题，用户在暗光环境下使用体验差，需要暗色模式支持。'

    vi.mocked(fs.exists).mockImplementation(async (path: string) => {
      if (path.endsWith('marchen')) return true
      if (path.endsWith('my-feature')) return true
      if (path.endsWith('proposal.md')) return true
      return false
    })
    vi.mocked(fs.readYaml).mockResolvedValue({ schema: 'full' })
    vi.mocked(fs.readFile).mockImplementation(async (path: string) => {
      if (path.endsWith('proposal.md')) return proposalContent
      return ''
    })

    const result = await manager.getInstructions('my-feature', 'specs')

    expect(result.context).toHaveLength(1)
    expect(result.context[0]!.id).toBe('proposal')
    expect(result.context[0]!.status).toBe('filled')
    expect(result.context[0]!.content).toBe(proposalContent)
    expect(result.unlocks).toEqual(['tasks'])
  })

  it('tasks 指令: 依赖 specs + design', async () => {
    vi.mocked(fs.exists).mockImplementation(async (path: string) => {
      if (path.endsWith('marchen')) return true
      if (path.endsWith('my-feature')) return true
      if (path.endsWith('specs') || path.endsWith('specs/')) return true
      if (path.endsWith('design.md')) return true
      return false
    })
    vi.mocked(fs.readYaml).mockResolvedValue({ schema: 'full' })
    vi.mocked(fs.readFile).mockImplementation(async (path: string) => {
      if (path.endsWith('design.md'))
        return '## 背景\n\n当前应用使用硬编码的亮色样式，需要重构为主题系统支持动态切换。'
      return ''
    })
    vi.mocked(fs.listDir).mockResolvedValue([])

    const result = await manager.getInstructions('my-feature', 'tasks')

    expect(result.context).toHaveLength(2)
    expect(result.context[0]!.id).toBe('specs')
    expect(result.context[1]!.id).toBe('design')
    expect(result.unlocks).toEqual([])
  })

  it('specs 依赖内容自动拼接', async () => {
    vi.mocked(fs.exists).mockImplementation(async (path: string) => {
      if (path.endsWith('marchen')) return true
      if (path.endsWith('my-feature')) return true
      if (path.endsWith('specs') || path.endsWith('specs/')) return true
      if (path.includes('specs/auth/spec.md')) return true
      if (path.includes('specs/theme/spec.md')) return true
      if (path.endsWith('design.md')) return true
      return false
    })
    vi.mocked(fs.readYaml).mockResolvedValue({ schema: 'full' })
    vi.mocked(fs.listDir).mockImplementation(async (path: string) => {
      if (path.endsWith('specs') || path.endsWith('specs/'))
        return ['auth', 'theme']
      return []
    })
    vi.mocked(fs.readFile).mockImplementation(async (path: string) => {
      if (path.includes('specs/auth/spec.md'))
        return '## Auth spec\n\n系统 SHALL 支持用户通过邮箱和密码进行认证登录。'
      if (path.includes('specs/theme/spec.md'))
        return '## Theme spec\n\n系统 SHALL 支持暗色主题和亮色主题之间的切换。'
      if (path.endsWith('design.md'))
        return '## 背景\n\n当前应用使用硬编码的亮色样式，需要重构为主题系统。'
      return ''
    })

    const result = await manager.getInstructions('my-feature', 'tasks')

    const specsDep = result.context.find((d) => d.id === 'specs')
    expect(specsDep?.status).toBe('filled')
    expect(specsDep?.content).toContain('--- specs/auth/spec.md ---')
    expect(specsDep?.content).toContain(
      '系统 SHALL 支持用户通过邮箱和密码进行认证登录',
    )
    expect(specsDep?.content).toContain('--- specs/theme/spec.md ---')
    expect(specsDep?.content).toContain(
      '系统 SHALL 支持暗色主题和亮色主题之间的切换',
    )
  })
})

describe('changeManager.getApplyInstructions apply 指令', () => {
  let workspace: Workspace
  let manager: ChangeManager

  beforeEach(() => {
    vi.clearAllMocks()
    workspace = new Workspace('/test/root')
    manager = new ChangeManager(workspace)
  })

  it('tasks 未填充时 state 为 blocked', async () => {
    vi.mocked(fs.exists).mockImplementation(async (path: string) => {
      if (path.endsWith('marchen')) return true
      if (path.endsWith('my-feature')) return true
      return false
    })
    vi.mocked(fs.readYaml).mockResolvedValue({ schema: 'full' })

    const result = await manager.getApplyInstructions('my-feature')

    expect(result.artifactId).toBe('apply')
    expect(result.state).toBe('blocked')
    expect(result.progress).toEqual({ total: 0, completed: 0, remaining: 0 })
    expect(result.outputPath).toBeNull()
    expect(result.template).toBeNull()
    expect(result.unlocks).toBeNull()
  })

  it('所有任务完成时 state 为 all_done', async () => {
    const tasksContent =
      '## 任务\n\n- [x] 1.1 做 A\n- [x] 1.2 做 B\n- [x] 2.1 做 C'

    vi.mocked(fs.exists).mockImplementation(async (path: string) => {
      if (path.endsWith('marchen')) return true
      if (path.endsWith('my-feature')) return true
      if (path.endsWith('tasks.md')) return true
      return false
    })
    vi.mocked(fs.readYaml).mockResolvedValue({ schema: 'full' })
    vi.mocked(fs.readFile).mockImplementation(async (path: string) => {
      if (path.endsWith('tasks.md')) return tasksContent
      return ''
    })

    const result = await manager.getApplyInstructions('my-feature')

    expect(result.state).toBe('all_done')
    expect(result.progress).toEqual({ total: 3, completed: 3, remaining: 0 })
  })

  it('有未完成任务时 state 为 ready', async () => {
    const tasksContent =
      '## 任务\n\n- [x] 1.1 做 A\n- [ ] 1.2 做 B\n- [ ] 2.1 做 C'

    vi.mocked(fs.exists).mockImplementation(async (path: string) => {
      if (path.endsWith('marchen')) return true
      if (path.endsWith('my-feature')) return true
      if (path.endsWith('tasks.md')) return true
      return false
    })
    vi.mocked(fs.readYaml).mockResolvedValue({ schema: 'full' })
    vi.mocked(fs.readFile).mockImplementation(async (path: string) => {
      if (path.endsWith('tasks.md')) return tasksContent
      return ''
    })

    const result = await manager.getApplyInstructions('my-feature')

    expect(result.state).toBe('ready')
    expect(result.progress).toEqual({ total: 3, completed: 1, remaining: 2 })
  })

  it('收集所有 artifact 作为 context', async () => {
    const proposalContent =
      '## 动机\n\n当前应用只有亮色主题，用户在暗光环境下使用体验差，需要暗色模式支持。'
    const tasksContent =
      '## 任务\n\n- [ ] 1.1 实现暗色主题的基础样式变量\n- [ ] 1.2 添加主题切换按钮组件'

    vi.mocked(fs.exists).mockImplementation(async (path: string) => {
      if (path.endsWith('marchen')) return true
      if (path.endsWith('my-feature')) return true
      if (path.endsWith('proposal.md')) return true
      if (path.endsWith('tasks.md')) return true
      return false
    })
    vi.mocked(fs.readYaml).mockResolvedValue({ schema: 'full' })
    vi.mocked(fs.readFile).mockImplementation(async (path: string) => {
      if (path.endsWith('proposal.md')) return proposalContent
      if (path.endsWith('tasks.md')) return tasksContent
      return ''
    })

    const result = await manager.getApplyInstructions('my-feature')

    expect(result.context.length).toBeGreaterThanOrEqual(2)
    const proposal = result.context.find((c) => c.id === 'proposal')
    expect(proposal?.status).toBe('filled')
    expect(proposal?.content).toBe(proposalContent)
    const tasks = result.context.find((c) => c.id === 'tasks')
    expect(tasks?.status).toBe('filled')
    expect(tasks?.content).toBe(tasksContent)
  })
})

// ============================================================
// archive 测试
// ============================================================

describe('changeManager.archive 归档变更', () => {
  let workspace: Workspace
  let manager: ChangeManager

  beforeEach(() => {
    vi.clearAllMocks()
    workspace = new Workspace('/test/root')
    manager = new ChangeManager(workspace)
  })

  it('未初始化时应该抛出错误', async () => {
    vi.mocked(fs.exists).mockResolvedValue(false)
    await expect(manager.archive('my-feature')).rejects.toThrow(StateError)
  })

  it('变更不存在时应该抛出错误', async () => {
    // specDir exists, changeDir does not
    vi.mocked(fs.exists).mockImplementation(async (path: string) => {
      if (path.endsWith('marchen')) return true
      return false
    })
    await expect(manager.archive('my-feature')).rejects.toThrow(ValidationError)
    await expect(manager.archive('my-feature')).rejects.toThrow('不存在')
  })

  it('目标归档目录已存在时应该抛出错误', async () => {
    // specDir, changeDir, archiveTarget all exist
    vi.mocked(fs.exists).mockResolvedValue(true)
    vi.mocked(fs.readYaml).mockResolvedValue({ schema: 'full' })

    await expect(manager.archive('my-feature')).rejects.toThrow(ValidationError)
    await expect(manager.archive('my-feature')).rejects.toThrow('已存在')
  })

  it('正常归档并返回 ArchiveResult', async () => {
    vi.mocked(fs.exists).mockImplementation(async (path: string) => {
      if (path.endsWith('marchen')) return true // specDir
      if (path.includes('changes') && path.endsWith('my-feature')) return true // changeDir
      return false // archiveTarget does not exist
    })
    vi.mocked(fs.readYaml).mockResolvedValue({ schema: 'full' })

    const result = await manager.archive('my-feature')

    expect(result.name).toBe('my-feature')
    expect(result.schema).toBe('full')
    expect(result.archivedTo).toContain('my-feature')
    expect(result.archivedAt).toBeTruthy()
    expect(fs.writeYaml).toHaveBeenCalledWith(
      expect.stringContaining('.metadata.yaml'),
      expect.objectContaining({ status: 'archived' }),
    )
    expect(fs.moveDir).toHaveBeenCalledTimes(1)
  })
})
