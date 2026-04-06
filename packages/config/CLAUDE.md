# @marchen-spec/config

## 包职责

配置层包，负责配置定义、默认值管理、Schema 定义和 Artifact 模板。

## 依赖关系

```
@marchen-spec/shared
    ↑
@marchen-spec/config
```

只依赖 `@marchen-spec/shared`，被 `@marchen-spec/core` 依赖。

## 源码结构

```
src/
├── index.ts         # 配置接口、默认值、统一导出
├── instructions.ts  # Artifact 指导文本（LLM 填充指引，含 apply）
├── schema.ts        # Schema 定义（spec-driven）
├── templates.ts     # Artifact 模板（proposal, design, tasks）
├── skills.ts        # Skill 模板导出（codegen 生成）
├── commands.ts      # Command 模板导出（codegen 生成）
└── generated/       # codegen 自动生成，勿手动修改
    ├── skill-templates.ts
    └── command-templates.ts
templates/
├── skills/          # Skill 模板源文件（.md）
│   ├── propose.md
│   └── apply.md
└── commands/        # Command 模板源文件（.md）
    ├── propose.md
    └── apply.md
scripts/
└── generate-templates.ts  # 模板 codegen 脚本（pnpm generate）
```

## 核心导出

- `MarchenSpecConfig` - 配置接口 `{ specDirectory: string }`
- `defaultConfig` - 默认配置 `{ specDirectory: 'marchenspec' }`
- `defineMarchenSpecConfig(partial?)` - 合并用户配置与默认值
- `DEFAULT_SCHEMA` - 默认 Schema 定义（spec-driven，4 个 artifacts）
- `ARTIFACT_TEMPLATES` - 制品 ID 到模板内容的映射
- `PROPOSAL_TEMPLATE` / `DESIGN_TEMPLATE` / `TASKS_TEMPLATE` - 各 artifact 的 Markdown 模板
- `ARTIFACT_INSTRUCTIONS` - 各 artifact 的 LLM 指导文本（含 apply 指导）
- `SKILL_TEMPLATES` - Skill 模板映射（propose, apply）
- `COMMAND_TEMPLATES` - Command 模板映射（propose, apply）

## 开发命令

```bash
pnpm build      # 构建
pnpm dev        # 开发模式
pnpm typecheck  # 类型检查
```

## 注意事项

1. **配置集中**: 所有配置相关逻辑必须在此包
2. **默认值**: 提供合理的默认值，减少用户配置负担
3. **Codegen**: `templates/` 下的 .md 文件通过 `pnpm generate` 生成 `src/generated/` 下的 TS 常量，build 时自动执行
4. **勿手动修改 generated/**: 修改模板请编辑 `templates/` 下的源文件
