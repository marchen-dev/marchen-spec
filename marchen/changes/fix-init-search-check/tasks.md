## 背景

`marchen init` 的模型下载询问没有先检测 qmd SDK 是否可用。如果用户没装 SQLite 依赖，qmd import 会失败，但 init 仍然会询问是否下载 2GB 模型——下了也用不了。

方案：在询问模型下载前，先用 `SearchManager.isAvailable()` 检测 qmd 能否加载。不可用时直接提示缺少依赖，跳过模型下载询问。

## 1. init 命令增加 qmd 可用性检测

- [x] 1.1 在模型下载逻辑前，用 `SearchManager.isAvailable()` 检测 qmd SDK
- [x] 1.2 qmd 不可用时提示缺少依赖并跳过模型下载询问，可用时保持现有流程
