## Context

MarchenSpec 当前只有 `marchen init` 命令。初始化后用户无法进行任何后续操作。`new` 命令是规范驱动工作流的第一个入口，它需要跨越 shared、config、core、cli 四个包协作完成。

现有基础设施：
- fs 包已提供 ensureDir、writeFile、writeYaml 等文件操作能力
- config 包已有 MarchenSpecConfig 和 defaultConfig
- core 包已有 checkIfInitialized() 检查初始化状态
- cli 包已有 commander + @clack/prompts 的命令注册模式

## Goals / Non-Goals

**Goals:**
- 实现 `marchen new <name>` 命令，创建变更目录和初始文件
- 在 config 包中建立内置 schema 定义（硬编码，集中管理）
- 在 shared 包中定义 Change 相关的共享类型
- 保持与现有 init 命令一致的代码风格和架构模式

**Non-Goals:**
- 不实现外部 schema YAML 文件加载（将来再做）
- 不实现 artifact 模板内容填充（new 只创建空结构）
- 不实现 list/show/status 等浏览命令（后续变更）
- 不实现 schema 的自定义和扩展机制

## Decisions

### Decision 1: Schema 硬编码在 config 包中
将 artifact 定义作为常量导出，而非读取外部 YAML 文件。

**理由**: 当前只有一种 workflow（spec-driven），没有多 schema 的实际需求。硬编码在 config 包中便于集中管理，将来外部化时只需将数据源从常量切换为文件读取。

**替代方案**:
- 直接读取 YAML schema 文件 → 过早引入复杂度，需要 schema 校验、路径解析等额外逻辑
- 硬编码在 core 包中 → 违反职责划分，config 包才是配置的归属地

### Decision 2: 模板内容内置在 config 包中
每个 artifact 的初始模板内容（markdown 骨架）作为字符串常量存放在 config 包中。

**理由**: 与 schema 定义放在一起，便于维护。模板内容相对稳定，不需要频繁修改。

**替代方案**:
- 模板作为独立 .md 文件打包 → 增加构建复杂度，需要处理文件路径和打包
- 不提供模板，创建空文件 → 用户体验差，不知道每个 artifact 该写什么

### Decision 3: 变更名称强制 kebab-case
使用正则校验变更名称，只允许小写字母、数字和连字符。

**理由**: 名称直接用作目录名，kebab-case 在文件系统中最安全、最一致。与 OpenSpec 的命名约定保持一致。

### Decision 4: 元数据使用 .metadata.yaml 文件名
使用点前缀的文件名，与 artifact 文件区分。

**理由**: 点前缀表示这是系统文件而非用户编辑的内容。OpenSpec 使用 `.openspec.yaml`，我们使用 `.metadata.yaml` 更通用。

### Decision 5: createChange() 作为 core 包的用例函数
业务逻辑（校验、创建目录、写文件）集中在 core 包的 createChange() 函数中，CLI 层只负责参数解析和 UI 交互。

**理由**: 遵循现有架构模式（init 命令的 initializeMarchenSpec() 就是这样做的），保持 CLI 层轻量。

## Risks / Trade-offs

- [硬编码 schema 限制灵活性] → 将 artifact 定义集中在一个常量中，将来外部化时改动范围可控
- [模板内容可能需要频繁调整] → 模板作为独立常量导出，修改不影响其他逻辑
- [kebab-case 校验可能过于严格] → 提供清晰的错误提示，告知用户正确格式
