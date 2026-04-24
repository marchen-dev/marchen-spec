## 背景

MarchenSpec 的 archive 目录包含 30 个归档变更、132 个 markdown 文件、5400 行内容。当前 AI 获取历史的方式是 `cat changelog.md`（30 行摘要）或 `grep`（关键词匹配，无语义理解）。

qmd 是一个本地搜索引擎，提供 BM25 + 向量搜索 + LLM rerank 三级流水线，有 Node.js SDK 可直接 import。

## 目标与非目标

**目标：**
- `marchen search` 命令提供语义搜索能力
- archive 时自动更新索引，用户无感知
- qmd 加载失败时优雅降级，不影响现有功能
- explore skill 自动利用搜索获取历史上下文

**非目标：**
- 不搜索代码库本身（只搜 archive 里的 markdown）
- 不做跨项目搜索
- 不自建 embedding/向量搜索（复用 qmd）
- 不强制所有平台都能用搜索（native binding 编译失败时降级）

## 决策

### 决策 1：qmd 作为 dependency 而非 optional/peer

qmd 放在 `@marchen-spec/core` 的 `dependencies` 中，`npm install` 时一起安装。

**理由**：用户不需要额外安装步骤。native binding 编译失败的情况通过 dynamic import + try/catch 处理，不影响其他功能。

**替代方案**：optionalDependencies 或 peerDependencies——需要用户手动安装，体验差。

### 决策 2：SearchManager 放在 core 包

SearchManager 作为 core 包的新类，和 Workspace/ChangeManager 同级。不新建 `@marchen-spec/search` 包。

**理由**：搜索是 archive 的延伸能力，属于核心业务逻辑。新建包会增加 monorepo 复杂度，且 SearchManager 需要访问 Workspace 的路径信息。

### 决策 3：SQLite 数据库存放在 `marchen/.search/`

qmd 的 index.sqlite 存放在 `marchen/.search/index.sqlite`，加入 `.gitignore`。

**理由**：索引是本地生成的衍生数据，不应提交到 git。放在 `marchen/` 下而非全局目录，保持项目自包含。

### 决策 4：tsdown external 处理 native 依赖

CLI 的 tsdown 构建配置中，将 `@tobilu/qmd` 和 `node-llama-cpp` 标记为 external。

**理由**：native binding（.node 文件）不能被 bundler 打包。external 后这些依赖在运行时从 node_modules 加载。

### 决策 5：archive 索引失败静默处理

`ChangeManager.archive()` 中的索引更新用 try/catch 包裹，失败时不抛出异常。

**理由**：归档是核心操作，搜索索引是增强功能。索引失败不应阻断归档流程。用户可以通过 `marchen search --rebuild` 手动重建。

### 决策 6：context 在 init 时自动配置

`workspace.initialize()` 时自动为 qmd store 添加 context 描述，帮助搜索理解文档结构。

**理由**：qmd 的 context 功能能显著提升搜索质量（在搜索结果中返回上下文描述）。用户不需要手动配置。

## 风险与权衡

### 风险 1：node-llama-cpp 编译失败

node-llama-cpp 依赖 C++ 编译。某些系统（缺少编译工具链、不支持的 CPU 架构）可能编译失败。

**缓解**：dynamic import + isAvailable() 检测。编译失败时搜索功能不可用，但 CLI 其他功能正常。

### 风险 2：安装体积增大

qmd + node-llama-cpp 会增加 npm install 的体积和时间。

**缓解**：模型不在 install 时下载（懒加载），npm 包本身增加约 50-80MB（主要是 node-llama-cpp 的预编译 binary）。

### 风险 3：首次搜索/归档延迟

首次使用搜索功能时需要下载 embedding 模型（~300MB），首次混合搜索还需要 reranker（~640MB）和 query expansion（~1.1GB）。

**缓解**：模型下载只发生一次，之后缓存在 `~/.cache/qmd/models/`。CLI 可以显示下载进度提示。

### 风险 4：macOS 需要 Homebrew SQLite

qmd 依赖 SQLite 扩展支持，macOS 系统自带的 SQLite 不够。

**缓解**：在安装文档中说明 `brew install sqlite` 前置要求。
