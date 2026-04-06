## Context

MarchenSpec 是一个 pnpm + Turborepo monorepo，CLI 通过 tsdown 打包时会 `alwaysBundle` 所有 `@marchen-spec/*` 包。这意味着 config 包的代码会被内联到 cli 的 bundle 中，但静态文件（如 .md）不会被自动打包。

现有的模板存储方式是 TypeScript 字符串常量（`templates.ts` 中的 `PROPOSAL_TEMPLATE` 等），但 skill 内容是大段 markdown（100+ 行），在模板字符串中维护体验差。

## Goals / Non-Goals

**Goals:**
- skill 源文件用独立 .md 文件存储，获得原生 markdown 编辑体验
- 构建后 skill 内容能被 cli bundle 正确打包
- `marchen init` 能将 skill/command 文件写入用户项目
- generated 文件提交到 git，避免 clone 后首次构建失败

**Non-Goals:**
- 不做 skill 版本管理和更新检测（后续迭代）
- 不支持 Claude Code 以外的 AI 工具（只生成 `.claude/` 目录）
- 不加 context/rules 字段到 instructions API（先不加，后续按需）

## Decisions

### 决策 1：codegen 方案解决静态文件打包问题

构建时将 .md 文件转为 TypeScript 常量，而非运行时 readFileSync。

**为什么不用运行时读取**：cli 的 tsdown 配置使用 `alwaysBundle` 将所有 `@marchen-spec/*` 包内联到一个 bundle 中。运行时 `readFileSync(import.meta.url + '...')` 在 bundle 后路径会错，因为 `import.meta.url` 指向 cli 的 dist 目录而非 config 包的 dist 目录。

**为什么不用 tsdown --copy**：同样的问题，copy 只复制到 config 包的 dist，cli bundle 时不会带上。

**codegen 流程**：
```
templates/skills/propose.md  →  scripts/generate-templates.ts  →  src/generated/skill-templates.ts
                                                                    export const SKILL_PROPOSE = `...`
```

### 决策 2：generated 文件提交到 git

**为什么提交**：
- monorepo 中其他包依赖 config，generated 不存在时 typecheck 会挂
- 避免 clone 后首次构建失败的新手陷阱
- CI 可以校验 generated 文件是否和 templates 同步

### 决策 3：skill/command 生成逻辑放在 Workspace.initialize()

在 core 包的 `Workspace.initialize()` 中调用，而非 cli 层。

**为什么**：保持 CLI 薄层原则——CLI 只做 UI，业务逻辑在 core。skill 生成是 init 的一部分，属于业务逻辑。

### 决策 4：重复 init 总是覆盖 skill 文件

不检测文件是否已修改，直接覆盖。

**为什么**：skill 文件是 CLI 生成的产物，用户不应手动修改。简化逻辑，避免版本比较的复杂度。

### 决策 5：propose skill 通过 shell 调用 marchen CLI

skill 通过 Bash tool 执行 `marchen status/instructions --json`，而非直接读文件。

**为什么**：保持 skill 是薄编排层，不需要知道目录结构和 metadata 格式。CLI 是 API 层，封装了所有内部逻辑。

## Risks / Trade-offs

- **codegen 步骤增加构建复杂度** → 脚本很小（~50 行），且 build 前自动执行，开发者无感
- **generated 文件提交可能和 templates 不同步** → CI 中加校验：`pnpm generate && git diff --exit-code`
- **skill 调用 CLI 需要 CLI 已构建** → 用户通过 npm 全局安装，CLI 已是构建产物；开发时用 `pnpm exec marchen`
- **重复 init 覆盖用户修改** → 设计决策：skill 不应手动修改。后续可加 `--skip-skills` 选项
