### 需求: apply skill/command 模板 SHALL 包含搜索历史方案的护栏指引

#### 场景: apply 模板护栏包含搜索提示

- WHEN 读取 `templates/skills/apply.md` 和 `templates/commands/apply.md` 的护栏章节
- THEN 包含指引：实现过程中遇到不确定的设计决策时，可用 `marchen search "<关键词>" --json` 搜索历史变更中的相关方案
- AND 指引为可选建议，不是强制步骤
