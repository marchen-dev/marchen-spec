## 1. 提取模型进度 utils

- [x] 1.1 创建 `apps/cli/src/utils/model-progress.ts`，导出 `MODEL_LABELS` 和 `formatModelProgress`
- [x] 1.2 修改 `init.ts`：移除本地 `MODEL_LABELS` 和 `formatModelProgress`，改为从 `model-progress.ts` 导入
- [x] 1.3 修改 `search.ts`：移除本地 `MODEL_LABELS` 和 `formatModelProgress`，改为从 `model-progress.ts` 导入

## 2. Workspace 支持 search 配置读写

- [x] 2.1 Workspace.initialize() 接收 `searchMode` 参数，写入 config.yaml 的 `search.mode` 字段
- [x] 2.2 Workspace.update() 读取配置时，缺失 `search` 字段则补全 `{ mode: 'auto' }` 并写回
- [x] 2.3 新增 Workspace.readConfig() 方法，返回 config.yaml 的完整内容

## 3. SearchManager 支持 mode 参数

- [x] 3.1 SearchManager.prepare() 新增可选参数 `mode?: 'auto' | 'bm25' | 'semantic'`
- [x] 3.2 mode 为 `bm25` 时跳过模型加载，直接标记 `modelsReady = false`
- [x] 3.3 mode 为 `semantic` 时加载模型，模型不存在则抛出 StateError 提示运行 `marchen update`
- [x] 3.4 mode 为 `auto` 或 `undefined` 时保持当前行为（检测文件系统）

## 4. 重构 init 命令

- [x] 4.1 移除 SearchManager.isAvailable() 检测和相关分支逻辑
- [x] 4.2 新增搜索模式选择交互（semantic / bm25 / auto），默认 auto
- [x] 4.3 将选择的 mode 传入 workspace.initialize() 写入 config.yaml
- [x] 4.4 用户选 semantic 时下载模型（使用共享的 formatModelProgress），选其他跳过

## 5. 增强 update 命令

- [x] 5.1 update 完成 skill/command 更新后，读取 config.yaml 的 search.mode
- [x] 5.2 mode 为 semantic 时调用 ModelManager.ensureModels() 确保模型就绪
- [x] 5.3 mode 为 auto 时检查模型状态并显示信息
- [x] 5.4 mode 为 bm25 时跳过

## 6. 简化 search 命令

- [x] 6.1 search 命令启动时读取 config.yaml 的 search.mode
- [x] 6.2 将 mode 传入 SearchManager.prepare()，移除 search 命令内的模型状态判断逻辑

## 7. 验证

- [x] 7.1 运行 `pnpm check` 确保 lint + typecheck + test 全部通过
- [x] 7.2 手动测试：`marchen init` 选择不同搜索模式，验证 config.yaml 写入正确
