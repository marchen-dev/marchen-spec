import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  ensureDir,
  exists,
  listDir,
  readFile,
  readYaml,
  writeFile,
  writeYaml,
} from '../src/index.js'

describe('fs 文件系统操作', () => {
  let testDir: string

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'marchen-test-'))
  })

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true })
  })

  describe('ensureDir 创建目录', () => {
    it('应该递归创建嵌套目录', async () => {
      const dir = join(testDir, 'foo', 'bar', 'baz')
      await ensureDir(dir)
      expect(await exists(dir)).toBe(true)
    })

    it('目录已存在时不应该抛出错误', async () => {
      const dir = join(testDir, 'existing')
      await ensureDir(dir)
      await expect(ensureDir(dir)).resolves.toBeUndefined()
    })
  })

  describe('exists 检查路径存在', () => {
    it('路径存在时应该返回 true', async () => {
      const file = join(testDir, 'test.txt')
      await writeFile(file, 'hello')
      expect(await exists(file)).toBe(true)
    })

    it('路径不存在时应该返回 false', async () => {
      expect(await exists(join(testDir, 'nope.txt'))).toBe(false)
    })
  })

  describe('readFile / writeFile 文件读写', () => {
    it('应该正确写入并读取文件内容', async () => {
      const file = join(testDir, 'hello.txt')
      await writeFile(file, '你好世界')
      expect(await readFile(file)).toBe('你好世界')
    })

    it('写入时应该自动创建父目录', async () => {
      const file = join(testDir, 'a', 'b', 'c.txt')
      await writeFile(file, 'deep')
      expect(await readFile(file)).toBe('deep')
    })

    it('读取不存在的文件时应该抛出 MarchenSpecError', async () => {
      await expect(readFile(join(testDir, 'missing.txt'))).rejects.toThrow(
        '文件不存在',
      )
    })
  })

  describe('listDir 列举目录', () => {
    it('应该列举目录下的所有条目', async () => {
      await writeFile(join(testDir, 'a.txt'), '')
      await writeFile(join(testDir, 'b.txt'), '')
      await ensureDir(join(testDir, 'subdir'))
      const entries = await listDir(testDir)
      expect(entries).toContain('a.txt')
      expect(entries).toContain('b.txt')
      expect(entries).toContain('subdir')
    })

    it('空目录时应该返回空数组', async () => {
      const emptyDir = join(testDir, 'empty')
      await ensureDir(emptyDir)
      expect(await listDir(emptyDir)).toEqual([])
    })

    it('目录不存在时应该抛出 MarchenSpecError', async () => {
      await expect(listDir(join(testDir, 'nope'))).rejects.toThrow('目录不存在')
    })
  })

  describe('readYaml / writeYaml YAML 读写', () => {
    it('应该正确写入并读取 YAML 文件', async () => {
      const file = join(testDir, 'config.yaml')
      const data = { schema: 'spec-driven', context: '', perArtifactRules: {} }
      await writeYaml(file, data)
      const result = await readYaml<typeof data>(file)
      expect(result).toEqual(data)
    })

    it('无效 YAML 时应该抛出 MarchenSpecError', async () => {
      const file = join(testDir, 'bad.yaml')
      await writeFile(file, '{{invalid: yaml::}')
      await expect(readYaml(file)).rejects.toThrow('YAML 解析失败')
    })
  })
})
