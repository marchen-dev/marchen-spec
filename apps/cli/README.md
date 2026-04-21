# marchen-spec

规范驱动开发 CLI — 让 AI 先想清楚再写代码。

完整文档请查看 [GitHub](https://github.com/marchen-dev/MarchenSpec)。

## 安装

```bash
npx marchen-spec init

# 或全局安装
npm i -g marchen-spec
marchen init
```

## 支持的 AI 工具

Claude Code · Codex · Cursor · Windsurf · GitHub Copilot · Gemini CLI · Kiro · OpenCode · Kilo Code · Antigravity

`marchen init` 会让你选择要集成的工具，自动生成对应的 skill 文件。

## CLI 命令

```bash
marchen init                              # 初始化，选择 AI 工具
marchen new <name> [--schema full|lite]   # 创建变更
marchen list [--json]                     # 列出变更
marchen status <name> [--json]            # 查看状态
marchen instructions <name> <artifact>    # 获取指令
marchen archive <name> [--summary <text>] # 归档变更
```

## License

MIT
