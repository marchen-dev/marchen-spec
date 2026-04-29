## 背景

首次使用 `marchen search` 时，如果从未归档过变更或从别处拷贝了 archive 目录，搜索索引为空，返回空结果。用户需要手动 `--rebuild` 才能搜到内容。

方案：在 `SearchManager.search()` 执行查询前，通过 `store.getStatus()` 检测 `totalDocuments === 0`，自动触发一次 `store.update()` 扫描 archive 目录建索引。

## 1. SearchManager 自动索引

- [x] 1.1 `search()` 方法在查询前调用 `ensureIndexed()` 检测索引是否为空
- [x] 1.2 `ensureIndexed()` 在 `totalDocuments === 0` 时自动执行 `store.update()`，有模型时追加 `store.embed()`
