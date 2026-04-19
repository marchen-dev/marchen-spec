# changelog-generation

## 目的

归档变更时自动生成和维护 changelog 文件，记录项目变更历史。

## 需求

### 需求: changelog 文件初始化

系统在 `marchen init` 时 SHALL 创建 `marchen/changelog.md` 文件，内容为 `# 变更日志\n`。

#### 场景: 首次初始化

- **WHEN** 用户执行 `marchen init`
- **THEN** 在 `marchen/` 目录下创建 `changelog.md`，内容为标题行 `# 变更日志`

#### 场景: 重复初始化

- **WHEN** 用户执行 `marchen init --force` 且 `changelog.md` 已存在
- **THEN** 不覆盖已有的 `changelog.md`

### 需求: archive 时写入 changelog 条目

系统在归档变更时 SHALL 自动追加一行条目到 `marchen/changelog.md`。

#### 场景: 带 summary 归档

- **WHEN** 执行 `marchen archive my-feature --summary "实现了用户认证"`
- **THEN** 追加 `- 2026-04-19: [my-feature](./archive/2026-04-19-my-feature/) — 实现了用户认证` 到 changelog.md 末尾

#### 场景: 不带 summary 归档

- **WHEN** 执行 `marchen archive my-feature`（无 --summary）
- **THEN** 追加 `- 2026-04-19: [my-feature](./archive/2026-04-19-my-feature/)` 到 changelog.md 末尾

#### 场景: changelog.md 不存在时归档

- **WHEN** 执行 `marchen archive` 但 `marchen/changelog.md` 不存在（旧项目未 re-init）
- **THEN** 自动创建 `changelog.md`（含标题行）后再追加条目

### 需求: changelog 条目格式

每条 changelog entry SHALL 遵循固定格式。

#### 场景: 格式规范

- **WHEN** 写入一条 changelog entry
- **THEN** 格式为 `- YYYY-MM-DD: [<name>](./archive/YYYY-MM-DD-<name>/) — <summary>`，其中日期从 archivedAt 截取前 10 位，name 为变更名称，summary 为可选摘要

#### 场景: summary 含换行符

- **WHEN** summary 文本包含换行符
- **THEN** 系统 SHALL 将换行符替换为空格，确保 entry 为单行
