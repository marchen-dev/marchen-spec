## 上下文

MarchenSpec 当前已完成 monorepo 基础架构搭建，包含 5 个包的清晰分层：shared（基础层）、config（配置层）、fs（文件系统层）、core（业务逻辑层）、cli（CLI 应用层）。但 fs 包目前只有路径解析功能，core 包的基础结构检查是硬编码的，cli 只有一个 `info` 命令用于展示基础信息。

**当前状态：**
- `@marchen-spec/fs` 只提供 `resolveWorkspaceRoot()`、`getSpecDirectory()`、`getChangeDirectory()` 等路径解析函数
- `@marchen-spec/core` 的 `inspectFoundation()` 返回硬编码的包边界信息
- `apps/cli` 只有 `info` 命令，使用 commander + @clack/prompts

**约束：**
- 必须保持单向依赖流：shared ← config/fs ← core ← cli
- 使用 ESM-first TypeScript，导入必须带 `.js` 扩展名
- 测试使用 Vitest，从 `../src/index.js` 导入
- 与 OpenSpec 保持格式兼容

**利益相关者：**
- 开发者：需要通过 `marchenspec init` 初始化项目
- 后续工作流命令：依赖 fs 包的文件操作能力

## 目标 / 非目标

**目标：**
- 为 fs 包添加完整的文件 I/O 能力（读、写、目录操作、YAML 处理）
- 实现 `marchenspec init` 命令创建标准 OpenSpec 目录结构
- 建立端到端的 cli → core → fs 调用链验证
- 提供完整的测试覆盖（单元测试 + 集成测试）

**非目标：**
- 不实现其他工作流命令（propose、apply、archive 等）
- 不实现动态包发现（保持 `inspectFoundation()` 的硬编码实现）
- 不添加配置文件加载逻辑（config 包暂时只提供默认配置）
- 不实现 AI 集成或模板系统

## 决策

### 决策 1: fs 包使用 Node.js 原生 fs/promises + js-yaml

**选择：** 直接使用 `node:fs/promises` 并封装，YAML 使用 `js-yaml`

**理由：**
- OpenSpec 本身也是用 Node.js fs + js-yaml，保持一致性
- 零额外依赖（除了 js-yaml），包体积小
- fs/promises API 足够现代，async/await 友好
- js-yaml 是 YAML 解析的事实标准，生态成熟

**备选方案：**
- fs-extra：API 更友好但增加依赖，对当前需求来说过度设计
- yaml 包：更现代但相对小众，与 OpenSpec 不一致

### 决策 2: fs 包 API 设计采用"自动创建父目录"策略

**选择：** `writeFile()` 和 `writeYaml()` 自动调用 `ensureDir(dirname(path))`

**理由：**
- 简化调用方代码，避免每次写文件前都要手动 mkdir
- init 命令需要创建嵌套目录结构（`openspec/changes/archive/`），自动化减少出错
- 与 fs-extra 的 `outputFile` 行为一致，符合开发者预期

**权衡：**
- 可能隐藏目录不存在的错误，但对 OpenSpec 场景来说这是期望行为

### 决策 3: CLI 层职责严格限制在 UI 交互

**选择：** CLI 命令只负责参数解析、用户交互（@clack/prompts）、调用 core 层

**理由：**
- 保持架构清晰，业务逻辑集中在 core 包便于测试
- CLI 测试只需验证命令注册和参数传递，不测试业务逻辑
- 未来可以轻松添加其他入口（如 HTTP API）复用 core 层

**实现：**
```
CLI (apps/cli/src/commands/init.ts)
  ↓ 解析 --force 参数
  ↓ 用 @clack/prompts 询问用户确认
  ↓ 调用 core.initializeOpenSpec()

Core (packages/core/src/init.ts)
  ↓ 编排业务逻辑
  ↓ 调用 fs.ensureDir() / fs.writeYaml()

FS (packages/fs/src/index.ts)
  ↓ 执行文件系统操作
```

### 决策 4: init 命令创建最小化目录结构

**选择：** 只创建 `openspec/`、`specs/`、`changes/`、`changes/archive/` 和 `config.yaml`

**理由：**
- 与 OpenSpec 的 `openspec init` 行为一致
- 最小化初始结构，避免创建用户可能不需要的文件
- `.gitkeep` 文件确保空目录被 git 追踪

**config.yaml 默认内容：**
```yaml
schema: spec-driven
context: ''
perArtifactRules: {}
```

### 决策 5: 测试策略分层

**选择：**
- fs 包：真实文件系统测试（使用 `mkdtemp` 创建临时目录）
- core 包：mock fs 层，只测试业务逻辑编排
- cli 包：验证命令注册，不测试执行逻辑

**理由：**
- fs 层必须测试真实文件操作，确保跨平台兼容性
- core 层 mock 掉 fs 可以快速测试业务逻辑，避免文件系统副作用
- cli 层测试只需确保命令正确注册到 commander

## 风险 / 权衡

### [风险] 文件权限错误导致 init 失败
**缓解：**
- fs 操作捕获 EACCES 错误并抛出清晰的业务错误
- CLI 层展示友好的错误信息，提示用户检查目录权限

### [风险] 用户在已有 openspec/ 目录的项目中运行 init
**缓解：**
- 添加 `--force` 参数允许覆盖
- 默认情况下检测到已存在时用 @clack/prompts 询问用户确认

### [权衡] fs 包自动创建父目录可能隐藏错误
**接受理由：**
- OpenSpec 场景下这是期望行为，简化调用方代码
- 如果真的需要检测目录不存在，可以先调用 `exists()`

### [权衡] 暂不实现配置文件加载
**接受理由：**
- init 命令只需写入默认配置，不需要读取
- 配置加载逻辑留到后续实现 `list`、`propose` 等命令时再添加
