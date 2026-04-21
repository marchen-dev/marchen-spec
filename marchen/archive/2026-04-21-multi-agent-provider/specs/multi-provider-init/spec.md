# multi-provider-init

init 命令的多工具选择交互和多目录生成。

### 需求: init 命令 SHALL 提供多选交互让用户选择 AI 工具

使用 `@clack/prompts` 的 `multiselect` 组件。
选项列表 MUST 从 `AGENT_PROVIDERS` 注册表动态生成。
Claude Code MUST 默认选中。

#### 场景: 用户选择多个工具

WHEN 用户在多选中勾选 Claude Code 和 Codex
THEN 为两个工具分别生成 skill 文件到对应目录

#### 场景: 用户只选择一个工具

WHEN 用户只勾选 Codex
THEN 只在 `.codex/skills/` 下生成 skill 文件，不生成 `.claude/` 相关文件

#### 场景: 用户取消选择

WHEN 用户按 Ctrl+C 或取消多选
THEN 操作取消，不创建任何文件

### 需求: Workspace.initialize() SHALL 根据 providers 参数生成文件

`initialize()` MUST 接受可选的 `options.providers` 参数（string 数组，provider id 列表）。
未传入时 MUST 使用 `DEFAULT_PROVIDER_IDS`。

#### 场景: 为有 commandDir 的 provider 生成 skills 和 commands

WHEN providers 包含 `'claude-code'`
THEN 在 `.claude/skills/marchen-*/` 下生成 SKILL.md 文件
AND 在 `.claude/commands/marchen/` 下生成 command 文件

#### 场景: 为没有 commandDir 的 provider 只生成 skills

WHEN providers 包含 `'codex'`
THEN 在 `.codex/skills/marchen-*/` 下生成 SKILL.md 文件
AND 不生成任何 command 文件

#### 场景: SKILL.md 内容跨 provider 一致

WHEN 同时选择 Claude Code 和 Codex
THEN `.claude/skills/marchen-apply/SKILL.md` 和 `.codex/skills/marchen-apply/SKILL.md` 的内容完全相同

### 需求: 选中的 providers SHALL 持久化到 config.yaml

`marchen/config.yaml` MUST 包含 `providers` 字段，值为 provider id 数组。

#### 场景: 持久化 provider 选择

WHEN 用户选择 Claude Code 和 Codex 并完成 init
THEN `marchen/config.yaml` 包含 `providers: ['claude-code', 'codex']`

### 需求: --force 重新初始化 SHALL 只覆盖 marchen 管理的文件

`--force` 模式 MUST 只覆盖 `marchen-` 前缀的 skill 目录和 `marchen/` 子目录下的 command 文件。
MUST NOT 删除或修改用户自定义的 skill 或 command 文件。

#### 场景: force 模式不影响用户自定义 skill

WHEN 用户在 `.claude/skills/my-custom-skill/` 有自定义 skill
AND 执行 `marchen init --force`
THEN `my-custom-skill` 目录保持不变
AND `marchen-*` 目录被重新生成
