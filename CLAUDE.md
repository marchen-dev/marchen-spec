# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

MarchenSpec 是一个类似 OpenSpec 的规范驱动工作流 CLI 工具，使用 pnpm + Turborepo 构建的 monorepo 架构。

## 核心架构

### 包依赖关系图

```
@marchen-spec/shared (基础层，无依赖)
    ↑
    ├── @marchen-spec/config (依赖: shared)
    │       ↑
    │       └── @marchen-spec/core (依赖: shared, config, fs) ←─┐
    │                                                             │
    └── @marchen-spec/fs (依赖: shared) ─────────────────────────┤
                                                                  │
@marchen-spec/cli (依赖: core) ───────────────────────────────────┘
```

### 包职责划分

- **apps/cli**: 命令注册（info, init）、参数解析、终端 UI（使用 commander + @clack/prompts）
- **packages/core**: 工作流用例（初始化、基础检查）、领域规则、业务逻辑
- **packages/fs**: 文件系统操作（读写、YAML 处理）、路径解析、目录管理
- **packages/config**: 配置加载、默认值（specDirectory）、配置定义
- **packages/shared**: 基础类型（PackageBoundary）、常量（目录名）、错误定义（MarchenSpecError）

**重要原则**: 严格遵守单向依赖流，禁止循环依赖。

## 开发命令

### 安装依赖
```bash
pnpm install
```

### 构建
```bash
# 构建所有包
pnpm build

# 单独构建某个包（在包目录下）
cd apps/cli && pnpm build
```

### 开发模式
```bash
# 启动所有包的 watch 模式
pnpm dev

# 单独开发某个包
cd packages/core && pnpm dev
```

### 测试
```bash
# 运行所有测试
pnpm test

# 运行单个包的测试
cd packages/core && pnpm test

# 运行单个测试文件
cd packages/core && pnpm test foundation.test.ts
```

### 代码质量检查
```bash
# Lint 检查
pnpm lint

# Lint 自动修复
pnpm lint:fix

# 类型检查
pnpm typecheck

# 格式化检查
pnpm format:check

# 格式化修复
pnpm format

# 完整检查（lint + typecheck + test）
pnpm check
```

### 版本发布
```bash
# 使用 bumpp 更新版本
pnpm release:version
```

## 技术栈约定

### TypeScript 配置
- **模块系统**: ESM-first，使用 `"type": "module"` 和 `NodeNext` 模块解析
- **导入扩展名**: 源码中必须使用 `.js` 扩展名（即使文件是 `.ts`）
  ```typescript
  // ✅ 正确
  import { foo } from './utils.js'

  // ❌ 错误
  import { foo } from './utils'
  ```
- **基础配置**: 所有包的 `tsconfig.json` 继承自根目录的 `tsconfig.base.json`

### 构建工具
- 使用 **tsdown** 进行 ESM 打包，生成 `.mjs` 文件和 `.d.mts` 类型定义
- 构建输出到 `dist/` 目录（已在 .gitignore 中）
- 每个包的 `tsdown.config.ts` 配置入口和输出格式

### 测试约定
- 使用 **Vitest** 作为测试框架
- 测试文件位于 `test/**/*.test.ts`
- 测试导入源码使用 `../src/index.js`（从 src 导入，不是 dist）
- 根目录 `vitest.config.ts` 提供共享配置，包级配置可合并扩展

### 代码风格
- **格式化**: 使用 Prettier（`@suemor/prettier-config`）
- **Lint**: 使用 ESLint（`@antfu/eslint-config`）
- **职责分离**: Prettier 负责格式，ESLint 负责代码质量

## 代码注释规范

**重要**: 在编写代码时，必须添加适当的注释以提高可读性和可维护性。

### 注释原则
1. **函数和类**: 必须添加 JSDoc 注释说明用途、参数、返回值
2. **复杂逻辑**: 对非显而易见的业务逻辑添加行内注释
3. **公共 API**: 导出的函数、类型必须有完整的文档注释
4. **配置文件**: 关键配置项需要注释说明用途

### 注释示例
```typescript
/**
 * 检查项目基础结构
 *
 * 扫描 workspace 中的所有包，构建依赖关系图
 *
 * @returns 包含包边界和依赖关系的基础结构信息
 */
export function inspectFoundation(): Foundation {
  // 从 pnpm workspace 配置中读取包路径
  const packages = readWorkspacePackages()

  // 构建依赖图（使用拓扑排序确保顺序）
  const graph = buildDependencyGraph(packages)

  return { packageBoundaries: graph }
}
```

## OpenSpec 工作流

项目使用 OpenSpec 规范驱动开发流程：

- **规范目录**: `openspec/specs/` - 存放当前活跃的规范
- **变更归档**: `openspec/changes/archive/` - 已完成的变更记录
- **配置文件**: `openspec/config.yaml` - OpenSpec 配置

### 变更文档结构
每个变更包含：
- `proposal.md` - 变更提案（问题、解决方案、新能力）
- `design.md` - 详细设计（架构决策、权衡、风险）
- `tasks.md` - 实现任务列表
- `specs/` - 增量规范（delta specs）

## 文件组织约定

### 包结构模板
```
packages/example/
├── src/
│   └── index.ts          # 包入口，导出公共 API
├── test/
│   └── example.test.ts   # 测试文件
├── package.json          # 包配置
├── tsconfig.json         # TS 配置（继承 base）
├── tsdown.config.ts      # 构建配置
└── vitest.config.ts      # 测试配置（可选）
```

### CLI 命令组织
- 命令定义在 `apps/cli/src/commands/` 目录
- 每个命令一个文件，导出注册函数
- 在 `apps/cli/src/index.ts` 中注册命令

示例：
```typescript
// apps/cli/src/commands/example.ts
import type { Command } from 'commander'

export function registerExampleCommand(program: Command): void {
  program
    .command('example')
    .description('示例命令')
    .action(async () => {
      // 命令实现
    })
}
```

## 重要注意事项

1. **依赖方向**: 只能从上层依赖下层，不能反向依赖
2. **CLI 职责**: CLI 层只负责用户交互，业务逻辑放在 core 包
3. **文件系统**: 所有文件操作通过 fs 包，不要在其他包直接使用 Node.js fs
4. **配置管理**: 配置相关逻辑统一在 config 包处理
5. **类型定义**: 共享类型定义在 shared 包，避免重复定义
6. **测试覆盖**: 新功能必须包含测试，确保核心逻辑有测试覆盖

## 知识库

项目知识库位于 `knowledge/` 目录，存放项目进展、调研结论和技术决策。

**新对话开始时**，先阅读 `knowledge/overview.md` 获取项目全景视图。
需要深入了解某个主题时，查阅 `knowledge/research/_index.md` 和 `knowledge/decisions/_index.md`。

## Turbo 缓存

Turborepo 会缓存构建和测试结果到 `.turbo/` 目录（已在 .gitignore）。如需清除缓存：
```bash
rm -rf .turbo
```