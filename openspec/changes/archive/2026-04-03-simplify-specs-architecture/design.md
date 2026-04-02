## Context

当前 MarchenSpec 模仿 OpenSpec 使用双层规范系统：
- `marchenspec/specs/` - 主规范（系统当前状态）
- `changes/*/specs/` - Delta specs（变更增量）

通过深入调研发现：
1. OpenSpec 按需加载 specs，不是全部注入上下文
2. 合并逻辑复杂（ADDED/MODIFIED/REMOVED）
3. 容易出现 main spec 和 delta spec 不一致
4. 对于小团队中型项目，这个复杂度不值得

## Goals / Non-Goals

**Goals:**
- 删除 main specs 目录及其创建逻辑
- 简化 archive 命令（不需要 sync）
- 保持 delta specs 功能不变
- 更新文档说明新架构

**Non-Goals:**
- 不改变 delta specs 的格式和用法
- 不影响现有的 init/new/list 命令
- 不实现按需生成 specs 的功能（留待未来）

## Decisions

### 决策 1: 删除 main specs，archive 作为唯一真相

**理由:**
- Archive 已经包含完整的变更历史
- AI 可以自己读取多个 delta specs 并理解
- 避免维护两份内容的同步问题

**替代方案:**
- 保留 main specs，实现完整的 sync 逻辑 → 复杂度高
- 按需生成 main specs → 可以作为未来优化

### 决策 2: 简化 workspace.initialize()

**修改:**
- 删除 `ensureDir(join(this.specDir, 'specs'))`
- 删除对应的 .gitkeep 文件创建

**理由:**
- 直接在源头阻止 main specs 目录创建
- 保持其他目录创建逻辑不变

## Risks / Trade-offs

**风险 1: 没有"当前状态"的快速视图**
- 影响: 需要遍历 archive 才能了解系统当前状态
- 缓解: 项目规模小（<100 changes），遍历成本可接受；未来可实现按需生成

**风险 2: 偏离 OpenSpec 标准**
- 影响: 不能直接使用 OpenSpec 的工具和文档
- 缓解: MarchenSpec 本就是独立实现，有自己的设计决策

**权衡: 简单性 vs 功能性**
- 选择简单性，适合目标用户（小团队）
- 如果项目变大，可以重新引入 main specs
