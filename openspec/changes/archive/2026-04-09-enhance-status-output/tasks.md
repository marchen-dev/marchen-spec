## 1. 依赖安装

- [x] 1.1 在 `apps/cli/package.json` 中添加 `picocolors` 依赖

## 2. 状态文字上色

- [x] 2.1 在 `status.ts` 中导入 `picocolors`，添加 `colorizeStatus` 辅助函数，将 filled/empty/missing/no-content 映射为对应颜色
- [x] 2.2 blocked 的 artifact 状态文字改为显示 `blocked`（红色），替代原始内容状态

## 3. 输出格式优化

- [x] 3.1 变更信息行压缩为一行：`pc.bold(name) · pc.dim(schema)`
- [x] 3.2 新增 Artifacts 总进度行（`Artifacts: N/M 完成`），与 Tasks 进度合并展示
- [x] 3.3 进度数字根据完成度上色：全部完成绿色、部分完成黄色、零完成灰色
- [x] 3.4 下一步提示中的 artifact 名称用 `pc.cyan()` 高亮
- [x] 3.5 进度行添加 `[██████░░░░]` 进度条可视化

## 4. 验证

- [x] 4.1 运行 `pnpm typecheck` 确认类型无误
- [x] 4.2 运行 `pnpm test` 确认现有测试通过
