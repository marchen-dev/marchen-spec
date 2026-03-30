import type { ChangeMetadata } from '@marchen-spec/shared'
import type { Workspace } from './workspace.js'
import { join } from 'node:path'
import { ARTIFACT_TEMPLATES, DEFAULT_SCHEMA } from '@marchen-spec/config'
import {
  ensureDir,
  exists,
  listDir,
  readYaml,
  writeFile,
  writeYaml,
} from '@marchen-spec/fs'
import { MarchenSpecError, METADATA_FILE_NAME } from '@marchen-spec/shared'

/** kebab-case 校验正则 */
const KEBAB_CASE_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * 变更管理器
 *
 * 统一管理变更的创建、查询、列出等操作。
 * 通过构造函数接收 Workspace 实例获取路径上下文。
 */
export class ChangeManager {
  /**
   * @param workspace - 工作区实例，提供路径上下文
   */
  constructor(private readonly workspace: Workspace) {}

  /**
   * 校验变更名称是否为合法的 kebab-case 格式
   *
   * @param name - 变更名称
   * @returns 名称是否合法
   */
  static isValidName(name: string): boolean {
    return KEBAB_CASE_REGEX.test(name)
  }

  /**
   * 创建一个新的变更
   *
   * 在 marchenspec/changes/ 下创建变更目录，写入元数据和初始 artifact 文件。
   * 会依次校验：MarchenSpec 是否已初始化、名称格式、是否重名。
   *
   * @param name - 变更名称（kebab-case）
   * @throws {MarchenSpecError} 未初始化、名称格式错误或变更已存在时抛出
   */
  async create(name: string): Promise<void> {
    // 校验初始化状态
    await this.ensureInitialized()

    // 校验名称格式
    if (!ChangeManager.isValidName(name)) {
      throw new MarchenSpecError(
        `变更名称 "${name}" 不合法，请使用 kebab-case 格式（如 add-dark-mode）`,
      )
    }

    // 校验是否重名
    const changeDir = join(this.workspace.changeDir, name)
    if (await exists(changeDir)) {
      throw new MarchenSpecError(`变更 "${name}" 已存在`)
    }

    // 创建变更根目录和 specs 子目录
    await ensureDir(changeDir)
    await ensureDir(join(changeDir, 'specs'))

    // 写入元数据文件
    const metadata: ChangeMetadata = {
      name,
      schema: DEFAULT_SCHEMA.name,
      createdAt: new Date().toISOString(),
      status: 'open',
    }
    await writeYaml(join(changeDir, METADATA_FILE_NAME), metadata)

    // 根据 schema 定义生成初始 artifact 文件
    for (const artifact of DEFAULT_SCHEMA.artifacts) {
      const template = ARTIFACT_TEMPLATES[artifact.id]
      if (template) {
        await writeFile(join(changeDir, artifact.generates), template)
      }
    }
  }

  /**
   * 列出所有 open 状态的变更
   *
   * 扫描 marchenspec/changes/ 目录，读取各变更的元数据，
   * 返回按创建时间降序排列的列表。自动过滤 archive 目录，跳过缺失元数据的目录。
   *
   * @returns 变更元数据数组，按 createdAt 降序排列
   * @throws {MarchenSpecError} 未初始化时抛出
   */
  async list(): Promise<ChangeMetadata[]> {
    await this.ensureInitialized()

    const entries = await listDir(this.workspace.changeDir)

    // 过滤掉 archive 目录
    const changeNames = entries.filter((name) => name !== 'archive')

    const changes: ChangeMetadata[] = []

    // 读取每个变更的元数据
    for (const name of changeNames) {
      const metadataPath = join(
        this.workspace.changeDir,
        name,
        METADATA_FILE_NAME,
      )

      if (!(await exists(metadataPath))) {
        continue
      }

      try {
        const metadata = await readYaml<ChangeMetadata>(metadataPath)
        changes.push(metadata)
      } catch {
        continue
      }
    }

    // 按创建时间降序排列（最新的在前）
    changes.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return changes
  }

  /**
   * 确保 MarchenSpec 已初始化，否则抛出错误
   */
  private async ensureInitialized(): Promise<void> {
    const initialized = await this.workspace.isInitialized()
    if (!initialized) {
      throw new MarchenSpecError(
        'MarchenSpec 尚未初始化，请先执行 marchen init',
      )
    }
  }
}
