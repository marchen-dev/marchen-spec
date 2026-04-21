## 背景

`generate-templates.ts` codegen 生成的对象 key 带引号（`'apply'`），但 Prettier 规则会去掉合法标识符的引号（`apply`），导致每次 `pnpm release:version` 后产生脏 diff。修复方式：让 codegen 直接生成不带引号的 key。

## 1. 修复 codegen 脚本

- [x] 1.1 修改 `generate-templates.ts` 中 skill-templates 的 key 生成，去掉引号
- [x] 1.2 修改 `generate-templates.ts` 中 command-templates 的 key 生成，去掉引号
- [x] 1.3 重新运行 `pnpm generate` 并验证生成产物符合 Prettier 规范
