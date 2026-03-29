import { promises as nodeFs } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CHANGE_DIRECTORY_NAME,
  MarchenSpecError,
  SPEC_DIRECTORY_NAME,
} from '@marchen-spec/shared'
import yaml from 'js-yaml'

// ============================================================
// 路径解析
// ============================================================

export function resolveWorkspaceRoot(fromPath = process.cwd()): string {
  return resolve(fromPath)
}

export function getSpecDirectory(root = process.cwd()): string {
  return resolve(root, SPEC_DIRECTORY_NAME)
}

export function getChangeDirectory(root = process.cwd()): string {
  return resolve(getSpecDirectory(root), CHANGE_DIRECTORY_NAME)
}

export function getPackageRoot(importMetaUrl: string): string {
  return dirname(fileURLToPath(importMetaUrl))
}

// ============================================================
// 目录操作
// ============================================================

/**
 * 递归创建目录，如果目录已存在则静默跳过
 */
export async function ensureDir(path: string): Promise<void> {
  try {
    await nodeFs.mkdir(path, { recursive: true })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error
    }
  }
}

/**
 * 检查路径是否存在（文件或目录）
 */
export async function exists(path: string): Promise<boolean> {
  try {
    await nodeFs.access(path)
    return true
  } catch {
    return false
  }
}

/**
 * 列举目录下的直接子条目
 */
export async function listDir(path: string): Promise<string[]> {
  try {
    return await nodeFs.readdir(path)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new MarchenSpecError(`目录不存在: ${path}`)
    }
    throw error
  }
}

// ============================================================
// 文件读写
// ============================================================

/**
 * 读取文件内容（UTF-8）
 */
export async function readFile(path: string): Promise<string> {
  try {
    return await nodeFs.readFile(path, 'utf-8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new MarchenSpecError(`文件不存在: ${path}`)
    }
    throw error
  }
}

/**
 * 写入文件内容（UTF-8），自动创建父目录
 */
export async function writeFile(path: string, content: string): Promise<void> {
  await ensureDir(dirname(path))
  await nodeFs.writeFile(path, content, 'utf-8')
}

// ============================================================
// YAML 读写
// ============================================================

/**
 * 读取 YAML 文件并解析为对象
 */
export async function readYaml<T>(path: string): Promise<T> {
  const content = await readFile(path)
  try {
    return yaml.load(content) as T
  } catch {
    throw new MarchenSpecError(`YAML 解析失败: ${path}`)
  }
}

/**
 * 将对象序列化为 YAML 并写入文件（2 空格缩进）
 */
export async function writeYaml(path: string, data: unknown): Promise<void> {
  const content = yaml.dump(data, { indent: 2 })
  await writeFile(path, content)
}
