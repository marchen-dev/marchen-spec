## Why

archive 后知识"沉没"——18 个 archive 目录、70+ 个 markdown 文件，explore 时无法快速获取项目做过什么决策。需要一个轻量索引，让 AI 在 explore 阶段能快速定位相关历史变更并按需深入。

## What Changes

- `Workspace.initialize()` 创建空 `changelog.md`（标题 + 空内容）
- `ChangeManager.archive()` 归档后自动 append 一行摘要到 `changelog.md`
- CLI `archive` 命令新增 `--summary` 选项，传递摘要文本
- fs 包新增 `appendFile()` 函数
- explore skill 模板增加"读取 changelog.md"步骤
- archive skill 模板增加"AI 生成摘要传给 --summary"步骤

## Capabilities

### New Capabilities

- `changelog-generation`: archive 时自动写入 changelog.md 的机制（格式、写入逻辑、init 创建）

### Modified Capabilities

- `change-creation`: `marchen init` 时额外创建 changelog.md
- `archive-command`: archive 命令支持 --summary 参数，归档后写入 changelog

## Impact

- `packages/fs` — 新增 `appendFile` 函数
- `packages/shared` — 新增 `ArchiveOptions` 类型
- `packages/core` — `ChangeManager.archive()` 签名变更 + changelog 写入逻辑；`Workspace.initialize()` 创建 changelog.md
- `apps/cli` — archive 命令加 `--summary` 选项
- `packages/config/templates/skills/` — explore.md 和 archive.md 模板更新
