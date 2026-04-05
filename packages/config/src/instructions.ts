/**
 * Artifact 指导文本
 *
 * 每个 artifact 的 LLM 指导文本，告诉 AI 如何填充该 artifact
 */
export const ARTIFACT_INSTRUCTIONS: Record<string, string> = {
  proposal: `根据用户的描述，填写 proposal 的各个部分。
- 动机：说明为什么要做这个变更，解决什么问题
- 变更内容：列出具体改动
- 能力：列出需要创建 spec 的 capability（kebab-case 命名），每个会生成 specs/<name>/spec.md
- 影响范围：说明涉及的代码和系统
保持简洁，1-2 页。聚焦"为什么"和"做什么"，不要写实现细节。`,

  specs: `根据 proposal 中列出的能力，为每个能力创建 specs/<name>/spec.md。
- 每个需求用 '### 需求:' 开头，使用 SHALL/MUST 表述
- 每个场景用 '#### 场景:' 开头，使用 WHEN/THEN 格式
- 每个需求至少一个场景
- 场景应该是可测试的`,

  design: `根据 proposal 的动机和 specs 的需求，设计技术实现方案。
- 背景：当前状态和约束
- 目标与非目标：明确范围
- 决策：关键技术选择和理由（为什么选 X 而不是 Y）
- 风险与权衡：已知限制和可能出错的地方
聚焦架构和方案，不要写逐行实现细节。`,

  tasks: `根据 specs 的需求和 design 的技术方案，拆分实现任务。
- 按任务组分组，每组用 ## 标题
- 每个任务用 checkbox 格式：- [ ] X.Y 描述
- 任务粒度要小到一个会话内能完成
- 按依赖顺序排列（先做的在前）`,
}
