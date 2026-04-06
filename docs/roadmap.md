# MarchenSpec 路线图

参考 [架构决策](./references/specs-architecture-decision.md) | [OpenSpec 功能清单](./references/openspec-llms.txt)

## 已完成 ✅

- 2026-03-22: [项目基础搭建](../openspec/changes/archive/2026-03-22-bootstrap-monorepo-foundation/)
- 2026-03-29: [文件系统包 + init 命令](../openspec/changes/archive/2026-03-29-implement-fs-and-init-command/)
- 2026-03-29: [new 命令](../openspec/changes/archive/2026-03-29-implement-new-command/)
- 2026-03-29: [知识库结构](../openspec/changes/archive/2026-03-29-add-knowledge-base/)
- 2026-03-30: [list 命令](../openspec/changes/archive/2026-03-30-implement-list-command/)
- 2026-03-31: [知识库重构为 docs 结构](../openspec/changes/archive/2026-03-31-refactor-knowledge-to-docs/)
- 2026-03-30: [Class 架构重构](../openspec/changes/archive/2026-03-30-refactor-to-class-architecture/)
- 2026-04-03: [错误处理重构](../openspec/changes/archive/2026-04-03-refactor-error-handling/)
- 2026-04-03: [CLI 发布配置](../openspec/changes/archive/2026-04-03-setup-cli-release/)
- 2026-04-03: 简化 specs 架构 (去掉 main specs，archive 作为唯一真相)
- 2026-04-03: archive 命令 (简化版，只移动文件)
- 2026-04-05: [verify 命令](../openspec/changes/archive/2026-04-05-implement-verify-command/)
- 2026-04-05: [status + instructions 命令](../openspec/changes/archive/2026-04-05-implement-status-and-instructions/) (废弃 verify，内容感知状态检测)

## 进行中 🚧

（无）

## 计划中 📋

### Phase 1: CLI 基础设施 ✅

~~为 Skill 层提供 JSON API，是后续一切的基础。~~

- [x] status 命令 + instructions 命令

### Phase 2: Skill 层

CLI 提供 API 后，编写 Claude Code skills 驱动 AI 工作流。每个 skill 是 `.claude/skills/marchen-*/SKILL.md`。

- [ ] marchen:continue — 调 status → 找 ready artifact → 调 instructions → LLM 生成 → 写入
- [x] marchen:propose — marchen new + 循环 continue 直到所有 artifact filled（含 codegen 基础设施 + init 生成 skill 文件）
- [ ] marchen:apply — 读 tasks.md，逐个实现 task
- [ ] marchen:explore — 纯对话模式，思考伙伴

### Phase 3: 体验优化

- [ ] bulk-archive 命令（CLI，批量归档）
- [ ] marchen:onboard skill（引导式入门）
- [ ] CLI 交互优化（status 彩色输出等）

### 已移除

- ~~sync 命令~~ (不需要，见 [架构决策](./references/specs-architecture-decision.md))
- ~~verify 命令~~ (被 status 替代，见 [架构决策](./references/specs-architecture-decision.md))
- ~~continue CLI 命令~~ (是 skill，不是 CLI 命令)
- ~~explore CLI 命令~~ (是 skill，不是 CLI 命令)
- ~~propose CLI 命令~~ (是 skill，不是 CLI 命令)
- ~~ff CLI 命令~~ (= propose skill 的别名)
