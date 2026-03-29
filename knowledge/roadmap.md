# 方向规划

> 最后更新: 2026-03-29

## 开发路线图

### Phase 1: 核心引擎（基础能力层）

所有后续命令的基石，用户不可见的内部能力。按顺序逐个开发。

- **A. ArtifactGraph**: 工件依赖图，拓扑排序，getNextArtifacts/getBuildOrder/isComplete/getBlocked。放在 core 包。
- **B. Change 读取**: 读 .metadata.yaml、列出变更目录、读取工件文件、判断工件完成状态。放在 core 包。

### Phase 2: 基础命令（用户可见的第一批功能）

依赖 Phase 1，按顺序逐个开发。

- **C. list 命令**: 列出所有变更，过滤/排序，JSON 输出。依赖 B。
- **D. status 命令**: 工件完成进度，下一步建议，JSON 输出。依赖 A + B。
- **E. instructions 命令**: 生成工件创建指引，含上下文+模板。依赖 A + 模板系统。

### Phase 3: Delta Spec 引擎（归档的前置条件）

- **F. Delta Spec 解析与合并**: 解析 ADDED/MODIFIED/REMOVED/RENAMED，合并到主规范（rename → remove → modify → add），冲突检测，dry-run 模式。放在 core 包。

### Phase 4: 归档（闭环！）

- **G. archive 命令**: 校验任务完成度，合并 delta specs → 主规范，移动到 archive/，更新 metadata 状态。依赖 B + F。
- 🎯 **里程碑**: 完整变更生命周期闭环 (new → status → instructions → apply → archive)

### Phase 5: 质量与可视化

- **H. validate 命令**: 结构校验，CI 友好
- **I. show 命令**: 查看变更/规范详情
- **J. view 命令**: 终端仪表盘，进度可视化

### Phase 6: 高级能力（远期）

- **K. 自定义 Schema**: schema init/fork/validate
- **L. config 管理命令**
- **M. Shell 补全**

## 依赖关系图

```
开发顺序（串行）:

A. ArtifactGraph → B. Change 读取 → C. list → D. status → E. instructions
→ F. Delta Spec 引擎 → G. archive 🎯闭环
→ H. validate → I. show → J. view
→ K. schema → L. config → M. completion
```

## 当前位置

- ✅ Phase 0 完成: init, new, knowledge
- ➡️ 下一步: A. ArtifactGraph
