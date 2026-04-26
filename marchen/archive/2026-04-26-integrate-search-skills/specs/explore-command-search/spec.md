### 需求: explore command 模板 SHALL 包含 marchen search 步骤

#### 场景: command 版本与 skill 版本对齐

- WHEN 读取 `templates/commands/explore.md` 的"检查上下文"章节
- THEN 包含 `marchen search "<关键词>" --json` 步骤
- AND 包含 score >= 0.4 时读取 archive 详情的指引
- AND 包含 `marchen search` 不可用时回退到 changelog.md 的说明
