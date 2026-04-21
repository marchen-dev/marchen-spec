import type { AgentProvider, PackageBoundary } from '@marchen-spec/shared'
import { join } from 'node:path'
import {
  AGENT_PROVIDERS,
  COMMAND_TEMPLATES,
  DEFAULT_PROVIDER_IDS,
  SKILL_TEMPLATES,
} from '@marchen-spec/config'
import {
  ensureDir,
  exists,
  getArchiveDirectory,
  getChangeDirectory,
  getSpecDirectory,
  resolveWorkspaceRoot,
  writeFile,
  writeYaml,
} from '@marchen-spec/fs'

/** 初始化选项 */
export interface InitializeOptions {
  /** 要安装的 AI 工具 provider ID 列表 */
  readonly providers?: readonly string[]
}

/**
 * 工作区上下文
 *
 * 统一管理 workspace 的路径计算、初始化检查和初始化操作。
 * 所有路径在构造时一次性计算完成，整个生命周期共享。
 */
export class Workspace {
  /** 工作区根目录 */
  readonly root: string

  /** 规范目录路径（marchenspec/） */
  readonly specDir: string

  /** 变更目录路径（marchenspec/changes/） */
  readonly changeDir: string

  /** 归档目录路径（marchenspec/archive/） */
  readonly archiveDir: string

  /** 变更日志路径（marchenspec/changelog.md） */
  readonly changelogPath: string

  /** 包边界信息 */
  readonly packageBoundaries: readonly PackageBoundary[] = [
    { name: '@marchen-spec/shared', dependsOn: [] },
    { name: '@marchen-spec/config', dependsOn: ['@marchen-spec/shared'] },
    { name: '@marchen-spec/fs', dependsOn: ['@marchen-spec/shared'] },
    {
      name: '@marchen-spec/core',
      dependsOn: [
        '@marchen-spec/config',
        '@marchen-spec/fs',
        '@marchen-spec/shared',
      ],
    },
  ]

  /**
   * @param root - 工作区根目录路径，默认为 process.cwd()
   */
  constructor(root?: string) {
    this.root = resolveWorkspaceRoot(root)
    this.specDir = getSpecDirectory(this.root)
    this.changeDir = getChangeDirectory(this.root)
    this.archiveDir = getArchiveDirectory(this.root)
    this.changelogPath = join(this.specDir, 'changelog.md')
  }

  /**
   * 检查 MarchenSpec 是否已初始化
   *
   * @returns 如果 marchenspec 目录存在则返回 true
   */
  async isInitialized(): Promise<boolean> {
    return await exists(this.specDir)
  }

  /**
   * 初始化 MarchenSpec 目录结构
   *
   * 创建标准目录结构和默认配置文件：
   * - marchenspec/config.yaml
   * - marchenspec/changes/
   * - marchenspec/archive/
   *
   * @param options - 初始化选项
   */
  async initialize(options?: InitializeOptions): Promise<void> {
    const providerIds = options?.providers ?? DEFAULT_PROVIDER_IDS
    const providers = providerIds
      .map((id) => AGENT_PROVIDERS[id])
      .filter((p): p is AgentProvider => p != null)

    // 创建目录结构
    await ensureDir(this.specDir)
    await ensureDir(this.changeDir)
    await ensureDir(this.archiveDir)

    // 写入默认配置
    const configPath = join(this.specDir, 'config.yaml')
    await writeYaml(configPath, {
      schema: 'full',
      context: '',
      providers: [...providerIds],
      perArtifactRules: {},
    })

    // 创建 .gitkeep 占位文件
    await writeFile(join(this.changeDir, '.gitkeep'), '')
    await writeFile(join(this.archiveDir, '.gitkeep'), '')

    // 创建 changelog.md（已存在时跳过）
    if (!(await exists(this.changelogPath))) {
      await writeFile(this.changelogPath, '# 变更日志\n')
    }

    // 为每个 provider 生成 skill 和 command 文件
    for (const provider of providers) {
      await this.generateSkills(provider.skillDir)
      if (provider.commandDir) {
        await this.generateCommands(provider.commandDir)
      }
    }
  }

  /**
   * 生成 skill 文件到指定目录
   *
   * @param skillDir - skill 根目录的相对路径
   */
  private async generateSkills(skillDir: string): Promise<void> {
    for (const template of Object.values(SKILL_TEMPLATES)) {
      const dir = join(this.root, skillDir, template.dirName)
      await ensureDir(dir)
      await writeFile(join(dir, 'SKILL.md'), template.content)
    }
  }

  /**
   * 生成 command 文件到指定目录
   *
   * @param commandDir - command 目录的相对路径
   */
  private async generateCommands(commandDir: string): Promise<void> {
    const dir = join(this.root, commandDir)
    await ensureDir(dir)
    for (const template of Object.values(COMMAND_TEMPLATES)) {
      await writeFile(join(dir, template.fileName), template.content)
    }
  }
}
