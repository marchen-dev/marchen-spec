## 背景

当前 `Workspace.initialize()` 硬编码了 `.claude/skills/` 和 `.claude/commands/marchen/` 路径。`generateSkills()` 和 `generateCommands()` 是私有方法，直接拼接 `.claude` 前缀。

AI 工具生态中，SKILL.md 格式已成为事实标准，各工具只是目录路径不同：
- Claude Code: `.claude/skills/`
- Codex: `.codex/skills/`
- Gemini CLI: `.gemini/skills/`
- Cursor: `.cursor/skills/`

commands 是 Claude Code 独有的概念，其他工具没有等价物。

## 目标与非目标

**目标：**
- init 时让用户选择安装哪些 AI 工具集成
- 先支持 Claude Code 和 Codex
- 建立 AgentProvider 注册表，后续加新工具只需加一条记录
- 将选择持久化到 config.yaml

**非目标：**
- 不做自动检测（检测项目中已有的 AI 工具配置）
- 不做 symlink 优化（多个目录共享同一份文件）
- 不做模板差异化（所有工具用同一份 SKILL.md）
- 不做 plugin 机制（不支持用户自定义 provider）
- 不改变现有 SKILL.md 和 command 模板的内容

## 决策

### D1: AgentProvider 类型放 shared 包，注册表放 config 包

类型定义属于共享类型，放 shared。注册表是配置数据，放 config。遵循现有的分层约定。

### D2: initialize() 通过 options 对象接收 providers

```
initialize(options?: { providers?: string[] })
```

用 options 对象而非位置参数，方便后续扩展其他选项。providers 为 provider id 数组，未传入时使用 `DEFAULT_PROVIDER_IDS`（`['claude-code']`），保持向后兼容。

### D3: 同一份 SKILL.md 写入多个目录

所有 provider 共享 `SKILL_TEMPLATES` 和 `COMMAND_TEMPLATES`，只是写入路径不同。不引入模板转换层。

理由：当前所有工具的 SKILL.md 格式完全一致。如果未来某个工具需要特殊格式，再在 AgentProvider 上加 `transformContent?` 钩子。

### D4: commandDir 可选，只有 Claude Code 有

commands 是 Claude Code 独有的。AgentProvider 的 `commandDir` 为可选字段，只在有值时才生成 command 文件。

### D5: providers 选择持久化到 config.yaml

在 `marchen/config.yaml` 中新增 `providers` 字段。这样后续命令（如 refresh/update）可以知道该维护哪些目录。

## 风险与权衡

### R1: 多目录维护成本

选择多个 provider 意味着同一份 SKILL.md 存在多份拷贝。如果用户手动修改了其中一份，其他拷贝不会同步。这是可接受的，因为 MarchenSpec 管理的 skill 不应被手动修改。

### R2: 向后兼容

现有用户执行 `marchen init` 时，如果不传 providers，默认行为与当前完全一致（只生成 Claude Code 的文件）。不会破坏现有项目。
