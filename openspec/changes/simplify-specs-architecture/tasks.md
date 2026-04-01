## 1. 清理 main specs 逻辑

- [ ] 1.1 删除 workspace.ts 中 `initialize()` 方法的 main specs 目录创建逻辑
- [ ] 1.2 更新 workspace 测试，移除对 `specs/` 目录创建的断言

## 2. 实现 archive 功能

- [ ] 2.1 在 fs 包中添加 `moveDir(src, dest)` 方法
- [ ] 2.2 在 ChangeManager 中实现 `archive(name: string)` 方法
- [ ] 2.3 创建 `marchen archive <name>` CLI 命令

## 3. 文档与清理

- [ ] 3.1 更新 CLAUDE.md，移除 `marchenspec/specs/` 引用，添加 archive 命令说明
- [ ] 3.2 删除现有的 `openspec/specs/` 目录
