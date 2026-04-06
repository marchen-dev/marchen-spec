## ADDED Requirements

### Requirement: 模板源文件存储
系统 SHALL 在 `packages/config/templates/skills/` 目录下存储 skill 的 markdown 源文件，在 `packages/config/templates/commands/` 目录下存储 command 的 markdown 源文件。

#### Scenario: skill 模板文件存在
- **WHEN** 开发者查看 `packages/config/templates/skills/` 目录
- **THEN** 存在 `propose.md` 文件，内容为完整的 SKILL.md markdown

#### Scenario: command 模板文件存在
- **WHEN** 开发者查看 `packages/config/templates/commands/` 目录
- **THEN** 存在 `propose.md` 文件，内容为 command 短命令的 markdown

### Requirement: codegen 脚本生成 TypeScript 常量
系统 SHALL 提供 `scripts/generate-templates.ts` 脚本，读取 `templates/` 下的 .md 文件并生成 `src/generated/` 下的 TypeScript 文件。

#### Scenario: 生成 skill 模板常量
- **WHEN** 执行 `pnpm generate`
- **THEN** 生成 `src/generated/skill-templates.ts`，包含每个 skill 的内容常量和 `SKILL_TEMPLATES` 映射对象

#### Scenario: 生成 command 模板常量
- **WHEN** 执行 `pnpm generate`
- **THEN** 生成 `src/generated/command-templates.ts`，包含每个 command 的内容常量和 `COMMAND_TEMPLATES` 映射对象

#### Scenario: 正确转义模板字符串
- **WHEN** markdown 源文件包含反引号或 `${` 字符
- **THEN** 生成的 TypeScript 模板字符串中这些字符被正确转义

### Requirement: 构建集成
系统 SHALL 在 config 包的 build 流程中自动执行 codegen。

#### Scenario: build 前自动 generate
- **WHEN** 执行 `pnpm build`
- **THEN** 先执行 generate 脚本再执行 tsdown 构建

### Requirement: config 包导出模板
系统 SHALL 通过 `@marchen-spec/config` 包导出 `SKILL_TEMPLATES` 和 `COMMAND_TEMPLATES`。

#### Scenario: 导入 skill 模板
- **WHEN** 其他包 `import { SKILL_TEMPLATES } from '@marchen-spec/config'`
- **THEN** 获得包含 `propose` 键的对象，值包含 `dirName` 和 `content` 字段

#### Scenario: 导入 command 模板
- **WHEN** 其他包 `import { COMMAND_TEMPLATES } from '@marchen-spec/config'`
- **THEN** 获得包含 `propose` 键的对象，值包含 `fileName` 和 `content` 字段
