# agent-provider-registry

AgentProvider 类型定义和内置 provider 注册表。

### 需求: AgentProvider 类型 SHALL 定义 AI 工具的集成信息

AgentProvider 类型 MUST 包含以下字段：
- `id`（string）：唯一标识符，kebab-case
- `name`（string）：显示名称
- `skillDir`（string）：skill 目录的相对路径（相对于项目根目录）
- `commandDir`（string | undefined）：command 目录的相对路径，可选

#### 场景: 定义一个有 commands 的 provider

WHEN 定义 Claude Code provider
THEN `id` 为 `'claude-code'`，`name` 为 `'Claude Code'`，`skillDir` 为 `'.claude/skills'`，`commandDir` 为 `'.claude/commands/marchen'`

#### 场景: 定义一个没有 commands 的 provider

WHEN 定义 Codex provider
THEN `id` 为 `'codex'`，`name` 为 `'Codex'`，`skillDir` 为 `'.codex/skills'`，`commandDir` 为 `undefined`

### 需求: AGENT_PROVIDERS 注册表 SHALL 包含所有内置 provider

注册表 MUST 是 `Record<string, AgentProvider>` 类型，key 为 provider id。
注册表 MUST 至少包含 `claude-code` 和 `codex` 两个 provider。
注册表 MUST 从 config 包导出。

#### 场景: 通过 id 查找 provider

WHEN 使用 `AGENT_PROVIDERS['claude-code']` 查找
THEN 返回 Claude Code 的 AgentProvider 定义

#### 场景: 遍历所有 provider

WHEN 使用 `Object.values(AGENT_PROVIDERS)` 遍历
THEN 返回包含 claude-code 和 codex 的数组

### 需求: 默认 provider SHALL 为 claude-code

当用户未做选择时，系统 MUST 使用 `claude-code` 作为默认 provider。
config 包 MUST 导出 `DEFAULT_PROVIDER_IDS` 常量。

#### 场景: 未指定 provider 时使用默认值

WHEN 调用 `initialize()` 未传入 providers 参数
THEN 使用 `DEFAULT_PROVIDER_IDS`（`['claude-code']`）生成文件
