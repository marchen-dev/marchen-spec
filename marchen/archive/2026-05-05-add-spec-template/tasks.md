## 背景

为 specs artifact 添加 markdown template 骨架（当前是唯一没有 template 的 artifact），并增强 instruction 以规范 spec 生成格式。参考 OpenSpec 源码的 spec.md template 和 RFC 2119 / BDD Gherkin 规范。

## 1. 添加 SPEC_TEMPLATE 并集成到 schema

- [x] 1.1 在 `packages/config/src/templates.ts` 新增 `SPEC_TEMPLATE` 常量
- [x] 1.2 在 `packages/config/src/schema.ts` 的 specs artifact 定义中添加 `template: SPEC_TEMPLATE` 字段并更新 `instruction`
- [x] 1.3 在 `packages/config/src/index.ts` 导出 `SPEC_TEMPLATE`
- [x] 1.4 构建并通过类型检查
