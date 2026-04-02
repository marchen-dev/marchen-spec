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
 * 移动目录到新位置
 *
 * @param src - 源目录路径
 * @param dest - 目标目录路径
 * @throws {MarchenSpecError} 源目录不存在时抛出
 */
export async function moveDir(src: string, dest: string): Promise<void> {
  try {
    await nodeFs.rename(src, dest)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new MarchenSpecError(`目录不存在: ${src}`)
    }
    throw error
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
