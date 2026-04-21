## 背景

当前 `AGENT_PROVIDERS` 注册表只有 Claude Code 和 Codex 两个 provider。参照 OpenSpec 的实现，需要扩展到 10 个工具。所有工具的 skills 目录格式统一（SKILL.md），commands 暂时只保留 Claude Code。

## 1. 扩展 provider 注册表

- [x] 1.1 在 `packages/config/src/providers.ts` 的 `AGENT_PROVIDERS` 中新增 8 个 provider（antigravity、cursor、gemini-cli、copilot、kilocode、kiro、opencode、windsurf）
- [x] 1.2 更新 `packages/config/test/providers.test.ts` 验证注册表包含 10 个 provider

## 2. 验证

- [x] 2.1 `pnpm check` 通过
