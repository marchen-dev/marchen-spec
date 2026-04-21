## Context

MarchenSpec 的 archive 机制将完成的变更移动到 `marchen/archive/` 目录，但归档后没有任何"浓缩"的知识出口。explore skill 启动时只检查当前 open 变更，无法快速获取历史变更信息。需要在 archive 流程中自动沉淀一行摘要到 `changelog.md`，供 explore 阶段作为上下文索引。

当前 archive 流程：读取 metadata → 更新 status → moveDir → return ArchiveResult。

## Goals / Non-Goals

**Goals:**
- archive 时自动写入一行摘要到 `marchen/changelog.md`
- 支持通过 `--summary` 传入摘要文本（CLI 直接使用或 skill 传入 AI 生成的摘要）
- 没有 summary 时仍写入条目（只有名称和链接，无描述）
- init 时创建空 changelog.md
- explore skill 启动时读取 changelog.md 作为历史上下文

**Non-Goals:**
- 不做 RAG 或向量检索（changelog 规模远不需要）
- 不恢复主 specs 机制
- 不自动从 proposal 提取摘要（CLI 层不做 AI 调用，摘要生成由 skill 层负责）

## Decisions

### 1. changelog.md 格式：纯文本一行一条

每条 entry 格式：
```
- YYYY-MM-DD: [change-name](./archive/YYYY-MM-DD-change-name/) — 摘要文本
```

无 summary 时：
```
- YYYY-MM-DD: [change-name](./archive/YYYY-MM-DD-change-name/)
```

理由：格式确定性高，由代码模板拼接，不需要解析 markdown AST。AI 全量读取后自行判断相关性。

### 2. 写入方式：fs 包新增 appendFile

使用 `appendFile` 而非 `readFile + writeFile`，语义更清晰，且 Node.js 原生支持。

### 3. summary 来源：CLI `--summary` 参数

CLI 层只负责接收和传递 summary 文本，不做任何智能提取。两条路径：
- 直接 CLI：用户手动传 `--summary "..."`，或不传（只写名称）
- archive skill：AI 读 proposal 生成摘要后传给 `--summary`

### 4. changelog.md 位置：`marchen/changelog.md`

与 `changes/` 和 `archive/` 同级，属于 spec 系统的一部分。entry 中的链接使用相对路径 `./archive/...`。

### 5. explore skill 消费方式：直接 cat

explore skill 模板中加一步 `cat marchen/changelog.md`，AI 全量读取后按需深入相关 archive。不需要新增 CLI 命令。

## Risks / Trade-offs

- [changelog.md 不存在] → archive 时先检查文件是否存在，不存在则创建（兼容未 re-init 的旧项目）
- [summary 含换行符] → 写入前 trim 并替换换行为空格
- [changelog 增长] → 当前 18 条，预计年增 ~100 条，~10KB，AI context 完全可承受。未来如需可按年分组，但现在不做
