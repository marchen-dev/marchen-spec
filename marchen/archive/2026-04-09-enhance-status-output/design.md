## Context

`marchen status` 命令当前使用 `@clack/prompts` 的 `p.log` 输出纯文本。状态区分仅靠 emoji（✅/⬜/🔒），文字部分无颜色。变更名称和 schema 占两行，没有总进度汇总。

CLI 包当前依赖：`@clack/prompts`、`commander`、`js-yaml`。无颜色库。

## Goals / Non-Goals

**Goals:**
- 为 status 终端输出添加颜色，提升状态辨识度
- 添加 Artifacts/Tasks 总进度汇总
- 压缩变更信息行，减少视觉噪音
- 保持 `--json` 输出不变

**Non-Goals:**
- 不做进度条可视化
- 不做依赖关系 DAG 图
- 不拆分 formatter 模块
- 不改动 core 层的 StatusResult 数据结构
- 不改动其他命令（list、archive 等）的输出

## Decisions

### 颜色库选择：picocolors

选 `picocolors` 而非 `chalk`。

- `picocolors` 已是 `@clack/prompts` 的传递依赖，加它等于零额外包体积
- API 简单直接：`pc.green()`、`pc.bold()`、`pc.dim()`
- 自动检测 `NO_COLOR` 环境变量和 pipe 输出，无需手动处理降级
- `chalk` 功能更丰富但体积大（~40KB），这里用不到

### blocked 状态文字替换

blocked 的 artifact 当前显示原始内容状态（如 `empty`），改为显示 `blocked`。

原因：用户关心的是「能不能做」而非「底层文件状态」。🔒 图标 + 红色 `blocked` + `(等待 xxx)` 已经传达了足够信息。

### 只给状态文字上色，不给 artifact 名称上色

一行里颜色太多反而降低可读性。emoji 已经提供了图标级别的区分，状态文字颜色提供文字级别的区分，两层够了。

### 进度行放在 Artifacts 列表之后

```
◇  Artifacts
│  ✅ proposal     filled
│  ...
│
◇  Artifacts: 2/4 完成
│  Tasks:     3/7 完成
│
└  下一步: design
```

进度是对列表的汇总，放在列表后面符合阅读顺序。Tasks 进度从原来的独立 `p.log.info` 合并到这里。

## Risks / Trade-offs

- [picocolors 版本兼容] → 使用 `^` 版本范围，与 clack 内部版本保持兼容
- [终端不支持颜色] → picocolors 自动降级为无色输出，无需额外处理
- [blocked 替换丢失原始状态信息] → 用户如需原始状态可用 `--json`，终端输出优先可读性
