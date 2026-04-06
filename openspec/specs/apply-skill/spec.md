## apply-skill

apply skill 模板，指导 AI 按 tasks.md 逐个实现任务。

### 需求: 提供 command 和 skill 两种模板

系统 SHALL 在 `templates/commands/apply.md` 和 `templates/skills/apply.md` 提供 apply 模板。

#### 场景: command 模板存在

WHEN 构建 config 包
THEN `commands/apply.md` SHALL 存在且包含完整的 apply 流程指引

#### 场景: skill 模板存在

WHEN 构建 config 包
THEN `skills/apply.md` SHALL 存在且包含完整的 apply 流程指引

### 需求: skill 模板使用 instructions apply 获取上下文

模板 SHALL 指导 AI 通过 `marchen instructions <name> apply --json` 一次调用获取全部上下文，不需要额外调用 status 或读文件。

#### 场景: 模板中的 CLI 调用

WHEN AI 按模板执行
THEN 获取上下文只需一次 `marchen instructions <name> apply --json` 调用

### 需求: skill 模板处理三种状态

模板 SHALL 指导 AI 根据 `state` 字段处理 blocked、ready、all_done 三种状态。

#### 场景: blocked 状态

WHEN `state` 为 `"blocked"`
THEN 模板 SHALL 指导 AI 提示用户先完成 artifacts

#### 场景: all_done 状态

WHEN `state` 为 `"all_done"`
THEN 模板 SHALL 指导 AI 提示用户归档变更
