import type { ChangeMetadata } from '@marchen-spec/shared'
import { join } from 'node:path'
import { ARTIFACT_TEMPLATES, DEFAULT_SCHEMA } from '@marchen-spec/config'
import {
  ensureDir,
  exists,
  getChangeDirectory,
  writeFile,
  writeYaml,
} from '@marchen-spec/fs'
import { MarchenSpecError, METADATA_FILE_NAME } from '@marchen-spec/shared'
import { checkIfInitialized } from './init.js'

/** kebab-case 校验正则 */
const KEBAB_CASE_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * 校验变更名称是否为合法的 kebab-case 格式
 *
 * @param name - 变更名称
 * @returns 名称是否合法
 */
export function isValidChangeName(name: string): boolean {
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
export async function createChange(name: string): Promise<void> {
  // 校验初始化状态
  const initialized = await checkIfInitialized()
  if (!initialized) {
    throw new MarchenSpecError('MarchenSpec 尚未初始化，请先执行 marchen init')
  }

  // 校验名称格式
  if (!isValidChangeName(name)) {
    throw new MarchenSpecError(
      `变更名称 "${name}" 不合法，请使用 kebab-case 格式（如 add-dark-mode）`,
    )
  }

  // 校验是否重名
  const changeDir = join(getChangeDirectory(), name)
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
      // 有模板的 artifact，写入模板内容
      await writeFile(join(changeDir, artifact.generates), template)
    }
    // specs 类型只创建目录（已在上面创建），无需额外处理
  }
}
