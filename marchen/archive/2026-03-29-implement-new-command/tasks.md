## 1. Shared 包：类型定义

- [x] 1.1 在 packages/shared/src/index.ts 中新增 ChangeStatus 类型（'open' | 'archived'）
- [x] 1.2 新增 ChangeMetadata 接口（name, schema, createdAt, status）
- [x] 1.3 新增 ArtifactDefinition 接口（id, generates, requires）
- [x] 1.4 新增 SchemaDefinition 接口（name, artifacts: ArtifactDefinition[]）
- [x] 1.5 新增 METADATA_FILE_NAME 常量（'.metadata.yaml'）

## 2. Config 包：Schema 定义和模板

- [x] 2.1 在 packages/config/src/ 下新建 schema.ts，导出 DEFAULT_SCHEMA 常量（包含 proposal/specs/design/tasks 四个 artifact 定义）
- [x] 2.2 在 packages/config/src/ 下新建 templates.ts，导出每个 artifact 的模板字符串常量
- [x] 2.3 在 packages/config/src/index.ts 中重新导出 schema 和 templates

## 3. Core 包：createChange 用例

- [x] 3.1 在 packages/core/src/ 下新建 change.ts，实现 createChange(name: string) 函数
- [x] 3.2 实现 kebab-case 名称校验逻辑（正则：/^[a-z0-9]+(-[a-z0-9]+)*$/）
- [x] 3.3 实现初始化检查（调用 checkIfInitialized，未初始化时抛出 MarchenSpecError）
- [x] 3.4 实现重名检查（变更目录已存在时抛出 MarchenSpecError）
- [x] 3.5 实现目录创建（变更根目录 + specs/ 子目录）
- [x] 3.6 实现 .metadata.yaml 写入（name, schema, createdAt, status: 'open'）
- [x] 3.7 实现根据 schema 定义生成初始 artifact 文件（读取模板内容写入对应路径）
- [x] 3.8 在 packages/core/src/index.ts 中导出 createChange

## 4. CLI 包：new 命令

- [x] 4.1 在 apps/cli/src/commands/ 下新建 new.ts，实现 registerNewCommand
- [x] 4.2 命令接收必填参数 `<name>`，调用 core 的 createChange
- [x] 4.3 使用 @clack/prompts 展示创建进度和结果
- [x] 4.4 处理错误（未初始化、重名、名称格式错误）并展示友好提示
- [x] 4.5 在 apps/cli/src/index.ts 中注册 new 命令

## 5. 测试

- [x] 5.1 为 createChange 编写单元测试（正常创建、重名、未初始化、名称校验）
- [x] 5.2 为 CLI new 命令编写注册测试（验证命令存在和参数定义）
- [x] 5.3 为 schema 定义编写测试（验证 artifact 依赖关系正确性）
