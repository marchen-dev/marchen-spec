## 背景

当前 schema 信息分散在三处：`schema.ts`（结构）、`templates.ts`（模板）、`instructions.ts`（指导）。ChangeManager 硬编码引用 `DEFAULT_SCHEMA`，无法支持多 schema。目录名 `marchenspec/` 由 `SPEC_DIRECTORY_NAME` 常量控制。

## 目标与非目标

**目标：**
- 内聚 ArtifactDefinition，一个对象包含 artifact 的全部信息
- 内置 spec-driven + rapid 两个 schema
- `marchen new --schema rapid` 可选
- 目录名改为 `marchen/`

**非目标：**
- 不做 YAML schema 文件系统（不做用户自定义 schema）
- 不做 schema init/fork 命令
- 不做运行时 schema 验证
- 不处理旧 `marchenspec/` 目录的自动迁移

## 决策

### D1: template/instruction 内聚到 ArtifactDefinition

将 `template` 和 `instruction` 作为 ArtifactDefinition 的字段，而非独立的 flat map。

理由：同一个 artifact ID（如 `tasks`）在不同 schema 下需要不同的 template 和 instruction，flat map 以 ID 为 key 无法区分。内聚后每个 schema 自包含，加新 schema 只需定义一个对象。

### D2: SCHEMAS 作为 Record<string, SchemaDefinition>

在 `config/src/schema.ts` 中导出 `SCHEMAS` map。ChangeManager 通过 `SCHEMAS[metadata.schema]` 查找。

理由：简单直接，内置 schema 数量少（2 个），不需要文件系统解析。

### D3: rapid schema 只有 tasks 一个 artifact

不保留 proposal。explore 已完成思考，直接写 tasks 即可。tasks 模板包含 `## 背景` 章节提供上下文。

理由：rapid 的使用场景是 explore 之后快速执行，proposal 是多余的中间步骤。背景章节零成本提供 apply 时的上下文。

### D4: 废弃 templates.ts 和 instructions.ts 的导出

模板和指导文本的字符串常量保留（供 schema 定义引用），但不再导出 `ARTIFACT_TEMPLATES` 和 `ARTIFACT_INSTRUCTIONS` 这两个 flat map。

理由：消费方（ChangeManager）改为从 schema 定义取值，flat map 无人使用。

### D5: config/index.ts 导出 SCHEMAS 和 getSchema() 辅助函数

```typescript
export function getSchema(name: string): SchemaDefinition
// 找不到时抛 SchemaNotFoundError，附带可用 schema 列表
```

理由：集中 schema 查找逻辑，避免 ChangeManager 直接操作 map。

### D6: 目录重命名只改常量

`SPEC_DIRECTORY_NAME` 从 `'marchenspec'` 改为 `'marchen'`，所有路径通过此常量派生，改一处即可。模板和文档中的硬编码路径手动替换。

## 风险与权衡

- **Breaking change**：已有用户的 `marchenspec/` 目录不会被自动识别。需要在 changelog 中说明手动重命名。项目还在早期，影响面小。
- **两个 breaking change 合并**：增加单次变更的复杂度，但减少连续 breaking change 对用户的冲击。
- **rapid 无 proposal**：apply 时 AI 只有 tasks.md 的背景章节作为上下文，信息量比 spec-driven 少。可接受，因为 rapid 面向的是简单变更。
