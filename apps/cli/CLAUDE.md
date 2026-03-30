# @marchen-spec/cli

## 包职责

CLI 应用层，负责命令行界面、用户交互和参数解析。使用 `commander` 处理命令，`@clack/prompts` 提供交互式 UI。

## 依赖关系

```
@marchen-spec/core
    ↑
@marchen-spec/cli
```

依赖 `@marchen-spec/core`，是整个依赖图的最上层。

## 开发命令

```bash
# 构建
pnpm build

# 开发模式（监听文件变化）
pnpm dev

# 运行测试
pnpm test

# 类型检查
pnpm typecheck

# 本地运行 CLI
node dist/index.mjs

# 或使用 tsx 直接运行源码
tsx src/index.ts
```

## 项目结构

```
src/
├── index.ts              # CLI 入口，注册所有命令
├── commands/             # 命令定义目录
│   ├── info.ts          # info 命令实现
│   ├── init.ts          # init 命令实现
│   └── new.ts           # new 命令实现
└── ui/                  # UI 工具函数
    └── log.ts           # 日志输出工具
```

## 已实现命令

### info 命令
显示当前 workspace 的基础结构状态。

```bash
marchen info
```

### init 命令
初始化 MarchenSpec 目录结构。

```bash
marchen init          # 交互式确认
marchen init --force  # 跳过确认
```

### new 命令
创建新的变更（change）。

```bash
marchen new <change-name>  # 创建指定名称的变更
marchen new                # 交互式输入变更名称
```

变更名称必须符合 kebab-case 格式（小写字母、数字、连字符）。

## 添加新命令

### 1. 创建命令文件

在 `src/commands/` 下创建新文件，例如 `example.ts`：

```typescript
import type { Command } from 'commander'
import { log } from '../ui/log.js'

/**
 * 注册 example 命令
 *
 * @param program - Commander 程序实例
 */
export function registerExampleCommand(program: Command): void {
  program
    .command('example')
    .description('示例命令说明')
    .option('-f, --force', '强制执行')
    .action(async (options) => {
      // 调用 core 层的业务逻辑
      const result = await performExample(options)

      // 使用 UI 工具展示结果
      log.success('操作完成')
    })
}
```

### 2. 注册命令

在 `src/index.ts` 中导入并注册：

```typescript
import { registerExampleCommand } from './commands/example.js'

export function buildCliProgram(): Command {
  const program = new Command()

  program
    .name('marchen')
    .description('OpenSpec-like spec workflow CLI')
    .version('0.1.0')

  registerInfoCommand(program)
  registerInitCommand(program)
  registerNewCommand(program)
  registerExampleCommand(program)  // 添加新命令

  return program
}
```

## 代码规范

### 命令注册函数
每个命令一个文件，导出注册函数：

```typescript
/**
 * 注册命令到 CLI 程序
 *
 * @param program - Commander 程序实例
 */
export function registerXxxCommand(program: Command): void {
  // 命令定义
}
```

### UI 交互
使用 `@clack/prompts` 进行交互式输入：

```typescript
import * as p from '@clack/prompts'

const shouldContinue = await p.confirm({
  message: '是否继续？',
  initialValue: false,
})

if (p.isCancel(shouldContinue) || !shouldContinue) {
  p.cancel('操作已取消')
  process.exit(0)
}
```

### 日志输出
使用 `ui/log.ts` 中的工具函数：

```typescript
import { showIntro, showOutro } from '../ui/log.js'

showIntro()  // 显示 'MarchenSpec CLI'
showOutro('操作完成')  // 显示完成消息
```

## 职责边界

**CLI 层只负责**：
- 解析命令行参数
- 用户交互（提示、确认、选择）
- 格式化输出结果
- 错误展示

**不应该包含**：
- 业务逻辑（放在 `@marchen-spec/core`）
- 文件操作（通过 core 调用 fs 包）
- 配置解析（通过 core 调用 config 包）

## 注意事项

1. **薄 CLI 层**: 保持 CLI 层轻量，复杂逻辑委托给 core 包
2. **错误处理**: 捕获 core 层抛出的错误，转换为用户友好的消息
3. **异步操作**: 命令 action 使用 async/await 处理异步操作
4. **退出码**: 成功时退出码为 0，错误时使用非零退出码
