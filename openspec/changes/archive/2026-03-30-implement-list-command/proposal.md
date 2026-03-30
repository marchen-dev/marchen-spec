## 为什么

用户通过 `marchen new` 创建变更后，没有任何方式查看已有的变更。创建变更后的自然下一步是查看所有现有变更，这是用户旅程中的关键断点，阻碍了工作流的连续性。

## 变更内容

- 新增 `marchen list` 命令，展示所有 open 状态的变更
- 在 core 包中实现 `listChanges()` 函数，扫描并读取变更元数据
- 格式化输出为表格，显示变更名称、schema、创建时间
- 处理边界情况：未初始化的仓库、无变更、元数据文件缺失

## 能力

### 新增能力
- `change-listing`：列出工作区内所有 open 状态的变更及其元数据

### 修改的能力
<!-- 无需修改现有能力 -->

## 影响范围

- **新增文件**：
  - `apps/cli/src/commands/list.ts` — CLI 命令实现
  - core 包导出 `listChanges()` 函数
- **修改文件**：
  - `apps/cli/src/index.ts` — 注册 list 命令
  - `packages/core/src/change.ts` — 新增 listChanges 函数
  - `packages/core/src/index.ts` — 导出 listChanges
- **依赖**：复用已有的 fs 操作（`listDir`、`readYaml`）
- **用户体验**：补全基础工作流闭环（init → new → list）
