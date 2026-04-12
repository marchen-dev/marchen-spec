# MarchenSpec

规范驱动开发 CLI — 让 AI 按 proposal → specs → design → tasks 的流程，先想清楚再动手写代码。

## 它做什么

MarchenSpec 管理"变更"的生命周期。每个变更是一个目录，包含一组 artifact：

```
marchenspec/changes/add-user-auth/
├── .metadata.yaml   # 元数据（schema、状态、创建时间）
├── proposal.md      # 动机和变更内容
├── specs/           # 每个能力的需求规格
│   └── login-flow/
│       └── spec.md
├── design.md        # 技术方案
└── tasks.md         # 实现任务清单
```

CLI 提供 JSON API，AI Skills 消费这些 API 驱动工作流：

```
CLI (marchen)                    AI Skills (.claude/skills/)
─────────────                    ──────────────────────────
marchen new <name>         ←──  /marchen:propose      创建变更 + 填充所有 artifact
marchen status <name>      ←──  /marchen:propose-lite  轻量变更，只填 tasks.md
marchen instructions ...   ←──  /marchen:apply         逐个实现 task
marchen archive <name>          /marchen:explore       思考伙伴，不写代码
```

## 两种 Schema

| Schema | Artifact 流程 | 适用场景 |
|--------|--------------|---------|
| `full`（默认） | proposal → specs → design → tasks | 新功能、架构变更 |
| `lite` | tasks（含背景章节） | bug 修复、小改动 |

```bash
marchen new add-dark-mode              # full schema
marchen new fix-typo --schema lite     # lite schema
```

## 快速开始

```bash
# 安装
npm install -g marchen-spec

# 在项目根目录初始化
marchen init

# 创建变更（AI 会填充所有 artifact）
# 在 Claude Code 中执行：
/marchen:propose add-user-auth

# 开始实现
/marchen:apply add-user-auth

# 完成后归档
marchen archive add-user-auth
```

`marchen init` 会生成 `.claude/skills/` 和 `.claude/commands/` 文件，Claude Code 可以直接使用。

## CLI 命令

```bash
marchen init                              # 初始化目录结构 + 生成 AI skill 文件
marchen new <name> [--schema full|lite]   # 创建变更
marchen list [--json]                     # 列出所有 open 变更
marchen status <name> [--json]            # 查看 artifact 状态和工作流建议
marchen instructions <name> <artifact>    # 获取 artifact 创建指令（JSON）
marchen archive <name>                    # 归档已完成的变更
```

## 项目结构

pnpm monorepo，Turborepo 编排构建：

```
apps/cli          CLI 入口（commander + @clack/prompts）
packages/core     业务逻辑（Workspace + ChangeManager）
packages/config   Schema 定义、模板、配置
packages/fs       文件系统操作封装
packages/shared   共享类型、常量、错误
```

依赖方向：`cli → core → config / fs → shared`

## 开发

```bash
pnpm install      # 安装依赖
pnpm build        # 构建所有包
pnpm dev          # watch 模式
pnpm test         # 运行测试
pnpm check        # lint + typecheck + test
pnpm lint:fix     # Lint 自动修复
pnpm format       # 格式化
```

## License

MIT
