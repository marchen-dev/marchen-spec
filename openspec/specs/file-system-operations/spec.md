## Purpose

定义 `@marchen-spec/fs` 包提供的文件系统操作 API 规范，包括目录管理、文件读写、YAML 处理等基础能力。

## Requirements

### Requirement: 提供目录创建操作
`@marchen-spec/fs` SHALL 提供 `ensureDir()` 函数，递归创建目录路径，如果目录已存在则静默跳过。

#### Scenario: 创建嵌套目录
- **WHEN** 调用 `ensureDir('/path/to/nested/dir')`
- **THEN** 递归创建所有中间目录
- **AND** 函数正常返回，不抛出错误

#### Scenario: 目录已存在
- **WHEN** 调用 `ensureDir()` 传入已存在的目录路径
- **THEN** 函数静默返回，不抛出错误

### Requirement: 提供文件存在性检查
`@marchen-spec/fs` SHALL 提供 `exists()` 函数，检查给定路径是否存在（文件或目录）。

#### Scenario: 路径存在
- **WHEN** 调用 `exists()` 传入已存在的路径
- **THEN** 返回 `true`

#### Scenario: 路径不存在
- **WHEN** 调用 `exists()` 传入不存在的路径
- **THEN** 返回 `false`

### Requirement: 提供文件读取操作
`@marchen-spec/fs` SHALL 提供 `readFile()` 函数，以 UTF-8 编码读取文件内容。

#### Scenario: 读取已存在的文件
- **WHEN** 调用 `readFile()` 传入已存在的文件路径
- **THEN** 返回文件内容字符串

#### Scenario: 读取不存在的文件
- **WHEN** 调用 `readFile()` 传入不存在的文件路径
- **THEN** 抛出 `MarchenSpecError` 错误

### Requirement: 提供文件写入操作
`@marchen-spec/fs` SHALL 提供 `writeFile()` 函数，以 UTF-8 编码写入文件内容，自动创建父目录。

#### Scenario: 写入文件到已存在的目录
- **WHEN** 调用 `writeFile(path, content)`
- **THEN** 文件被创建或覆盖，内容为指定字符串

#### Scenario: 写入文件到不存在的目录
- **WHEN** 调用 `writeFile()` 且父目录不存在
- **THEN** 自动创建父目录后写入文件

### Requirement: 提供目录内容列举操作
`@marchen-spec/fs` SHALL 提供 `listDir()` 函数，返回指定目录下的直接子条目名称列表。

#### Scenario: 列举非空目录
- **WHEN** 调用 `listDir()` 传入包含文件和子目录的目录
- **THEN** 返回所有直接子条目的名称数组

#### Scenario: 列举空目录
- **WHEN** 调用 `listDir()` 传入空目录
- **THEN** 返回空数组

#### Scenario: 列举不存在的目录
- **WHEN** 调用 `listDir()` 传入不存在的路径
- **THEN** 抛出 `MarchenSpecError` 错误

### Requirement: 提供 YAML 文件读取操作
`@marchen-spec/fs` SHALL 提供 `readYaml<T>()` 泛型函数，读取 YAML 文件并解析为指定类型的对象。

#### Scenario: 读取有效 YAML 文件
- **WHEN** 调用 `readYaml()` 传入有效的 YAML 文件路径
- **THEN** 返回解析后的 JavaScript 对象

#### Scenario: 读取无效 YAML 文件
- **WHEN** 调用 `readYaml()` 传入格式错误的 YAML 文件
- **THEN** 抛出 `MarchenSpecError` 错误

### Requirement: 提供 YAML 文件写入操作
`@marchen-spec/fs` SHALL 提供 `writeYaml()` 函数，将 JavaScript 对象序列化为 YAML 格式写入文件。

#### Scenario: 写入对象为 YAML 文件
- **WHEN** 调用 `writeYaml(path, data)`
- **THEN** 文件内容为 YAML 格式的字符串，缩进为 2 空格
- **AND** 父目录不存在时自动创建

---

## MODIFIED Requirements (refactor-to-class-architecture)

### Requirement: fs 包拆分为多文件模块
`@marchen-spec/fs` SHALL 将单文件拆分为 `paths.ts`、`directory.ts`、`file.ts`、`yaml.ts` 四个模块，通过 `index.ts` 统一 re-export。公共 API 保持不变。

#### Scenario: 拆分后 API 兼容
- **WHEN** 其他包通过 `import { ... } from '@marchen-spec/fs'` 导入
- **THEN** 所有现有函数（resolveWorkspaceRoot、getSpecDirectory、getChangeDirectory、ensureDir、exists、listDir、readFile、writeFile、readYaml、writeYaml）SHALL 保持可用且行为不变
