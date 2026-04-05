## Why

当前 MarchenSpec 的工作流缺少 archive 前的验证环节。用户无法快速了解一个变更的 artifact 完整度和 task 完成情况，只能手动打开文件检查。verify 命令填补这个空缺，为 CLI 层提供结构化的变更状态检查，同时为 AI skill 层（`/opsx:verify`）提供 `--json` 数据源。

## What Changes

- 新增 `marchen verify <name>` CLI 命令
- `ChangeManager` 新增 `verify(name)` 方法，返回结构化的 `VerifyResult`
- `shared` 包新增 `VerifyResult`、`ArtifactStatus`、`TaskItem` 类型定义
- CLI 层做纯信息展示（不做通过/失败判断），支持 `--json` 输出
- tasks 解析返回全部 items（含已完成），CLI 展示时只列未完成项

## Capabilities

### New Capabilities
- `verify-command`: verify 命令的 CLI 交互、core 逻辑和类型定义

### Modified Capabilities

（无）

## Impact

- `packages/shared`: 新增类型
- `packages/core`: ChangeManager 新增方法
- `apps/cli`: 新增命令文件，注册到 commander
