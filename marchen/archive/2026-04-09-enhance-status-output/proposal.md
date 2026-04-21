## Why

`marchen status` 的终端输出目前是纯文本，没有颜色区分。filled/empty/blocked/missing 状态全靠 emoji 和文字辨认，视觉辨识度低。加上缺少总进度汇总，用户需要自己数 artifact 完成情况。

## What Changes

- 添加 `picocolors` 依赖到 CLI 包（已是 `@clack/prompts` 的传递依赖，零额外成本）
- 为 artifact 状态文字上色：filled 绿色、empty 黄色、missing/no-content 灰色、blocked 红色
- blocked 的 artifact 状态文字显示为 `blocked` 而非原始内容状态（如 empty）
- 变更信息行压缩为一行：`name · schema`，name 加粗、schema 灰色
- 新增 Artifacts 总进度行（如 `Artifacts: 2/4 完成`）
- Tasks 进度行与 Artifacts 进度行合并展示
- 进度数字根据完成度上色：全部完成绿色、部分完成黄色、零完成灰色
- 下一步提示的 artifact 名称用 cyan 高亮

## Capabilities

### New Capabilities
- `status-colorized-output`: status 命令的彩色终端输出和进度汇总

### Modified Capabilities

（无）

## Impact

- `apps/cli/package.json` — 新增 `picocolors` 依赖
- `apps/cli/src/commands/status.ts` — 重构终端输出格式化逻辑
- 不影响 `--json` 输出（Skill 消费的 API 不变）
- 不影响 core/shared/config/fs 包
