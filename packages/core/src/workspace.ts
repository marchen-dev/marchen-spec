import type { PackageBoundary } from '@marchen-spec/shared'
import { join } from 'node:path'
import {
  ensureDir,
  exists,
  getChangeDirectory,
  getSpecDirectory,
  resolveWorkspaceRoot,
  writeFile,
  writeYaml,
} from '@marchen-spec/fs'
import { CHANGE_DIRECTORY_NAME } from '@marchen-spec/shared'

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

  /** 包边界信息 */
  readonly packageBoundaries: readonly PackageBoundary[] = [
    { name: '@marchen-spec/shared', dependsOn: [] },
    { name: '@marchen-spec/config', dependsOn: ['@marchen-spec/shared'] },
    { name: '@marchen-spec/fs', dependsOn: ['@marchen-spec/shared'] },
    {
      name: '@marchen-spec/core',
      dependsOn: ['@marchen-spec/config', '@marchen-spec/fs', '@marchen-spec/shared'],
    },
  ]

  /**
   * @param root - 工作区根目录路径，默认为 process.cwd()
   */
  constructor(root?: string) {
    this.root = resolveWorkspaceRoot(root)
    this.specDir = getSpecDirectory(this.root)
    this.changeDir = getChangeDirectory(this.root)
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
   * - marchenspec/specs/
   * - marchenspec/changes/
   * - marchenspec/changes/archive/
   */
  async initialize(): Promise<void> {
    // 创建目录结构
    await ensureDir(this.specDir)
    await ensureDir(join(this.specDir, 'specs'))
    await ensureDir(join(this.specDir, CHANGE_DIRECTORY_NAME))
    await ensureDir(join(this.specDir, CHANGE_DIRECTORY_NAME, 'archive'))

    // 写入默认配置
    const configPath = join(this.specDir, 'config.yaml')
    await writeYaml(configPath, {
      schema: 'spec-driven',
      context: '',
      perArtifactRules: {},
    })

    // 创建 .gitkeep 占位文件
    await writeFile(join(this.specDir, 'specs', '.gitkeep'), '')
    await writeFile(join(this.specDir, CHANGE_DIRECTORY_NAME, '.gitkeep'), '')
    await writeFile(
      join(this.specDir, CHANGE_DIRECTORY_NAME, 'archive', '.gitkeep'),
      '',
    )
  }
}
