# @marchen-spec/cli

## 包职责

CLI 应用层，负责命令行界面、用户交互和参数解析。使用 `commander` 处理命令，`@clack/prompts` 提供交互式 UI。

## 依赖关系

```
@marchen-spec/core
    ↑
marchen-spec CLI ──→ @marchen-spec/shared（错误类型）
                 ──→ @marchen-spec/config（AgentProvider 注册表）
```

依赖 `core`（业务逻辑）、`shared`（错误类型）和 `config`（provider 列表），是依赖图的最上层。

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
│   ├── instructions.ts   # instructions 命令
│   ├── update.ts         # update 命令
│   └── search.ts         # search 命令
└── utils/
    ├── context.ts        # createContext() 工具
    ├── error.ts          # handleError() 错误处理
    └── model-progress.ts # 模型下载进度格式化（init/update/search 共用）
```

## 已实现命令

### init 命令
```bash
marchen init          # 交互式选择 AI 工具和搜索模式，初始化目录结构
marchen init --force  # 跳过确认
```

### new 命令
```bash
marchen new <name>                 # 创建变更（默认 full schema）
marchen new <name> --schema lite   # 创建轻量变更（lite schema）
```

### list 命令
```bash
marchen list          # 列出所有 open 变更
marchen list --json   # JSON 输出
```

### archive 命令
```bash
marchen archive <name>                        # 归档变更
marchen archive <name> --summary "一句话摘要"  # 归档并写入 changelog 摘要
marchen archive <name> --json                 # JSON 输出（ArchiveResult）
```

### status 命令
```bash
marchen status <name>         # 查看 artifact 内容状态和工作流建议
marchen status <name> --json  # JSON 输出（给 Skill 消费）
```

### instructions 命令
```bash
marchen instructions <name> <artifact-id>         # 获取 artifact 创建指令（JSON）
marchen instructions <name> <artifact-id> --json   # 同上（默认行为）
marchen instructions <name> apply --json           # 获取 apply 实现指令（state + progress + context）
```

### update 命令
```bash
marchen update        # 更新 skill/command 文件，按 config.yaml 同步搜索模型状态
```

### search 命令
```bash
marchen search <query>                # 搜索归档变更历史（按 config.yaml 的 search.mode 决定策略）
marchen search <query> -n 10          # 指定结果数量
marchen search <query> --min-score 0.5  # 最低分数阈值
marchen search <query> --rebuild      # 重建索引后搜索
marchen search <query> --json         # JSON 输出
```

## 添加新命令

1. 创建 `src/commands/example.ts`：

```typescript
import type { Command } from 'commander'
import { createContext } from '../utils/context.js'

export function registerExampleCommand(program: Command): void {
  program
    .command('example')
    .description('示例命令')
    .action(async () => {
      const { workspace, changes } = createContext()
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
3. **createContext()**: 使用 `utils/context.ts` 统一创建 `Workspace` + `ChangeManager` 实例
