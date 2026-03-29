## 为什么

MarchenSpec 项目目前已经搭建好了 monorepo 基础架构，但缺少作为规范驱动开发工具所需的基础文件系统操作和用户命令。没有 fs 包的文件 I/O 能力和可用的 init 命令，用户无法创建或管理 OpenSpec 目录结构，阻碍了所有后续工作流的开发。

## 变更内容

- 为 `@marchen-spec/fs` 包添加核心文件系统操作（读、写、创建目录、存在性检查、YAML 解析）
- 在 `@marchen-spec/core` 包中实现 `initializeOpenSpec()` 用例
- 在 `apps/cli` 包中添加 `marchenspec init` CLI 命令
- 添加 `js-yaml` 依赖用于 YAML 文件处理
- 为 fs 操作和 init 工作流创建完整的测试覆盖

## 能力

### 新增能力
- `file-system-operations`: 核心文件 I/O 操作，包括目录创建、文件读写、存在性检查和 YAML 序列化/反序列化
- `init-command`: 在项目工作区中初始化 OpenSpec 目录结构及默认配置

### 修改的能力
- `project-foundation`: 扩展现有的基础结构检查以支持动态文件系统操作

## 影响

**受影响的包：**
- `@marchen-spec/fs`: 新增文件操作 API（从仅路径解析到完整 I/O 的破坏性变更）
- `@marchen-spec/core`: 新增 init 用例和基础结构增强
- `apps/cli`: 新增 init 命令注册

**依赖：**
- 为 `@marchen-spec/fs` 包添加 `js-yaml` 依赖

**测试：**
- 使用临时目录的 fs 操作测试套件
- init 命令端到端流程的集成测试
