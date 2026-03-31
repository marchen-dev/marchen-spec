## Why

OpenSpec 的双层规范系统（main specs + delta specs）在 MarchenSpec 中引入了不必要的复杂度。通过调研发现 OpenSpec 按需加载 specs，且合并逻辑复杂易出错。对于小团队中型项目，archive 作为唯一真相来源更简单高效。

## What Changes

- 删除 `marchenspec/specs/` 目录及其创建逻辑
- 简化 `workspace.initialize()` 方法，不再创建 main specs 目录
- 更新 CLAUDE.md 文档，说明新的架构决策
- 删除现有的 `openspec/specs/` 目录
- archive 命令将简化为纯文件移动，不需要 sync 逻辑

## Capabilities

### New Capabilities
- `archive-command`: 归档变更的命令实现，简化版只做文件移动

### Modified Capabilities
- `workspace-initialization`: 移除 main specs 目录创建
- `project-structure`: 更新项目结构说明

## Impact

- 影响文件：
  - `packages/core/src/workspace.ts` - 删除 specs 目录创建
  - `CLAUDE.md` - 更新架构说明
  - `openspec/specs/` - 删除整个目录
- 不影响 delta specs（`changes/*/specs/`）的创建和使用
- 简化了 archive 命令的实现复杂度
