import { promises as nodeFs } from 'node:fs'
import { dirname } from 'node:path'
import { FileSystemError } from '@marchen-spec/shared'
import { ensureDir } from './directory.js'

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
      throw new FileSystemError('文件不存在', path)
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

/**
 * 追加内容到文件末尾（UTF-8），自动创建父目录
 */
export async function appendFile(path: string, content: string): Promise<void> {
  await ensureDir(dirname(path))
  await nodeFs.appendFile(path, content, 'utf-8')
}
