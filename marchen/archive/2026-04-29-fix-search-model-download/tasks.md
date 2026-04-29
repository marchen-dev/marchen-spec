## 背景

`marchen search` 命令始终向 `SearchManager.prepare()` 传递 `onModelProgress` 回调，导致即使用户没有安装本地模型也会触发模型下载。`prepare()` 的设计意图是"有回调 = 要下载"，但 CLI 只是想展示进度，不一定要下载。

方案：给 `PrepareOptions` 增加 `downloadIfMissing` 选项（默认 false），解耦"展示进度"和"触发下载"两个语义。CLI search 命令默认不下载，只有显式场景才触发下载。

## 1. core 层：扩展 PrepareOptions

- [x] 1.1 `PrepareOptions` 增加 `downloadIfMissing?: boolean` 字段
- [x] 1.2 重写 `prepare()` 分支逻辑：downloadIfMissing=true 时下载，否则仅本地有模型才加载

## 2. CLI 层：适配调用方

- [x] 2.1 search 命令传 `downloadIfMissing: false`
- [x] 2.2 确认其他调用点（如 archive 中的 indexChange）无需改动
