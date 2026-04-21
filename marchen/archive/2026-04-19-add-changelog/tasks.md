## 1. fs 包扩展

- [x] 1.1 在 `packages/fs/src/file.ts` 新增 `appendFile(path, content)` 函数
- [x] 1.2 在 `packages/fs/src/index.ts` 导出 `appendFile`
- [x] 1.3 为 `appendFile` 编写单元测试

## 2. shared 包类型扩展

- [x] 2.1 在 `packages/shared/src/types.ts` 新增 `ArchiveOptions` 接口（含可选 `summary` 字段）
- [x] 2.2 导出 `ArchiveOptions` 类型

## 3. core 包 — changelog 写入逻辑

- [x] 3.1 `Workspace` 类新增 `changelogPath` 只读属性（`join(specDir, 'changelog.md')`）
- [x] 3.2 `Workspace.initialize()` 中创建空 `changelog.md`（内容 `# 变更日志\n`），已存在时跳过
- [x] 3.3 `ChangeManager.archive()` 方法签名增加可选 `options?: ArchiveOptions` 参数
- [x] 3.4 archive 方法末尾：拼接 entry 字符串，调用 `appendFile` 写入 changelog.md（不存在时先创建）
- [x] 3.5 summary 写入前 trim 并替换换行为空格
- [x] 3.6 为 changelog 写入逻辑编写单元测试

## 4. CLI — archive 命令扩展

- [x] 4.1 `apps/cli/src/commands/archive.ts` 新增 `--summary <text>` 选项
- [x] 4.2 将 summary 传递给 `changes.archive(name, { summary })`

## 5. Skill 模板更新

- [x] 5.1 更新 `packages/config/templates/skills/archive.md`：归档前读取 proposal.md 生成一句话摘要，传给 `--summary`
- [x] 5.2 更新 `packages/config/templates/skills/explore.md`：检查上下文时加 `cat marchen/changelog.md` 步骤
- [x] 5.3 运行 `pnpm generate` 重新生成 codegen 文件
