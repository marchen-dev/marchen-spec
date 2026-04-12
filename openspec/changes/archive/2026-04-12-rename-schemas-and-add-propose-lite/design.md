## Context

当前 SCHEMAS map 使用 `spec-driven` 和 `rapid` 作为 key，命名不在同一语义轴上。所有引用分散在代码、测试、文档、skill/command 模板中。lite schema 没有对应的 propose 入口。

## Goals / Non-Goals

**Goals:**
- schema 名称改为 `full` / `lite`，语义对称
- 新增 propose-lite command 和 skill 模板
- `marchen init` 生成 propose-lite 入口

**Non-Goals:**
- 不改 schema 的 artifact 结构（full 还是 4 个 artifact，lite 还是 1 个）
- 不做旧 schema 名的兼容映射
- 不改 propose 命令的逻辑（它继续服务 full schema）

## Decisions

### D1: 纯字符串替换，不改逻辑

schema 重命名只涉及字符串常量和文档引用，不改变任何运行时逻辑。`SCHEMAS` map 的 key、`SchemaDefinition.name`、`DEFAULT_SCHEMA_NAME` 三处改值即可。

### D2: propose-lite 模板基于 propose 模板简化

propose-lite 的 command/skill 模板从现有 propose 模板派生，去掉 proposal → specs → design 的循环逻辑，简化为：创建 lite 变更 → 获取 tasks 指令 → 填充 tasks.md。

### D3: propose-lite 模板放在 config 包的 templates/ 下

和 propose/apply 模板一样，propose-lite 的 command 和 skill 模板源文件放在 `packages/config/templates/commands/propose-lite.md` 和 `packages/config/templates/skills/propose-lite.md`，通过 codegen 生成 TS 常量。

### D4: 变量名同步更新

`RAPID_TASKS_TEMPLATE` 改为 `LITE_TASKS_TEMPLATE`，保持代码中的命名和 schema 名一致。

## Risks / Trade-offs

- 改动文件多（约 17 个），但每个文件的改动都是机械替换，风险低
- openspec/changes/ 下的历史 artifact 不改（记录当时的决策），archive/ 也不动
- propose-lite 模板需要和 propose 保持风格一致，后续两者的维护成本略增
