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
├── schema.ts        # Schema 定义（full + lite），含 template/instruction
├── templates.ts     # Artifact 模板常量（proposal, design, tasks）
├── skills.ts        # Skill 模板导出（codegen 生成）
├── commands.ts      # Command 模板导出（codegen 生成）
└── generated/       # codegen 自动生成，勿手动修改
    ├── skill-templates.ts
    └── command-templates.ts
templates/
├── skills/          # Skill 模板源文件（.md）
│   ├── propose.md
│   ├── lite.md
│   ├── apply.md
│   ├── explore.md
│   └── archive.md
└── commands/        # Command 模板源文件（.md）
    ├── propose.md
    ├── lite.md
    ├── apply.md
    ├── explore.md
    └── archive.md
scripts/
└── generate-templates.ts  # 模板 codegen 脚本（pnpm generate）
```

## 核心导出

- `MarchenSpecConfig` - 配置接口 `{ specDirectory: string }`
- `defaultConfig` - 默认配置 `{ specDirectory: 'marchen' }`
- `defineMarchenSpecConfig(partial?)` - 合并用户配置与默认值
- `SCHEMAS` - 内置 schema 映射（full, lite）
- `DEFAULT_SCHEMA_NAME` - 默认 schema 名称 `'full'`
- `getSchema(name)` - 按名称查找 schema，不存在时抛 ValidationError
- `APPLY_INSTRUCTION` - apply 阶段的 LLM 指导文本
- `PROPOSAL_TEMPLATE` / `DESIGN_TEMPLATE` / `TASKS_TEMPLATE` - 各 artifact 的 Markdown 模板
- `SKILL_TEMPLATES` - Skill 模板映射（propose, lite, apply, explore, archive）
- `COMMAND_TEMPLATES` - Command 模板映射（propose, lite, apply, explore, archive）

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
