# change-creation

## 概述

`marchen new` 命令支持 `--schema` 参数选择工作流。

### 需求: `marchen new` SHALL 接受 `--schema` 选项

命令 MUST 支持 `--schema <name>` 可选参数，默认值为 `'spec-driven'`。

#### 场景: 使用默认 schema 创建变更

WHEN 执行 `marchen new my-feature`（不带 --schema）
THEN 创建的变更使用 spec-driven schema
AND .metadata.yaml 中 schema 字段为 `'spec-driven'`

#### 场景: 使用 rapid schema 创建变更

WHEN 执行 `marchen new my-fix --schema rapid`
THEN 创建的变更使用 rapid schema
AND .metadata.yaml 中 schema 字段为 `'rapid'`
AND 变更目录下只有 tasks.md 和 .metadata.yaml

#### 场景: 使用不存在的 schema 创建变更

WHEN 执行 `marchen new my-fix --schema unknown`
THEN 命令报错，提示可用的 schema 列表
AND 不创建任何文件

### 需求: ChangeManager.create() SHALL 接受 schema 参数

create 方法 MUST 接受可选的 schema 名称参数，用于查找对应的 SchemaDefinition。

#### 场景: 按 schema 创建不同的文件结构

WHEN 调用 `create('my-fix', 'rapid')`
THEN 只创建 rapid schema 定义的 artifacts（tasks.md）
AND metadata 记录 schema 为 `'rapid'`
