# marchen-spec

规范驱动开发 CLI — 让 AI 按结构化流程先想清楚再动手写代码。

## 安装

```bash
# 直接使用
npx marchen-spec init

# 或全局安装
npm i -g marchen-spec
marchen init
```

## 命令

```bash
marchen init [options]                    # 初始化 MarchenSpec 目录结构
marchen new <name> [--schema full|lite]   # 创建一个新的变更
marchen list [--json]                     # 列出所有 open 状态的变更
marchen status <name> [--json]            # 查看 artifact 状态和工作流建议
marchen instructions <name> <artifact>    # 获取 artifact 创建指令
marchen archive <name> [--summary <text>] # 归档变更并写入 changelog
```

## 两种 Schema

- **full**（默认）：proposal → specs → design → tasks，适合新功能和架构变更
- **lite**：直接生成带背景的 tasks.md，适合 bug 修复和小改动

```bash
marchen new add-dark-mode              # full schema
marchen new fix-typo --schema lite     # lite schema
```

## 变更日志

归档时自动追加记录到 `marchen/changelog.md`，为项目提供结构化的变更历史索引。

## AI Skills

初始化后生成 Claude Code 可用的 skill 文件：

- `/marchen:propose` — 创建变更，填充所有 artifact
- `/marchen:lite` — 一键式轻量变更（创建 → 实现 → 询问归档）
- `/marchen:apply` — 逐个实现 task
- `/marchen:explore` — 思考伙伴，探索问题空间
- `/marchen:archive` — 检查完成度后归档

## License

MIT
