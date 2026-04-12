# multi-schema-support

## MODIFIED Requirements

### 需求: 系统 SHALL 提供 SCHEMAS map 管理所有内置 schema

MUST 导出 `SCHEMAS: Record<string, SchemaDefinition>` 包含所有内置 schema。

#### 场景: 按名称查找 schema

- **WHEN** 传入 schema 名称 `'full'`
- **THEN** 返回对应的 SchemaDefinition 对象
- **AND** 该对象包含完整的 artifacts 定义（含 template 和 instruction）

#### 场景: 按名称查找 lite schema

- **WHEN** 传入 schema 名称 `'lite'`
- **THEN** 返回 lite 的 SchemaDefinition 对象
- **AND** 该对象只包含 tasks 一个 artifact

#### 场景: 查找不存在的 schema

- **WHEN** 传入不存在的 schema 名称
- **THEN** 抛出错误，提示可用的 schema 列表（包含 `full` 和 `lite`）
