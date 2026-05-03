import type { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { createReadStream, createWriteStream } from 'node:fs'
import { rename, rm, stat } from 'node:fs/promises'
import { dirname } from 'node:path'
import { Readable, Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { FileSystemError } from '@marchen-spec/shared'
import { ensureDir } from './directory.js'

/** 下载进度信息 */
export interface DownloadProgress {
  /** 已下载字节数 */
  readonly downloadedBytes: number
  /** 总字节数，响应未提供 Content-Length 时为 null */
  readonly totalBytes: number | null
}

/** 下载文件选项 */
export interface DownloadFileOptions {
  /** 下载进度回调 */
  readonly onProgress?: (progress: DownloadProgress) => void
  readonly headers?: Record<string, string>
}

/**
 * 下载远程文件到本地路径。
 *
 * 以 stream 写入文件，避免将大文件完整读入内存。写入前会自动创建父目录。
 *
 * @param url - 下载地址
 * @param outputPath - 输出文件路径
 * @param options - 下载选项
 */
export async function downloadFile(
  url: string,
  outputPath: string,
  options?: DownloadFileOptions,
): Promise<void> {
  await ensureDir(dirname(outputPath))

  try {
    const response = await fetch(url, {
      headers: options?.headers ?? {},
    })
    if (!response.ok || !response.body) {
      throw new Error(`HTTP ${response.status}`)
    }

    const totalBytesHeader = response.headers.get('content-length')
    const totalBytes = totalBytesHeader ? Number(totalBytesHeader) : null
    let downloadedBytes = 0

    const progressStream = new Transform({
      transform(chunk: Buffer, _encoding, callback) {
        downloadedBytes += chunk.byteLength
        options?.onProgress?.({ downloadedBytes, totalBytes })
        callback(null, chunk)
      },
    })

    await pipeline(
      Readable.fromWeb(response.body),
      progressStream,
      createWriteStream(outputPath),
    )
  } catch (error) {
    throw new FileSystemError(
      `下载文件失败: ${url}`,
      outputPath,
      error instanceof Error ? error : undefined,
    )
  }
}

/**
 * 计算文件 SHA-256。
 *
 * @param path - 文件路径
 * @returns 十六进制 SHA-256
 */
export async function sha256File(path: string): Promise<string> {
  try {
    const hash = createHash('sha256')
    await pipeline(createReadStream(path), hash)
    return hash.digest('hex')
  } catch (error) {
    throw new FileSystemError(
      '计算文件哈希失败',
      path,
      error instanceof Error ? error : undefined,
    )
  }
}

/**
 * 获取文件大小。
 *
 * @param path - 文件路径
 * @returns 文件大小（字节）
 */
export async function getFileSize(path: string): Promise<number> {
  try {
    const info = await stat(path)
    return info.size
  } catch (error) {
    throw new FileSystemError(
      '获取文件大小失败',
      path,
      error instanceof Error ? error : undefined,
    )
  }
}

/**
 * 删除文件。
 *
 * 文件不存在时不抛错。
 *
 * @param path - 文件路径
 */
export async function removeFile(path: string): Promise<void> {
  try {
    await rm(path, { force: true })
  } catch (error) {
    throw new FileSystemError(
      '删除文件失败',
      path,
      error instanceof Error ? error : undefined,
    )
  }
}

/**
 * 移动文件到目标路径。
 *
 * 自动创建目标父目录。
 *
 * @param src - 源文件路径
 * @param dest - 目标文件路径
 */
export async function renameFile(src: string, dest: string): Promise<void> {
  await ensureDir(dirname(dest))

  try {
    await rename(src, dest)
  } catch (error) {
    throw new FileSystemError(
      '移动文件失败',
      src,
      error instanceof Error ? error : undefined,
    )
  }
}
