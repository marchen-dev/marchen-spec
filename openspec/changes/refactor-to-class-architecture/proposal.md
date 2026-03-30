## Why

当前 core、fs、shared 包的代码组织是纯函数堆叠模式，随着功能增长（list、status、archive、validate），函数越来越多且缺乏内聚性。每个函数各自计算路径、检查初始化状态，逻辑分散重复。引入 Class 架构可以将相关操作收归到领域对象中，为后续功能开发提供清晰的扩展点。

## What Changes

- **BREAKING** 重构 `@marchen-spec/core` 的公共 API：散落函数收归为 `Workspace` 和 `ChangeManager` 两个类
- 拆分 `@marchen-spec/fs` 的单文件为 4 个模块（paths / directory / file / yaml）
- 拆分 `@marchen-spec/shared` 的单文件为 3 个模块（types / constants / errors）
- 更新 `@marchen-spec/cli` 的命令实现以适配新的 Class API
- 更新所有测试以匹配新的 API 形式

## Capabilities

### New Capabilities
- `workspace-class`: Workspace 类的 API 规范，包括工作区上下文管理、初始化检查和初始化操作
- `change-manager-class`: ChangeManager 类的 API 规范，包括变更的创建、列出等操作

### Modified Capabilities
- `init-command`: init 命令改为通过 Workspace 实例调用
- `change-creation`: 变更创建改为通过 ChangeManager 实例调用
- `change-listing`: 变更列出改为通过 ChangeManager 实例调用
- `file-system-operations`: 文件拆分，公共 API 不变
- `project-foundation`: 基础检查改为 Workspace 类方法

## Impact

- **core 包**：完全重写 src/ 目录，从函数式改为 Class 式
- **fs 包**：拆文件，index.ts 统一 re-export，对外 API 不变
- **shared 包**：拆文件，index.ts 统一 re-export，对外 API 不变
- **cli 包**：所有命令实现需适配（创建 Workspace → 调用方法）
- **测试**：所有测试需重写以匹配新 API
- **依赖方向不变**：cli → core → {config, fs} → shared
