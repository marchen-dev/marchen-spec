import { promises as nodeFs } from 'node:fs'
import { MarchenSpecError } from '@marchen-spec/shared'

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
