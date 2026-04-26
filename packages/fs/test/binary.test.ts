import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { mkdtemp, writeFile as nodeWriteFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  downloadFile,
  getFileSize,
  readFile,
  removeFile,
  renameFile,
  sha256File,
} from '../src/index.js'

describe('binary 二进制文件操作', () => {
  let testDir: string

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'marchen-binary-test-'))
  })

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true })
  })

  describe('sha256File', () => {
    it('应该返回 64 字符的十六进制哈希', async () => {
      const filePath = join(testDir, 'test.txt')
      await nodeWriteFile(filePath, 'hello world')

      const hash = await sha256File(filePath)

      expect(hash).toHaveLength(64)
      expect(hash).toBe(
        createHash('sha256').update('hello world').digest('hex'),
      )
    })

    it('文件不存在时应该抛出错误', async () => {
      await expect(sha256File(join(testDir, 'nope.txt'))).rejects.toThrow()
    })
  })

  describe('getFileSize', () => {
    it('应该返回文件字节数', async () => {
      const filePath = join(testDir, 'size.txt')
      const content = 'hello'
      await nodeWriteFile(filePath, content)

      const size = await getFileSize(filePath)

      expect(size).toBe(Buffer.byteLength(content))
    })
  })

  describe('removeFile', () => {
    it('应该删除已有文件', async () => {
      const filePath = join(testDir, 'remove-me.txt')
      await nodeWriteFile(filePath, 'bye')

      await removeFile(filePath)

      const { exists } = await import('../src/index.js')
      expect(await exists(filePath)).toBe(false)
    })

    it('文件不存在时不应该抛出错误', async () => {
      await expect(
        removeFile(join(testDir, 'nope.txt')),
      ).resolves.toBeUndefined()
    })
  })

  describe('renameFile', () => {
    it('应该移动文件到目标路径', async () => {
      const src = join(testDir, 'src.txt')
      await nodeWriteFile(src, 'data')

      const dest = join(testDir, 'dest.txt')
      await renameFile(src, dest)

      const content = await readFile(dest)
      expect(content).toBe('data')
    })

    it('目标父目录不存在时应该自动创建', async () => {
      const src = join(testDir, 'src2.txt')
      await nodeWriteFile(src, 'nested')

      const dest = join(testDir, 'sub', 'dir', 'dest2.txt')
      await renameFile(src, dest)

      const content = await readFile(dest)
      expect(content).toBe('nested')
    })
  })

  describe('downloadFile', () => {
    it('应该下载文件并自动创建父目录', async () => {
      const outputPath = join(testDir, 'dl', 'nested', 'file.txt')

      await downloadFile('https://httpbin.org/robots.txt', outputPath)

      const content = await readFile(outputPath)
      expect(content.length).toBeGreaterThan(0)
    })

    it('应该在下载过程中调用进度回调', async () => {
      const outputPath = join(testDir, 'progress.txt')
      const progressCalls: Array<{ downloadedBytes: number }> = []

      await downloadFile('https://httpbin.org/robots.txt', outputPath, {
        onProgress: (p) => progressCalls.push(p),
      })

      expect(progressCalls.length).toBeGreaterThan(0)
      expect(progressCalls.at(-1)!.downloadedBytes).toBeGreaterThan(0)
    })

    it('下载失败时应该抛出错误', async () => {
      const outputPath = join(testDir, 'fail.txt')

      await expect(
        downloadFile('https://httpbin.org/status/404', outputPath),
      ).rejects.toThrow()
    })
  })
})
