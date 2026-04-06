## Skill 模板基础设施

- [x] 1.1 创建 `packages/config/templates/skills/propose.md`（propose skill 完整内容）
- [x] 1.2 创建 `packages/config/templates/commands/propose.md`（command 短命令内容）
- [x] 1.3 创建 `packages/config/scripts/generate-templates.ts`（codegen 脚本：读 .md → 生成 .ts）
- [x] 1.4 执行 generate，产出 `src/generated/skill-templates.ts` 和 `src/generated/command-templates.ts`
- [x] 1.5 创建 `packages/config/src/skills.ts`（SkillTemplate 类型定义 + re-export SKILL_TEMPLATES）
- [x] 1.6 创建 `packages/config/src/commands.ts`（CommandTemplate 类型定义 + re-export COMMAND_TEMPLATES）
- [x] 1.7 修改 `packages/config/src/index.ts`，导出 skills 和 commands
- [x] 1.8 修改 `packages/config/package.json`，scripts 加 `"generate": "tsx scripts/generate-templates.ts"`，build 改为 `"pnpm generate && tsdown ..."`

## Init 命令改造

- [x] 2.1 修改 `packages/core/src/workspace.ts`：`initialize()` 中新增 `generateSkills()` 和 `generateCommands()` 方法，遍历 SKILL_TEMPLATES/COMMAND_TEMPLATES 写入 `.claude/skills/` 和 `.claude/commands/`
- [x] 2.2 修改 `apps/cli/src/commands/init.ts`：输出提示加上 skill 生成信息

## 测试

- [x] 3.1 修改 `packages/core/test/workspace.test.ts`：验证 initialize() 生成了 `.claude/skills/marchen-propose/SKILL.md` 和 `.claude/commands/marchen/propose.md`
- [x] 3.2 验证重复 init 覆盖已有文件
- [x] 3.3 运行 `pnpm check` 确保 lint + typecheck + test 全部通过

## 文档更新

- [x] 4.1 更新相关 CLAUDE.md（根目录 + config + core + cli）
- [x] 4.2 更新 `docs/roadmap.md`
