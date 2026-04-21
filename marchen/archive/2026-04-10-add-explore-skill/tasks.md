## 1. 创建模板文件

- [x] 1.1 创建 `packages/config/templates/skills/explore.md`
- [x] 1.2 创建 `packages/config/templates/commands/explore.md`

## 2. 验证

- [x] 2.1 运行 `pnpm build` 确认 codegen 生成 `SKILL_EXPLORE` 和 `COMMAND_EXPLORE` 常量
- [x] 2.2 运行 `pnpm typecheck` 确认类型无误
- [x] 2.3 运行 `pnpm test` 确认现有测试通过
