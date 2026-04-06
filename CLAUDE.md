# CLAUDE.md

MarchenSpec 是一个规范驱动工作流 CLI 工具（类似 OpenSpec），使用 pnpm + Turborepo 构建的 monorepo。

**CLI 命令**: `marchen`（已实现 init, new, list, archive, status, instructions, verify 命令）

**AI Skills**: `marchen init` 自动生成 `.claude/skills/` 和 `.claude/commands/` 文件（marchen-propose, marchen-apply skill）

## 架构

```
@marchen-spec/shared (基础层，无依赖)
    ↑
    ├── @marchen-spec/config (依赖: shared)
    │       ↑
    │       └── @marchen-spec/core (依赖: shared, config, fs) ←─┐
    │                                                             │
    └── @marchen-spec/fs (依赖: shared) ─────────────────────────┤
                                                                  │
@marchen-spec/cli (依赖: core, shared) ──────────────────────────┘
```

- **apps/cli**: 命令注册、参数解析、终端 UI（commander + @clack/prompts）
- **packages/core**: 业务逻辑，`Workspace` 类 + `ChangeManager` 类
- **packages/fs**: 文件系统操作（paths / directory / file / yaml）
- **packages/config**: 配置加载、Schema 定义、Artifact 模板管理、Artifact 指导文本（含 apply）、Skill/Command 模板（codegen 生成，propose + apply）
- **packages/shared**: 共享类型、常量、错误定义

## 语言

- 对话、回复、文档注释统一使用中文

## 关键约束

1. **单向依赖**: 只能从上层依赖下层，禁止循环依赖
2. **CLI 只做 UI**: 业务逻辑通过 core 包的 Class 实例调用
3. **文件操作走 fs 包**: 不要在其他包直接使用 Node.js fs
4. **ESM-first**: 导入必须使用 `.js` 扩展名（`import { foo } from './utils.js'`）
5. **注释规范**: 函数和类必须添加 JSDoc，公共 API 必须有文档注释

## 开发命令

```bash
pnpm install          # 安装依赖
pnpm build            # 构建所有包
pnpm dev              # watch 模式
pnpm test             # 运行测试
pnpm check            # 完整检查（lint + typecheck + test）
pnpm lint:fix         # Lint 自动修复
pnpm format           # 格式化
```

## 技术栈

- TypeScript（ESM, NodeNext），tsdown 构建（.mjs + .d.mts）
- Vitest 测试，测试文件 `test/**/*.test.ts`，导入用 `../src/index.js`
- Prettier（`@suemor/prettier-config`）+ ESLint（`@antfu/eslint-config`）
- 所有 `tsconfig.json` 继承 `tsconfig.base.json`

## 文件组织

- 包结构: `src/index.ts`（入口）、`test/*.test.ts`、`tsdown.config.ts`
- CLI 命令: `apps/cli/src/commands/` 每个命令一个文件

## 文档与知识

- **`docs/`** - 项目文档（路线图、外部参考）。新对话先读 `docs/INDEX.md`
- **`openspec/changes/archive/`** - 完整变更历史（proposal + design + tasks + specs），是唯一的规范真相来源
- **`openspec/specs/`** - 当前活跃规范
- **`docs/references/`** - 外部参考文档（OpenSpec 功能清单、OpenAI Harness Engineering 实践）
