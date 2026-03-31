# MarchenSpec 路线图

## 已完成 ✅

- 2026-03-22: [项目基础搭建](../openspec/changes/archive/2026-03-22-bootstrap-monorepo-foundation/)
- 2026-03-29: [文件系统包 + init 命令](../openspec/changes/archive/2026-03-29-implement-fs-and-init-command/)
- 2026-03-29: [new 命令](../openspec/changes/archive/2026-03-29-implement-new-command/)
- 2026-03-29: [知识库结构](../openspec/changes/archive/2026-03-29-add-knowledge-base/)
- 2026-03-30: [list 命令](../openspec/changes/archive/2026-03-30-implement-list-command/)
- 2026-03-31: [知识库重构为 docs 结构](../openspec/changes/archive/2026-03-31-refactor-knowledge-to-docs/)
- 2026-03-30: [Class 架构重构](../openspec/changes/archive/2026-03-30-refactor-to-class-architecture/)

## 进行中 🚧

- [ ] 简化 specs 架构 (去掉 main specs，archive 作为唯一真相)
- [ ] archive 命令 (简化版，只移动文件)
- [ ] verify 命令

## 计划中 📋

参考 [OpenSpec 功能清单](./references/openspec-llms.txt) | [Specs 架构决策](./references/specs-architecture-decision.md)

### 核心循环 (优先)
- [ ] explore 模式
- [ ] continue 命令
- [ ] propose 命令

### 辅助命令
- [ ] ff 命令
- [ ] bulk-archive 命令
- [ ] onboard 命令

### 已移除
- ~~sync 命令~~ (不再需要，见 [specs 架构决策](./references/specs-architecture-decision.md))
