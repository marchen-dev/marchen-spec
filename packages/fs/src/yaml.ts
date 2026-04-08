import { FileSystemError } from '@marchen-spec/shared'
import yaml from 'js-yaml'
import { readFile, writeFile } from './file.js'

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
  } catch (error) {
    throw new FileSystemError(
      'YAML 解析失败',
      path,
      error instanceof Error ? error : undefined,
    )
  }
}

/**
 * 将对象序列化为 YAML 并写入文件（2 空格缩进）
 */
export async function writeYaml(path: string, data: unknown): Promise<void> {
  const content = yaml.dump(data, { indent: 2 })
  await writeFile(path, content)
}
