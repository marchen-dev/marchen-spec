# OpenSpec 功能分析

## 状态

concluded

## 结论

OpenSpec 有 15+ CLI 命令和 11 个 slash command，核心创新是 Delta Spec（增量规范修改）和 Artifact DAG（工件依赖图）。MarchenSpec 当前只实现了 init 和 new，需要按 6 个 Phase 逐步补齐。

## 背景

MarchenSpec 模仿 OpenSpec 做规范驱动工作流工具，需要了解 OpenSpec 的完整功能集以规划开发路线。

## 选项对比

| 功能类别 | OpenSpec 功能 | MarchenSpec 状态 | 优先级 |
|---------|-------------|-----------------|-------|
| 变更创建 | init, new | ✅ 已实现 | - |
| 变更查询 | list, status, show, view | ❌ 未实现 | Phase 2 |
| 工件管理 | instructions, templates | ❌ 未实现 | Phase 2 |
| 规范合并 | archive, sync (Delta Spec) | ❌ 未实现 | Phase 3-4 |
| 质量保障 | validate (并发校验, strict 模式) | ❌ 未实现 | Phase 5 |
| Schema 系统 | schemas, schema init/fork/validate | ❌ 未实现 | Phase 6 |
| 配置管理 | config 子命令 | ❌ 未实现 | Phase 6 |
| 工具集成 | 24 个 AI 工具适配, shell 补全 | ❌ 未实现 | 远期 |

### 核心引擎能力（OpenSpec 内部）

| 能力 | 说明 | MarchenSpec 状态 |
|-----|------|-----------------|
| ArtifactGraph | DAG + Kahn 拓扑排序，计算工件状态 | 类型已定义，运行时逻辑未实现 |
| Delta Spec 解析 | 解析 ADDED/MODIFIED/REMOVED/RENAMED | ❌ 未实现 |
| Spec 合并引擎 | rename → remove → modify → add 顺序合并 | ❌ 未实现 |
| Change 读取 | 读 metadata、列目录、判断工件状态 | ❌ 未实现 |

## 最终选择

按 6 Phase 路线图推进，Phase 1（ArtifactGraph + Change 读取）为最高优先级，Phase 4 完成后达到闭环里程碑。

## 参考

- OpenSpec 仓库: https://github.com/Fission-AI/OpenSpec
- 内置 schema: spec-driven（proposal → specs/design → tasks）
- Delta Spec 合并顺序: rename → remove → modify → add
