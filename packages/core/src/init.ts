import { join } from 'node:path'
import {
  ensureDir,
  exists,
  getSpecDirectory,
  resolveWorkspaceRoot,
  writeFile,
  writeYaml,
} from '@marchen-spec/fs'
import { CHANGE_DIRECTORY_NAME } from '@marchen-spec/shared'

/**
 * 初始化 MarchenSpec 目录结构
 *
 * 在当前工作区根目录下创建标准目录结构和默认配置文件：
 * - openspec/config.yaml（默认配置）
 * - openspec/specs/（主规范目录）
 * - openspec/changes/（活跃变更目录）
 * - openspec/changes/archive/（已归档变更目录）
 */
export async function initializeMarchenSpec(): Promise<void> {
  const root = resolveWorkspaceRoot()
  const specDir = getSpecDirectory(root)

  // 创建目录结构
  await ensureDir(specDir)
  await ensureDir(join(specDir, 'specs'))
  await ensureDir(join(specDir, CHANGE_DIRECTORY_NAME))
  await ensureDir(join(specDir, CHANGE_DIRECTORY_NAME, 'archive'))

  // 写入默认配置
  const configPath = join(specDir, 'config.yaml')
  await writeYaml(configPath, {
    schema: 'spec-driven',
    context: '',
    perArtifactRules: {},
  })

  // 创建 .gitkeep 占位文件，确保空目录被 git 追踪
  await writeFile(join(specDir, 'specs', '.gitkeep'), '')
  await writeFile(join(specDir, CHANGE_DIRECTORY_NAME, '.gitkeep'), '')
  await writeFile(
    join(specDir, CHANGE_DIRECTORY_NAME, 'archive', '.gitkeep'),
    '',
  )
}

/**
 * 检查 MarchenSpec 是否已初始化
 *
 * @returns 如果 openspec 目录存在则返回 true
 */
export async function checkIfInitialized(): Promise<boolean> {
  const specDir = getSpecDirectory()
  return await exists(specDir)
}
