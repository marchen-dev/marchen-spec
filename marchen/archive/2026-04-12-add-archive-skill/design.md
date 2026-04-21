## Context

MarchenSpec 有 4 组 skill/command 模板（propose, propose-lite, apply, explore），archive 缺失。CLI 的 `marchen archive` 命令功能简陋：无 `--json` 输出、不检查目标目录冲突、返回 void。

## Goals / Non-Goals

**Goals:**
- 新增 archive skill + command 模板，支持 `/marchen:archive` 工作流
- CLI archive 命令增加 `--json` 输出
- `ChangeManager.archive()` 返回结构化结果 + 目标已存在检查

**Non-Goals:**
- 不在 CLI 层做完成度检查（留给 skill 用 `status --json`）
- 不做 delta spec sync（架构决策：archive 是唯一真相来源）
- 不做 roadmap 更新（项目层面的事，不属于工具职责）

## Decisions

### archive() 返回 ArchiveResult

现在返回 void，改为返回 `{ name, schema, archivedTo, archivedAt }`。

理由：`--json` 输出需要结构化数据，且 skill 需要知道归档路径来显示结果。

### 目标目录检查放在 ChangeManager 而非 fs 层

在 `archive()` 方法内、`moveDir` 前用 `exists()` 检查目标路径。

理由：这是业务规则（"同名归档不允许"），不是文件系统层的职责。

### skill 模板内容 = command 模板内容

和 propose/apply/explore 一致，skill 和 command 共享相同的流程描述，只有 frontmatter 不同。

### ArchiveResult 类型放在 shared 包

和 `StatusResult`、`InstructionsResult` 一致，所有跨包共享的结果类型都在 shared。

## Risks / Trade-offs

- [风险] archive() 签名变更是 breaking change → 影响范围小，只有 CLI 一个消费方，同步改即可
- [风险] skill 模板的完成度检查依赖 status --json 的输出格式 → 格式已稳定，且 skill 是文本模板不是代码，容易调整
