[English](./README.en.md)

# MarchenSpec

规范驱动开发 CLI — 让 AI 按结构化流程先想清楚再动手写代码。

[![npm version](https://img.shields.io/npm/v/marchen-spec)](https://www.npmjs.com/package/marchen-spec)

## 为什么需要它

AI 写代码很快，但容易"想到哪写到哪"。MarchenSpec 给 AI 加了一层思考框架：

- 先写 proposal 明确动机和范围
- 再写 specs 定义需求和验收标准
- 然后 design 确定技术方案
- 最后拆 tasks 逐步实现

每一步都有 artifact 留痕，可追溯、可回顾。

## 快速开始

```bash
# 安装
npm install -g marchen-spec

# 在项目根目录初始化
marchen init
```

在 Claude Code 中使用：

```bash
# 先探索想法，理清思路
/marchen:explore 我想给项目加暗色模式

# 想清楚后，选择合适的模式：

# 轻量模式 — 一步到位：创建变更 → 实现 → 归档
/marchen:lite

# 完整模式 — 适合复杂功能，分步推进
/marchen:propose                     # 生成 proposal → specs → design → tasks
/marchen:apply                       # 逐个实现任务
/marchen:archive                     # 完成后归档
```

`marchen init` 会生成 `.claude/skills/` 和 `.claude/commands/` 文件，Claude Code 可以直接使用。

## 两种 Schema

| Schema | 流程 | 适用场景 |
|--------|------|---------|
| `full`（默认） | proposal → specs → design → tasks | 新功能、架构变更 |
| `lite` | tasks（含背景章节） | bug 修复、小改动、快速迭代 |

```bash
marchen new add-dark-mode              # full schema
marchen new fix-typo --schema lite     # lite schema
```

Lite 模式跳过 proposal/specs/design，直接生成带背景说明的 tasks.md，适合不需要完整规范流程的小变更。

## 变更日志

归档变更时，MarchenSpec 自动在 `marchen/changelog.md` 中追加一行记录：

```markdown
- 2026-04-19: [add-user-auth](./archive/2026-04-19-add-user-auth/) — 实现用户认证功能
```

这为项目提供了一份结构化的变更历史索引，AI 在探索模式下可以读取它了解项目演进脉络。

## 工作区结构

```
marchen/
├── changes/          # 进行中的变更
│   └── add-user-auth/
│       ├── .metadata.yaml
│       ├── proposal.md
│       ├── specs/
│       ├── design.md
│       └── tasks.md
├── archive/          # 已归档的变更
├── changelog.md      # 变更日志索引
└── config.yaml       # 配置
```

## CLI 命令

```bash
marchen init                              # 初始化目录结构 + 生成 AI skill 文件
marchen new <name> [--schema full|lite]   # 创建变更
marchen list [--json]                     # 列出所有 open 变更
marchen status <name> [--json]            # 查看 artifact 状态和工作流建议
marchen instructions <name> <artifact>    # 获取 artifact 创建指令（JSON）
marchen archive <name> [--summary <text>] # 归档变更并写入 changelog
```

## AI Skills

| Skill | 用途 |
|-------|------|
| `/marchen:propose` | 创建变更，填充所有 artifact |
| `/marchen:lite` | 一键式轻量变更（创建 → 实现 → 询问归档） |
| `/marchen:apply` | 逐个实现 task |
| `/marchen:explore` | 思考伙伴，探索问题空间 |
| `/marchen:archive` | 检查完成度后归档 |

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
```

## 致谢

本项目的规范驱动工作流设计受 [OpenSpec](https://github.com/Fission-AI/OpenSpec) 启发。

## License

MIT
