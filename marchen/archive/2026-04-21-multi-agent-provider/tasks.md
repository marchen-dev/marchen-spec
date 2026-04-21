## 1. shared 包：新增 AgentProvider 类型

- [x] 1.1 在 `packages/shared/src/types.ts` 新增 `AgentProvider` 接口（id, name, skillDir, commandDir?）
- [x] 1.2 在 `packages/shared/src/index.ts` 导出 `AgentProvider` 类型

## 2. config 包：新增 provider 注册表

- [x] 2.1 创建 `packages/config/src/providers.ts`，定义 `AGENT_PROVIDERS` 注册表（claude-code, codex）和 `DEFAULT_PROVIDER_IDS` 常量
- [x] 2.2 在 `packages/config/src/index.ts` 导出 `AGENT_PROVIDERS`、`DEFAULT_PROVIDER_IDS`

## 3. core 包：改造 Workspace.initialize()

- [x] 3.1 修改 `initialize()` 签名，接受 `options?: { providers?: string[] }`
- [x] 3.2 改造 `generateSkills()` 接收 provider 的 skillDir 参数，循环所有选中 provider 生成
- [x] 3.3 改造 `generateCommands()` 只在 provider 有 commandDir 时生成
- [x] 3.4 在 config.yaml 写入中新增 `providers` 字段

## 4. CLI：init 命令增加多选交互

- [x] 4.1 在 `apps/cli/src/commands/init.ts` 增加 `@clack/prompts` multiselect，从 `AGENT_PROVIDERS` 动态生成选项
- [x] 4.2 将用户选择的 provider ids 传递给 `workspace.initialize({ providers })`

## 5. 测试

- [x] 5.1 为 `AGENT_PROVIDERS` 注册表编写单元测试（验证结构和默认值）
- [x] 5.2 为 `Workspace.initialize()` 的多 provider 场景编写测试（单 provider、多 provider、默认 provider）
- [x] 5.3 构建并验证 `pnpm build` 和 `pnpm check` 通过
