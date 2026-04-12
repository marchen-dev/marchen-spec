# multi-schema-support

## 目的

支持多 schema 选择，ArtifactDefinition 内聚 template 和 instruction，使每个 artifact 的所有信息集中在一个对象中。

## 需求

### 需求: ArtifactDefinition 类型 SHALL 包含 template 和 instruction 字段

ArtifactDefinition 接口 MUST 新增 `template`（可选）和 `instruction`（必填）字段，使每个 artifact 的所有信息内聚在一个对象中。

#### 场景: 定义包含模板的 artifact

WHEN 定义一个 artifact（如 proposal）
THEN ArtifactDefinition 包含 id、generates、requires、template、instruction 五个字段
AND template 为该 artifact 的 markdown 骨架内容

#### 场景: 定义目录类型 artifact（无模板）

WHEN 定义 specs 类型 artifact（generates 以 `/` 结尾）
THEN template 字段为 undefined
AND 其他字段正常填充

### 需求: 系统 SHALL 提供 SCHEMAS map 管理所有内置 schema

MUST 导出 `SCHEMAS: Record<string, SchemaDefinition>` 包含所有内置 schema。

#### 场景: 按名称查找 schema

WHEN 传入 schema 名称 `'spec-driven'`
THEN 返回对应的 SchemaDefinition 对象
AND 该对象包含完整的 artifacts 定义（含 template 和 instruction）

#### 场景: 查找不存在的 schema

WHEN 传入不存在的 schema 名称
THEN 抛出错误，提示可用的 schema 列表

### 需求: 废弃 ARTIFACT_TEMPLATES 和 ARTIFACT_INSTRUCTIONS flat map

MUST 删除 `ARTIFACT_TEMPLATES` 和 `ARTIFACT_INSTRUCTIONS` 导出，所有消费方改为从 schema 的 artifact 定义中获取。

#### 场景: ChangeManager.create() 获取模板

WHEN 创建变更时需要写入 artifact 初始文件
THEN 从 schema.artifacts 中找到对应 artifact 定义，取其 template 字段
AND 不再引用 ARTIFACT_TEMPLATES
