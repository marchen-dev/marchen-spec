## 1. 为 @marchen-spec/fs 包添加依赖

- [x] 1.1 在 `packages/fs/package.json` 中添加 `js-yaml` 依赖
- [x] 1.2 在 `packages/fs/package.json` 中添加 `@types/js-yaml` 开发依赖
- [x] 1.3 运行 `pnpm install` 安装依赖

## 2. 实现 fs 包的核心文件操作

- [x] 2.1 在 `packages/fs/src/index.ts` 中实现 `ensureDir()` 函数

```typescript
import { promises as fs } from 'node:fs'

/**
 * 递归创建目录，如果目录已存在则静默跳过
 */
export async function ensureDir(path: string): Promise<void> {
  try {
    await fs.mkdir(path, { recursive: true })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error
    }
  }
}
```

- [x] 2.2 在 `packages/fs/src/index.ts` 中实现 `exists()` 函数

```typescript
/**
 * 检查路径是否存在（文件或目录）
 */
export async function exists(path: string): Promise<boolean> {
  try {
    await fs.access(path)
    return true
  } catch {
    return false
  }
}
```

- [x] 2.3 在 `packages/fs/src/index.ts` 中实现 `readFile()` 函数

```typescript
import { MarchenSpecError } from '@marchen-spec/shared'

/**
 * 读取文件内容（UTF-8）
 */
export async function readFile(path: string): Promise<string> {
  try {
    return await fs.readFile(path, 'utf-8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new MarchenSpecError(`文件不存在: ${path}`)
    }
    throw error
  }
}
```

- [x] 2.4 在 `packages/fs/src/index.ts` 中实现 `writeFile()` 函数（自动创建父目录）

```typescript
/**
 * 写入文件内容（UTF-8），自动创建父目录
 */
export async function writeFile(path: string, content: string): Promise<void> {
  await ensureDir(dirname(path))
  await fs.writeFile(path, content, 'utf-8')
}
```

- [x] 2.5 在 `packages/fs/src/index.ts` 中实现 `listDir()` 函数

```typescript
/**
 * 列举目录下的直接子条目
 */
export async function listDir(path: string): Promise<string[]> {
  try {
    return await fs.readdir(path)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new MarchenSpecError(`目录不存在: ${path}`)
    }
    throw error
  }
}
```

## 3. 实现 fs 包的 YAML 操作

- [x] 3.1 在 `packages/fs/src/index.ts` 中实现 `readYaml<T>()` 泛型函数

```typescript
import yaml from 'js-yaml'

/**
 * 读取 YAML 文件并解析为对象
 */
export async function readYaml<T>(path: string): Promise<T> {
  const content = await readFile(path)
  try {
    return yaml.load(content) as T
  } catch (error) {
    throw new MarchenSpecError(`YAML 解析失败: ${path}`)
  }
}
```

- [x] 3.2 在 `packages/fs/src/index.ts` 中实现 `writeYaml()` 函数

```typescript
/**
 * 将对象序列化为 YAML 并写入文件
 */
export async function writeYaml(path: string, data: unknown): Promise<void> {
  const content = yaml.dump(data, { indent: 2 })
  await writeFile(path, content)
}
```

- [x] 3.3 确保 YAML 序列化使用 2 空格缩进

✅ 已在 `writeYaml()` 中通过 `{ indent: 2 }` 配置实现

## 4. 为 fs 包添加测试

- [x] 4.1 创建 `packages/fs/test/fs.test.ts` 测试文件

```typescript
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { join } from 'node:path'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { ensureDir, exists, listDir, readFile, readYaml, writeFile, writeYaml } from '../src/index.js'

describe('fs operations', () => {
  let testDir: string

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'marchen-test-'))
  })

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true })
  })

  // 测试用例在后续任务中添加
})
```

- [x] 4.2 添加 `ensureDir()` 的测试用例（创建嵌套目录、目录已存在）

```typescript
describe('ensureDir', () => {
  it('should create nested directories', async () => {
    const dir = join(testDir, 'foo', 'bar', 'baz')
    await ensureDir(dir)
    expect(await exists(dir)).toBe(true)
  })

  it('should not throw if directory already exists', async () => {
    const dir = join(testDir, 'existing')
    await ensureDir(dir)
    await expect(ensureDir(dir)).resolves.toBeUndefined()
  })
})
```
- [x] 4.3 添加 `exists()` 的测试用例（路径存在、路径不存在）

```typescript
describe('exists', () => {
  it('should return true for existing path', async () => {
    const file = join(testDir, 'test.txt')
    await writeFile(file, 'hello')
    expect(await exists(file)).toBe(true)
  })

  it('should return false for non-existing path', async () => {
    expect(await exists(join(testDir, 'nope.txt'))).toBe(false)
  })
})
```

- [x] 4.4 添加 `readFile()` 和 `writeFile()` 的测试用例

```typescript
describe('readFile / writeFile', () => {
  it('should write and read file content', async () => {
    const file = join(testDir, 'hello.txt')
    await writeFile(file, '你好世界')
    expect(await readFile(file)).toBe('你好世界')
  })

  it('should auto-create parent directories on write', async () => {
    const file = join(testDir, 'a', 'b', 'c.txt')
    await writeFile(file, 'deep')
    expect(await readFile(file)).toBe('deep')
  })

  it('should throw MarchenSpecError when reading non-existing file', async () => {
    await expect(readFile(join(testDir, 'missing.txt'))).rejects.toThrow('文件不存在')
  })
})
```

- [x] 4.5 添加 `listDir()` 的测试用例（非空目录、空目录、不存在的目录）

```typescript
describe('listDir', () => {
  it('should list directory entries', async () => {
    await writeFile(join(testDir, 'a.txt'), '')
    await writeFile(join(testDir, 'b.txt'), '')
    await ensureDir(join(testDir, 'subdir'))
    const entries = await listDir(testDir)
    expect(entries).toContain('a.txt')
    expect(entries).toContain('b.txt')
    expect(entries).toContain('subdir')
  })

  it('should return empty array for empty directory', async () => {
    const emptyDir = join(testDir, 'empty')
    await ensureDir(emptyDir)
    expect(await listDir(emptyDir)).toEqual([])
  })

  it('should throw MarchenSpecError for non-existing directory', async () => {
    await expect(listDir(join(testDir, 'nope'))).rejects.toThrow('目录不存在')
  })
})
```

- [x] 4.6 添加 `readYaml()` 和 `writeYaml()` 的测试用例

```typescript
describe('readYaml / writeYaml', () => {
  it('should write and read YAML', async () => {
    const file = join(testDir, 'config.yaml')
    const data = { schema: 'spec-driven', context: '', perArtifactRules: {} }
    await writeYaml(file, data)
    const result = await readYaml<typeof data>(file)
    expect(result).toEqual(data)
  })

  it('should throw MarchenSpecError for invalid YAML', async () => {
    const file = join(testDir, 'bad.yaml')
    await writeFile(file, '{{invalid: yaml::}')
    await expect(readYaml(file)).rejects.toThrow('YAML 解析失败')
  })
})
```

- [x] 4.7 使用 `mkdtemp()` 创建临时测试目录，测试后清理

✅ 已在 4.1 的 `beforeEach` / `afterEach` 中实现

## 5. 在 core 包中实现 init 用例

- [x] 5.1 创建 `packages/core/src/init.ts` 文件

```typescript
import { join } from 'node:path'
import { ensureDir, exists, getSpecDirectory, resolveWorkspaceRoot, writeFile, writeYaml } from '@marchen-spec/fs'
import { CHANGE_DIRECTORY_NAME } from '@marchen-spec/shared'

/**
 * 初始化 OpenSpec 目录结构
 */
export async function initializeOpenSpec(): Promise<void> {
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
    perArtifactRules:
  })

  // 创建 .gitkeep 占位文件
  await writeFile(join(specDir, 'specs', '.gitkeep'), '')
  await writeFile(join(specDir, CHANGE_DIRECTORY_NAME, '.gitkeep'), '')
  await writeFile(join(specDir, CHANGE_DIRECTORY_NAME, 'archive', '.gitkeep'), '')
}

/**
 * 检查 OpenSpec 是否已初始化
 */
export async function checkIfInitialized(): Promise<boolean> {
  const specDir = getSpecDirectory()
  return await exists(specDir)
}
```

- [x] 5.2 实现 `initializeOpenSpec()` 函数，创建 openspec 目录结构

✅ 已在 5.1 中实现

- [x] 5.3 实现 `checkIfInitialized()` 函数，检查 openspec 目录是否存在

✅ 已在 5.1 中实现

- [x] 5.4 在 `packages/core/src/index.ts` 中导出 init 相关函数

```typescript
// 在现有导出后添加
export { checkIfInitialized, initializeOpenSpec } from './init.js'
```

## 6. 为 core 包的 init 用例添加测试

- [x] 6.1 创建 `packages/core/test/init.test.ts` 测试文件
- [x] 6.2 使用 vitest 的 `vi.spyOn()` mock fs 层函数
- [x] 6.3 添加 `initializeOpenSpec()` 的测试用例（验证目录创建、配置文件写入）
- [x] 6.4 添加 `checkIfInitialized()` 的测试用例

## 7. 在 CLI 中实现 init 命令

- [x] 7.1 创建 `apps/cli/src/commands/init.ts` 文件

```typescript
import type { Command } from 'commander'
import * as p from '@clack/prompts'
import { checkIfInitialized, initializeMarchenSpec } from '@marchen-spec/core'

/**
 * 注册 init 命令
 */
export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('初始化 MarchenSpec 目录结构')
    .option('--force', '强制覆盖已存在的目录')
    .action(async (options) => {
      p.intro('MarchenSpec CLI')

      // 检查是否已初始化
      const alreadyExists = await checkIfInitialized()
      if (alreadyExists && !options.force) {
        const confirm = await p.confirm({
          message: 'MarchenSpec 目录已存在，是否覆盖？',
        })

        if (p.isCancel(confirm) || !confirm) {
          p.cancel('操作已取消')
          process.exit(0)
        }
      }

      // 执行初始化
      await initializeMarchenSpec()

      p.outro('MarchenSpec 初始化成功！')
    })
}
```

- [x] 7.2 实现 `registerInitCommand()` 函数，注册 init 命令到 commander

✅ 已在 7.1 中实现

- [x] 7.3 添加 `--force` 参数支持

✅ 已在 7.1 中实现
- [x] 7.4 使用 `@clack/prompts` 实现已存在时的确认交互

✅ 已在 7.1 中实现

- [x] 7.5 在 `apps/cli/src/index.ts` 中注册 init 命令

```typescript
// 在 import 部分添加
import { registerInitCommand } from './commands/init.js'

// 在 buildCliProgram 函数中添加
export function buildCliProgram(): Command {
  const program = new Command()

  program
    .name('marchenspec')
    .description('OpenSpec-like spec workflow CLI')
    .version('0.1.0')

  registerInfoCommand(program)
  registerInitCommand(program)  // 添加这一行

  return program
}
```

## 8. 为 CLI init 命令添加测试

- [x] 8.1 在 `apps/cli/test/cli.test.ts` 中添加 init 命令的测试

```typescript
// 在现有测试后添加
describe('init 命令', () => {
  it('应该正确注册 init 命令', () => {
    const program = buildCliProgram()
    const initCommand = program.commands.find(cmd => cmd.name() === 'init')

    expect(initCommand).toBeDefined()
    expect(initCommand?.description()).toBe('初始化 MarchenSpec 目录结构')
  })
})
```

- [x] 8.2 验证 init 命令已正确注册到 commander

✅ 已在 8.1 中实现

## 9. 构建和验证

- [x] 9.1 运行 `pnpm build` 确保所有包构建成功
- [x] 9.2 运行 `pnpm test` 确保所有测试通过
- [x] 9.3 运行 `pnpm typecheck` 确保类型检查通过
- [x] 9.4 在临时目录中手动测试 `marchenspec init` 命令
- [x] 9.5 验证创建的目录结构和 config.yaml 内容正确
