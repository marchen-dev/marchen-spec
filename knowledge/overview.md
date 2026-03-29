# MarchenSpec 项目全景

> 最后更新: 2026-03-29

## 项目定位

MarchenSpec 是一个规范驱动工作流 CLI 工具，帮助开发者通过结构化的规范（spec）来管理项目变更流程。类似 OpenSpec，但作为独立实现。

## 架构现状

Monorepo 架构（pnpm + Turborepo），5 个包：

```
@marchen-spec/cli      → 命令注册、终端 UI（commander + @clack/prompts）
@marchen-spec/core     → 业务逻辑、工作流用例
@marchen-spec/config   → 配置加载与定义
@marchen-spec/fs       → 文件系统操作、YAML 处理
@marchen-spec/shared   → 共享类型、常量、错误定义
```

依赖方向：cli → core → config/fs → shared

## 已完成里程碑

- **项目初始化** (2026-03): monorepo 搭建，5 个包基础结构，构建/测试/lint 工具链
- **init 命令** (2026-03): `marchen-spec init` 初始化项目配置

## 进行中

- `new` 命令开发（创建新变更）
- 知识库结构搭建

## 技术栈

- TypeScript (ESM-first, NodeNext)
- tsdown 构建，Vitest 测试
- Prettier + ESLint 代码风格
- OpenSpec 规范驱动开发流程

## 关键数字

- 包数量: 5（1 app + 4 packages）
- CLI 命令: 2（info, init）+ 1 开发中（new）
- 测试框架: Vitest
