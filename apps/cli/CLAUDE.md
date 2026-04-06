# @marchen-spec/cli

## 包职责

CLI 应用层，负责命令行界面、用户交互和参数解析。使用 `commander` 处理命令，`@clack/prompts` 提供交互式 UI。

## 依赖关系

```
@marchen-spec/core
    ↑
@marchen-spec/cli ──→ @marchen-spec/shared（错误类型）
```

依赖 `core`（业务逻辑）和 `shared`（错误类型），是依赖图的最上层。

## 源码结构

```
src/
├── index.ts              # CLI 入口
├── program.ts            # 构建 Commander 程序，注册所有命令
├── commands/
│   ├── init.ts           # init 命令
│   ├── new.ts            # new 命令
│   ├── list.ts           # list 命令
│   ├── archive.ts        # archive 命令
│   ├── status.ts         # status 命令
│   └── instructions.ts   # instructions 命令
└── utils/
    ├── context.ts        # createContext() 工具
    └── error.ts          # handleError() 错误处理
```

## 已实现命令

### init 命令
```bash
marchen init          # 交互式确认
marchen init --force  # 跳过确认
```

### new 命令
```bash
marchen new <name>    # 创建变更（kebab-case）
```

### list 命令
```bash
marchen list          # 列出所有 open 变更
```

### archive 命令
```bash
marchen archive <name>  # 归档变更，移动到 archive/ 并更新 metadata
```

### status 命令
```bash
marchen status <name>         # 查看 artifact 内容状态和工作流建议
marchen status <name> --json  # 输出 JSON 格式（给 Skill 消费）
```

### instructions 命令
```bash
marchen instructions <name> <artifact-id>         # 获取 artifact 创建指令（JSON）
marchen instructions <name> <artifact-id> --json   # 同上（默认行为）
marchen instructions <name> apply --json           # 获取 apply 实现指令（state + progress + context）
```

## 添加新命令

1. 创建 `src/commands/example.ts`：

```typescript
import type { Command } from 'commander'
import { ChangeManager, Workspace } from '@marchen-spec/core'
import { MarchenSpecError } from '@marchen-spec/shared'

export function registerExampleCommand(program: Command): void {
  program
    .command('example')
    .description('示例命令')
    .action(async () => {
      const workspace = new Workspace()
      const changes = new ChangeManager(workspace)
      // 通过实例调用业务逻辑
    })
}
```

2. 在 `src/program.ts` 中注册：
```typescript
import { registerExampleCommand } from './commands/example.js'
registerExampleCommand(program)
```

## 开发命令

```bash
pnpm build      # 构建
pnpm dev        # 开发模式
pnpm test       # 运行测试
pnpm typecheck  # 类型检查
```

## 注意事项

1. **薄 CLI 层**: 只负责用户交互，业务逻辑通过 core 包的 Class 实例调用
2. **错误处理**: 捕获 `MarchenSpecError`，转换为用户友好的消息
3. **Class 实例**: 每个命令内部创建 `Workspace` + `ChangeManager` 实例
