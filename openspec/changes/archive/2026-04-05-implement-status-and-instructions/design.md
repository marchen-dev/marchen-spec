## 背景

MarchenSpec CLI 已有 init/new/list/archive/verify 命令。当前 `new` 命令创建变更时会生成所有 artifact 文件（带模板骨架），但没有机制让 AI Skill 知道哪些 artifact 已填充、下一步该做什么。

现有架构：
- `packages/shared` — 类型和常量
- `packages/config` — 配置、schema 定义、artifact 模板
- `packages/core` — ChangeManager（create/archive/list/verify）
- `apps/cli` — 命令注册和 UI

## 目标与非目标

**目标：**
- 新增 `status` 和 `instructions` 两个 CLI 命令，提供 JSON API 给 Skill 消费
- 实现内容感知的 artifact 状态检测（区分模板骨架和实质内容）
- 实现固定工作流规则计算（ready/blocked/next）
- 移除 verify 命令

**非目标：**
- 不做通用 artifact-graph 引擎（不需要 Kahn 拓扑排序）
- 不做多 schema 支持（只有 spec-driven）
- 不做 Skill 层（Phase 2）
- 不做 specs 目录的 hints/expectedFiles 解析

## 决策

### 1. 内容检测策略：字符数阈值

**选择**: 去掉 HTML 注释、空行、纯 markdown 标题行后，剩余内容超过 20 字符算 `filled`。

**替代方案**: 精确匹配模板内容（hash 比较）。
**理由**: 模板可能被用户部分修改（删掉注释但没写内容），hash 比较会误判。字符数阈值简单且容错性好。Skill 每次都会读文件内容自己判断，内容检测只是粗粒度信号。

### 2. specs 目录依赖内容：自动拼接

**选择**: `instructions` 返回 specs 依赖时，自动拼接所有 spec 文件内容到 `content` 字段，用 `--- specs/<name>/spec.md ---` 分隔。

**替代方案 A**: content 为 null，Skill 自己读文件。
**替代方案 B**: 加 files 数组字段，每个文件单独列出。
**理由**: 方案 A 打破"调 instructions 就拿到一切"的简洁模型。方案 B 让 DependencyInfo 类型变复杂。MarchenSpec 定位中小项目，specs 不会太多，拼接不会导致 JSON 过大。

### 3. 工作流计算：硬编码 if/else

**选择**: 依赖规则直接写在 ChangeManager 的 `computeWorkflow` 私有方法中。

**替代方案**: 从 `DEFAULT_SCHEMA.artifacts` 的 `requires` 字段动态计算。
**理由**: 虽然 schema 已经定义了 requires，但动态计算需要通用的图遍历逻辑。目前只有 4 个节点，硬编码更清晰。如果未来需要多 schema，再重构为动态计算。

### 4. verify 处理：直接删除

**选择**: 完全移除 verify 命令、方法和类型。

**替代方案**: 保留 verify 命令加 deprecation warning。
**理由**: verify 刚发布不久（2026-04-05），还没有外部用户。status 是完全替代，没有保留的必要。

### 5. instructions 默认输出 JSON

**选择**: instructions 命令默认输出 JSON，`--json` 标志可选但行为一致。

**理由**: 这个命令主要给 Skill 消费，人类直接用的场景很少。默认 JSON 减少 Skill 调用时的参数。

## 风险与权衡

- **风险**: 内容检测的 20 字符阈值可能误判（用户写了很短的内容被判为 empty）
  → 缓解: 阈值可调，且 Skill 不完全依赖这个判断，它会读文件内容自己决策
- **风险**: specs 内容拼接在大项目中可能导致 JSON 过大
  → 缓解: MarchenSpec 定位中小项目，且未来可以加 `--no-content` 标志
- **权衡**: 硬编码工作流规则牺牲了扩展性，但换来了实现简单性
