# marchen-spec

规范驱动开发工具 — 让 AI 先想清楚再写代码。

完整文档请查看 [GitHub](https://github.com/marchen-dev/MarchenSpec)。

## 安装

```bash
# 直接使用
npx marchen-spec init

# 或全局安装
npm i -g marchen-spec
marchen init
```

## 使用

在 Claude Code 中：

```bash
# 先探索想法，理清思路
/marchen:explore 我想给项目加暗色模式

# 轻量模式 — 一步到位：创建变更 → 实现 → 归档
/marchen:lite

# 完整模式 — 适合复杂功能，分步推进
/marchen:propose
/marchen:apply
/marchen:archive
```

## 两种 Schema

- **full**（默认）：proposal → specs → design → tasks，适合新功能和架构变更
- **lite**：直接生成带背景的 tasks.md，适合 bug 修复和小改动

## CLI 命令

```bash
marchen init                              # 初始化目录结构 + 生成 AI skill 文件
marchen new <name> [--schema full|lite]   # 创建变更
marchen list [--json]                     # 列出所有 open 变更
marchen status <name> [--json]            # 查看 artifact 状态和工作流建议
marchen instructions <name> <artifact>    # 获取 artifact 创建指令
marchen archive <name> [--summary <text>] # 归档变更并写入 changelog
```

## License

MIT
