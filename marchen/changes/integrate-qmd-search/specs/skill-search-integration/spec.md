## skill-search-integration

更新 explore skill 模板，在检查上下文阶段自动调用 `marchen search` 获取相关历史。

### 需求: explore skill SHALL 在检查上下文时搜索相关历史

#### 场景: 用户提到具体话题时搜索

- WHEN explore skill 开始执行
- AND 用户输入包含具体话题（如"error handling"、"CLI 命令"）
- THEN skill 指引 AI 调用 `marchen search "<关键词>" --json`
- AND 将搜索结果作为历史上下文

#### 场景: 搜索到相关历史时深入读取

- WHEN `marchen search` 返回匹配结果
- AND 结果 score >= 0.4
- THEN skill 指引 AI 读取对应 archive 目录下的 design.md 或 proposal.md
- AND 在对话中引用历史决策

#### 场景: 搜索无结果时回退

- WHEN `marchen search` 返回空结果
- THEN 回退到现有方式：读取 changelog.md 浏览历史
